"use client"

import { useState, useRef } from "react"

// ─── Wheel config ─────────────────────────────────────────────────────────────
const SEGMENTS = [
  { label: "STUDY",         emoji: "📚", color: "#5B6EE8", isStudy: true  },
  { label: "Sleep",         emoji: "😴", color: "#2d2d6e", isStudy: false },
  { label: "STUDY",         emoji: "📚", color: "#5B6EE8", isStudy: true  },
  { label: "Gaming",        emoji: "🎮", color: "#1e3a5f", isStudy: false },
  { label: "STUDY",         emoji: "📚", color: "#5B6EE8", isStudy: true  },
  { label: "Scroll TikTok", emoji: "📱", color: "#2d2d6e", isStudy: false },
  { label: "STUDY",         emoji: "📚", color: "#5B6EE8", isStudy: true  },
  { label: "Cry",           emoji: "😭", color: "#1e3a5f", isStudy: false },
  { label: "STUDY",         emoji: "📚", color: "#5B6EE8", isStudy: true  },
  { label: "Eat",           emoji: "🍕", color: "#2d2d6e", isStudy: false },
]

const TOTAL = SEGMENTS.length
const SEGMENT_ANGLE = 360 / TOTAL

// Always land on segment index 0 (STUDY). Pointer is at top.
const WINNER_INDEX = 0
const WINNER_CENTER = WINNER_INDEX * SEGMENT_ANGLE + SEGMENT_ANGLE / 2
const BASE_LAND = 360 - WINNER_CENTER

export default function SpinWheel() {
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [spunCount, setSpunCount] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const totalRotationRef = useRef(0)

  const spin = () => {
    if (spinning) return
    setSpinning(true)
    setShowResult(false)

    const extraSpins = (5 + spunCount) * 360
    const targetRotation = totalRotationRef.current + extraSpins + BASE_LAND
    totalRotationRef.current = targetRotation
    setRotation(targetRotation)

    setTimeout(() => {
      setSpinning(false)
      setSpunCount((c) => c + 1)
      setShowResult(true)
    }, 4200)
  }

  const SIZE = 260
  const CENTER = SIZE / 2
  const RADIUS = SIZE / 2 - 4

  const segments = SEGMENTS.map((seg, i) => {
    const startAngle = i * SEGMENT_ANGLE - 90
    const endAngle = startAngle + SEGMENT_ANGLE
    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180

    const x1 = CENTER + RADIUS * Math.cos(startRad)
    const y1 = CENTER + RADIUS * Math.sin(startRad)
    const x2 = CENTER + RADIUS * Math.cos(endRad)
    const y2 = CENTER + RADIUS * Math.sin(endRad)

    const largeArc = SEGMENT_ANGLE > 180 ? 1 : 0
    const path = `M ${CENTER} ${CENTER} L ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${x2} ${y2} Z`

    const midAngle = startAngle + SEGMENT_ANGLE / 2
    const midRad = (midAngle * Math.PI) / 180
    const textR = RADIUS * 0.65
    const tx = CENTER + textR * Math.cos(midRad)
    const ty = CENTER + textR * Math.sin(midRad)

    return { path, color: seg.color, label: seg.label, emoji: seg.emoji, tx, ty, midAngle }
  })

  const resultMessages: Record<number, string> = {
    1: "Shocking. Truly shocking. 📚",
    2: "The wheel has spoken… again. 😂",
    3: "Are you starting to notice a pattern?",
    4: "It's almost like it's rigged… 👀",
    5: "Okay at this point just open your notes lol",
  }
  const resultMsg = resultMessages[Math.min(spunCount, 5)] ?? "The wheel never lies. 📚"

  return (
    <>
      <style>{`
        @keyframes resultPop {
          from { transform: scale(0.85); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        @keyframes qpBlob {
          0%,100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>

        {/* Title */}
        <div style={{ textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(91,110,232,0.15)",
            border: "1px solid rgba(91,110,232,0.3)",
            borderRadius: 100, padding: "5px 14px", marginBottom: 10,
            fontSize: 10, fontWeight: 700, color: "#9baeff",
            letterSpacing: "1px", textTransform: "uppercase",
          }}>
            🎡 Interactive
          </div>
          <p style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(13px, 1.8vw, 16px)",
            fontWeight: 800, color: "rgba(255,255,255,0.9)",
            letterSpacing: -0.3, lineHeight: 1.3,
            textTransform: "uppercase",
            margin: 0,
          }}>
            The Wheel That<br />Drives You To Learn
          </p>
        </div>

        {/* Wheel + pointer */}
        <div style={{ position: "relative", width: SIZE, height: SIZE }}>
          {/* Glow */}
          <div style={{
            position: "absolute", inset: -20, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(91,110,232,0.25) 0%, transparent 70%)",
            filter: "blur(16px)", pointerEvents: "none",
          }} />

          {/* Spinning wheel */}
          <div style={{
            width: SIZE, height: SIZE,
            transition: spinning ? `transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)` : "none",
            transform: `rotate(${rotation}deg)`,
            borderRadius: "50%",
            boxShadow: "0 0 0 3px rgba(91,110,232,0.4), 0 8px 32px rgba(0,0,0,0.5)",
          }}>
            <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
              {segments.map((seg, i) => (
                <g key={i}>
                  <path d={seg.path} fill={seg.color} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                  <text
                    x={seg.tx} y={seg.ty - 6}
                    textAnchor="middle" dominantBaseline="middle" fontSize="14"
                    transform={`rotate(${seg.midAngle + 90}, ${seg.tx}, ${seg.ty})`}
                  >
                    {seg.emoji}
                  </text>
                  <text
                    x={seg.tx} y={seg.ty + 10}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={seg.label.length > 6 ? "7" : "8"}
                    fontWeight="700" fill="rgba(255,255,255,0.85)"
                    fontFamily="DM Sans, sans-serif"
                    transform={`rotate(${seg.midAngle + 90}, ${seg.tx}, ${seg.ty})`}
                  >
                    {seg.label}
                  </text>
                </g>
              ))}
              <circle cx={CENTER} cy={CENTER} r={16} fill="#07071a" stroke="rgba(91,110,232,0.6)" strokeWidth="2" />
              <circle cx={CENTER} cy={CENTER} r={8} fill="#5B6EE8" />
            </svg>
          </div>

          {/* Pointer */}
          <div style={{
            position: "absolute", top: -14, left: "50%",
            transform: "translateX(-50%)",
            width: 0, height: 0,
            borderLeft: "10px solid transparent",
            borderRight: "10px solid transparent",
            borderTop: "18px solid #FFD43B",
            filter: "drop-shadow(0 2px 6px rgba(255,212,59,0.6))",
            zIndex: 2,
          }} />
        </div>

        {/* Spin button */}
        <button
          type="button"
          onClick={spin}
          disabled={spinning}
          style={{
            padding: "12px 32px", borderRadius: 100,
            fontSize: 14, fontWeight: 800,
            fontFamily: "'Syne', sans-serif",
            background: spinning ? "rgba(91,110,232,0.3)" : "linear-gradient(135deg, #5B6EE8, #7b5ea7)",
            border: "none", color: "#fff",
            cursor: spinning ? "not-allowed" : "pointer",
            boxShadow: spinning ? "none" : "0 6px 20px rgba(91,110,232,0.45)",
            transition: "all .2s", letterSpacing: "0.5px",
            opacity: spinning ? 0.7 : 1,
          }}
        >
          {spinning ? "Spinning…" : spunCount === 0 ? "🎡 SPIN" : "🎡 SPIN AGAIN"}
        </button>

        {/* Result */}
        {showResult && (
          <div style={{
            background: "rgba(91,110,232,0.15)",
            border: "1px solid rgba(91,110,232,0.35)",
            borderRadius: 14, padding: "12px 20px",
            textAlign: "center",
            animation: "resultPop .3s cubic-bezier(0.34,1.56,0.64,1)",
            maxWidth: 240,
          }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: "#7f9fff", marginBottom: 4 }}>
              📚 STUDY!
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
              {resultMsg}
            </div>
          </div>
        )}
      </div>
    </>
  )
}