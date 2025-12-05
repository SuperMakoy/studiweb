"use client"
import { useState, useEffect } from "react"
import Sidebar from "@/components/dashboard/sidebar"
import WelcomeBanner from "@/components/dashboard/welcome-banner"
import RecentlyOpenedFiles from "@/components/dashboard/recently-opened-files"
import QuizHistory from "@/components/dashboard/quiz-history"
import { getUserFiles } from "@/lib/file-service"
import { useAuth } from "@/hooks/use-auth"
import SmartFileSearch from "@/components/search/smart-file-search"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const [files, setFiles] = useState<any[]>([])
  const [isLoadingFiles, setIsLoadingFiles] = useState(true)

  useEffect(() => {
    if (loading) return
    if (!user) {
      setIsLoadingFiles(false)
      return
    }

    const loadFiles = async () => {
      try {
        const userFiles = await getUserFiles()
        setFiles(userFiles)
      } catch (error) {
        console.error("Error loading files:", error)
        setFiles([])
      } finally {
        setIsLoadingFiles(false)
      }
    }

    loadFiles()
  }, [user, loading])

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <SmartFileSearch
            files={files}
            onSelectFile={(fileId) => (window.location.href = `/file-library/${fileId}`)}
          />

          <div className="flex items-center gap-3 ml-8">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              M
            </div>
            <span className="text-gray-900 font-semibold">Makoy</span>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <WelcomeBanner />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recently opened Files</h2>
              <RecentlyOpenedFiles />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quiz game history Score</h2>
              <QuizHistory />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
