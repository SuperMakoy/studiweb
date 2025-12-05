"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useState } from "react"

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-[#5B6EE8] text-white px-4 md:px-8 lg:px-16 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <Image
            src="/studi-logo.svg"
            alt="STUDI Logo"
            width={100}
            height={33}
            className="md:w-[120px] md:h-[40px]"
            priority
          />
        </Link>

        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`w-6 h-0.5 bg-white transition-all ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`w-6 h-0.5 bg-white transition-all ${mobileMenuOpen ? "opacity-0" : ""}`} />
          <span className={`w-6 h-0.5 bg-white transition-all ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>

        <div className="hidden md:flex gap-8 items-center">
          <Link
            href="#"
            className="flex items-center gap-2 text-lg font-semibold hover:scale-105 transition-transform group"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="group-hover:opacity-80 transition-opacity"
            >
              <path
                d="M3 5 L3 17 C3 18 4 19 5 19 L15 19 C16 19 17 18 17 17 L17 5 M2 5 L10 2 L18 5 M7 10 L13 10 M7 13 L13 13"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="group-hover:underline underline-offset-4">HOME</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-2 text-lg font-semibold hover:scale-105 transition-transform group"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="group-hover:opacity-80 transition-opacity"
            >
              <rect x="4" y="4" width="12" height="14" rx="1" stroke="white" strokeWidth="1.5" fill="none" />
              <line x1="7" y1="8" x2="13" y2="8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="7" y1="11" x2="13" y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="7" y1="14" x2="10" y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="group-hover:underline underline-offset-4">CONTACT</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-2 text-lg font-semibold hover:scale-105 transition-transform group"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="group-hover:opacity-80 transition-opacity"
            >
              <path
                d="M18 10 C18 6 15 3 10 3 C5 3 2 6 2 10 C2 13 4 15 6 16 L6 19 L9 17 C9.3 17 9.6 17 10 17 C15 17 18 14 18 10 Z"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <circle cx="7" cy="10" r="0.8" fill="white" />
              <circle cx="10" cy="10" r="0.8" fill="white" />
              <circle cx="13" cy="10" r="0.8" fill="white" />
            </svg>
            <span className="group-hover:underline underline-offset-4">CHAT SUPPORT</span>
          </Link>
        </div>

        <Link href="/login" className="hidden md:block">
          <Button className="bg-white text-[#5B6EE8] px-6 py-2 font-bold rounded-lg hover:bg-gray-100 transition">
            LOGIN
          </Button>
        </Link>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-4 pb-4 border-t border-white/20 pt-4">
          <Link
            href="#"
            className="flex items-center gap-2 text-base font-semibold hover:opacity-80 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M3 5 L3 17 C3 18 4 19 5 19 L15 19 C16 19 17 18 17 17 L17 5 M2 5 L10 2 L18 5 M7 10 L13 10 M7 13 L13 13"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>HOME</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-2 text-base font-semibold hover:opacity-80 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="4" width="12" height="14" rx="1" stroke="white" strokeWidth="1.5" fill="none" />
              <line x1="7" y1="8" x2="13" y2="8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="7" y1="11" x2="13" y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="7" y1="14" x2="10" y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>CONTACT</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-2 text-base font-semibold hover:opacity-80 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M18 10 C18 6 15 3 10 3 C5 3 2 6 2 10 C2 13 4 15 6 16 L6 19 L9 17 C9.3 17 9.6 17 10 17 C15 17 18 14 18 10 Z"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <circle cx="7" cy="10" r="0.8" fill="white" />
              <circle cx="10" cy="10" r="0.8" fill="white" />
              <circle cx="13" cy="10" r="0.8" fill="white" />
            </svg>
            <span>CHAT SUPPORT</span>
          </Link>
          <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
            <Button className="bg-white text-[#5B6EE8] w-full px-6 py-2 font-bold rounded-lg hover:bg-gray-100 transition">
              LOGIN
            </Button>
          </Link>
        </div>
      )}
    </nav>
  )
}
