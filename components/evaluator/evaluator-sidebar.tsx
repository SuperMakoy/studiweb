"use client"

import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { LayoutDashboard, LogOut, User, FileText, Clock, CheckCircle2 } from "lucide-react"
import { getQuizzesForEvaluation } from "@/lib/evaluation-service"

export default function EvaluatorSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [stats, setStats] = useState({ total: 0, pending: 0, evaluated: 0 })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const quizzes = await getQuizzesForEvaluation()
        const pending = quizzes.filter(q => q.evaluationStatus === "pending").length
        const evaluated = quizzes.filter(q => q.evaluationStatus === "evaluated").length
        setStats({ total: quizzes.length, pending, evaluated })
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }
    fetchStats()
  }, [pathname])

  const handleLogout = () => {
    sessionStorage.removeItem("isEvaluator")
    sessionStorage.removeItem("evaluatorName")
    router.push("/evaluator/login")
  }

  const isDashboardActive = pathname === "/evaluator/dashboard"
  const isQuizzesActive = pathname === "/evaluator/quizzes"
  const isPendingActive = pathname === "/evaluator/pending"
  const isEvaluatedActive = pathname === "/evaluator/evaluated"

  return (
    <aside className="hidden md:flex w-52 bg-[#5B6EE8] flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-3xl font-bold text-white">STUDI</h1>
      </div>

      {/* Dashboard Nav */}
      <nav className="px-3">
        <button
          onClick={() => router.push("/evaluator/dashboard")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition ${
            isDashboardActive
              ? "bg-white text-[#5B6EE8]"
              : "text-white hover:bg-[#4A5AC9]"
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </button>
      </nav>

      {/* Stats Section */}
      <div className="px-3 mt-6">
        <p className="text-white/60 text-xs font-medium px-3 mb-3 tracking-wide">STATISTICS</p>
        
        <button
          onClick={() => router.push("/evaluator/quizzes")}
          className={`w-full rounded-lg p-3 mb-2 transition ${
            isQuizzesActive ? "bg-white" : "bg-white/10 hover:bg-white/20"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isQuizzesActive ? "bg-[#5B6EE8]/10" : "bg-white/20"
            }`}>
              <FileText className={`w-4 h-4 ${isQuizzesActive ? "text-[#5B6EE8]" : "text-white"}`} />
            </div>
            <div className="text-left">
              <p className={`text-lg font-bold ${isQuizzesActive ? "text-[#5B6EE8]" : "text-white"}`}>{stats.total}</p>
              <p className={`text-xs ${isQuizzesActive ? "text-gray-500" : "text-white/70"}`}>Total Quizzes</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => router.push("/evaluator/pending")}
          className={`w-full rounded-lg p-3 mb-2 transition ${
            isPendingActive ? "bg-white" : "bg-white/10 hover:bg-white/20"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isPendingActive ? "bg-amber-100" : "bg-amber-500/30"
            }`}>
              <Clock className={`w-4 h-4 ${isPendingActive ? "text-amber-600" : "text-amber-300"}`} />
            </div>
            <div className="text-left">
              <p className={`text-lg font-bold ${isPendingActive ? "text-gray-900" : "text-white"}`}>{stats.pending}</p>
              <p className={`text-xs ${isPendingActive ? "text-gray-500" : "text-white/70"}`}>Pending</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => router.push("/evaluator/evaluated")}
          className={`w-full rounded-lg p-3 transition ${
            isEvaluatedActive ? "bg-white" : "bg-white/10 hover:bg-white/20"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isEvaluatedActive ? "bg-emerald-100" : "bg-emerald-500/30"
            }`}>
              <CheckCircle2 className={`w-4 h-4 ${isEvaluatedActive ? "text-emerald-600" : "text-emerald-300"}`} />
            </div>
            <div className="text-left">
              <p className={`text-lg font-bold ${isEvaluatedActive ? "text-gray-900" : "text-white"}`}>{stats.evaluated}</p>
              <p className={`text-xs ${isEvaluatedActive ? "text-gray-500" : "text-white/70"}`}>Evaluated</p>
            </div>
          </div>
        </button>
      </div>

      {/* Evaluator Profile & Logout */}
      <div className="mt-auto p-4 border-t border-[#4A5AC9]">
        <button
          onClick={() => router.push("/evaluator/profile")}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[#4A5AC9] transition mb-3"
        >
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-white text-sm font-medium">Evaluator</p>
            <p className="text-white/70 text-xs">View Profile</p>
          </div>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-[#5B6EE8] font-bold rounded-lg hover:bg-gray-100 transition"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}
