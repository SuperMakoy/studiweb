"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import TeacherQuizBuilder from "@/components/teacher/teacher-quiz-builder"

export default function QuizBuilderPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if teacher is logged in
    const session = localStorage.getItem("teacherSession")
    if (!session) {
      router.push("/teacher-login")
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-full px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-xl font-bold text-slate-900">Quiz Builder</h1>
          <div className="w-24"></div>
        </div>
      </header>

      <main>
        <TeacherQuizBuilder />
      </main>
    </div>
  )
}
