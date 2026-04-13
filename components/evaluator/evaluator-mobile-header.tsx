"use client"

import { useRouter, usePathname } from "next/navigation"
import { LayoutDashboard, LogOut, User, FileText, Clock, CheckCircle2 } from "lucide-react"

export default function EvaluatorMobileHeader() {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    sessionStorage.removeItem("isEvaluator")
    sessionStorage.removeItem("evaluatorName")
    router.push("/evaluator/login")
  }

  const isDashboardActive = pathname === "/evaluator/dashboard"
  const isQuizzesActive = pathname === "/evaluator/quizzes"
  const isPendingActive = pathname === "/evaluator/pending"
  const isEvaluatedActive = pathname === "/evaluator/evaluated"
  const isProfileActive = pathname === "/evaluator/profile"

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Logo */}
        <h1 className="text-xl font-bold text-[#5B6EE8]">STUDI</h1>

        {/* Navigation Icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => router.push("/evaluator/dashboard")}
            className={`p-2 rounded-lg transition ${
              isDashboardActive ? "bg-[#5B6EE8] text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
            title="Dashboard"
          >
            <LayoutDashboard className="w-5 h-5" />
          </button>
          <button
            onClick={() => router.push("/evaluator/quizzes")}
            className={`p-2 rounded-lg transition ${
              isQuizzesActive ? "bg-[#5B6EE8] text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
            title="All Quizzes"
          >
            <FileText className="w-5 h-5" />
          </button>
          <button
            onClick={() => router.push("/evaluator/pending")}
            className={`p-2 rounded-lg transition ${
              isPendingActive ? "bg-amber-500 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
            title="Pending"
          >
            <Clock className="w-5 h-5" />
          </button>
          <button
            onClick={() => router.push("/evaluator/evaluated")}
            className={`p-2 rounded-lg transition ${
              isEvaluatedActive ? "bg-emerald-500 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
            title="Evaluated"
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => router.push("/evaluator/profile")}
            className={`p-2 rounded-lg transition ${
              isProfileActive ? "bg-[#5B6EE8] text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
            title="Profile"
          >
            <User className="w-5 h-5" />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
