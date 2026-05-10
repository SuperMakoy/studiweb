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
    <div style={{ minHeight: "100vh", background: "#f5f5f5", padding: "40px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Teacher Dashboard</h1>
            <p style={{ color: "#666" }}>Create and manage quizzes for your students</p>
          </div>
          <Link href="/" style={{
            padding: "10px 20px",
            background: "#e0e0e0",
            borderRadius: 8,
            textDecoration: "none",
            color: "#000",
            fontSize: 14,
            fontWeight: 500,
          }}>
            Logout
          </Link>
        </div>

        {/* Upload Section */}
        <div style={{
          background: "#fff",
          border: "2px dashed #ccc",
          borderRadius: 12,
          padding: 40,
          textAlign: "center",
          marginBottom: 40,
        }}>
          {uploadError && (
            <div style={{
              background: "#ffebee",
              border: "1px solid #ffcdd2",
              color: "#c62828",
              padding: "12px 16px",
              borderRadius: 6,
              marginBottom: 20,
              textAlign: "left",
            }}>
              {uploadError}
            </div>
          )}
          <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth={2} style={{ margin: "0 auto 16px" }}>
            <path d="M12 2v20M2 12h20" />
          </svg>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Upload Study Material</h3>
          <p style={{ color: "#666", marginBottom: 20 }}>
            Upload a document (PDF, DOCX, TXT) to create quizzes
          </p>
          <label style={{
            display: "inline-block",
            padding: "12px 28px",
            background: isUploading ? "#999" : "#5B6EE8",
            color: "#fff",
            borderRadius: 8,
            cursor: isUploading ? "not-allowed" : "pointer",
            fontWeight: 600,
            opacity: isUploading ? 0.7 : 1,
          }}>
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

        {/* Files List */}
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>Your Files</h2>
          
          {fileLoading ? (
            <p style={{ textAlign: "center", color: "#999" }}>Loading files...</p>
          ) : files.length === 0 ? (
            <p style={{ textAlign: "center", color: "#999", padding: "40px 20px" }}>
              No files yet. Upload one to get started.
            </p>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 20,
            }}>
              {files.map(file => (
                <div key={file.id} style={{
                  background: "#fff",
                  border: "1px solid #e0e0e0",
                  borderRadius: 12,
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
                      {file.displayName || file.fileName}
                    </h3>
                    <p style={{ fontSize: 12, color: "#999" }}>
                      {(file.fileSize / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                    <Link
                      href={`/teacher/create-quiz/${file.id}`}
                      style={{
                        flex: 1,
                        padding: "10px 16px",
                        background: "#5B6EE8",
                        color: "#fff",
                        borderRadius: 6,
                        textDecoration: "none",
                        textAlign: "center",
                        fontSize: 14,
                        fontWeight: 500,
                      }}
                    >
                      Create Quiz
                    </Link>
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      style={{
                        padding: "10px 16px",
                        background: "#f0f0f0",
                        border: "none",
                        borderRadius: 6,
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#d32f2f",
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

        {/* My Quizzes Link */}
        <div style={{ marginTop: 60, textAlign: "center" }}>
          <Link
            href="/teacher/my-quizzes"
            style={{
              display: "inline-block",
              padding: "12px 28px",
              background: "#27ae60",
              color: "#fff",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            View My Quizzes
          </Link>
        </div>
      </div>
    </div>
  )
}
