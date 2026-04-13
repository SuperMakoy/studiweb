"use client"

import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { LayoutDashboard, LogOut, User, FileText, Clock, CheckCircle2 } from "lucide-react"
import { getQuizzesForEvaluation, type QuizForEvaluation } from "@/lib/evaluation-service"

interface NavItem {
  icon: React.ElementType
  label: string
  href: string
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/evaluator/dashboard" },
]

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

  return (
    <aside className="hidden md:flex w-52 bg-[#5B6EE8] flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-3xl font-bold text-white">STUDI</h1>
      </div>

      {/* Navigation */}
      <nav className="px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
          
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition ${
                isActive
                  ? "bg-white text-[#5B6EE8]"
                  : "text-white hover:bg-[#4A5AC9]"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Stats Section */}
      <div className="px-4 mt-6 space-y-2">
        <p className="text-white/60 text-xs font-medium px-2 mb-2">STATISTICS</p>
        
        <div className="bg-white/10 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white text-lg font-bold">{stats.total}</p>
              <p className="text-white/70 text-xs">Total Quizzes</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500/30 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <p className="text-white text-lg font-bold">{stats.pending}</p>
              <p className="text-white/70 text-xs">Pending</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500/30 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <p className="text-white text-lg font-bold">{stats.evaluated}</p>
              <p className="text-white/70 text-xs">Evaluated</p>
            </div>
          </div>
        </div>
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
