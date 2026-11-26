import "server-only"

export class BackendError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message)
    this.name = "BackendError"
  }
}

export function isDocumentId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 128 &&
    !value.includes("/") && value !== "." && value !== ".."
}

// Preview-only until a separate production workload identity is provisioned.
export async function studentBackend(request: Request) {
  const project = process.env.GCP_PROJECT_ID
  const number = process.env.GCP_PROJECT_NUMBER
  const pool = process.env.GCP_WORKLOAD_IDENTITY_POOL_ID
  const provider = process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID
  const account = process.env.GCP_SERVICE_ACCOUNT_EMAIL
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  if (process.env.VERCEL_ENV !== "preview" || project !== "studi-testing" ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== project ||
      account !== "studi-testing-backend@studi-testing.iam.gserviceaccount.com" ||
      !number || !pool || !provider || !apiKey) {
    throw new BackendError(503, "Testing backend configuration unavailable")
  }

  const header = request.headers.get("authorization") || ""
  const token = header.startsWith("Bearer ") ? header.slice(7) : ""
  const parts = token.split(".")
  if (!token || token.length > 8192 || parts.length !== 3) {
    throw new BackendError(401, "Please sign in to STUDI")
  }
  let claims: { aud?: string; iss?: string; sub?: string }
  try {
    claims = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"))
  } catch {
    throw new BackendError(401, "Invalid student session")
  }
  if (!claims || claims.aud !== project || claims.iss !== `https://securetoken.google.com/${project}` ||
      !isDocumentId(claims.sub)) throw new BackendError(401, "Invalid student session")

  // Claims alone are not trusted. Firebase validates the ID token.
  const lookup = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: token }), cache: "no-store", signal: AbortSignal.timeout(10000),
  })
  if (!lookup.ok) throw new BackendError(lookup.status >= 500 ? 502 : 401, "Student authentication failed")
  const identity = await lookup.json()
  const uid = identity.users?.[0]?.localId
  if (!isDocumentId(uid) || uid !== claims.sub || identity.users?.[0]?.disabled) {
    throw new BackendError(401, "Invalid student session")
  }

  const oidc = request.headers.get("x-vercel-oidc-token")
  if (!oidc) throw new BackendError(503, "Vercel identity unavailable")
  const sts = await fetch("https://sts.googleapis.com/v1/token", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      audience: `//iam.googleapis.com/projects/${number}/locations/global/workloadIdentityPools/${pool}/providers/${provider}`,
      grantType: "urn:ietf:params:oauth:grant-type:token-exchange",
      requestedTokenType: "urn:ietf:params:oauth:token-type:access_token",
      subjectTokenType: "urn:ietf:params:oauth:token-type:jwt",
      subjectToken: oidc, scope: "https://www.googleapis.com/auth/cloud-platform",
    }),
    cache: "no-store", signal: AbortSignal.timeout(10000),
  })
  if (!sts.ok) throw new BackendError(502, "Google identity exchange failed")
  const federated = await sts.json()
  if (typeof federated.access_token !== "string") throw new BackendError(502, "Google identity exchange failed")
  const iam = await fetch(`https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${encodeURIComponent(account)}:generateAccessToken`, {
    method: "POST", headers: {
      Authorization: `Bearer ${federated.access_token}`, "Content-Type": "application/json",
    },
    body: JSON.stringify({ scope: ["https://www.googleapis.com/auth/datastore"], lifetime: "600s" }),
    cache: "no-store", signal: AbortSignal.timeout(10000),
  })
  if (!iam.ok) throw new BackendError(502, "Backend impersonation failed")
  const temporary = await iam.json()
  if (typeof temporary.accessToken !== "string") throw new BackendError(502, "Backend impersonation failed")

  const root = `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents`
  const headers = { Authorization: `Bearer ${temporary.accessToken}` }
  return {
    uid,
    async readOwnedFile(fileId: string) {
      if (!isDocumentId(fileId)) throw new BackendError(400, "Invalid file ID")
      const response = await fetch(`${root}/users/${encodeURIComponent(uid)}/files/${encodeURIComponent(fileId)}`, {
        headers, cache: "no-store", signal: AbortSignal.timeout(10000),
      })
      if (response.status === 404) throw new BackendError(404, "File not found")
      if (!response.ok) throw new BackendError(502, "File lookup failed")
      const data = await response.json()
      const fileData = data.fields?.fileData?.stringValue
      const fileType = data.fields?.fileType?.stringValue
      const fileName = data.fields?.fileName?.stringValue
      if (typeof fileData !== "string" || typeof fileType !== "string" || typeof fileName !== "string") {
        throw new BackendError(422, "Stored file metadata is invalid")
      }
      return { fileData, fileType, fileName }
    },
    async saveGeneratedQuiz(input: { fileId: string; fileName: string; difficulty: string; questions: unknown[] }) {
      const fields = {
        fileId: encodeValue(input.fileId),
        userId: encodeValue(uid),
        fileName: encodeValue(input.fileName),
        difficulty: encodeValue(input.difficulty),
        questions: encodeValue(input.questions),
        createdAt: { timestampValue: new Date().toISOString() },
        evaluationStatus: encodeValue("pending"),
      }
      const response = await fetch(`${root}/generatedQuizzes`, {
        method: "POST", headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ fields }), cache: "no-store", signal: AbortSignal.timeout(10000),
      })
      if (!response.ok) throw new BackendError(502, "Quiz record could not be saved")
    },
  }
}

function encodeValue(value: unknown): Record<string, unknown> {
  if (value === null) return { nullValue: null }
  if (typeof value === "string") return { stringValue: value }
  if (typeof value === "boolean") return { booleanValue: value }
  if (typeof value === "number" && Number.isFinite(value)) {
    return Number.isSafeInteger(value) ? { integerValue: String(value) } : { doubleValue: value }
  }
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encodeValue) } }
  if (typeof value === "object" && value !== null) {
    return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([k,v]) => [k, encodeValue(v)])) } }
  }
  throw new BackendError(422, "Invalid quiz record")
}
