"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { getUserRole } from "@/lib/auth-service"
import { getTeacherFiles, deleteTeacherFile, uploadTeacherFile, type TeacherFile } from "@/lib/teacher-file-service"

export default function TeacherDashboard() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [files, setFiles] = useState<TeacherFile[]>([])
  const [fileLoading, setFileLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check user authentication and role
  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push("/")
      return
    }

    // Check if user is a teacher
    const checkRole = async () => {
      const role = await getUserRole(user.uid)
      setUserRole(role)
      if (role !== "teacher") {
        // Redirect to appropriate dashboard
        router.push(role === "evaluator" ? "/evaluator/dashboard" : "/dashboard")
      }
    }

    checkRole()
  }, [user, authLoading, router])

  // Load teacher files
  useEffect(() => {
    if (!user || userRole !== "teacher") return

    const loadFiles = async () => {
      try {
        setFileLoading(true)
        const teacherFiles = await getTeacherFiles()
        setFiles(teacherFiles)
      } catch (error) {
        console.error("[v0] Error loading teacher files:", error)
      } finally {
        setFileLoading(false)
      }
    }

    loadFiles()
  }, [user, userRole])

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    setUploadError(null)
    setIsUploading(true)

    try {
      const file = selectedFiles[0]
      
      // Validate file type
      const validTypes = [
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/pdf",
      ]
      
      if (!validTypes.includes(file.type)) {
        setUploadError("Only TXT, DOCX, and PDF files are supported")
        setIsUploading(false)
        return
      }

      // Validate file size (max 5MB for teacher files)
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        setUploadError("File size must be less than 5MB")
        setIsUploading(false)
        return
      }

      const uploadedFile = await uploadTeacherFile(file)
      setFiles([uploadedFile, ...files])
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("[v0] Error uploading file:", error)
      setUploadError(error instanceof Error ? error.message : "Failed to upload file")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return

    try {
      await deleteTeacherFile(fileId)
      setFiles(files.filter(f => f.id !== fileId))
    } catch (error) {
      console.error("[v0] Error deleting file:", error)
    }
  }

  if (authLoading || userRole === null) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%)",
      color: "#fff",
      padding: "40px 24px",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header with Logout */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 48,
        }}>
          <div>
            <h1 style={{
              fontSize: 40,
              fontWeight: 800,
              marginBottom: 8,
              letterSpacing: -0.5,
              background: "linear-gradient(135deg, #fff 0%, #9baeff 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Create Quizzes
            </h1>
            <p style={{
              fontSize: 16,
              color: "rgba(255, 255, 255, 0.5)",
              marginTop: 8,
            }}>
              Iteratively craft the perfect quiz aligned with Bloom's Taxonomy
            </p>
          </div>
          <Link
            href="/"
            style={{
              padding: "11px 24px",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(91, 110, 232, 0.3)",
              borderRadius: 10,
              textDecoration: "none",
              color: "#fff",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(91, 110, 232, 0.15)"
              e.currentTarget.style.borderColor = "rgba(91, 110, 232, 0.5)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)"
              e.currentTarget.style.borderColor = "rgba(91, 110, 232, 0.3)"
            }}
          >
            ← Logout
          </Link>
        </div>

        {/* Upload Section */}
        <div
          style={{
            background: "rgba(91, 110, 232, 0.08)",
            border: "2px dashed rgba(91, 110, 232, 0.3)",
            borderRadius: 16,
            padding: 48,
            textAlign: "center",
            marginBottom: 48,
            backdropFilter: "blur(10px)",
          }}
        >
          {uploadError && (
            <div
              style={{
                background: "rgba(255, 107, 107, 0.12)",
                border: "1px solid rgba(255, 107, 107, 0.3)",
                color: "#ff6b6b",
                padding: "14px 18px",
                borderRadius: 8,
                marginBottom: 24,
                fontSize: 14,
              }}
            >
              {uploadError}
            </div>
          )}
          <div
            style={{
              width: 56,
              height: 56,
              margin: "0 auto 20px",
              background: "rgba(91, 110, 232, 0.15)",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width={28}
              height={28}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9baeff"
              strokeWidth={2}
            >
              <path d="M12 2v20M2 12h20" />
            </svg>
          </div>
          <h3
            style={{
              fontSize: 22,
              fontWeight: 700,
              marginBottom: 10,
              letterSpacing: -0.3,
            }}
          >
            Upload Your Study Material
          </h3>
          <p
            style={{
              fontSize: 14,
              color: "rgba(255, 255, 255, 0.5)",
              marginBottom: 24,
              maxWidth: 420,
              margin: "0 auto 24px",
            }}
          >
            Add PDF, DOCX, or TXT documents. We'll help you craft a quiz aligned with Bloom's Taxonomy
          </p>
          <label
            style={{
              display: "inline-block",
              padding: "14px 32px",
              background: isUploading
                ? "rgba(91, 110, 232, 0.5)"
                : "linear-gradient(135deg, #5B6EE8, #7b5ea7)",
              color: "#fff",
              borderRadius: 12,
              cursor: isUploading ? "not-allowed" : "pointer",
              fontWeight: 600,
              fontSize: 15,
              border: "none",
              boxShadow: isUploading
                ? "none"
                : "0 6px 20px rgba(91, 110, 232, 0.4)",
              transition: "all 0.3s",
              opacity: isUploading ? 0.7 : 1,
            }}
          >
            {isUploading ? "📤 Uploading..." : "📤 Choose File"}
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: "none" }}
              accept=".pdf,.docx,.txt"
              onChange={handleFileInputChange}
              disabled={isUploading}
            />
          </label>
        </div>

        {/* Files Grid */}
        <div>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 24,
              letterSpacing: -0.3,
            }}
          >
            {fileLoading ? "Loading..." : `Your Files (${files.length})`}
          </h2>

          {fileLoading ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "rgba(255, 255, 255, 0.3)",
              }}
            >
              Loading files...
            </div>
          ) : files.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "rgba(255, 255, 255, 0.3)",
              }}
            >
              No files yet. Upload one to get started.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 20,
              }}
            >
              {files.map((file) => (
                <div
                  key={file.id}
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(91, 110, 232, 0.2)",
                    borderRadius: 14,
                    padding: 24,
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    backdropFilter: "blur(10px)",
                    transition: "all 0.3s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)"
                    e.currentTarget.style.borderColor = "rgba(91, 110, 232, 0.4)"
                    e.currentTarget.style.transform = "translateY(-2px)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
                    e.currentTarget.style.borderColor = "rgba(91, 110, 232, 0.2)"
                    e.currentTarget.style.transform = "translateY(0)"
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 28,
                        marginBottom: 12,
                      }}
                    >
                      📄
                    </div>
                    <h3
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        marginBottom: 6,
                      }}
                    >
                      {file.displayName || file.fileName}
                    </h3>
                    <p
                      style={{
                        fontSize: 12,
                        color: "rgba(255, 255, 255, 0.4)",
                      }}
                    >
                      {(file.fileSize / 1024).toFixed(1)} KB
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      marginTop: "auto",
                    }}
                  >
                    <Link
                      href={`/teacher/create-quiz/${file.id}`}
                      style={{
                        flex: 1,
                        padding: "11px 16px",
                        background: "linear-gradient(135deg, #5B6EE8, #7b5ea7)",
                        color: "#fff",
                        borderRadius: 10,
                        textDecoration: "none",
                        textAlign: "center",
                        fontSize: 13,
                        fontWeight: 600,
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.3s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = "0.85"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = "1"
                      }}
                    >
                      ✏️ Create Quiz
                    </Link>
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      style={{
                        padding: "11px 16px",
                        background: "rgba(255, 107, 107, 0.1)",
                        border: "1px solid rgba(255, 107, 107, 0.2)",
                        borderRadius: 10,
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#ff6b6b",
                        transition: "all 0.3s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255, 107, 107, 0.2)"
                        e.currentTarget.style.borderColor = "rgba(255, 107, 107, 0.4)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255, 107, 107, 0.1)"
                        e.currentTarget.style.borderColor = "rgba(255, 107, 107, 0.2)"
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Quizzes Button */}
        {files.length > 0 && (
          <div style={{ marginTop: 60, textAlign: "center" }}>
            <Link
              href="/teacher/my-quizzes"
              style={{
                display: "inline-block",
                padding: "14px 40px",
                background: "linear-gradient(135deg, #51CF66, #37b24d)",
                color: "#fff",
                borderRadius: 12,
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 15,
                boxShadow: "0 6px 20px rgba(81, 207, 102, 0.3)",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.9"
                e.currentTarget.style.transform = "translateY(-2px)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1"
                e.currentTarget.style.transform = "translateY(0)"
              }}
            >
              📚 View My Quizzes
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
