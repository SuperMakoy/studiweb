"use client"

import Link from "next/link"

interface File {
  id: string
  fileName: string
  displayName?: string
  uploadedAt: Date
  fileSize: number
}

interface FileGridProps {
  files: File[]
  selectedFiles: Set<string>
  onToggleSelection: (fileId: string) => void
}

export default function FileGrid({ files, selectedFiles, onToggleSelection }: FileGridProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {files.map((file) => (
        <div key={file.id} className="relative group">
          <Link href={`/file-library/${file.id}`}>
            <div className="bg-gray-200 rounded-2xl p-6 h-64 flex flex-col items-center justify-center hover:shadow-lg transition cursor-pointer">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-xl flex items-center justify-center text-5xl mb-4 group-hover:scale-110 transition transform flex-shrink-0">
                📁
              </div>
              <p className="text-gray-900 font-bold text-base text-center line-clamp-2 w-full min-h-[3rem] flex items-center justify-center">
                {file.displayName || file.fileName}
              </p>
              <p className="text-gray-600 text-sm mt-2">{formatFileSize(file.fileSize)}</p>
            </div>
          </Link>

          {/* Checkbox Overlay */}
          <div
            className="absolute top-3 left-3 w-6 h-6 bg-white border-2 border-gray-400 rounded-md flex items-center justify-center cursor-pointer"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggleSelection(file.id)
            }}
          >
            {selectedFiles.has(file.id) && (
              <svg className="w-4 h-4 text-[#5B6EE8]" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
