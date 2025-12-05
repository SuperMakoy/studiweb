"use client"
import { Construction } from "lucide-react"
import Sidebar from "@/components/dashboard/sidebar"
import { useAuth } from "@/hooks/use-auth"

export default function StudyAiPage() {
  const { user } = useAuth()

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Study with AI</h1>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-base md:text-lg">
              M
            </div>
            <span className="text-gray-900 font-semibold text-sm md:text-base">Makoy</span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center justify-center rounded-full bg-yellow-100 p-4 md:p-6">
              <Construction className="h-12 w-12 md:h-16 md:w-16 text-yellow-600" />
            </div>
            <h2 className="mb-3 text-2xl md:text-3xl font-bold text-gray-900">Under Construction</h2>
            <p className="mb-2 text-base md:text-lg text-gray-600">Study with AI feature is coming soon!</p>
            <p className="text-sm text-gray-500">
              We're working hard to bring you this feature. Check back later for updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
