"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function TeacherLogin() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Mock login - for demonstration purposes
    setTimeout(() => {
      // Store teacher session in localStorage (mock)
      localStorage.setItem("teacherSession", JSON.stringify({ email, role: "teacher" }))
      router.push("/teacher")
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Mockup Warning */}
        <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
          <p className="text-sm font-semibold text-yellow-900">
            ⚠️ MOCKUP VERSION - For Demonstration Only
          </p>
          <p className="text-xs text-yellow-800 mt-1">
            This teacher portal is currently a prototype. Real authentication will be implemented next.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">STUDI Teacher</h1>
            <p className="text-slate-600 mt-2">Quiz Generation & Management Portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@school.edu"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg transition duration-200"
            >
              {isLoading ? "Signing in..." : "Sign In as Teacher"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-6">
            Are you a student?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Go to Student Login
            </Link>
          </p>
        </div>

        {/* Demo Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs font-semibold text-blue-900">Demo Credentials:</p>
          <p className="text-xs text-blue-800 mt-1">Email: demo@teacher.com | Password: demo123</p>
        </div>
      </div>
    </div>
  )
}
