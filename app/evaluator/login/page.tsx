"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { User, KeyRound } from "lucide-react"

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
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      {/* Background blur effect */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-5" />
      
      <div className="relative w-full max-w-md">
        {/* Login Card */}
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50">
          {/* Card Header */}
          <div className="pt-10 pb-6 px-8 text-center">
            {/* Logo */}
            <div className="flex items-center justify-center gap-1 mb-6">
              <div className="grid grid-cols-2 gap-0.5">
                <div className="w-3 h-3 bg-amber-500 rounded-sm" />
                <div className="w-3 h-3 bg-blue-500 rounded-sm" />
                <div className="w-3 h-3 bg-green-500 rounded-sm" />
                <div className="w-3 h-3 bg-red-500 rounded-sm" />
              </div>
              <span className="text-3xl font-bold text-white ml-2">STUDI</span>
            </div>
            
            <h1 className="text-xl font-semibold text-blue-400 tracking-wide">EVALUATOR PANEL</h1>
            <p className="text-slate-400 text-sm mt-1">Taxonomy evaluation portal</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 pb-4">
            {/* Email Field */}
            <div className="mb-4">
              <div className="flex items-center gap-3 border-b border-slate-600 pb-3 focus-within:border-blue-500 transition-colors">
                <User className="w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="evaluator email"
                  className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-sm"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="mb-6">
              <div className="flex items-center gap-3 border-b border-slate-600 pb-3 focus-within:border-blue-500 transition-colors">
                <KeyRound className="w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="password"
                  className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-sm"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            {/* Login Button */}
            <div className="flex justify-center mb-6">
              <button
                type="submit"
                disabled={loading}
                className="px-10 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-full shadow-lg shadow-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Login"}
              </button>
            </div>
          </form>

          {/* Wave Decoration */}
          <div className="relative h-24">
            <svg
              className="absolute bottom-0 w-full"
              viewBox="0 0 400 100"
              preserveAspectRatio="none"
            >
              <path
                d="M0,60 C50,80 100,40 150,50 C200,60 250,80 300,60 C350,40 400,70 400,70 L400,100 L0,100 Z"
                fill="#4a6fa5"
                opacity="0.6"
              />
              <path
                d="M0,70 C80,90 120,50 180,60 C240,70 280,90 320,70 C360,50 400,80 400,80 L400,100 L0,100 Z"
                fill="#5b7db1"
                opacity="0.8"
              />
              <path
                d="M0,80 C60,95 100,70 160,75 C220,80 260,95 300,80 C340,65 400,85 400,85 L400,100 L0,100 Z"
                fill="#6b8cbe"
              />
            </svg>
          </div>
        </div>

        {/* Back to main site link */}
        <p className="text-center mt-6 text-slate-500 text-sm">
          <a href="/" className="hover:text-slate-400 transition-colors">
            Back to main site
          </a>
        </p>
      </div>
    </div>
  )
}
