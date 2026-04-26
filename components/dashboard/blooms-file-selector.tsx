"use client"

// ─── Drop this component into app/dashboard/page.tsx ─────────────────────────
// Replace the <select> element in the Bloom's Taxonomy card with this component.
// Props match what the dashboard already passes.

import { useState, useRef, useEffect } from "react"

interface BloomsFileSelectorProps {
  files: string[]           // list of unique file names
  selected: string | null   // currently selected fileName
  onSelect: (fileName: string) => void
}

export function BloomsFileSelector({ files, selected, onSelect }: BloomsFileSelectorProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const selectedLabel = selected
    ? selected.length > 22 ? selected.slice(0, 20) + "…" : selected
    : "Select a file"

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Trigger pill */}
      <button
        suppressHydrationWarning
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex", alignItems: "center", gap: 7,
          padding: "6px 12px",
          borderRadius: 100,
          background: open
            ? "rgba(91,110,232,0.25)"
            : selected
            ? "rgba(91,110,232,0.18)"
            : "rgba(255,255,255,0.06)",
          border: open || selected
            ? "1px solid rgba(91,110,232,0.4)"
            : "1px solid rgba(255,255,255,0.1)",
          color: selected ? "#9baeff" : "rgba(255,255,255,0.4)",
          fontSize: 11, fontWeight: 600,
          fontFamily: "inherit", cursor: "pointer",
          transition: "all .2s",
          maxWidth: 180,
        }}
      >
        {/* File icon */}
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
          <rect x="2" y="1" width="8" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M4 4.5h4M4 6.5h4M4 8.5h2.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>

        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selectedLabel}
        </span>

        {/* Chevron */}
        <svg
          width="10" height="10" viewBox="0 0 10 10" fill="none"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .2s", flexShrink: 0, opacity: 0.6 }}
        >
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0,
          background: "#0d0d2b",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 12, padding: "6px",
          minWidth: 200, maxWidth: 280,
          maxHeight: 220, overflowY: "auto",
          boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
          zIndex: 30,
          animation: "bloomsDDPop .15s cubic-bezier(0.34,1.56,0.64,1)",
        }}>
          <style>{`
            @keyframes bloomsDDPop {
              from { opacity: 0; transform: scale(0.94) translateY(-4px); }
              to   { opacity: 1; transform: scale(1) translateY(0); }
            }
            .blooms-opt:hover { background: rgba(91,110,232,0.15) !important; }
            .blooms-opt.active { background: rgba(91,110,232,0.2) !important; color: #9baeff !important; }
          `}</style>

          {files.length === 0 ? (
            <div style={{ padding: "10px 12px", fontSize: 12, color: "rgba(255,255,255,0.3)", textAlign: "center" }}>
              No quiz history yet
            </div>
          ) : (
            files.map((fileName) => {
              const isActive = selected === fileName
              const label = fileName.length > 28 ? fileName.slice(0, 26) + "…" : fileName
              return (
                <button
                  key={fileName}
                  className={`blooms-opt${isActive ? " active" : ""}`}
                  onClick={() => { onSelect(fileName); setOpen(false) }}
                  style={{
                    width: "100%", padding: "9px 12px",
                    borderRadius: 8, border: "none",
                    background: isActive ? "rgba(91,110,232,0.2)" : "transparent",
                    color: isActive ? "#9baeff" : "rgba(255,255,255,0.65)",
                    fontSize: 12, fontWeight: isActive ? 600 : 400,
                    fontFamily: "inherit", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 8,
                    textAlign: "left", transition: "background .15s",
                  }}
                >
                  {/* Active checkmark */}
                  <div style={{
                    width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                    background: isActive ? "rgba(91,110,232,0.3)" : "rgba(255,255,255,0.06)",
                    border: isActive ? "1px solid rgba(91,110,232,0.6)" : "1px solid rgba(255,255,255,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {isActive && (
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1.5 4l2 2 3-3" stroke="#9baeff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {label}
                  </span>
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}