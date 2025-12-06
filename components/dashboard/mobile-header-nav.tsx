"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, FileText, Bot, LogOut } from "lucide-react"
import { auth } from "@/lib/firebase"

export default function MobileHeaderNav() {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Files", href: "/file-library", icon: FileText },
    { label: "AI Study", href: "/study-ai", icon: Bot },
  ]

  const handleLogout = async () => {
    try {
      await auth.signOut()
      router.push("/")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Logo */}
        <h1 className="text-xl font-bold text-[#5B6EE8]">STUDI</h1>

        {/* Navigation Icons */}
        <div className="flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`p-2 rounded-lg transition ${
                  pathname === item.href ? "bg-[#5B6EE8] text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5" />
              </Link>
            )
          })}
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
