"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { getUserFiles } from "@/lib/file-service"
import { useAuth } from "@/hooks/use-auth"

export default function RecentlyOpenedFiles() {
  const { user, loading } = useAuth()
  const [files, setFiles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (loading) return
    if (!user) {
      setIsLoading(false)
      return
    }

    const loadFiles = async () => {
      try {
        const userFiles = await getUserFiles()
        const sortedByModified = userFiles.sort((a, b) => {
          const timeA = a.lastModified?.getTime() || a.uploadedAt.getTime()
          const timeB = b.lastModified?.getTime() || b.uploadedAt.getTime()
          return timeB - timeA
        })
        // Get the 3 most recently modified files
        setFiles(sortedByModified.slice(0, 3))
      } catch (error) {
        console.error("Error loading files:", error)
        setFiles([])
      } finally {
        setIsLoading(false)
      }
    }

    loadFiles()
  }, [user, loading])

  if (isLoading) {
    return <div className="text-gray-500">Loading files...</div>
  }

  if (files.length === 0) {
    return <div className="text-gray-500">No files yet. Upload a file to get started!</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {files.map((file) => (
        <Link
          key={file.id}
          href={`/file-library/${file.id}`}
          className="bg-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center hover:shadow-lg transition cursor-pointer group"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-xl flex items-center justify-center text-5xl mb-4 group-hover:scale-110 transition transform">
            📁
          </div>
          <p className="text-gray-900 font-bold text-lg text-center">{file.displayName || file.fileName}</p>
        </Link>
      ))}
    </div>
  )
}
