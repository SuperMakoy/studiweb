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
  const [showBlockedPopup, setShowBlockedPopup] = useState(false)
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

    const fileName = file.name.toLowerCase()
    const isPDF = fileName.endsWith(".pdf") || file.type === "application/pdf"
    const isPPT =
      fileName.endsWith(".ppt") ||
      fileName.endsWith(".pptx") ||
      file.type === "application/vnd.ms-powerpoint" ||
      file.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation"

    if (isPDF || isPPT) {
      setShowBlockedPopup(true)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      return
    }

    const maxSize = 1 * 1024 * 1024
    if (file.size > maxSize) {
      onError?.("File size must be less than 1MB for storage")
      return
    }

    const validTypes = [
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (!validTypes.includes(file.type)) {
      onError?.("Only TXT and DOC files are supported")
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
        accept=".txt,.doc,.docx"
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

      {showBlockedPopup && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">File Type Not Supported</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                PDF and PowerPoint files are not supported at this time. Please upload <strong>TXT</strong> or{" "}
                <strong>Word DOC</strong> files instead.
              </p>
              <button
                onClick={() => setShowBlockedPopup(false)}
                className="w-full px-6 py-3 bg-[#5B6EE8] text-white rounded-lg hover:bg-[#4A5AC9] font-semibold text-lg transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

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
