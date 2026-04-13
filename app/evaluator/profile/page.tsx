"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, User, Mail, Save, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import EvaluatorSidebar from "@/components/evaluator/evaluator-sidebar"
import EvaluatorMobileHeader from "@/components/evaluator/evaluator-mobile-header"

export default function EvaluatorProfilePage() {
  const router = useRouter()
  const [name, setName] = useState("Evaluator")
  const [email, setEmail] = useState("evaluator@studi.com")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Check if user is authenticated as evaluator
    const isEvaluator = sessionStorage.getItem("isEvaluator")
    if (!isEvaluator) {
      router.push("/evaluator/login")
      return
    }

    // Load saved profile data
    const savedName = sessionStorage.getItem("evaluatorName")
    const savedEmail = sessionStorage.getItem("evaluatorEmail")
    if (savedName) setName(savedName)
    if (savedEmail) setEmail(savedEmail)
  }, [router])

  const handleSave = () => {
    setSaving(true)
    
    // Save to sessionStorage
    sessionStorage.setItem("evaluatorName", name)
    sessionStorage.setItem("evaluatorEmail", email)
    
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }, 500)
  }

  return (
    <div className="md:flex h-screen bg-gray-50">
      <EvaluatorMobileHeader />
      <EvaluatorSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden pt-14 md:pt-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 md:py-4">
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/evaluator/dashboard")}
              className="text-gray-600 hover:text-gray-800 px-2 md:px-3"
            >
              <ArrowLeft className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Back to Dashboard</span>
            </Button>
            <div className="h-6 w-px bg-gray-200 hidden md:block" />
            <div>
              <h1 className="text-lg md:text-2xl font-semibold text-gray-900">Evaluator Profile</h1>
              <p className="text-gray-500 text-xs md:text-sm">Manage your profile information</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-2xl mx-auto">
            {/* Profile Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Profile Header */}
              <div className="bg-[#5B6EE8] px-6 py-8 text-center">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 md:w-12 md:h-12 text-white" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white">{name}</h2>
                <p className="text-white/70 text-sm">Taxonomy Expert</p>
              </div>

              {/* Profile Form */}
              <div className="p-6 space-y-6">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B6EE8] focus:border-transparent transition"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B6EE8] focus:border-transparent transition"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                {/* Role (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                    Taxonomy Evaluator
                  </div>
                </div>

                {/* Save Button */}
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-[#5B6EE8] hover:bg-[#4A5AC9] text-white py-3"
                >
                  {saved ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Saved Successfully
                    </>
                  ) : saving ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Info Card */}
            <div className="mt-6 bg-[#5B6EE8]/5 border border-[#5B6EE8]/20 rounded-xl p-4 md:p-6">
              <h3 className="font-semibold text-gray-900 mb-2">About Evaluator Role</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                As a Taxonomy Evaluator, you are responsible for reviewing AI-generated quiz questions 
                and evaluating their alignment with Anderson & Krathwohl&apos;s revised Bloom&apos;s Taxonomy. 
                Your expert assessments help improve the quality and accuracy of our educational content.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
