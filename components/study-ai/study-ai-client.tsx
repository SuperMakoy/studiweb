"use client"

import { useState, useEffect, useRef } from "react"
import { auth } from "@/lib/firebase"
import { getUserFiles } from "@/lib/file-service"
import Sidebar from "@/components/dashboard/sidebar"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface UserFile {
  id: string
  fileName: string
  fileSize: number
  uploadedAt: Date
}

export default function StudyAiClient() {
  const [selectedFile, setSelectedFile] = useState<UserFile | null>(null)
  const [files, setFiles] = useState<UserFile[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingFiles, setIsLoadingFiles] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadFiles()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadFiles = async () => {
    try {
      const user = auth.currentUser
      if (!user) return

      const userFiles = await getUserFiles()
      setFiles(
        userFiles.map((f) => ({
          id: f.id,
          fileName: f.displayName || f.fileName,
          fileSize: f.fileSize,
          uploadedAt: f.uploadedAt,
        })),
      )
    } catch (error) {
      console.error("Error loading files:", error)
    } finally {
      setIsLoadingFiles(false)
    }
  }

  const handleFileSelect = (file: UserFile) => {
    setSelectedFile(file)
    setMessages([
      {
        id: Date.now().toString(),
        role: "assistant",
        content: `Great! I'm ready to help you study "${file.fileName}". Feel free to ask me anything about this material - I can explain concepts, create practice questions, or help clarify any topics you're unsure about.`,
        timestamp: new Date(),
      },
    ])
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setMessages([])
  }

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedFile || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      console.log("[v0] Sending message to API:", { fileId: selectedFile.id, fileName: selectedFile.fileName })

      const response = await fetch("/api/study-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: selectedFile.id,
          fileName: selectedFile.fileName,
          message: input,
          chatHistory: messages.slice(-10),
        }),
      })

      const data = await response.json()
      console.log("[v0] API response:", { ok: response.ok, status: response.status, data })

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`)
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("[v0] Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Study with AI</h1>
              <p className="text-sm text-gray-600">Ask questions and get instant help with your study materials</p>
            </div>
            {selectedFile && (
              <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-lg">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="font-medium text-indigo-900">{selectedFile.fileName}</span>
                <button onClick={handleRemoveFile} className="ml-2 text-indigo-600 hover:text-indigo-800 transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </header>

        {!selectedFile ? (
          // File Selection Screen
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-4xl w-full">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Select a file to study</h2>
                <p className="text-gray-600">Choose from your uploaded files to start chatting with AI</p>
              </div>

              {isLoadingFiles ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : files.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
                  <p className="text-gray-600 mb-4">No files uploaded yet</p>
                  <a
                    href="/file-library"
                    className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
                  >
                    Go to File Library
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {files.map((file) => (
                    <button
                      key={file.id}
                      onClick={() => handleFileSelect(file)}
                      className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-indigo-500 hover:shadow-lg transition text-left group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">
                          <svg
                            className="w-6 h-6 text-yellow-800"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate mb-1">{file.fileName}</h3>
                          <p className="text-sm text-gray-500">{(file.fileSize / 1024).toFixed(2)} KB</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          // Chat Interface
          <div className="flex-1 flex flex-col">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[70%] rounded-2xl px-6 py-4 ${
                      message.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-white border border-gray-200 text-gray-900"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    <span
                      className={`text-xs mt-2 block ${message.role === "user" ? "text-indigo-200" : "text-gray-500"}`}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4">
                    <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 bg-white p-6">
              <div className="max-w-4xl mx-auto">
                <div className="flex gap-4 items-end">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder="Ask a question about your study material..."
                    className="flex-1 resize-none rounded-xl border-2 border-gray-300 px-4 py-3 focus:outline-none focus:border-indigo-500 min-h-[60px] max-h-[200px]"
                    rows={2}
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    Send
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift + Enter for new line</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
