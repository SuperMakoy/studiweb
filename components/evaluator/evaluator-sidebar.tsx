"use client"

import { useRouter, usePathname } from "next/navigation"
import { LayoutDashboard, LogOut, ClipboardCheck } from "lucide-react"

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
        <p className="text-white/70 text-xs mt-1">Evaluator Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
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

      {/* Evaluator Info & Logout */}
      <div className="p-6 border-t border-[#4A5AC9]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-medium">Evaluator</p>
            <p className="text-white/70 text-xs">Taxonomy Expert</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-white text-[#5B6EE8] font-bold rounded-lg hover:bg-gray-100 transition"
        >
          Logout
        </button>
      </div>
    </aside>
  )
}
