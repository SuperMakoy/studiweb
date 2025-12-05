"use client"

import React from "react"

import { Search } from "lucide-react"

interface SmartFileSearchProps {
  files: any[]
  onSelectFile?: (fileId: string) => void
  onSelectFileName?: (fileName: string) => void
}

export default function SmartFileSearch({ files, onSelectFile, onSelectFileName }: SmartFileSearchProps) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [showDropdown, setShowDropdown] = React.useState(false)

  const searchSuggestions = searchTerm.trim()
    ? files.filter((file) => file.fileName.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5)
    : []

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    setShowDropdown(value.length > 0)
  }

  const handleSelectSuggestion = (file: any) => {
    setSearchTerm(file.fileName)
    setShowDropdown(false)
    if (onSelectFile) {
      onSelectFile(file.id)
    } else if (onSelectFileName) {
      onSelectFileName(file.fileName)
    }
  }

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        type="text"
        placeholder="Search file to Quiz"
        value={searchTerm}
        onChange={handleSearchChange}
        onFocus={() => searchTerm.length > 0 && setShowDropdown(true)}
        className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-full focus:outline-none focus:border-[#5B6EE8] transition"
      />

      {showDropdown && searchSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
          {searchSuggestions.map((file) => (
            <button
              key={file.id}
              onClick={() => handleSelectSuggestion(file)}
              className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-gray-200 last:border-b-0 flex items-center gap-3 transition"
            >
              <div className="flex-1">
                <p className="text-gray-900 font-medium">{file.fileName}</p>
                <p className="text-gray-500 text-sm">{(file.fileSize / 1024).toFixed(2)} KB</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
