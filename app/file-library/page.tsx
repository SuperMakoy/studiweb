"use client"
import SmartFileSearch from "@/components/search/smart-file-search"
import { useState, useEffect } from "react"
import { getUserFiles, deleteMultipleFiles } from "@/lib/file-service"
import { useAuth } from "@/hooks/use-auth"
import Sidebar from "@/components/dashboard/sidebar"
import FileGrid from "@/components/file-library/file-grid"
import { Trash2 } from "lucide-react"
import FileUploadButton from "@/components/file-library/file-upload-button"

export default function FileLibraryPage() {
  const { user, loading } = useAuth()
  const [files, setFiles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filteredFiles, setFilteredFiles] = useState<any[]>([])
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!user) {
      setIsLoading(false)
      return
    }

    const loadFiles = async () => {
      try {
        const userFiles = await getUserFiles()
        setFiles(userFiles)
        setFilteredFiles(userFiles)
      } catch (error) {
        console.error("Error loading files:", error)
        setFiles([])
        setFilteredFiles([])
      } finally {
        setIsLoading(false)
      }
    }

    loadFiles()
  }, [user, loading])

  const handleSearchChange = (fileName: string) => {
    const filtered = fileName.trim()
      ? files.filter((file) => file.fileName.toLowerCase().includes(fileName.toLowerCase()))
      : files
    setFilteredFiles(filtered)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFiles(new Set(filteredFiles.map((f) => f.id)))
    } else {
      setSelectedFiles(new Set())
    }
  }

  const handleToggleFile = (fileId: string) => {
    const newSelected = new Set(selectedFiles)
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId)
    } else {
      newSelected.add(fileId)
    }
    setSelectedFiles(newSelected)
  }

  const handleDeleteSelected = async () => {
    if (selectedFiles.size === 0) return
    if (!confirm(`Delete ${selectedFiles.size} file(s)? This cannot be undone.`)) return

    setIsDeleting(true)
    try {
      await deleteMultipleFiles(Array.from(selectedFiles))
      const updatedFiles = files.filter((f) => !selectedFiles.has(f.id))
      setFiles(updatedFiles)
      setFilteredFiles(updatedFiles)
      setSelectedFiles(new Set())
    } catch (error) {
      console.error("Error deleting files:", error)
      alert("Failed to delete files")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleFileAdd = (newFile: any) => {
    const updatedFiles = [...files, newFile].sort((a, b) =>
      (a.displayName || a.fileName).localeCompare(b.displayName || b.fileName),
    )
    setFiles(updatedFiles)
    setFilteredFiles(updatedFiles)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-white">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading files...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Main header with title and add button */}
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">File Library</h1>
              <FileUploadButton onFileAdd={handleFileAdd} />
            </div>

            {/* Select All and Search Row */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedFiles.size === filteredFiles.length && filteredFiles.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-400 cursor-pointer"
                />
                <label className="text-gray-900 font-semibold cursor-pointer text-sm md:text-base">Select All</label>

                {selectedFiles.size > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    disabled={isDeleting}
                    className="ml-2 md:ml-4 bg-red-600 text-white px-3 md:px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition font-medium disabled:opacity-50 text-sm md:text-base"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete ({selectedFiles.size})
                  </button>
                )}
              </div>

              <SmartFileSearch files={files} onSelectFileName={handleSearchChange} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {filteredFiles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-base md:text-lg">
                  {files.length === 0 ? "No files yet. Upload a file to get started!" : "No files match your search."}
                </p>
              </div>
            ) : (
              <FileGrid files={filteredFiles} selectedFiles={selectedFiles} onToggleSelection={handleToggleFile} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
