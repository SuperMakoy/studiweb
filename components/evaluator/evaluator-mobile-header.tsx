"use client"

import { useRouter, usePathname } from "next/navigation"
import { LayoutDashboard, LogOut } from "lucide-react"

export default function EvaluatorMobileHeader() {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    sessionStorage.removeItem("isEvaluator")
    sessionStorage.removeItem("evaluatorName")
    router.push("/evaluator/login")
  }

  const isActive = pathname === "/evaluator/dashboard" || pathname?.startsWith("/evaluator/dashboard/")

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Logo */}
        <h1 className="text-xl font-bold text-[#5B6EE8]">STUDI</h1>

        {/* Navigation Icons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/evaluator/dashboard")}
            className={`p-2 rounded-lg transition ${
              isActive ? "bg-[#5B6EE8] text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
            title="Dashboard"
          >
            <LayoutDashboard className="w-5 h-5" />
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
