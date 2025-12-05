"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/navbar"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { setDoc, doc } from "firebase/firestore"

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
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
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match")
        setLoading(false)
        return
      }

      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters")
        setLoading(false)
        return
      }

      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user

      // Create user profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName: formData.fullName,
        email: formData.email,
        createdAt: new Date(),
      })

      router.push("/dashboard")
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("Email already in use")
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak")
      } else {
        setError(err.message || "Failed to create account")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <div className="absolute top-24 left-16 opacity-20 hidden md:block">
        <img src="/decorative-graduation.svg" alt="" className="w-16 h-16" />
      </div>
      <div className="absolute top-32 right-24 opacity-20 hidden md:block">
        <img src="/decorative-notebook.svg" alt="" className="w-14 h-14" />
      </div>
      <div className="absolute bottom-40 left-20 opacity-20 hidden md:block">
        <img src="/decorative-rocket.svg" alt="" className="w-12 h-12" />
      </div>
      <div className="absolute bottom-24 right-20 opacity-20 hidden md:block">
        <img src="/decorative-target.svg" alt="" className="w-14 h-14" />
      </div>

      <Navbar />
      <main className="flex flex-col md:flex-row items-center justify-between px-4 md:px-8 lg:px-16 py-8 md:py-20 relative z-10 gap-8">
        {/* Left Side - Illustration */}
        <div className="w-full md:w-1/2 flex justify-center hidden sm:flex">
          <div className="flex flex-col items-center justify-center relative">
            <div className="absolute -top-6 -left-6 hidden lg:block">
              <img src="/decorative-medal.svg" alt="" className="w-12 h-12 opacity-60" />
            </div>
            <div className="absolute -bottom-6 -right-6 hidden lg:block">
              <img src="/decorative-compass.svg" alt="" className="w-10 h-10 opacity-60" />
            </div>

            {/* Vector Image Container */}
            <div className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 flex items-center justify-center">
              <img src="/signup-illustration.svg" alt="Join us illustration" className="w-full h-full object-contain" />
            </div>
            {/* Descriptive Text */}
            <div className="mt-4 md:mt-8 text-center max-w-md px-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3">Start Your Journey</h2>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                Join thousands of students who are already learning smarter. Get personalized study plans, track your
                progress, and achieve your academic goals.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 md:pl-12 relative">
          <div className="absolute -top-6 right-16 opacity-30 hidden lg:block">
            <img src="/decorative-sparkles.svg" alt="" className="w-16 h-16" />
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">Study ka yah?</h1>
          <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8">Create an account</p>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {/* Full Name */}
            <div>
              <label className="text-gray-800 font-semibold mb-2 block text-sm md:text-base">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter name"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#5B6EE8] transition text-sm md:text-base"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-gray-800 font-semibold mb-2 block text-sm md:text-base">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
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

            {/* Confirm Password */}
            <div>
              <label className="text-gray-800 font-semibold mb-2 block text-sm md:text-base">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
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
              {loading ? "Creating Account..." : "Create Account"}
            </Button>

            {/* Login Link */}
            <p className="text-center text-gray-600 text-sm md:text-base">
              Already have an account?{" "}
              <Link href="/login" className="text-[#5B6EE8] font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  )
}
