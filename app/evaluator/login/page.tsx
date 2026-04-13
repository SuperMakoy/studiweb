"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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

    // Check against hardcoded credentials
    if (
      formData.email === EVALUATOR_CREDENTIALS.email &&
      formData.password === EVALUATOR_CREDENTIALS.password
    ) {
      // Store evaluator session in sessionStorage
      sessionStorage.setItem("isEvaluator", "true")
      sessionStorage.setItem("evaluatorName", "Evaluator")
      router.push("/evaluator/dashboard")
    } else {
      setError("Invalid evaluator credentials")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 opacity-20 hidden md:block">
        <img src="/decorative-book.svg" alt="" className="w-16 h-16" />
      </div>
      <div className="absolute top-40 right-20 opacity-20 hidden md:block">
        <img src="/decorative-pencil.svg" alt="" className="w-12 h-12" />
      </div>
      <div className="absolute bottom-32 left-1/4 opacity-20 hidden md:block">
        <img src="/decorative-lightbulb.svg" alt="" className="w-14 h-14" />
      </div>
      <div className="absolute bottom-20 right-16 opacity-20 hidden md:block">
        <img src="/decorative-star.svg" alt="" className="w-10 h-10" />
      </div>

      <Navbar />
      
      <main className="flex flex-col md:flex-row items-center justify-between px-4 md:px-8 lg:px-16 py-8 md:py-20 relative z-10 gap-8">
        {/* Left Side - Illustration */}
        <div className="w-full md:w-1/2 flex justify-center hidden sm:flex">
          <div className="flex flex-col items-center justify-center relative">
            <div className="absolute -top-8 -left-8 hidden lg:block">
              <img src="/decorative-trophy.svg" alt="" className="w-12 h-12 opacity-60" />
            </div>
            <div className="absolute -bottom-4 -right-4 hidden lg:block">
              <img src="/decorative-checkmark.svg" alt="" className="w-10 h-10 opacity-60" />
            </div>

            {/* Vector Image Container */}
            <div className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 flex items-center justify-center">
              <img
                src="/login-illustration.svg"
                alt="Evaluator login illustration"
                className="w-full h-full object-contain"
              />
            </div>
            {/* Descriptive Text */}
            <div className="mt-4 md:mt-8 text-center max-w-md px-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3">Evaluator Portal</h2>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                Access the taxonomy evaluation system to review and assess AI-generated quiz questions 
                using Anderson & Krathwohl&apos;s revised Bloom&apos;s Taxonomy framework.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 md:pl-12 relative">
          <div className="absolute -top-4 right-20 opacity-30 hidden lg:block">
            <img src="/decorative-brain.svg" alt="" className="w-14 h-14" />
          </div>

          <div className="inline-block px-3 py-1 bg-[#5B6EE8]/10 text-[#5B6EE8] text-sm font-medium rounded-full mb-4">
            Evaluator Access
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">Welcome, Evaluator</h1>
          <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8">Sign in to the evaluation portal</p>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {/* Email */}
            <div>
              <label className="text-gray-800 font-semibold mb-2 block text-sm md:text-base">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter evaluator email"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#5B6EE8] transition text-sm md:text-base"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-gray-800 font-semibold mb-2 block text-sm md:text-base">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#5B6EE8] transition text-sm md:text-base"
                required
              />
            </div>

            {/* Error Message */}
            {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5B6EE8] text-white py-3 font-bold text-base md:text-lg rounded-lg hover:bg-[#4A5AC9] transition"
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            {/* Back to main site */}
            <p className="text-center text-gray-600 text-sm md:text-base">
              <Link href="/" className="text-[#5B6EE8] font-bold hover:underline">
                Back to main site
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  )
}
