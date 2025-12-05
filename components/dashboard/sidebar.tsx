"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: "📊" },
    { label: "File Library", href: "/file-library", icon: "📁" },
    { label: "Study with Ai", href: "/study-ai", icon: "🤖" },
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
    <div className="w-52 bg-[#5B6EE8] text-white flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-3xl font-bold">STUDI</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition ${
              pathname === item.href ? "bg-white text-[#5B6EE8]" : "text-white hover:bg-[#4A5AC9]"
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-6 border-t border-[#4A5AC9]">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-white text-[#5B6EE8] font-bold rounded-lg hover:bg-gray-100 transition"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
