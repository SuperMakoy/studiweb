"use client"

import type React from "react"

import { useState } from "react"
import { Search } from "lucide-react"

interface DashboardHeaderProps {
  searchQuery?: string
  onSearchChange?: (query: string) => void
  showSearch?: boolean
}

export default function DashboardHeader({ searchQuery = "", onSearchChange, showSearch = true }: DashboardHeaderProps) {
  const [internalQuery, setInternalQuery] = useState(searchQuery)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInternalQuery(value)
    onSearchChange?.(value)
  }

  return (
    <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
      {showSearch && (
        <div className="flex-1 max-w-md">
          <div className="relative flex items-center">
            <Search className="absolute left-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search file to Quiz"
              value={internalQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-full focus:outline-none focus:border-[#5B6EE8] transition"
            />
          </div>
        </div>
      )}

      {/* User Profile */}
      <div className={`flex items-center gap-3 ${showSearch ? "ml-8" : "ml-auto"}`}>
        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
          M
        </div>
        <span className="text-gray-900 font-semibold">Makoy</span>
      </div>
    </div>
  )
}
