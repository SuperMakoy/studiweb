"use client"
import { useState, useEffect } from "react"
import Sidebar from "@/components/dashboard/sidebar"
import MobileHeaderNav from "@/components/dashboard/mobile-header-nav"
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
    <div className="md:flex h-screen bg-gray-50">
      <MobileHeaderNav />
      {/* </CHANGE> */}
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden pt-14 md:pt-0">
        {/* </CHANGE> */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 md:py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
          <SmartFileSearch
            files={files}
            onSelectFile={(fileId) => (window.location.href = `/file-library/${fileId}`)}
          />

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-lg">
              M
            </div>
            <span className="text-gray-900 font-semibold text-sm md:text-base">Makoy</span>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-3 md:p-8">
          <div className="max-w-7xl mx-auto space-y-4 md:space-y-8">
            {/* </CHANGE> */}
            <WelcomeBanner />
            <div>
              <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-3 md:mb-6">Recently opened Files</h2>
              {/* </CHANGE> */}
              <RecentlyOpenedFiles />
            </div>
            <div>
              <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-3 md:mb-6">Quiz game history Score</h2>
              {/* </CHANGE> */}
              <QuizHistory />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
