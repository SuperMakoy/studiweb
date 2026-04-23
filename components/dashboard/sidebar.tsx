"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { useState, useEffect } from "react"
import { getUserFiles } from "@/lib/file-service"

// ─── Types ───────────────────────────────────────────────────────────────────
interface RecentFile {
  id: string
  fileName: string
  displayName?: string
  fileSize: number
}

// ─── File Tree Item ───────────────────────────────────────────────────────────
function FileTreeItem({ file, active }: { file: RecentFile; active: boolean }) {
  const [hovered, setHovered] = useState(false)
  const name = file.displayName || file.fileName
  const ext = name.split(".").pop()?.toLowerCase() ?? ""

  const extColor: Record<string, string> = {
    txt: "#7f9fff",
    doc: "#5dade2",
    docx: "#5dade2",
    pdf: "#f1948a",
  }
  const dotColor = extColor[ext] ?? "#7f9fff"
  const isHighlighted = active || hovered

  return (
    <Link
      href={`/file-library/${file.id}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "5px 8px 5px 20px",
        borderRadius: 7,
        background: active
          ? "rgba(91,110,232,0.14)"
          : hovered
          ? "rgba(255,255,255,0.04)"
          : "transparent",
        border: "1px solid",
        borderColor: active ? "rgba(91,110,232,0.22)" : "transparent",
        textDecoration: "none",
        transition: "all .15s",
        cursor: "pointer",
        position: "relative",
        flexShrink: 0,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={name}
    >
      {/* Horizontal connector tick from the vertical border line */}
      <div
        style={{
          position: "absolute",
          left: 9,
          top: "50%",
          width: 7,
          height: 1,
          background: "rgba(255,255,255,0.1)",
          transform: "translateY(-50%)",
        }}
      />

      {/* File type dot */}
      <div
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: dotColor,
          flexShrink: 0,
          opacity: isHighlighted ? 1 : 0.5,
          transition: "opacity .15s",
        }}
      />

      {/* File icon */}
      <svg
        width="11"
        height="11"
        viewBox="0 0 12 12"
        fill="none"
        style={{
          flexShrink: 0,
          opacity: isHighlighted ? 0.7 : 0.3,
          transition: "opacity .15s",
        }}
      >
        <rect x="1.5" y="1" width="9" height="10" rx="1.5" stroke="rgba(255,255,255,0.8)" strokeWidth="1" />
        <path
          d="M3.5 4.5h5M3.5 6.5h5M3.5 8.5h3"
          stroke="rgba(255,255,255,0.8)"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
      </svg>

      {/* File name */}
      <span
        style={{
          fontSize: 11,
          fontWeight: active ? 600 : 400,
          color: active
            ? "#b8c4ff"
            : hovered
            ? "rgba(255,255,255,0.65)"
            : "rgba(255,255,255,0.35)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          flex: 1,
          transition: "color .15s",
        }}
      >
        {name}
      </span>
    </Link>
  )
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [filesOpen, setFilesOpen] = useState(true)
  const [allFiles, setAllFiles] = useState<RecentFile[]>([])
  const [loadingFiles, setLoadingFiles] = useState(true)

  useEffect(() => {
    getUserFiles()
      .then((files) => {
        const sorted = [...files].sort((a, b) => {
          const ta = (a as any).lastModified?.getTime?.() ?? (a as any).uploadedAt?.getTime?.() ?? 0
          const tb = (b as any).lastModified?.getTime?.() ?? (b as any).uploadedAt?.getTime?.() ?? 0
          return tb - ta
        })
        setAllFiles(sorted)
      })
      .catch(() => setAllFiles([]))
      .finally(() => setLoadingFiles(false))
  }, [])

  const fileLibActive = pathname === "/file-library" || pathname.startsWith("/file-library/")
  const activeFileId = pathname.startsWith("/file-library/")
    ? pathname.split("/file-library/")[1]
    : null

  const handleLogout = async () => {
    await auth.signOut()
    router.push("/")
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        .studi-sidebar { font-family: 'DM Sans', 'Segoe UI', sans-serif; }

        .studi-nav-link:hover {
          background: rgba(255,255,255,0.05) !important;
          color: rgba(255,255,255,0.85) !important;
        }
        .studi-filelib-link:hover {
          background: rgba(255,255,255,0.05) !important;
          color: rgba(255,255,255,0.85) !important;
        }

        /* Invisible-scrollbar scroll area */
        .file-tree-scroll {
          overflow-y: auto;
          overflow-x: hidden;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .file-tree-scroll::-webkit-scrollbar { display: none; }

        /* Fade-out at bottom to hint at more content */
        .file-tree-wrap {
          position: relative;
        }
        .file-tree-wrap::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 18px;
          background: linear-gradient(to bottom, transparent, #0d0d2b);
          pointer-events: none;
          z-index: 1;
        }

        /* Staggered slide-in for file items */
        @keyframes fileSlideIn {
          from { opacity: 0; transform: translateX(-5px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .file-tree-item {
          animation: fileSlideIn .14s ease forwards;
          opacity: 0;
        }
        .file-tree-item:nth-child(1)  { animation-delay:   0ms; }
        .file-tree-item:nth-child(2)  { animation-delay:  22ms; }
        .file-tree-item:nth-child(3)  { animation-delay:  44ms; }
        .file-tree-item:nth-child(4)  { animation-delay:  66ms; }
        .file-tree-item:nth-child(5)  { animation-delay:  88ms; }
        .file-tree-item:nth-child(6)  { animation-delay: 110ms; }
        .file-tree-item:nth-child(7)  { animation-delay: 132ms; }
        .file-tree-item:nth-child(8)  { animation-delay: 154ms; }
        .file-tree-item:nth-child(n+9){ animation-delay: 176ms; }

        /* Skeleton shimmer */
        @keyframes shimmer {
          0%,100% { opacity: 0.04; }
          50%      { opacity: 0.1; }
        }
        .skel { animation: shimmer 1.3s ease-in-out infinite; }

        /* Chevron toggle button */
        .chevron-btn:hover { color: rgba(255,255,255,0.55) !important; }
      `}</style>

      <aside
        className="studi-sidebar hidden md:flex flex-col flex-shrink-0 h-screen sticky top-0"
        style={{
          width: 200,
          background: "#0d0d2b",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* ── Logo ── */}
        <div style={{ padding: "24px 20px 16px", flexShrink: 0 }}>
          <span
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 22,
              fontWeight: 800,
              color: "#fff",
              letterSpacing: -0.5,
            }}
          >
            STU<span style={{ color: "#7f9fff" }}>DI</span>
          </span>
        </div>

        {/* ── Menu label ── */}
        <div
          style={{
            padding: "0 20px 6px",
            fontSize: 10,
            color: "rgba(255,255,255,0.3)",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          Menu
        </div>

        {/* ── Nav ── */}
        <nav style={{ padding: "0 8px", flexShrink: 0 }}>

          {/* Dashboard */}
          <Link
            href="/dashboard"
            className="studi-nav-link"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 12px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              color: pathname === "/dashboard" ? "#9baeff" : "rgba(255,255,255,0.45)",
              background: pathname === "/dashboard" ? "rgba(91,110,232,0.18)" : "transparent",
              border: pathname === "/dashboard"
                ? "1px solid rgba(91,110,232,0.25)"
                : "1px solid transparent",
              textDecoration: "none",
              marginBottom: 2,
              transition: "all .2s",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" />
              <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5" />
              <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5" />
              <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5" />
            </svg>
            Dashboard
          </Link>

          {/* File Library + inline tree */}
          <div style={{ marginBottom: 2 }}>

            {/* Row: File Library link + collapse chevron */}
            <div style={{ display: "flex", alignItems: "center" }}>
              <Link
                href="/file-library"
                className="studi-filelib-link"
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  color: fileLibActive ? "#9baeff" : "rgba(255,255,255,0.45)",
                  background: fileLibActive ? "rgba(91,110,232,0.18)" : "transparent",
                  border: fileLibActive
                    ? "1px solid rgba(91,110,232,0.25)"
                    : "1px solid transparent",
                  textDecoration: "none",
                  transition: "all .2s",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M5 8h6M5 5.5h6M5 10.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                File Library
              </Link>

              {/* Only show chevron when there are files */}
              {!loadingFiles && allFiles.length > 0 && (
                <button
                  className="chevron-btn"
                  onClick={() => setFilesOpen((v) => !v)}
                  style={{
                    padding: "6px 5px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    borderRadius: 6,
                    transition: "color .15s",
                    flexShrink: 0,
                  }}
                  title={filesOpen ? "Collapse" : "Expand"}
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    style={{
                      transform: filesOpen ? "rotate(0deg)" : "rotate(-90deg)",
                      transition: "transform .2s ease",
                    }}
                  >
                    <path
                      d="M2 3.5l3 3 3-3"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* ── File tree ── */}
            {filesOpen && (
              <div
                className="file-tree-wrap"
                style={{
                  marginLeft: 19,
                  borderLeft: "1px solid rgba(255,255,255,0.07)",
                  marginTop: 2,
                }}
              >
                <div
                  className="file-tree-scroll"
                  style={{
                    maxHeight: 180,
                    paddingBottom: 20,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  {loadingFiles ? (
                    [78, 92, 58, 85].map((w, i) => (
                      <div
                        key={i}
                        className="skel"
                        style={{
                          height: 24,
                          borderRadius: 6,
                          background: "rgba(255,255,255,0.06)",
                          margin: "1px 6px 1px 10px",
                          width: `${w}%`,
                        }}
                      />
                    ))
                  ) : allFiles.length === 0 ? (
                    <div
                      style={{
                        padding: "5px 8px 5px 18px",
                        fontSize: 11,
                        color: "rgba(255,255,255,0.18)",
                        fontStyle: "italic",
                      }}
                    >
                      No files yet
                    </div>
                  ) : (
                    allFiles.map((file) => (
                      <div key={file.id} className="file-tree-item">
                        <FileTreeItem
                          file={file}
                          active={activeFileId === file.id}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Study with AI */}
          <Link
            href="/study-ai"
            className="studi-nav-link"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 12px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              color: pathname === "/study-ai" ? "#9baeff" : "rgba(255,255,255,0.45)",
              background: pathname === "/study-ai" ? "rgba(91,110,232,0.18)" : "transparent",
              border: pathname === "/study-ai"
                ? "1px solid rgba(91,110,232,0.25)"
                : "1px solid transparent",
              textDecoration: "none",
              marginBottom: 2,
              transition: "all .2s",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M6 6.5c0-1.1.9-2 2-2s2 .9 2 2c0 1.5-2 2.5-2 3.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle cx="8" cy="11.5" r=".75" fill="currentColor" />
            </svg>
            Study with AI
          </Link>
        </nav>

        {/* ── Level progress ── */}
        <div style={{ padding: "16px 16px 0", marginTop: 8, flexShrink: 0 }}>
          <div
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.3)",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            Progress
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12,
              padding: 12,
            }}
          >
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>
              Overall Level
            </div>
            <div
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 20,
                fontWeight: 800,
                color: "#7f9fff",
              }}
            >
              Lv. 12
            </div>
            <div
              style={{
                marginTop: 8,
                height: 4,
                background: "rgba(255,255,255,0.08)",
                borderRadius: 100,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "68%",
                  height: "100%",
                  background: "linear-gradient(90deg,#5B6EE8,#9b7fe8)",
                  borderRadius: 100,
                }}
              />
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
              680 / 1000 XP
            </div>
          </div>
        </div>

        {/* ── User + logout ── */}
        <div style={{ marginTop: "auto", padding: "16px 8px", flexShrink: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.07)",
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#51CF66,#37b24d)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 13,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              M
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Makoy</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Scholar</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            suppressHydrationWarning
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(255,107,107,0.8)",
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all .2s",
              fontFamily: "inherit",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3M9 10l3-3-3-3M13 7H5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}