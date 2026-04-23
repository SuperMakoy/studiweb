"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"

export default function MobileHeaderNav() {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" />
          <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5" />
          <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5" />
          <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5" />
        </svg>
      ),
    },
    {
      label: "Files",
      href: "/file-library",
      icon: (
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5 8h6M5 5.5h6M5 10.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: "AI Study",
      href: "/study-ai",
      icon: (
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M6 6.5c0-1.1.9-2 2-2s2 .9 2 2c0 1.5-2 2.5-2 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="8" cy="11.5" r=".75" fill="currentColor" />
        </svg>
      ),
    },
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
    <div
      className="md:hidden fixed top-0 left-0 right-0 z-50"
      style={{
        background: "rgba(13,13,43,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="flex items-center justify-between px-4 py-2.5">
        {/* Logo */}
        <span
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 20,
            fontWeight: 800,
            color: "#fff",
            letterSpacing: -0.5,
          }}
        >
          STU<span style={{ color: "#7f9fff" }}>DI</span>
        </span>

        {/* Navigation Icons */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: "7px 10px",
                  borderRadius: 9,
                  color: active ? "#9baeff" : "rgba(255,255,255,0.4)",
                  background: active ? "rgba(91,110,232,0.18)" : "transparent",
                  border: active ? "1px solid rgba(91,110,232,0.25)" : "1px solid transparent",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  textDecoration: "none",
                  fontSize: 11,
                  fontWeight: 600,
                  transition: "all .2s",
                }}
                title={item.label}
              >
                {item.icon}
                <span className="hidden xs:inline">{item.label}</span>
              </Link>
            )
          })}
          <button
            onClick={handleLogout}
            style={{
              padding: "7px 10px",
              borderRadius: 9,
              color: "rgba(255,107,107,0.7)",
              background: "transparent",
              border: "1px solid transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
            title="Logout"
          >
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
              <path
                d="M5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3M9 10l3-3-3-3M13 7H5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}