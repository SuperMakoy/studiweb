"use client"

import { useState, useEffect } from "react"
import FileUploadButton from "./file-upload-button"
import FileGrid from "./file-grid"
import { getUserFiles, deleteMultipleFiles } from "@/lib/file-service"
import { useAuth } from "@/hooks/use-auth"

interface FileData {
  id: string
  fileName: string
  uploadedAt: Date
  fileSize: number
  fileData: string
}

export default function FileLibraryContent() {
  const [files, setFiles] = useState<FileData[]>([])
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadFiles()
    }
  }, [user])

  const loadFiles = async () => {
    try {
      setLoading(true)
      const userFiles = await getUserFiles()
      setFiles(
        userFiles.map((f) => ({
          id: f.id,
          fileName: f.fileName,
          uploadedAt: f.uploadedAt,
          fileSize: f.fileSize,
          fileData: f.fileData,
        })),
      )
    } catch (err) {
      console.error("Error loading files:", err)
      setError("Failed to load files")
    } finally {
      setLoading(false)
    }
  }

  const handleAddFile = (newFile: FileData) => {
    setFiles([...files, newFile])
  }

  const toggleFileSelection = (fileId: string) => {
    const newSelected = new Set(selectedFiles)
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId)
    } else {
      newSelected.add(fileId)
    }
    setSelectedFiles(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set())
    } else {
      setSelectedFiles(new Set(files.map((f) => f.id)))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedFiles.size === 0) return

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedFiles.size} file(s)? This action cannot be undone.`,
    )
    if (!confirmDelete) return

    try {
      setLoading(true)
      await deleteMultipleFiles(Array.from(selectedFiles))
      setFiles(files.filter((f) => !selectedFiles.has(f.id)))
      setSelectedFiles(new Set())
      setError("")
    } catch (err) {
      console.error("Error deleting files:", err)
      setError("Failed to delete selected files")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">File Library</h1>
          <FileUploadButton onFileAdd={handleAddFile} onError={(err) => setError(err)} />
        </div>

        {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg mb-4">{error}</div>}

        <div className="flex items-center gap-4 mb-8">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedFiles.size === files.length && files.length > 0}
              onChange={toggleSelectAll}
              className="w-6 h-6 cursor-pointer"
            />
            <span className="text-gray-700 font-semibold">Select</span>
          </label>

          <input
            type="text"
            placeholder="Search file to Quiz"
            className="flex-1 max-w-md px-4 py-2 border-2 border-gray-300 rounded-full focus:outline-none focus:border-[#5B6EE8] transition"
          />

          {selectedFiles.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              disabled={loading}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold rounded-lg transition"
            >
              Delete ({selectedFiles.size})
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading your files...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No files uploaded yet. Click "Add new" to get started!</p>
          </div>
        ) : (
          <FileGrid files={files} selectedFiles={selectedFiles} onToggleSelection={toggleFileSelection} />
        )}
      </div>
    </div>
  )
}
