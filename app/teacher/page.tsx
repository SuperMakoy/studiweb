"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function TeacherDashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [teacherEmail, setTeacherEmail] = useState("")

  useEffect(() => {
    // Check if teacher is logged in (mock auth)
    const session = localStorage.getItem("teacherSession")
    if (session) {
      const data = JSON.parse(session)
      setTeacherEmail(data.email)
      setIsAuthenticated(true)
    } else {
      router.push("/teacher-login")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("teacherSession")
    router.push("/teacher-login")
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">STUDI Teacher Portal</h1>
            <p className="text-sm text-slate-600">Welcome, {teacherEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Mockup Warning Banner */}
        <div className="mb-8 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-yellow-900">This is a Mockup/Preview Version</p>
            <p className="text-sm text-yellow-800 mt-1">
              The teacher portal is currently a prototype for your capstone presentation. Real backend integration and database connections will be implemented in the final version.
            </p>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quiz Builder Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
            <div className="h-40 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-6xl">📝</span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Quiz Builder</h3>
              <p className="text-slate-600 text-sm mb-4">
                Create intelligent quizzes aligned with Bloom&apos;s Taxonomy
              </p>
              <Link
                href="/teacher/quiz-builder"
                className="inline-block w-full text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
              >
                Go to Builder
              </Link>
            </div>
          </div>

          {/* My Quizzes Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
            <div className="h-40 bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <span className="text-6xl">📚</span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-2">My Quizzes</h3>
              <p className="text-slate-600 text-sm mb-4">
                View and manage all your created quizzes
              </p>
              <button
                disabled
                className="w-full px-4 py-2 bg-slate-200 text-slate-400 rounded-lg font-semibold cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>
          </div>

          {/* Analytics Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
            <div className="h-40 bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <span className="text-6xl">📊</span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Analytics</h3>
              <p className="text-slate-600 text-sm mb-4">
                Track student performance and quiz statistics
              </p>
              <button
                disabled
                className="w-full px-4 py-2 bg-slate-200 text-slate-400 rounded-lg font-semibold cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>
          </div>

          {/* Classes Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
            <div className="h-40 bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <span className="text-6xl">👥</span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-2">My Classes</h3>
              <p className="text-slate-600 text-sm mb-4">
                Manage your classes and distribute quizzes
              </p>
              <button
                disabled
                className="w-full px-4 py-2 bg-slate-200 text-slate-400 rounded-lg font-semibold cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>
          </div>

          {/* Resources Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
            <div className="h-40 bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
              <span className="text-6xl">📖</span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Resources</h3>
              <p className="text-slate-600 text-sm mb-4">
                Access teaching materials and guides
              </p>
              <button
                disabled
                className="w-full px-4 py-2 bg-slate-200 text-slate-400 rounded-lg font-semibold cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>
          </div>

          {/* Back to Student */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
            <div className="h-40 bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center">
              <span className="text-6xl">🎓</span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Student Portal</h3>
              <p className="text-slate-600 text-sm mb-4">
                Switch to student view to see the quiz interface
              </p>
              <Link
                href="/dashboard"
                className="inline-block w-full text-center px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-semibold transition"
              >
                Go to Student
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
