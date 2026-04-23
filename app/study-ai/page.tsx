"use client"
import { Construction } from "lucide-react"
import Sidebar from "@/components/dashboard/sidebar"
import MobileHeaderNav from "@/components/dashboard/mobile-header-nav"
import { useAuth } from "@/hooks/use-auth"

export default function StudyAiPage() {
  const { user } = useAuth()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .sai-page { font-family: 'DM Sans', 'Segoe UI', sans-serif; }
        @keyframes saiBlob {
          0%,100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.06) translateY(-16px); }
        }
        .sai-blob { animation: saiBlob ease-in-out infinite; }
        @keyframes saiPulse {
          0%,100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.04); }
        }
        .sai-icon-pulse { animation: saiPulse 2.5s ease-in-out infinite; }
        @keyframes saiSpin {
          to { transform: rotate(360deg); }
        }
        .sai-spin { animation: saiSpin 16s linear infinite; }
      `}</style>

      <div
        className="sai-page"
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
          className="sai-blob"
          style={{
            position: "fixed",
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: "rgba(91,110,232,0.1)",
            filter: "blur(90px)",
            top: -80,
            left: 240,
            animationDuration: "10s",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <div
          className="sai-blob"
          style={{
            position: "fixed",
            width: 260,
            height: 260,
            borderRadius: "50%",
            background: "rgba(123,94,167,0.07)",
            filter: "blur(70px)",
            bottom: 60,
            right: 80,
            animationDuration: "14s",
            animationDelay: "5s",
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
            position: "relative",
            zIndex: 1,
          }}
          className="pt-14 md:pt-0"
        >
          {/* Header */}
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
                Study with AI
              </h1>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: "2px 0 0" }}>
                Chat with your notes
              </p>
            </div>

            {/* User avatar */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#51CF66,#37b24d)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 14,
                color: "#fff",
              }}
            >
              M
            </div>
          </div>

          {/* Main content */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px 24px",
            }}
          >
            <div style={{ textAlign: "center", maxWidth: 420 }}>
              {/* Animated icon */}
              <div
                style={{
                  position: "relative",
                  width: 120,
                  height: 120,
                  margin: "0 auto 32px",
                }}
              >
                {/* Spinning ring */}
                <svg
                  className="sai-spin"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                  viewBox="0 0 120 120"
                  fill="none"
                >
                  <circle
                    cx="60"
                    cy="60"
                    r="55"
                    stroke="rgba(91,110,232,0.2)"
                    strokeWidth="1.5"
                    strokeDasharray="8 6"
                  />
                </svg>

                {/* Center glow */}
                <div
                  style={{
                    position: "absolute",
                    inset: 16,
                    borderRadius: "50%",
                    background: "rgba(91,110,232,0.12)",
                    border: "1px solid rgba(91,110,232,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div className="sai-icon-pulse">
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                      <path
                        d="M18 4C9.16 4 2 11.16 2 20c0 4.08 1.56 7.8 4.12 10.58L4 34l5.06-2.08C11.3 33.28 14.56 34 18 34c8.84 0 16-7.16 16-16S26.84 4 18 4z"
                        fill="rgba(91,110,232,0.3)"
                        stroke="#7f9fff"
                        strokeWidth="1.5"
                      />
                      <circle cx="12" cy="19" r="2" fill="#9baeff" />
                      <circle cx="18" cy="19" r="2" fill="#9baeff" />
                      <circle cx="24" cy="19" r="2" fill="#9baeff" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Construction badge */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(255,212,59,0.1)",
                  border: "1px solid rgba(255,212,59,0.25)",
                  borderRadius: 100,
                  padding: "5px 14px",
                  marginBottom: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#FFD43B",
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                }}
              >
                <Construction size={12} />
                Under Construction
              </div>

              <h2
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 28,
                  fontWeight: 800,
                  color: "#fff",
                  margin: "0 0 12px",
                  letterSpacing: -0.5,
                }}
              >
                Coming Soon
              </h2>

              <p
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.45)",
                  lineHeight: 1.75,
                  marginBottom: 32,
                }}
              >
                We're building a powerful AI tutor that lets you chat with your
                uploaded notes, ask questions, and get instant explanations. Check
                back soon!
              </p>

              {/* Feature previews */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { icon: "💬", label: "Chat with your documents" },
                  { icon: "❓", label: "Ask anything, get instant answers" },
                  { icon: "🎯", label: "Personalized study suggestions" },
                ].map((feat) => (
                  <div
                    key={feat.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 16px",
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      textAlign: "left",
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{feat.icon}</span>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>
                      {feat.label}
                    </span>
                    <div
                      style={{
                        marginLeft: "auto",
                        fontSize: 9,
                        fontWeight: 700,
                        color: "rgba(255,212,59,0.7)",
                        background: "rgba(255,212,59,0.08)",
                        border: "1px solid rgba(255,212,59,0.18)",
                        borderRadius: 100,
                        padding: "2px 8px",
                        letterSpacing: "0.6px",
                        textTransform: "uppercase",
                      }}
                    >
                      Soon
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}