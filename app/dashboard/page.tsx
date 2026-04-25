"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { setDoc, doc } from "firebase/firestore"

// ─── Wheel config ─────────────────────────────────────────────────────────────
const SEGMENTS = [
  { label: "STUDY",        emoji: "📚", color: "#5B6EE8", isStudy: true  },
  { label: "Sleep",        emoji: "😴", color: "#2d2d6e", isStudy: false },
  { label: "STUDY",        emoji: "📚", color: "#5B6EE8", isStudy: true  },
  { label: "Gaming",       emoji: "🎮", color: "#1e3a5f", isStudy: false },
  { label: "STUDY",        emoji: "📚", color: "#5B6EE8", isStudy: true  },
  { label: "Scroll TikTok",emoji: "📱", color: "#2d2d6e", isStudy: false },
  { label: "STUDY",        emoji: "📚", color: "#5B6EE8", isStudy: true  },
  { label: "Cry",          emoji: "😭", color: "#1e3a5f", isStudy: false },
  { label: "STUDY",        emoji: "📚", color: "#5B6EE8", isStudy: true  },
  { label: "Eat",          emoji: "🍕", color: "#2d2d6e", isStudy: false },
]

const TOTAL = SEGMENTS.length
const SEGMENT_ANGLE = 360 / TOTAL

// The wheel will always land on a STUDY segment.
// We pick segment index 0 (first STUDY) as the guaranteed winner.
// The pointer is at the top (270deg in SVG terms).
// We calculate the exact rotation to land segment 0 under the pointer.
const WINNER_INDEX = 0
// Center of winner segment in degrees (0-indexed from top, clockwise)
const WINNER_CENTER = WINNER_INDEX * SEGMENT_ANGLE + SEGMENT_ANGLE / 2
// We want winner center at top (0deg). Rotation needed = 360 - WINNER_CENTER
// Add multiple full spins for drama (5 full rotations minimum)
const BASE_LAND = 360 - WINNER_CENTER

// ─── Tiny star helper ─────────────────────────────────────────────────────────
const Star = ({ top, left, size, delay }: { top: string; left: string; size: number; delay: string }) => (
  <span style={{
    position: "absolute", top, left, width: size, height: size, borderRadius: "50%",
    background: "#fff", animationName: "twinkle", animationDuration: "3s",
    animationTimingFunction: "ease-in-out", animationIterationCount: "infinite",
    animationDirection: "alternate", animationDelay: delay,
  }} />
)

// ─── Spin Wheel Component ──────────────────────────────────────────────────────
function SpinWheel() {
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [spunCount, setSpunCount] = useState(0)
  const [landed, setLanded] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const totalRotationRef = useRef(0)

  const spin = () => {
    if (spinning) return
    setSpinning(true)
    setShowResult(false)
    setLanded(null)

    // Always land on STUDY — add extra spins each time for more drama
    const extraSpins = (5 + spunCount) * 360
    const targetRotation = totalRotationRef.current + extraSpins + BASE_LAND
    totalRotationRef.current = targetRotation

    setRotation(targetRotation)

    setTimeout(() => {
      setSpinning(false)
      setSpunCount((c) => c + 1)
      setLanded("STUDY")
      setShowResult(true)
    }, 4200)
  }

  const SIZE = 260
  const CENTER = SIZE / 2
  const RADIUS = SIZE / 2 - 4

  // Build SVG paths for each segment
  const segments = SEGMENTS.map((seg, i) => {
    const startAngle = i * SEGMENT_ANGLE - 90 // -90 so 0 is at top
    const endAngle = startAngle + SEGMENT_ANGLE
    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180

    const x1 = CENTER + RADIUS * Math.cos(startRad)
    const y1 = CENTER + RADIUS * Math.sin(startRad)
    const x2 = CENTER + RADIUS * Math.cos(endRad)
    const y2 = CENTER + RADIUS * Math.sin(endRad)

    const largeArc = SEGMENT_ANGLE > 180 ? 1 : 0
    const path = `M ${CENTER} ${CENTER} L ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${x2} ${y2} Z`

    // Text position — midpoint of arc
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

        {/* Glow behind wheel */}
        <div style={{
          position: "absolute", inset: -20,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(91,110,232,0.25) 0%, transparent 70%)",
          filter: "blur(16px)",
          pointerEvents: "none",
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
                {/* Emoji */}
                <text
                  x={seg.tx}
                  y={seg.ty - 6}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="14"
                  transform={`rotate(${seg.midAngle + 90}, ${seg.tx}, ${seg.ty})`}
                >
                  {seg.emoji}
                </text>
                {/* Label */}
                <text
                  x={seg.tx}
                  y={seg.ty + 10}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={seg.label.length > 6 ? "7" : "8"}
                  fontWeight="700"
                  fill="rgba(255,255,255,0.85)"
                  fontFamily="DM Sans, sans-serif"
                  transform={`rotate(${seg.midAngle + 90}, ${seg.tx}, ${seg.ty})`}
                >
                  {seg.label}
                </text>
              </g>
            ))}

            {/* Center hub */}
            <circle cx={CENTER} cy={CENTER} r={16} fill="#07071a" stroke="rgba(91,110,232,0.6)" strokeWidth="2" />
            <circle cx={CENTER} cy={CENTER} r={8} fill="#5B6EE8" />
          </svg>
        </div>

        {/* Pointer triangle at top */}
        <div style={{
          position: "absolute",
          top: -14,
          left: "50%",
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
        onClick={spin}
        disabled={spinning}
        style={{
          padding: "12px 32px",
          borderRadius: 100,
          fontSize: 14, fontWeight: 800,
          fontFamily: "'Syne', sans-serif",
          background: spinning
            ? "rgba(91,110,232,0.3)"
            : "linear-gradient(135deg, #5B6EE8, #7b5ea7)",
          border: "none", color: "#fff",
          cursor: spinning ? "not-allowed" : "pointer",
          boxShadow: spinning ? "none" : "0 6px 20px rgba(91,110,232,0.45)",
          transition: "all .2s",
          letterSpacing: "0.5px",
          opacity: spinning ? 0.7 : 1,
        }}
      >
        {spinning ? "Spinning…" : spunCount === 0 ? "🎡 SPIN" : "🎡 SPIN AGAIN"}
      </button>

      {/* Result message */}
      {showResult && (
        <div style={{
          background: "rgba(91,110,232,0.15)",
          border: "1px solid rgba(91,110,232,0.35)",
          borderRadius: 14,
          padding: "12px 20px",
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
  )
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter()
  const [tab, setTab] = useState<"login" | "signup">("login")
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [signupData, setSignupData] = useState({ fullName: "", email: "", password: "", confirmPassword: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const switchTab = (t: "login" | "signup") => { setTab(t); setError("") }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, loginData.email, loginData.password)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.code === "auth/invalid-credential" ? "Invalid email or password" : err.message)
    } finally { setLoading(false) }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault(); setError("")
    if (signupData.password !== signupData.confirmPassword) return setError("Passwords do not match")
    if (signupData.password.length < 6) return setError("Password must be at least 6 characters")
    setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, signupData.email, signupData.password)
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid, fullName: signupData.fullName,
        email: signupData.email, createdAt: new Date(),
      })
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.code === "auth/email-already-in-use" ? "Email already in use" : err.message)
    } finally { setLoading(false) }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&family=Syne:wght@700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .sp { font-family: 'DM Sans', 'Segoe UI', sans-serif; background: #07071a; color: #fff; overflow-x: hidden; }

        @keyframes waveScroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .wave1 { animation: waveScroll 10s linear infinite; }
        .wave2 { animation: waveScroll 16s linear infinite reverse; }
        .wave3 { animation: waveScroll 24s linear infinite; }

        @keyframes twinkle {
          from { opacity: 0.1; transform: scale(0.7); }
          to   { opacity: 0.9; transform: scale(1.5); }
        }

        @keyframes blobDrift {
          0%   { transform: translateY(0px) scale(1); }
          50%  { transform: translateY(-28px) scale(1.06); }
          100% { transform: translateY(0px) scale(1); }
        }
        .blob  { animation: blobDrift 9s ease-in-out infinite; }
        .blob2 { animation: blobDrift 13s ease-in-out infinite; animation-delay: 4s; }
        .blob3 { animation: blobDrift 17s ease-in-out infinite; animation-delay: 8s; }

        @keyframes resultPop {
          from { transform: scale(0.85); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }

        /* ── Nav ── */
        .sp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 48px;
          background: rgba(7,7,26,0.75); backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .sp-logo { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: #fff; letter-spacing: -0.5px; text-decoration: none; }
        .sp-logo em { color: #7f9fff; font-style: normal; }
        .sp-nav-links { display: flex; align-items: center; gap: 28px; }
        .sp-nav-link { font-size: 14px; color: rgba(255,255,255,0.5); text-decoration: none; transition: color .2s; }
        .sp-nav-link:hover { color: #fff; }
        .sp-nav-eval {
          font-size: 13px; font-weight: 600; color: #9baeff;
          border: 1px solid rgba(127,159,255,0.3); border-radius: 8px;
          padding: 6px 14px; text-decoration: none; transition: all .2s;
        }
        .sp-nav-eval:hover { background: rgba(127,159,255,0.12); }

        /* ── Hero ── */
        .sp-hero {
          position: relative; min-height: 100vh; overflow: hidden;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 100px 24px 80px;
        }
        .sp-hero-bg { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }

        /* Top half: headline + wheel side by side */
        .sp-hero-top {
          position: relative; z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 64px;
          width: 100%;
          max-width: 960px;
          margin-bottom: 52px;
          flex-wrap: wrap;
        }

        /* Headline block */
        .sp-headline { flex: 1; min-width: 280px; max-width: 460px; }
        .sp-pill {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(91,110,232,0.15); border: 1px solid rgba(91,110,232,0.35);
          border-radius: 100px; padding: 6px 16px; margin-bottom: 22px;
          font-size: 11px; font-weight: 700; color: #9baeff;
          letter-spacing: 1px; text-transform: uppercase;
        }
        .sp-h1 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(36px, 5.5vw, 62px);
          font-weight: 800; color: #fff;
          line-height: 1.0; letter-spacing: -2px;
          margin-bottom: 18px;
        }
        .sp-h1 em { color: #7f9fff; font-style: normal; }
        .sp-sub { font-size: 15px; color: rgba(255,255,255,0.5); line-height: 1.75; margin-bottom: 28px; max-width: 400px; }
        .sp-badges { display: flex; gap: 8px; flex-wrap: wrap; }
        .sp-badge {
          padding: 5px 14px; border-radius: 100px; font-size: 12px; font-weight: 600;
          background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.5);
          border: 1px solid rgba(255,255,255,0.1);
        }

        /* Auth card */
        .sp-card {
          position: relative; z-index: 2;
          width: 100%; max-width: 400px;
          background: rgba(255,255,255,0.04); backdrop-filter: blur(28px);
          border: 1px solid rgba(255,255,255,0.1); border-radius: 22px; padding: 28px;
          box-shadow: 0 32px 64px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.04);
        }
        .sp-tabs {
          display: flex; gap: 4px;
          background: rgba(0,0,0,0.35); border-radius: 12px; padding: 4px; margin-bottom: 22px;
        }
        .sp-tab {
          flex: 1; padding: 9px; border: none; border-radius: 9px;
          font-size: 14px; font-family: 'DM Sans', sans-serif; font-weight: 600;
          cursor: pointer; transition: all .22s;
          background: transparent; color: rgba(255,255,255,0.35);
        }
        .sp-tab.on { background: #5B6EE8; color: #fff; box-shadow: 0 4px 14px rgba(91,110,232,0.45); }

        .sp-lbl { display: block; font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.4); margin-bottom: 7px; letter-spacing: 0.9px; text-transform: uppercase; }
        .sp-inp {
          width: 100%; padding: 11px 14px; margin-bottom: 14px;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; color: #fff; font-size: 14px;
          font-family: 'DM Sans', sans-serif; outline: none; transition: all .2s;
        }
        .sp-inp::placeholder { color: rgba(255,255,255,0.25); }
        .sp-inp:focus { border-color: #5B6EE8; background: rgba(91,110,232,0.09); box-shadow: 0 0 0 3px rgba(91,110,232,0.18); }

        .sp-forgot { text-align: right; margin: -8px 0 14px; font-size: 12px; color: #7f9fff; cursor: pointer; }
        .sp-forgot:hover { text-decoration: underline; }

        .sp-btn {
          width: 100%; padding: 13px; border: none; border-radius: 11px;
          background: linear-gradient(135deg, #5B6EE8 0%, #7b5ea7 100%);
          color: #fff; font-size: 15px; font-weight: 700;
          font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all .2s;
          box-shadow: 0 6px 20px rgba(91,110,232,0.4);
        }
        .sp-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(91,110,232,0.5); }
        .sp-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .sp-alt { text-align: center; margin-top: 14px; font-size: 13px; color: rgba(255,255,255,0.38); }
        .sp-alt button { background: none; border: none; color: #7f9fff; cursor: pointer; font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; padding: 0; }
        .sp-alt button:hover { text-decoration: underline; }

        .sp-err { background: rgba(220,53,69,0.14); border: 1px solid rgba(220,53,69,0.3); color: #ff8f8f; border-radius: 9px; padding: 10px 14px; font-size: 13px; margin-bottom: 14px; }
        .sp-hr { border: none; border-top: 1px solid rgba(255,255,255,0.06); }

        /* Sections */
        .sp-sec { padding: 80px 24px; max-width: 880px; margin: 0 auto; }
        .sp-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #7f9fff; margin-bottom: 12px; }
        .sp-h2 { font-family: 'Syne', sans-serif; font-size: clamp(24px, 3.5vw, 36px); font-weight: 800; color: #fff; line-height: 1.15; letter-spacing: -0.5px; margin-bottom: 14px; }
        .sp-body { font-size: 15px; color: rgba(255,255,255,0.48); line-height: 1.8; max-width: 560px; }

        .sp-fgrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 14px; margin-top: 36px; }
        .sp-fcard { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 22px 20px; transition: border-color .2s, transform .2s; }
        .sp-fcard:hover { border-color: rgba(91,110,232,0.3); transform: translateY(-3px); }
        .sp-ficon { width: 40px; height: 40px; border-radius: 11px; background: rgba(91,110,232,0.15); display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
        .sp-fcard h3 { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 7px; }
        .sp-fcard p { font-size: 13px; color: rgba(255,255,255,0.38); line-height: 1.6; }

        .sp-bgrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(128px, 1fr)); gap: 10px; margin-top: 36px; }
        .sp-bcard { border-radius: 14px; padding: 20px 12px; text-align: center; border: 1px solid; transition: transform .2s; }
        .sp-bcard:hover { transform: translateY(-4px); }
        .sp-bnum { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; margin-bottom: 6px; }
        .sp-bname { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 5px; }
        .sp-bverbs { font-size: 11px; color: rgba(255,255,255,0.38); line-height: 1.55; }

        .sp-tgrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(158px, 1fr)); gap: 14px; margin-top: 36px; }
        .sp-tcard { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px 16px; text-align: center; transition: border-color .2s; }
        .sp-tcard:hover { border-color: rgba(91,110,232,0.25); }
        .sp-av { width: 54px; height: 54px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 800; margin: 0 auto 12px; color: #fff; }
        .sp-tcard h4 { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 4px; }
        .sp-tcard p  { font-size: 12px; color: rgba(255,255,255,0.38); }

        .sp-footer { text-align: center; padding: 48px 24px; border-top: 1px solid rgba(255,255,255,0.06); }
        .sp-footer-logo { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; color: #fff; margin-bottom: 10px; }
        .sp-footer-logo em { color: #7f9fff; font-style: normal; }
        .sp-footer p { font-size: 13px; color: rgba(255,255,255,0.28); margin-top: 6px; }
        .sp-footer a { color: #7f9fff; text-decoration: none; }
        .sp-footer a:hover { text-decoration: underline; }

        @media (max-width: 700px) {
          .sp-nav { padding: 14px 20px; }
          .sp-nav-links { gap: 12px; }
          .sp-nav-link { display: none; }
          .sp-hero { padding: 80px 16px 60px; }
          .sp-hero-top { gap: 32px; }
          .sp-bgrid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>

      <div className="sp">

        {/* ── Nav ── */}
        <nav className="sp-nav">
          <a href="#" className="sp-logo">STU<em>DI</em></a>
          <div className="sp-nav-links">
            <a href="#about" className="sp-nav-link">About</a>
            <a href="#taxonomy" className="sp-nav-link">Taxonomy</a>
            <a href="#team" className="sp-nav-link">Team</a>
            <a href="/evaluator/login" className="sp-nav-eval">Evaluator →</a>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="sp-hero">

          {/* Animated background */}
          <div className="sp-hero-bg">
            <div className="blob" style={{ position:"absolute", width:420, height:420, borderRadius:"50%", background:"rgba(91,110,232,0.14)", filter:"blur(90px)", top:"-8%", left:"-4%" }} />
            <div className="blob2" style={{ position:"absolute", width:360, height:360, borderRadius:"50%", background:"rgba(123,94,167,0.11)", filter:"blur(80px)", top:"25%", right:"-2%" }} />
            <div className="blob3" style={{ position:"absolute", width:280, height:280, borderRadius:"50%", background:"rgba(91,110,232,0.09)", filter:"blur(70px)", bottom:"8%", left:"30%" }} />

            {/* Stars */}
            {([
              ["8%","11%",2,"0s"],["15%","26%",3,"0.7s"],["6%","53%",2,"1.3s"],
              ["21%","71%",2,"0.4s"],["12%","88%",3,"1.9s"],["34%","4%",2,"2.2s"],
              ["44%","94%",2,"0.9s"],["57%","19%",2,"1.6s"],["62%","79%",3,"2.6s"],
              ["72%","42%",2,"0.3s"],["80%","67%",2,"1.1s"],
            ] as [string,string,number,string][]).map(([t,l,s,d],i) => (
              <Star key={i} top={t} left={l} size={s} delay={d} />
            ))}

            {/* Waves */}
            <svg className="wave1" style={{ position:"absolute", bottom:0, left:0, width:"220%", display:"block" }} viewBox="0 0 1440 140" fill="none">
              <path d="M0,70 C240,120 480,20 720,70 C960,120 1200,20 1440,70 L1440,140 L0,140 Z" fill="rgba(91,110,232,0.15)" />
            </svg>
            <svg className="wave2" style={{ position:"absolute", bottom:-30, left:0, width:"220%", display:"block", opacity:0.55 }} viewBox="0 0 1440 140" fill="none">
              <path d="M0,50 C360,110 720,10 1080,60 C1200,78 1320,92 1440,50 L1440,140 L0,140 Z" fill="rgba(127,159,255,0.1)" />
            </svg>
            <svg className="wave3" style={{ position:"absolute", bottom:-55, left:0, width:"220%", display:"block", opacity:0.3 }} viewBox="0 0 1440 140" fill="none">
              <path d="M0,90 C180,30 360,100 540,65 C720,30 900,90 1080,55 C1260,20 1380,80 1440,90 L1440,140 L0,140 Z" fill="rgba(91,110,232,0.08)" />
            </svg>
          </div>

          {/* ── Top: Headline + Wheel side by side ── */}
          <div className="sp-hero-top">

            {/* Left: Headline */}
            <div className="sp-headline">
              <div className="sp-pill">
                <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="#5B6EE8"/><circle cx="4" cy="4" r="2" fill="#9baeff"/></svg>
                Powered by AI · Bloom&apos;s Taxonomy
              </div>
              <h1 className="sp-h1">Make Studying<br /><em>Actually Fun</em></h1>
              <p className="sp-sub">Upload your reviewer notes, get a smart AI-generated quiz, and level up your knowledge — one question at a time.</p>
              <div className="sp-badges">
                <span className="sp-badge">Quiz Games</span>
                <span className="sp-badge">6 Cognitive Levels</span>
                <span className="sp-badge">Instant Feedback</span>
                <span className="sp-badge">Track Progress</span>
              </div>
            </div>

            {/* Right: Spin Wheel */}
            <SpinWheel />
          </div>

          {/* ── Auth card below ── */}
          <div className="sp-card">
            <div className="sp-tabs">
              <button className={`sp-tab${tab==="login"?" on":""}`} onClick={()=>switchTab("login")}>Sign in</button>
              <button className={`sp-tab${tab==="signup"?" on":""}`} onClick={()=>switchTab("signup")}>Create account</button>
            </div>

            {error && <div className="sp-err">{error}</div>}

            {tab === "login" ? (
              <form onSubmit={handleLogin}>
                <label className="sp-lbl">Email</label>
                <input className="sp-inp" type="email" placeholder="you@example.com" value={loginData.email} onChange={e=>setLoginData(p=>({...p,email:e.target.value}))} required />
                <label className="sp-lbl">Password</label>
                <input className="sp-inp" type="password" placeholder="••••••••" value={loginData.password} onChange={e=>setLoginData(p=>({...p,password:e.target.value}))} required />
                <div className="sp-forgot">Forgot password?</div>
                <button className="sp-btn" type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in →"}</button>
                <p className="sp-alt">No account? <button type="button" onClick={()=>switchTab("signup")}>Create one free</button></p>
              </form>
            ) : (
              <form onSubmit={handleSignup}>
                <label className="sp-lbl">Full Name</label>
                <input className="sp-inp" type="text" placeholder="Your name" value={signupData.fullName} onChange={e=>setSignupData(p=>({...p,fullName:e.target.value}))} required />
                <label className="sp-lbl">Email</label>
                <input className="sp-inp" type="email" placeholder="you@example.com" value={signupData.email} onChange={e=>setSignupData(p=>({...p,email:e.target.value}))} required />
                <label className="sp-lbl">Password</label>
                <input className="sp-inp" type="password" placeholder="Min. 6 characters" value={signupData.password} onChange={e=>setSignupData(p=>({...p,password:e.target.value}))} required />
                <label className="sp-lbl">Confirm Password</label>
                <input className="sp-inp" type="password" placeholder="Repeat password" value={signupData.confirmPassword} onChange={e=>setSignupData(p=>({...p,confirmPassword:e.target.value}))} required />
                <button className="sp-btn" type="submit" disabled={loading}>{loading ? "Creating account…" : "Create account →"}</button>
                <p className="sp-alt">Already a member? <button type="button" onClick={()=>switchTab("login")}>Sign in</button></p>
              </form>
            )}
          </div>
        </section>

        {/* ── About ── */}
        <hr className="sp-hr" />
        <section className="sp-sec" id="about">
          <p className="sp-eyebrow">What is STUDI?</p>
          <h2 className="sp-h2">Study smarter,<br />not harder</h2>
          <p className="sp-body">STUDI turns your documents and reviewer notes into interactive quiz games. Powered by Groq AI and grounded in educational science, it makes reviewing genuinely engaging — and tells you exactly where you need more practice.</p>
          <div className="sp-fgrid">
            {[
              { icon:<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#7f9fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 2L2 6v6l7 4 7-4V6L9 2z"/></svg>, title:"Upload & Generate", desc:"Drop your DOC or TXT file and let AI build a tailored quiz in seconds." },
              { icon:<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#7f9fff" strokeWidth="1.5" strokeLinecap="round"><circle cx="10" cy="10" r="8"/><path d="M10 6v4l3 3"/></svg>, title:"Timed Challenges", desc:"Race against the clock. Speed bonuses and streaks keep you sharp." },
              { icon:<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#7f9fff" strokeWidth="1.5" strokeLinecap="round"><path d="M3 15l5-5 4 4 6-8"/></svg>, title:"Track Progress", desc:"See your scores per difficulty and cognitive level. Know where to improve." },
              { icon:<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#7f9fff" strokeWidth="1.5" strokeLinecap="round"><circle cx="10" cy="8" r="3"/><path d="M4 18c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>, title:"Expert Evaluation", desc:"A dedicated evaluator reviews every quiz for Bloom's Taxonomy alignment." },
            ].map((f,i)=>(
              <div key={i} className="sp-fcard">
                <div className="sp-ficon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Taxonomy ── */}
        <hr className="sp-hr" />
        <section className="sp-sec" id="taxonomy">
          <p className="sp-eyebrow">The Science Behind It</p>
          <h2 className="sp-h2">Anderson & Krathwohl&apos;s<br />Revised Bloom&apos;s Taxonomy</h2>
          <p className="sp-body">Every question STUDI generates is classified into one of six cognitive levels — from simple recall all the way to creative synthesis.</p>
          <div className="sp-bgrid">
            {[
              {num:"01",name:"Remember",  color:"#7f9fff",bg:"rgba(91,110,232,0.12)", border:"rgba(91,110,232,0.25)",  verbs:"Define · List · Name · Recall"},
              {num:"02",name:"Understand",color:"#5dade2",bg:"rgba(52,152,219,0.12)", border:"rgba(52,152,219,0.25)",  verbs:"Explain · Summarize · Describe"},
              {num:"03",name:"Apply",     color:"#58d68d",bg:"rgba(39,174,96,0.12)",  border:"rgba(39,174,96,0.25)",   verbs:"Solve · Demonstrate · Use"},
              {num:"04",name:"Analyze",   color:"#f8c471",bg:"rgba(243,156,18,0.12)", border:"rgba(243,156,18,0.25)",  verbs:"Compare · Contrast · Examine"},
              {num:"05",name:"Evaluate",  color:"#eb984e",bg:"rgba(230,126,34,0.12)", border:"rgba(230,126,34,0.25)",  verbs:"Justify · Critique · Judge"},
              {num:"06",name:"Create",    color:"#f1948a",bg:"rgba(192,57,43,0.12)",  border:"rgba(192,57,43,0.25)",   verbs:"Design · Propose · Construct"},
            ].map((l,i)=>(
              <div key={i} className="sp-bcard" style={{background:l.bg,borderColor:l.border}}>
                <div className="sp-bnum" style={{color:l.color}}>{l.num}</div>
                <div className="sp-bname">{l.name}</div>
                <div className="sp-bverbs">{l.verbs}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Team ── */}
        <hr className="sp-hr" />
        <section className="sp-sec" id="team">
          <p className="sp-eyebrow">The Team</p>
          <h2 className="sp-h2">Built by students,<br />for students</h2>
          <p className="sp-body">STUDI is a capstone project developed at Central Mindanao University.</p>
          <div className="sp-tgrid">
            {[
              {initials:"MK", name:"Makoy",       role:"Lead Developer",  color:"#5B6EE8"},
              {initials:"TM", name:"Team Member",  role:"UI / Research",   color:"#3d9e6e"},
              {initials:"TM", name:"Team Member",  role:"Backend / AI",    color:"#9b59b6"},
              {initials:"TM", name:"Team Member",  role:"Evaluation",      color:"#e67e22"},
            ].map((m,i)=>(
              <div key={i} className="sp-tcard">
                <div className="sp-av" style={{background:m.color}}>{m.initials}</div>
                <h4>{m.name}</h4>
                <p>{m.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="sp-footer">
          <div className="sp-footer-logo">STU<em>DI</em></div>
          <p>© 2025 STUDI — Central Mindanao University Capstone Project</p>
          <p style={{marginTop:8}}>Made with purpose · <a href="/evaluator/login">Evaluator access →</a></p>
        </footer>

      </div>
    </>
  )
}