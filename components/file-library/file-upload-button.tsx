"use client"

import type React from "react"
import { useRef, useState } from "react"
import { uploadStudyFile } from "@/lib/file-service"
import { useAuth } from "@/hooks/use-auth"

interface FileUploadButtonProps {
  onFileAdd: (file: any) => void
  onError?: (error: string) => void
}

export default function FileUploadButton({ onFileAdd, onError }: FileUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [customName, setCustomName] = useState("")
  const [uploadedFile, setUploadedFile] = useState<any>(null)
  const { user } = useAuth()

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (!user) {
      onError?.("Please sign in to upload files")
      return
    }

    const file = files[0]

    const maxSize = 1 * 1024 * 1024
    if (file.size > maxSize) {
      onError?.("File size must be less than 1MB for storage")
      return
    }

    const validTypes = [
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (!validTypes.includes(file.type)) {
      onError?.("Only PDF, TXT, and DOC files are supported")
      return
    }

    try {
      setIsLoading(true)
      const uploaded = await uploadStudyFile(file)
      setUploadedFile(uploaded)
      setCustomName(uploaded.fileName)
      setShowModal(true)
    } catch (error: any) {
      console.error("Error uploading file:", error)
      onError?.(error.message || "Failed to upload file")
      setIsLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleConfirmName = async () => {
    if (!customName.trim()) {
      onError?.("File name cannot be empty")
      return
    }

    try {
      const { updateFileDisplayName } = await import("@/lib/file-service")
      await updateFileDisplayName(uploadedFile.id, customName)

      const fileWithCustomName = { ...uploadedFile, displayName: customName }
      onFileAdd(fileWithCustomName)
      setShowModal(false)
      setCustomName("")
      setUploadedFile(null)
    } catch (error: any) {
      console.error("Error updating file name:", error)
      onError?.(error.message || "Failed to update file name")
    } finally {
      setIsLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleCancel = () => {
    setShowModal(false)
    setCustomName("")
    setUploadedFile(null)
    setIsLoading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,.doc,.docx"
        onChange={handleFileChange}
        className="hidden"
        disabled={isLoading || showModal}
      />
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="pointer-events-auto z-10 bg-[#5B6EE8] text-white px-6 py-2 font-bold rounded-lg hover:bg-[#4A5AC9] transition disabled:opacity-50 cursor-pointer"
      >
        {isLoading ? "Uploading..." : "+ Add new"}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Rename Your File</h2>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Enter a name for your file"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[#5B6EE8]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleConfirmName()
                if (e.key === "Escape") handleCancel()
              }}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmName}
                className="px-4 py-2 bg-[#5B6EE8] text-white rounded-lg hover:bg-[#4A5AC9]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
