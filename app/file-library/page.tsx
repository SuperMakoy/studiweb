"use client"
import SmartFileSearch from "@/components/search/smart-file-search"
import { useState, useEffect, useRef } from "react"
import { getUserFiles, deleteMultipleFiles } from "@/lib/file-service"
import { useAuth } from "@/hooks/use-auth"
import Sidebar from "@/components/dashboard/sidebar"
import MobileHeaderNav from "@/components/dashboard/mobile-header-nav"
import FileUploadButton from "@/components/file-library/file-upload-button"

// ─── macOS-style Folder Icon ──────────────────────────────────────────────────
function FolderIcon({ size = 56, color = "#F5A623" }: { size?: number; color?: string }) {
  const w = size
  const h = size * 0.82
  return (
    <svg width={w} height={h} viewBox="0 0 56 46" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Drop shadow */}
      <ellipse cx="28" cy="44" rx="18" ry="3" fill="rgba(0,0,0,0.25)" />
      {/* Folder back body */}
      <rect x="2" y="10" width="52" height="33" rx="4" fill={color} opacity="0.35" />
      {/* Folder tab */}
      <path d="M4 10 L4 7 Q4 5 6 5 L20 5 Q23 5 24 8 L26 10 Z" fill={color} />
      {/* Folder body */}
      <rect x="2" y="10" width="52" height="32" rx="4" fill={color} />
      {/* Inner highlight — gives 3D depth */}
      <rect x="2" y="10" width="52" height="8" rx="4" fill="rgba(255,255,255,0.18)" />
      {/* Bottom shadow line */}
      <rect x="2" y="38" width="52" height="4" rx="4" fill="rgba(0,0,0,0.15)" />
      {/* Subtle inner lines */}
      <line x1="10" y1="22" x2="46" y2="22" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="10" y1="27" x2="38" y2="27" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// ─── Add Button with Dropdown ─────────────────────────────────────────────────
function AddButton({ onAddFile, onAddFolder }: { onAddFile: () => void; onAddFolder: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        suppressHydrationWarning
        onClick={() => setOpen((v) => !v)}
        style={{
          width: 38, height: 38,
          borderRadius: 10,
          background: open
            ? "rgba(91,110,232,0.35)"
            : "linear-gradient(135deg,#5B6EE8,#7b5ea7)",
          border: "none",
          color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          boxShadow: open ? "none" : "0 4px 14px rgba(91,110,232,0.4)",
          transition: "all .2s",
          flexShrink: 0,
        }}
        title="Add"
      >
        {/* Plus icon — rotates to X when open */}
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)", transition: "transform .2s ease" }}
        >
          <path d="M8 3v10M3 8h10" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          background: "#0d0d2b",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 12,
          padding: "6px",
          minWidth: 160,
          boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
          zIndex: 50,
          animation: "ddPop .15s cubic-bezier(0.34,1.56,0.64,1)",
        }}>
          {/* Add File */}
          <button
            suppressHydrationWarning
            onClick={() => { onAddFile(); setOpen(false) }}
            style={{
              width: "100%", padding: "10px 14px",
              borderRadius: 8, border: "none",
              background: "transparent",
              color: "rgba(255,255,255,0.75)",
              fontSize: 13, fontWeight: 600,
              fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 10,
              cursor: "pointer", transition: "background .15s", textAlign: "left",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(91,110,232,0.15)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: "rgba(91,110,232,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <rect x="2" y="1" width="10" height="12" rx="2" stroke="#9baeff" strokeWidth="1.3" />
                <path d="M4.5 5h5M4.5 7.5h5M4.5 10h3" stroke="#9baeff" strokeWidth="1.1" strokeLinecap="round" />
              </svg>
            </div>
            Add File
          </button>

          {/* Divider */}
          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 6px" }} />

          {/* New Folder */}
          <button
            suppressHydrationWarning
            onClick={() => { onAddFolder(); setOpen(false) }}
            style={{
              width: "100%", padding: "10px 14px",
              borderRadius: 8, border: "none",
              background: "transparent",
              color: "rgba(255,255,255,0.75)",
              fontSize: 13, fontWeight: 600,
              fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 10,
              cursor: "pointer", transition: "background .15s", textAlign: "left",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(245,166,35,0.12)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: "rgba(245,166,35,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <FolderIcon size={16} />
            </div>
            New Folder
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
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
  const [showUploadTrigger, setShowUploadTrigger] = useState(false)
  const fileInputTriggerRef = useRef<HTMLButtonElement>(null)

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

  // Trigger hidden FileUploadButton when Add File is selected
  useEffect(() => {
    if (showUploadTrigger) {
      fileInputTriggerRef.current?.click()
      setShowUploadTrigger(false)
    }
  }, [showUploadTrigger])

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
    if (!newFolderName.trim()) return
    const newFolder = {
      id: `folder_${Date.now()}`,
      name: newFolderName.trim(),
      files: [],
      createdAt: new Date().toISOString(),
    }
    setFolders([...folders, newFolder])
    setNewFolderName("")
    setShowCreateFolder(false)
  }

  const toggleFolderExpand = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    newExpanded.has(folderId) ? newExpanded.delete(folderId) : newExpanded.add(folderId)
    setExpandedFolders(newExpanded)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .fl-page * { box-sizing: border-box; }
        .fl-page { font-family: 'DM Sans', 'Segoe UI', sans-serif; }

        @keyframes ddPop {
          from { opacity: 0; transform: scale(0.92) translateY(-4px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes flBlob {
          0%,100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        .fl-blob { animation: flBlob ease-in-out infinite; }

        /* folder card */
        .fl-folder-card {
          padding: 16px 14px;
          border-radius: 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          cursor: pointer;
          transition: all .2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .fl-folder-card:hover {
          border-color: rgba(245,166,35,0.4);
          background: rgba(245,166,35,0.06);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }
        .fl-folder-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, rgba(245,166,35,0.5), transparent);
        }

        /* file card */
        .fl-file-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 16px;
          cursor: pointer;
          transition: all .2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .fl-file-card:hover {
          border-color: rgba(91,110,232,0.35);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }
        .fl-file-card.selected {
          border-color: rgba(91,110,232,0.5);
          background: rgba(91,110,232,0.1);
        }

        /* checkbox */
        .fl-checkbox { accent-color: #5B6EE8; }

        /* search input override */
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

        /* create folder input */
        .fl-folder-input {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(245,166,35,0.4);
          border-radius: 10px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          padding: 8px 14px;
          outline: none;
          transition: all .2s;
          width: 180px;
        }
        .fl-folder-input:focus {
          border-color: rgba(245,166,35,0.7);
          box-shadow: 0 0 0 3px rgba(245,166,35,0.12);
        }
        .fl-folder-input::placeholder { color: rgba(255,255,255,0.25); }

        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fl-folder-create-row { animation: fadeSlideDown .2s ease forwards; }
      `}</style>

      <div
        className="fl-page"
        style={{
          display: "flex", height: "100vh", overflow: "hidden",
          background: "#07071a", color: "#fff", position: "relative",
        }}
      >
        {/* Ambient blobs */}
        <div className="fl-blob" style={{ position:"fixed", width:320, height:320, borderRadius:"50%", background:"rgba(91,110,232,0.08)", filter:"blur(80px)", top:-60, left:220, animationDuration:"9s", pointerEvents:"none", zIndex:0 }} />
        <div className="fl-blob" style={{ position:"fixed", width:240, height:240, borderRadius:"50%", background:"rgba(123,94,167,0.06)", filter:"blur(70px)", bottom:60, right:60, animationDuration:"13s", animationDelay:"4s", pointerEvents:"none", zIndex:0 }} />

        <MobileHeaderNav />
        <Sidebar />

        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", position:"relative", zIndex:1 }} className="pt-14 md:pt-0">

          {/* ── Top bar ── */}
          <div style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"16px 28px",
            borderBottom:"1px solid rgba(255,255,255,0.05)",
            background:"rgba(7,7,26,0.85)", backdropFilter:"blur(12px)",
            position:"sticky", top:0, zIndex:20,
            gap: 12, flexWrap: "wrap",
          }}>
            {/* Left: title + count */}
            <div>
              <h1 style={{ fontFamily:"'Syne', sans-serif", fontSize:20, fontWeight:800, color:"#fff", margin:0 }}>
                File Library
              </h1>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.35)", margin:"2px 0 0" }}>
                {filteredFiles.length} file{filteredFiles.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Right: controls */}
            <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>

              {/* Select all */}
              <label style={{ display:"flex", alignItems:"center", gap:7, cursor:"pointer" }}>
                <input
                  type="checkbox"
                  className="fl-checkbox"
                  checked={selectedFiles.size === filteredFiles.length && filteredFiles.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  style={{ width:15, height:15, cursor:"pointer" }}
                />
                <span style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.5)" }}>Select All</span>
              </label>

              {/* Delete selected */}
              {selectedFiles.size > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  disabled={isDeleting}
                  style={{
                    padding:"6px 14px", borderRadius:8, fontSize:12, fontWeight:600,
                    color:"#ff8f8f", background:"rgba(255,107,107,0.1)",
                    border:"1px solid rgba(255,107,107,0.25)",
                    cursor:"pointer", fontFamily:"inherit", transition:"all .2s",
                  }}
                >
                  {isDeleting ? "Deleting…" : `Delete (${selectedFiles.size})`}
                </button>
              )}

              {/* Search */}
              <div className="fl-search-wrap" style={{ position:"relative", minWidth:200 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", opacity:0.4 }}>
                  <circle cx="6" cy="6" r="4.5" stroke="#fff" strokeWidth="1.3" />
                  <path d="M9.5 9.5l2.5 2.5" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                <SmartFileSearch files={files} onSelectFileName={handleSearchChange} />
              </div>

              {/* Hidden FileUploadButton — triggered programmatically */}
              <div style={{ display:"none" }}>
                <FileUploadButton onFileAdd={handleFileAdd} ref={fileInputTriggerRef} />
              </div>

              {/* + dropdown button */}
              <AddButton
                onAddFile={() => setShowUploadTrigger(true)}
                onAddFolder={() => setShowCreateFolder(true)}
              />
            </div>
          </div>

          {/* ── Folder create row ── */}
          {showCreateFolder && (
            <div className="fl-folder-create-row" style={{
              display:"flex", alignItems:"center", gap:10,
              padding:"12px 28px",
              borderBottom:"1px solid rgba(255,255,255,0.05)",
              background:"rgba(245,166,35,0.04)",
            }}>
              <FolderIcon size={22} />
              <input
                autoFocus
                className="fl-folder-input"
                placeholder="Folder name…"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateFolder()
                  if (e.key === "Escape") { setShowCreateFolder(false); setNewFolderName("") }
                }}
              />
              <button
                suppressHydrationWarning
                onClick={handleCreateFolder}
                style={{
                  padding:"8px 16px", borderRadius:8, fontSize:12, fontWeight:700,
                  color:"#fff", background:"rgba(245,166,35,0.25)",
                  border:"1px solid rgba(245,166,35,0.4)",
                  cursor:"pointer", fontFamily:"inherit",
                }}
              >
                Create
              </button>
              <button
                suppressHydrationWarning
                onClick={() => { setShowCreateFolder(false); setNewFolderName("") }}
                style={{
                  padding:"8px 12px", borderRadius:8, fontSize:12, fontWeight:600,
                  color:"rgba(255,255,255,0.4)", background:"transparent",
                  border:"1px solid rgba(255,255,255,0.1)",
                  cursor:"pointer", fontFamily:"inherit",
                }}
              >
                Cancel
              </button>
              <span style={{ fontSize:11, color:"rgba(255,255,255,0.25)" }}>
                Press Enter to create · Esc to cancel
              </span>
            </div>
          )}

          {/* ── Main content ── */}
          <div style={{ flex:1, overflowY:"auto", padding:"24px 28px" }}>

            {isLoading ? (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:200, color:"rgba(255,255,255,0.35)", fontSize:14 }}>
                Loading files…
              </div>
            ) : (
              <>

                {/* ── Folders section ── */}
                {folders.length > 0 && (
                  <div style={{ marginBottom:32 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:14 }}>
                      Folders ({folders.length})
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(130px, 1fr))", gap:12, marginBottom: expandedFolders.size > 0 ? 20 : 0 }}>
                      {folders.map((folder) => (
                        <div
                          key={folder.id}
                          className="fl-folder-card"
                          onClick={() => toggleFolderExpand(folder.id)}
                        >
                          {/* 3D folder icon */}
                          <FolderIcon size={52} />

                          <div>
                            <p style={{ fontSize:13, fontWeight:700, color:"#fff", margin:0, wordBreak:"break-word" }}>
                              {folder.name}
                            </p>
                            <p style={{ fontSize:11, color:"rgba(255,255,255,0.35)", margin:"3px 0 0" }}>
                              {folder.files.length} item{folder.files.length !== 1 ? "s" : ""}
                            </p>
                          </div>

                          {/* Expand indicator */}
                          <div style={{
                            position:"absolute", bottom:8, right:10,
                            fontSize:10, color:"rgba(255,255,255,0.2)",
                            display:"flex", alignItems:"center", gap:3,
                          }}>
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                              style={{ transform: expandedFolders.has(folder.id) ? "rotate(180deg)" : "rotate(0deg)", transition:"transform .2s" }}>
                              <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Expanded folder contents */}
                    {folders.map((folder) =>
                      expandedFolders.has(folder.id) && folder.files.length > 0 ? (
                        <div key={`expanded-${folder.id}`} style={{ marginBottom:20 }}>
                          <div style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.4)", marginBottom:10, display:"flex", alignItems:"center", gap:6 }}>
                            <FolderIcon size={14} />
                            {folder.name}
                          </div>
                          <DarkFileGrid files={folder.files} selectedFiles={selectedFiles} onToggleSelection={handleToggleFile} />
                        </div>
                      ) : null
                    )}
                  </div>
                )}

                {/* ── Files section ── */}
                {filteredFiles.length === 0 && folders.length === 0 ? (
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:300, gap:16, color:"rgba(255,255,255,0.3)" }}>
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity="0.4">
                      <rect x="8" y="8" width="32" height="32" rx="6" stroke="currentColor" strokeWidth="2" />
                      <path d="M16 24h16M16 18h16M16 30h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <p style={{ fontSize:14 }}>No files yet. Hit the + button to upload!</p>
                  </div>
                ) : filteredFiles.length > 0 ? (
                  <div>
                    {folders.length > 0 && (
                      <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:14 }}>
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

              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Dark File Grid ───────────────────────────────────────────────────────────
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

  // File type color accent
  const getFileAccent = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase() ?? ""
    if (ext === "pdf") return "#f1948a"
    if (ext === "txt") return "#7f9fff"
    if (ext === "doc" || ext === "docx") return "#5dade2"
    return "#FFD43B"
  }

  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(160px, 1fr))", gap:14 }}>
      {files.map((file) => {
        const selected = selectedFiles.has(file.id)
        const accent = getFileAccent(file.fileName)
        return (
          <div key={file.id} style={{ position:"relative" }}>
            <a href={`/file-library/${file.id}`} style={{ textDecoration:"none" }}>
              <div
                className={`fl-file-card${selected ? " selected" : ""}`}
                style={{ borderTopColor: selected ? "rgba(91,110,232,0.5)" : `${accent}30` }}
              >
                {/* File icon with type accent */}
                <div style={{
                  width:52, height:52, borderRadius:14,
                  background:`linear-gradient(135deg, ${accent}cc, ${accent}88)`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:24, flexShrink:0,
                  boxShadow:`0 4px 12px ${accent}30`,
                }}>
                  📄
                </div>
                <div style={{ textAlign:"center", width:"100%" }}>
                  <div style={{ fontSize:12, fontWeight:600, color:"#fff", marginBottom:4, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                    {file.displayName || file.fileName}
                  </div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>
                    {formatFileSize(file.fileSize)}
                  </div>
                </div>
              </div>
            </a>

            {/* Checkbox */}
            <div
              style={{
                position:"absolute", top:10, left:10,
                width:20, height:20, borderRadius:6,
                background: selected ? "#5B6EE8" : "rgba(0,0,0,0.55)",
                border: selected ? "1.5px solid #5B6EE8" : "1.5px solid rgba(255,255,255,0.2)",
                display:"flex", alignItems:"center", justifyContent:"center",
                cursor:"pointer", transition:"all .15s",
                backdropFilter:"blur(4px)",
              }}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleSelection(file.id) }}
            >
              {selected && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1.5 5l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}