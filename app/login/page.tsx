"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/navbar"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function LoginPage() {
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

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password)
      router.push("/dashboard")
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setError("Email not found")
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password")
      } else if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password")
      } else {
        setError(err.message || "Failed to sign in")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <div className="absolute top-20 left-10 opacity-20">
        <img src="/decorative-book.svg" alt="" className="w-16 h-16" />
      </div>
      <div className="absolute top-40 right-20 opacity-20">
        <img src="/decorative-pencil.svg" alt="" className="w-12 h-12" />
      </div>
      <div className="absolute bottom-32 left-1/4 opacity-20">
        <img src="/decorative-lightbulb.svg" alt="" className="w-14 h-14" />
      </div>
      <div className="absolute bottom-20 right-16 opacity-20">
        <img src="/decorative-star.svg" alt="" className="w-10 h-10" />
      </div>

      <Navbar />
      <main className="flex items-center justify-between px-8 md:px-16 py-20 relative z-10">
        {/* Left Side - Illustration */}
        <div className="w-1/2 flex justify-center">
          <div className="flex flex-col items-center justify-center relative">
            <div className="absolute -top-8 -left-8">
              <img src="/decorative-trophy.svg" alt="" className="w-12 h-12 opacity-60" />
            </div>
            <div className="absolute -bottom-4 -right-4">
              <img src="/decorative-checkmark.svg" alt="" className="w-10 h-10 opacity-60" />
            </div>

            {/* Vector Image Container */}
            <div className="w-96 h-96 flex items-center justify-center">
              <img
                src="/login-illustration.svg"
                alt="Welcome back illustration"
                className="w-full h-full object-contain"
              />
            </div>
            {/* Descriptive Text */}
            <div className="mt-8 text-center max-w-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Welcome Back!</h2>
              <p className="text-gray-600 text-base leading-relaxed">
                Continue your learning journey and track your progress. Access your courses, assignments, and study
                materials all in one place.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-1/2 pl-12 relative">
          <div className="absolute -top-4 right-20 opacity-30">
            <img src="/decorative-brain.svg" alt="" className="w-14 h-14" />
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-2">Study ka yah?</h1>
          <p className="text-gray-600 text-lg mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="text-gray-800 font-semibold mb-2 block">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#5B6EE8] transition"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-gray-800 font-semibold mb-2 block">Password</label>
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

            {/* Error Message */}
            {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

            {/* Forgot Password Link */}
            <Link href="#" className="text-[#5B6EE8] font-semibold text-sm hover:underline block">
              Forgot password?
            </Link>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5B6EE8] text-white py-3 font-bold text-lg rounded-lg hover:bg-[#4A5AC9] transition"
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            {/* Signup Link */}
            <p className="text-center text-gray-600">
              Don't have an account?{" "}
              <Link href="/signup" className="text-[#5B6EE8] font-bold hover:underline">
                Create one
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  )
}
