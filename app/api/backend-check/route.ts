import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const reply = (status: number, stage: string, ok = false) =>
  NextResponse.json({ ok, stage }, { status, headers: { "Cache-Control": "no-store" } })

// Temporary, read-only Preview diagnostic. Never return or log credentials.
export async function POST(request: NextRequest) {
  const project = process.env.GCP_PROJECT_ID
  const number = process.env.GCP_PROJECT_NUMBER
  const pool = process.env.GCP_WORKLOAD_IDENTITY_POOL_ID
  const provider = process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID
  const account = process.env.GCP_SERVICE_ACCOUNT_EMAIL
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  if (process.env.VERCEL_ENV !== "preview" || project !== "studi-testing" ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== project) {
    return reply(404, "preview-isolation")
  }
  if (!number || !pool || !provider || !account || !apiKey) return reply(503, "configuration")

  let stage = "student-authentication"
  try {
    const header = request.headers.get("authorization") || ""
    if (!header.startsWith("Bearer ")) return reply(401, stage)
    const idToken = header.slice(7)
    if (idToken.length > 8192) return reply(401, stage)
    const parts = idToken.split(".")
    if (parts.length !== 3) return reply(401, stage)
    // Unverified claims only narrow the acceptable project. Google validates the
    // actual token below; no identity or database access is authorized yet.
    let claims: { aud?: string; iss?: string; sub?: string }
    try {
      claims = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"))
    } catch {
      return reply(401, stage)
    }
    if (claims.aud !== project || claims.iss !== `https://securetoken.google.com/${project}` ||
        typeof claims.sub !== "string" || !claims.sub) return reply(401, stage)

    const lookup = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }), cache: "no-store", signal: AbortSignal.timeout(10000),
    })
    if (!lookup.ok) return reply(lookup.status >= 500 ? 502 : 401, stage)
    const identity = await lookup.json()
    const uid = identity.users?.[0]?.localId
    if (typeof uid !== "string" || uid !== claims.sub || uid.includes("/") || identity.users?.[0]?.disabled) {
      return reply(401, stage)
    }

    stage = "vercel-oidc"
    const oidc = request.headers.get("x-vercel-oidc-token")
    if (!oidc) return reply(503, stage)

    stage = "google-sts"
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
    if (!sts.ok) return reply(502, stage)
    const federated = await sts.json()
    if (typeof federated.access_token !== "string") return reply(502, stage)

    stage = "service-account-impersonation"
    const iam = await fetch(`https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${encodeURIComponent(account)}:generateAccessToken`, {
      method: "POST", headers: {
        Authorization: `Bearer ${federated.access_token}`, "Content-Type": "application/json",
      },
      body: JSON.stringify({ scope: ["https://www.googleapis.com/auth/datastore"], lifetime: "600s" }),
      cache: "no-store", signal: AbortSignal.timeout(10000),
    })
    if (!iam.ok) return reply(502, stage)
    const temporary = await iam.json()
    if (typeof temporary.accessToken !== "string") return reply(502, stage)

    stage = "firestore-profile-read"
    const profile = await fetch(`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/users/${encodeURIComponent(uid)}?mask.fieldPaths=uid`, {
      headers: { Authorization: `Bearer ${temporary.accessToken}` },
      cache: "no-store", signal: AbortSignal.timeout(10000),
    })
    if (!profile.ok) return reply(profile.status === 404 ? 404 : 502, stage)
    return reply(200, "all-checks-passed", true)
  } catch {
    return reply(502, stage)
  }
}
