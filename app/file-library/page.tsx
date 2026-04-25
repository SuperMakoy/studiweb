"use client"
import SmartFileSearch from "@/components/search/smart-file-search"
import { useState, useEffect } from "react"
import { getUserFiles, deleteMultipleFiles } from "@/lib/file-service"
import { useAuth } from "@/hooks/use-auth"
import Sidebar from "@/components/dashboard/sidebar"
import MobileHeaderNav from "@/components/dashboard/mobile-header-nav"
import FileGrid from "@/components/file-library/file-grid"
import FileUploadButton from "@/components/file-library/file-upload-button"

export default function FileLibraryPage() {
  const { user, loading } = useAuth()
  const [files, setFiles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filteredFiles, setFilteredFiles] = useState<any[]>([])
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const [folders, setFolders] = useState<any[]>([])
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (loading) return
    if (!user) { setIsLoading(false); return }
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
      ? files.filter((f) => f.fileName.toLowerCase().includes(fileName.toLowerCase()))
      : files
    setFilteredFiles(filtered)
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedFiles(checked ? new Set(filteredFiles.map((f) => f.id)) : new Set())
  }

  const handleToggleFile = (fileId: string) => {
    const newSelected = new Set(selectedFiles)
    newSelected.has(fileId) ? newSelected.delete(fileId) : newSelected.add(fileId)
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
      (a.displayName || a.fileName).localeCompare(b.displayName || b.fileName)
    )
    setFiles(updatedFiles)
    setFilteredFiles(updatedFiles)
  }

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const newFolder = {
        id: `folder_${Date.now()}`,
        name: newFolderName,
        files: [],
        createdAt: new Date().toISOString(),
      }
      setFolders([...folders, newFolder])
      setNewFolderName("")
      setShowCreateFolder(false)
    }
  }

  const toggleFolderExpand = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    newExpanded.has(folderId) ? newExpanded.delete(folderId) : newExpanded.add(folderId)
    setExpandedFolders(newExpanded)
  }

  const handleMoveFileToFolder = (fileId: string, folderId: string) => {
    const updatedFolders = folders.map((folder: any) => {
      if (folder.id === folderId) {
        const file = files.find((f: any) => f.id === fileId)
        if (file && !folder.files.some((f: any) => f.id === fileId)) {
          return { ...folder, files: [...folder.files, file] }
        }
      }
      return folder
    })
    setFolders(updatedFolders)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .fl-page * { box-sizing: border-box; }
        .fl-page { font-family: 'DM Sans', 'Segoe UI', sans-serif; }
        .fl-checkbox { accent-color: #5B6EE8; }
        .fl-search-wrap input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 100px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          padding: 8px 16px 8px 38px;
          outline: none;
          width: 100%;
          transition: border-color .2s;
        }
        .fl-search-wrap input::placeholder { color: rgba(255,255,255,0.25); }
        .fl-search-wrap input:focus { border-color: #5B6EE8; }
        @keyframes flBlob {
          0%,100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        .fl-blob { animation: flBlob ease-in-out infinite; }
      `}</style>

      <div
        className="fl-page"
        style={{
          display: "flex",
          height: "100vh",
          overflow: "hidden",
          background: "#07071a",
          color: "#fff",
          position: "relative",
        }}
      >
        {/* Ambient blobs */}
        <div
          className="fl-blob"
          style={{
            position: "fixed",
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "rgba(91,110,232,0.08)",
            filter: "blur(80px)",
            top: -60,
            left: 220,
            animationDuration: "9s",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <div
          className="fl-blob"
          style={{
            position: "fixed",
            width: 240,
            height: 240,
            borderRadius: "50%",
            background: "rgba(123,94,167,0.06)",
            filter: "blur(70px)",
            bottom: 60,
            right: 60,
            animationDuration: "13s",
            animationDelay: "4s",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <MobileHeaderNav />
        <Sidebar />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            paddingTop: 0,
            position: "relative",
            zIndex: 1,
          }}
          className="pt-14 md:pt-0"
        >
          {/* Top bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "18px 28px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              background: "rgba(7,7,26,0.85)",
              backdropFilter: "blur(12px)",
              position: "sticky",
              top: 0,
              zIndex: 10,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <h1
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#fff",
                  margin: 0,
                }}
              >
                File Library
              </h1>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: "2px 0 0" }}>
                {filteredFiles.length} file{filteredFiles.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              {/* Select all */}
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  className="fl-checkbox"
                  checked={selectedFiles.size === filteredFiles.length && filteredFiles.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: "pointer", borderRadius: 4 }}
                />
                <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>
                  Select All
                </span>
              </label>

              {selectedFiles.size > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  disabled={isDeleting}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#ff8f8f",
                    background: "rgba(255,107,107,0.1)",
                    border: "1px solid rgba(255,107,107,0.25)",
                    cursor: "pointer",
                    transition: "all .2s",
                    fontFamily: "inherit",
                  }}
                >
                  {isDeleting ? "Deleting…" : `Delete (${selectedFiles.size})`}
                </button>
              )}

              {/* Search */}
              <div className="fl-search-wrap" style={{ position: "relative", minWidth: 200 }}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    opacity: 0.4,
                  }}
                >
                  <circle cx="6" cy="6" r="4.5" stroke="#fff" strokeWidth="1.3" />
                  <path d="M9.5 9.5l2.5 2.5" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                <SmartFileSearch files={files} onSelectFileName={handleSearchChange} />
              </div>

              <FileUploadButton onFileAdd={handleFileAdd} />
              
              {/* Create Folder Button */}
              {!showCreateFolder ? (
                <button
                  onClick={() => setShowCreateFolder(true)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#fff",
                    background: "rgba(91,110,232,0.15)",
                    border: "1px solid rgba(91,110,232,0.3)",
                    cursor: "pointer",
                    transition: "all .2s",
                    fontFamily: "inherit",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span>📁</span> New Folder
                </button>
              ) : (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="text"
                    placeholder="Folder name..."
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleCreateFolder()}
                    autoFocus
                    style={{
                      padding: "8px 12px",
                      borderRadius: 6,
                      fontSize: 13,
                      background: "rgba(91,110,232,0.15)",
                      border: "1px solid rgba(91,110,232,0.3)",
                      color: "#fff",
                      fontFamily: "inherit",
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={handleCreateFolder}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#fff",
                      background: "rgba(88,214,141,0.2)",
                      border: "1px solid rgba(88,214,141,0.4)",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Create
                  </button>
                  <button
                    onClick={() => { setShowCreateFolder(false); setNewFolderName(""); }}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#fff",
                      background: "rgba(255,107,107,0.2)",
                      border: "1px solid rgba(255,107,107,0.4)",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
            {isLoading ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 200,
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 14,
                }}
              >
                Loading files…
              </div>
            ) : folders.length > 0 ? (
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 12, letterSpacing: "0.5px" }}>
                  Folders ({folders.length})
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 12, marginBottom: 24 }}>
                  {folders.map(folder => (
                    <div
                      key={folder.id}
                      onClick={() => toggleFolderExpand(folder.id)}
                      style={{
                        padding: 12,
                        borderRadius: 10,
                        background: "rgba(91,110,232,0.1)",
                        border: "1px solid rgba(91,110,232,0.2)",
                        cursor: "pointer",
                        transition: "all .2s",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                        textAlign: "center",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(91,110,232,0.15)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(91,110,232,0.1)")}
                    >
                      <span style={{ fontSize: 32 }}>📁</span>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "#fff", margin: 0, wordBreak: "break-word" }}>
                          {folder.name}
                        </p>
                        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", margin: "2px 0 0" }}>
                          {folder.files.length} item{folder.files.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {expandedFolders.size > 0 && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 24 }}>
                    {folders.map(folder => expandedFolders.has(folder.id) && folder.files.length > 0 && (
                      <div key={folder.id} style={{ marginBottom: 24 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>
                          {folder.name}
                        </div>
                        <FileGrid files={folder.files} selectedFiles={selectedFiles} onToggleSelection={handleToggleFile} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {filteredFiles.length === 0 && folders.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 300,
                  gap: 16,
                  color: "rgba(255,255,255,0.3)",
                }}
              >
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity="0.4">
                  <rect x="8" y="8" width="32" height="32" rx="6" stroke="currentColor" strokeWidth="2" />
                  <path d="M16 24h16M16 18h16M16 30h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <p style={{ fontSize: 14 }}>
                  {files.length === 0 ? "No files yet. Upload a file to get started!" : "No files match your search."}
                </p>
              </div>
            ) : filteredFiles.length > 0 ? (
              <div>
                {folders.length > 0 && (
                  <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 12, letterSpacing: "0.5px" }}>
                    Files ({filteredFiles.length})
                  </div>
                )}
                <DarkFileGrid
                  files={filteredFiles}
                  selectedFiles={selectedFiles}
                  onToggleSelection={handleToggleFile}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  )
}

// Dark-themed file grid replacing the old gray cards
function DarkFileGrid({
  files,
  selectedFiles,
  onToggleSelection,
}: {
  files: any[]
  selectedFiles: Set<string>
  onToggleSelection: (id: string) => void
}) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: 16,
      }}
    >
      {files.map((file) => {
        const selected = selectedFiles.has(file.id)
        return (
          <div key={file.id} style={{ position: "relative" }}>
            <a
              href={`/file-library/${file.id}`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  background: selected
                    ? "rgba(91,110,232,0.12)"
                    : "rgba(255,255,255,0.04)",
                  border: selected
                    ? "1px solid rgba(91,110,232,0.4)"
                    : "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 16,
                  padding: 16,
                  cursor: "pointer",
                  transition: "all .2s",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                }}
                onMouseEnter={(e) => {
                  if (!selected) {
                    ;(e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(91,110,232,0.35)"
                    ;(e.currentTarget as HTMLElement).style.transform =
                      "translateY(-2px)"
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selected) {
                    ;(e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(255,255,255,0.08)"
                    ;(e.currentTarget as HTMLElement).style.transform =
                      "translateY(0)"
                  }
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: "linear-gradient(135deg,#FFD43B,#FFA94D)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 26,
                    flexShrink: 0,
                  }}
                >
                  📁
                </div>
                <div style={{ textAlign: "center", width: "100%" }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#fff",
                      marginBottom: 4,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {file.displayName || file.fileName}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                    {formatFileSize(file.fileSize)}
                  </div>
                </div>
              </div>
            </a>

            {/* Checkbox */}
            <div
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                width: 20,
                height: 20,
                borderRadius: 6,
                background: selected ? "#5B6EE8" : "rgba(0,0,0,0.5)",
                border: selected
                  ? "1.5px solid #5B6EE8"
                  : "1.5px solid rgba(255,255,255,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all .15s",
                backdropFilter: "blur(4px)",
              }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onToggleSelection(file.id)
              }}
            >
              {selected && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M1.5 5l2.5 2.5 4.5-5"
                    stroke="#fff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
