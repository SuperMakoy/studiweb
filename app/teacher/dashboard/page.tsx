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
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Mobile Header */}
      <div style={{
        display: "none",
        padding: "16px 24px",
        borderBottom: "1px solid rgba(91, 110, 232, 0.1)",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>STUDI</h1>
        <Link
          href="/"
          style={{
            color: "rgba(255, 255, 255, 0.6)",
            textDecoration: "none",
            fontSize: 13,
          }}
        >
          Logout
        </Link>
      </div>

      <div style={{ display: "flex", flex: 1 }}>
        {/* Sidebar */}
        <div style={{
          width: 200,
          background: "rgba(255, 255, 255, 0.02)",
          borderRight: "1px solid rgba(91, 110, 232, 0.1)",
          padding: "32px 0",
          position: "relative",
        }}>
          <div style={{ padding: "0 20px", marginBottom: 48 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>STUDI</h1>
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{
              padding: "12px 20px",
              fontSize: 13,
              fontWeight: 600,
              color: "#9baeff",
              background: "rgba(91, 110, 232, 0.15)",
              borderLeft: "3px solid #9baeff",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}>
              Dashboard
            </div>
            <Link
              href="/teacher/my-quizzes"
              style={{
                padding: "12px 20px",
                fontSize: 13,
                color: "rgba(255, 255, 255, 0.6)",
                textDecoration: "none",
                transition: "all 0.2s",
                display: "block",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.background = "rgba(91, 110, 232, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              My Quizzes
            </Link>
          </nav>

          <div style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            right: 20,
          }}>
            <Link
              href="/"
              style={{
                display: "block",
                padding: "10px 12px",
                textAlign: "center",
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(91, 110, 232, 0.2)",
                borderRadius: 8,
                textDecoration: "none",
                color: "#fff",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(91, 110, 232, 0.15)";
                e.currentTarget.style.borderColor = "rgba(91, 110, 232, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                e.currentTarget.style.borderColor = "rgba(91, 110, 232, 0.2)";
              }}
            >
              Logout
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: "40px 24px", overflowY: "auto" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            {/* Header */}
            <div style={{ marginBottom: 48 }}>
              <h2 style={{
                fontSize: 14,
                fontWeight: 700,
                color: "rgba(255, 255, 255, 0.4)",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 12,
              }}>
                SUNDAY, {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
              </h2>
              <h1 style={{
                fontSize: 36,
                fontWeight: 800,
                marginBottom: 8,
                letterSpacing: -0.5,
              }}>
                Welcome back, educator!
              </h1>
              <p style={{
                fontSize: 16,
                color: "rgba(255, 255, 255, 0.5)",
                marginTop: 8,
              }}>
                Iteratively craft the perfect quiz aligned with Bloom's Taxonomy
              </p>
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
                    background: "rgba(255, 107, 107, 0.15)",
                    border: "1px solid rgba(255, 107, 107, 0.4)",
                    color: "#ff8787",
                    padding: "14px 18px",
                    borderRadius: 10,
                    marginBottom: 24,
                    fontSize: 14,
                  }}
                >
                  {uploadError}
                </div>
              )}
              <div
                style={{
                  fontSize: 48,
                  marginBottom: 20,
                }}
              >
                +
              </div>
              <h3
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  marginBottom: 12,
                  letterSpacing: -0.3,
                }}
              >
                Upload Your Study Material
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: "rgba(255, 255, 255, 0.5)",
                  marginBottom: 28,
                  maxWidth: 500,
                  margin: "0 auto 28px",
                  lineHeight: 1.6,
                }}
              >
                Add PDF, DOCX, or TXT documents. We&apos;ll help you craft a quiz aligned with Bloom's Taxonomy
              </p>
              <label
                style={{
                  display: "inline-block",
                  padding: "13px 32px",
                  background: isUploading
                    ? "rgba(91, 110, 232, 0.5)"
                    : "linear-gradient(135deg, #5B6EE8, #7b5ea7)",
                  color: "#fff",
                  borderRadius: 12,
                  cursor: isUploading ? "not-allowed" : "pointer",
                  fontWeight: 700,
                  fontSize: 15,
                  border: "none",
                  boxShadow: isUploading
                    ? "none"
                    : "0 6px 20px rgba(91, 110, 232, 0.4)",
                  transition: "all 0.3s",
                  opacity: isUploading ? 0.7 : 1,
                }}
              >
                {isUploading ? "Uploading..." : "Choose File"}
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
                  fontSize: 16,
                  fontWeight: 700,
                  marginBottom: 24,
                  letterSpacing: -0.3,
                  textTransform: "capitalize",
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
                    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: 16,
                  }}
                >
                  {files.map((file) => (
                    <div
                      key={file.id}
                      style={{
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(91, 110, 232, 0.15)",
                        borderRadius: 12,
                        padding: 20,
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                        backdropFilter: "blur(10px)",
                        transition: "all 0.2s",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)"
                        e.currentTarget.style.borderColor = "rgba(91, 110, 232, 0.3)"
                        e.currentTarget.style.transform = "translateY(-2px)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"
                        e.currentTarget.style.borderColor = "rgba(91, 110, 232, 0.15)"
                        e.currentTarget.style.transform = "translateY(0)"
                      }}
                    >
                      <div>
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            background: "rgba(91, 110, 232, 0.1)",
                            borderRadius: 10,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 24,
                            marginBottom: 12,
                          }}
                        >
                          📄
                        </div>
                        <h3
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            marginBottom: 4,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {file.displayName || file.fileName}
                        </h3>
                        <p
                          style={{
                            fontSize: 11,
                            color: "rgba(255, 255, 255, 0.4)",
                          }}
                        >
                          {(file.fileSize / 1024).toFixed(1)} KB
                        </p>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          marginTop: "auto",
                        }}
                      >
                        <Link
                          href={`/teacher/create-quiz/${file.id}`}
                          style={{
                            flex: 1,
                            padding: "9px 12px",
                            background: "linear-gradient(135deg, #5B6EE8, #7b5ea7)",
                            color: "#fff",
                            borderRadius: 8,
                            textDecoration: "none",
                            textAlign: "center",
                            fontSize: 12,
                            fontWeight: 600,
                            border: "none",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = "0.85"
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = "1"
                          }}
                        >
                          Create Quiz
                        </Link>
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          style={{
                            padding: "9px 12px",
                            background: "rgba(255, 107, 107, 0.1)",
                            border: "1px solid rgba(255, 107, 107, 0.2)",
                            borderRadius: 8,
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 500,
                            color: "#ff8787",
                            transition: "all 0.2s",
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
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
