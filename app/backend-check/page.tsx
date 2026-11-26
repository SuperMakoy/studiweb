"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function BackendCheckPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<string>("")
  useEffect(() => onAuthStateChanged(auth, (current) => {
    setUser(current)
    setLoading(false)
  }), [])
  const testing = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === "studi-testing"

  async function run() {
    if (!testing || !user || busy) return
    setBusy(true)
    setResult("")
    try {
      const token = await user.getIdToken()
      const response = await fetch("/api/backend-check", {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      })
      const data = await response.json()
      setResult(data.ok ? "PASS: Student identity, OIDC, service account and Firestore profile read verified." :
        `FAIL: ${data.stage || "unknown"} (HTTP ${response.status})`)
    } catch {
      setResult("FAIL: Unable to complete diagnostic.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0b0b18] text-white p-8">
      <section className="mx-auto max-w-xl space-y-5 rounded-xl border border-white/15 p-6">
        <h1 className="text-2xl font-bold">STUDI backend connection check</h1>
        <p>Read-only testing diagnostic. No records are changed.</p>
        <p>Firebase project: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "missing"}</p>
        {!testing ? <p>Disabled outside the testing Firebase project.</p> : loading ? <p>Checking session...</p> :
          !user ? <p>Sign in or register a new testing account on <a className="underline" href="/">STUDI</a>, then return here.</p> :
          <button className="rounded-lg bg-indigo-600 px-4 py-3 disabled:opacity-50" disabled={busy} onClick={run}>
            {busy ? "Checking..." : "Run backend check"}
          </button>}
        {result && <p role="status" className="rounded-lg border border-white/15 p-3">{result}</p>}
      </section>
    </main>
  )
}
