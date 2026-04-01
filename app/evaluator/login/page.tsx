"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/navbar"

// Hardcoded evaluator credentials for capstone project
const EVALUATOR_CREDENTIALS = {
  email: "evaluator@studi.com",
  password: "evaluator123",
}

export default function EvaluatorLoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    console.log("[v0] Form submitted with:", formData.email)
    console.log("[v0] Expected:", EVALUATOR_CREDENTIALS.email)
    console.log("[v0] Email match:", formData.email === EVALUATOR_CREDENTIALS.email)
    console.log("[v0] Password match:", formData.password === EVALUATOR_CREDENTIALS.password)

    // Check against hardcoded credentials
    if (
      formData.email === EVALUATOR_CREDENTIALS.email &&
      formData.password === EVALUATOR_CREDENTIALS.password
    ) {
      console.log("[v0] Credentials matched! Redirecting...")
      // Store evaluator session in localStorage
      localStorage.setItem("evaluator_session", JSON.stringify({
        isEvaluator: true,
        loginTime: Date.now(),
      }))
      router.push("/evaluator/dashboard")
    } else {
      console.log("[v0] Credentials did not match")
      setError("Invalid evaluator credentials")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <Navbar />
      <main className="flex flex-col items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          <div className="bg-[#5B6EE8] text-white text-center py-3 rounded-t-lg">
            <h1 className="text-xl font-bold">Evaluator Access</h1>
          </div>
          
          <div className="bg-white border-2 border-t-0 border-gray-200 rounded-b-lg p-8">
            <p className="text-gray-600 text-center mb-6">
              This portal is for evaluators to assess quiz taxonomy alignment.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-gray-800 font-semibold mb-2 block text-sm">
                  Evaluator Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter evaluator email"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#5B6EE8] transition"
                  required
                />
              </div>

              <div>
                <label className="text-gray-800 font-semibold mb-2 block text-sm">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#5B6EE8] transition"
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#5B6EE8] text-white py-3 font-bold text-lg rounded-lg hover:bg-[#4A5AC9] transition"
              >
                {loading ? "Signing in..." : "Sign in as Evaluator"}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
