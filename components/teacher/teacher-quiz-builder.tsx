"use client"
import { useState } from "react"

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_FILES = [
  { id: "f1", name: "Biology Chapter 5 - Cell Division.txt", size: "42 KB" },
  { id: "f2", name: "Philippine History Notes.docx", size: "78 KB" },
  { id: "f3", name: "Algebra Fundamentals.txt", size: "31 KB" },
]

const TAXONOMY_LEVELS = [
  { name: "Remember",   color: "#7f9fff", verbs: "Define, List, Recall, Name" },
  { name: "Understand", color: "#5dade2", verbs: "Explain, Summarize, Describe" },
  { name: "Apply",      color: "#58d68d", verbs: "Solve, Demonstrate, Use" },
  { name: "Analyze",    color: "#f8c471", verbs: "Compare, Contrast, Examine" },
  { name: "Evaluate",   color: "#eb984e", verbs: "Justify, Critique, Judge" },
  { name: "Create",     color: "#f1948a", verbs: "Design, Propose, Construct" },
]

const MOCK_GENERATED_QUESTIONS = [
  {
    id: 1,
    question: "What is the term for the process by which a cell divides into two daughter cells with the same number of chromosomes as the parent cell?",
    options: ["Meiosis", "Mitosis", "Binary fission", "Cytokinesis"],
    correctAnswer: 1,
    cognitiveLevel: "Remember",
    explanation: "Mitosis is the process of cell division resulting in two genetically identical daughter cells, each with the same number of chromosomes as the parent.",
  },
  {
    id: 2,
    question: "Explain why mitosis is essential for the growth and repair of multicellular organisms.",
    options: [
      "It produces genetically diverse cells for adaptation",
      "It replaces damaged cells with identical copies to maintain tissue function",
      "It reduces the chromosome number to allow fertilization",
      "It creates stem cells for organ regeneration only",
    ],
    correctAnswer: 1,
    cognitiveLevel: "Understand",
    explanation: "Mitosis produces identical cells that replace damaged or dead cells, maintaining tissue integrity and enabling organismal growth.",
  },
  {
    id: 3,
    question: "A researcher observes cells with 46 chromosomes before division and 46 chromosomes after. Which type of cell division occurred?",
    options: ["Meiosis I", "Meiosis II", "Mitosis", "Binary Fission"],
    correctAnswer: 2,
    cognitiveLevel: "Apply",
    explanation: "Mitosis preserves chromosome number (46 in humans), so the observation of 46 chromosomes pre- and post-division indicates mitotic division.",
  },
  {
    id: 4,
    question: "Compare the roles of mitosis and meiosis in sexual reproduction. What would happen if meiosis did not occur?",
    options: [
      "Cells would stop dividing altogether",
      "Gametes would have double the chromosome number, causing polyploidy",
      "Only binary fission would replace it",
      "Organisms would reproduce asexually instead",
    ],
    correctAnswer: 1,
    cognitiveLevel: "Analyze",
    explanation: "Without meiosis, gametes would have the full diploid chromosome count, resulting in offspring with double the chromosomes (polyploidy) after fertilization.",
  },
  {
    id: 5,
    question: "Judge which phase of mitosis is most critical for ensuring accurate genetic replication, and justify your answer.",
    options: [
      "Prophase — chromatin condenses into visible chromosomes",
      "Metaphase — chromosomes align ensuring equal distribution",
      "Anaphase — sister chromatids are pulled to poles",
      "Telophase — nuclear envelopes reform",
    ],
    correctAnswer: 1,
    cognitiveLevel: "Evaluate",
    explanation: "Metaphase is critical because proper chromosome alignment on the metaphase plate ensures that each daughter cell receives the correct number of chromosomes.",
  },
  {
    id: 6,
    question: "Design an experiment to test whether temperature affects the rate of mitosis in onion root tip cells.",
    options: [
      "Stain cells at one temperature and count dividing cells",
      "Grow roots at different temperatures and compare mitotic index across groups",
      "Use a microscope to observe cells and guess the temperature",
      "Apply radiation to cells and measure growth",
    ],
    correctAnswer: 1,
    cognitiveLevel: "Create",
    explanation: "A controlled experiment varying temperature while measuring mitotic index (proportion of dividing cells) would directly test temperature's effect on mitosis rate.",
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function TaxonomyBadge({ level, small = false }) {
  const lv = TAXONOMY_LEVELS.find((l) => l.name === level)
  if (!lv) return null
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: small ? 9 : 11, fontWeight: 700, letterSpacing: "0.7px",
      textTransform: "uppercase",
      color: lv.color,
      background: `${lv.color}18`,
      border: `1px solid ${lv.color}35`,
      borderRadius: 100,
      padding: small ? "2px 8px" : "3px 10px",
    }}>
      {level}
    </span>
  )
}

// ─── SCREEN 1: Login ──────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [tab, setTab] = useState("login")
  const [form, setForm] = useState({ email: "", password: "", name: "" })
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onLogin({ name: form.name || "Ms. Santos", email: form.email || "teacher@studi.com" })
    }, 900)
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#07071a",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "40px 24px", position: "relative", overflow: "hidden",
    }}>
      {/* Ambient */}
      {[
        { w:420, h:420, bg:"rgba(91,110,232,0.12)", t:"-80px", l:"-40px", dur:"11s" },
        { w:320, h:320, bg:"rgba(81,207,102,0.08)", b:"40px", r:"-40px", dur:"15s" },
      ].map((b, i) => (
        <div key={i} style={{
          position:"fixed", width:b.w, height:b.h, borderRadius:"50%",
          background:b.bg, filter:"blur(90px)", pointerEvents:"none", zIndex:0,
          top:b.t, left:b.l, bottom:b.b, right:b.r,
          animation:`blobD ${b.dur} ease-in-out infinite`,
        }} />
      ))}

      {/* Nav bar */}
      <div style={{
        position:"fixed", top:0, left:0, right:0,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"14px 40px",
        background:"rgba(7,7,26,0.8)", backdropFilter:"blur(12px)",
        borderBottom:"1px solid rgba(255,255,255,0.06)", zIndex:10,
      }}>
        <span style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:"#fff" }}>
          STU<span style={{ color:"#7f9fff" }}>DI</span>
          <span style={{ fontSize:11, fontWeight:700, color:"#51CF66", background:"rgba(81,207,102,0.12)", border:"1px solid rgba(81,207,102,0.25)", borderRadius:100, padding:"2px 10px", marginLeft:10, letterSpacing:"1px", textTransform:"uppercase" }}>
            Teacher
          </span>
        </span>
        <a href="/dashboard" style={{ fontSize:13, color:"rgba(255,255,255,0.4)", textDecoration:"none", display:"flex", alignItems:"center", gap:6 }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          Back to Student
        </a>
      </div>

      {/* Card */}
      <div style={{ position:"relative", zIndex:1, width:"100%", maxWidth:400 }}>
        {/* Hero text */}
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{
            display:"inline-flex", alignItems:"center", gap:8,
            background:"rgba(81,207,102,0.12)", border:"1px solid rgba(81,207,102,0.25)",
            borderRadius:100, padding:"5px 16px", marginBottom:18,
            fontSize:11, fontWeight:700, color:"#51CF66", letterSpacing:"1px", textTransform:"uppercase",
          }}>
            🎓 Teacher Portal
          </div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800, color:"#fff", margin:"0 0 8px", letterSpacing:-0.5 }}>
            Build Better Quizzes
          </h1>
          <p style={{ fontSize:14, color:"rgba(255,255,255,0.4)", lineHeight:1.7 }}>
            Upload your materials and craft Bloom's-aligned questions with AI assistance.
          </p>
        </div>

        <div style={{
          background:"rgba(255,255,255,0.04)", backdropFilter:"blur(24px)",
          border:"1px solid rgba(255,255,255,0.1)", borderRadius:22, padding:"28px",
          boxShadow:"0 32px 64px rgba(0,0,0,0.5)",
        }}>
          {/* Tabs */}
          <div style={{ display:"flex", gap:4, background:"rgba(0,0,0,0.3)", borderRadius:12, padding:4, marginBottom:22 }}>
            {["login","signup"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex:1, padding:"9px", border:"none", borderRadius:9,
                fontSize:14, fontFamily:"inherit", fontWeight:600, cursor:"pointer",
                transition:"all .2s",
                background: tab===t ? "#51CF66" : "transparent",
                color: tab===t ? "#fff" : "rgba(255,255,255,0.35)",
                boxShadow: tab===t ? "0 4px 14px rgba(81,207,102,0.4)" : "none",
              }}>
                {t === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {tab === "signup" && (
              <>
                <label style={{ display:"block", fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.4)", letterSpacing:"0.9px", textTransform:"uppercase", marginBottom:7 }}>Full Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm(p=>({...p,name:e.target.value}))}
                  placeholder="Ms. Santos"
                  style={{
                    width:"100%", padding:"11px 14px", marginBottom:14,
                    background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)",
                    borderRadius:10, color:"#fff", fontSize:14, fontFamily:"inherit", outline:"none",
                  }}
                />
              </>
            )}
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.4)", letterSpacing:"0.9px", textTransform:"uppercase", marginBottom:7 }}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(p=>({...p,email:e.target.value}))}
              placeholder="teacher@school.edu"
              style={{
                width:"100%", padding:"11px 14px", marginBottom:14,
                background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)",
                borderRadius:10, color:"#fff", fontSize:14, fontFamily:"inherit", outline:"none",
              }}
            />
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.4)", letterSpacing:"0.9px", textTransform:"uppercase", marginBottom:7 }}>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(p=>({...p,password:e.target.value}))}
              placeholder="••••••••"
              style={{
                width:"100%", padding:"11px 14px", marginBottom:22,
                background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)",
                borderRadius:10, color:"#fff", fontSize:14, fontFamily:"inherit", outline:"none",
              }}
            />
            <button type="submit" disabled={loading} style={{
              width:"100%", padding:"13px", border:"none", borderRadius:11,
              background:"linear-gradient(135deg,#51CF66,#37b24d)",
              color:"#fff", fontSize:15, fontWeight:700, fontFamily:"inherit",
              cursor:loading?"not-allowed":"pointer", opacity:loading?.6:1,
              boxShadow:"0 6px 20px rgba(81,207,102,0.4)", transition:"all .2s",
            }}>
              {loading ? "Signing in…" : tab==="login" ? "Sign In →" : "Create Account →"}
            </button>
          </form>

          <div style={{ marginTop:14, padding:"10px 14px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:10, fontSize:11, color:"rgba(255,255,255,0.25)", textAlign:"center" }}>
            Demo: any email & password works
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── SCREEN 2: Dashboard / File Picker ───────────────────────────────────────
function DashboardScreen({ teacher, onPickFile, savedSets }) {
  const [dragging, setDragging] = useState(false)
  const [files, setFiles] = useState(MOCK_FILES)

  const initials = teacher.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)

  return (
    <div style={{ display:"flex", height:"100vh", background:"#07071a", color:"#fff", overflow:"hidden" }}>
      {/* Sidebar */}
      <aside style={{ width:200, background:"#0d0d2b", borderRight:"1px solid rgba(255,255,255,0.06)", display:"flex", flexDirection:"column", flexShrink:0 }}>
        <div style={{ padding:"22px 20px 16px" }}>
          <span style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:"#fff" }}>
            STU<span style={{ color:"#51CF66" }}>DI</span>
          </span>
          <div style={{ fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.25)", letterSpacing:"1.5px", textTransform:"uppercase", marginTop:2 }}>Teacher Portal</div>
        </div>
        <div style={{ height:1, background:"rgba(255,255,255,0.06)", margin:"0 12px" }} />
        <nav style={{ padding:"12px 8px", flex:1 }}>
          {[
            { icon:"⊞", label:"Dashboard", active:true },
            { icon:"📁", label:"My Files", active:false },
            { icon:"📋", label:"Saved Quizzes", active:false, count: savedSets.length },
            { icon:"⚙", label:"Settings", active:false },
          ].map(item => (
            <div key={item.label} style={{
              display:"flex", alignItems:"center", gap:10, padding:"9px 12px",
              borderRadius:10, marginBottom:2, cursor:"pointer",
              background: item.active ? "rgba(81,207,102,0.15)" : "transparent",
              border: item.active ? "1px solid rgba(81,207,102,0.25)" : "1px solid transparent",
              color: item.active ? "#51CF66" : "rgba(255,255,255,0.4)",
              fontSize:13, fontWeight: item.active ? 600 : 400,
            }}>
              <span style={{ fontSize:14 }}>{item.icon}</span>
              <span style={{ flex:1 }}>{item.label}</span>
              {item.count > 0 && (
                <span style={{ fontSize:10, fontWeight:700, color:"#51CF66", background:"rgba(81,207,102,0.12)", borderRadius:100, padding:"1px 6px" }}>
                  {item.count}
                </span>
              )}
            </div>
          ))}
        </nav>
        {/* User */}
        <div style={{ padding:"12px 8px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#51CF66,#37b24d)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:"#fff" }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize:12, fontWeight:600, color:"#fff", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:90 }}>{teacher.name}</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)" }}>Teacher</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex:1, overflow:"auto", display:"flex", flexDirection:"column" }}>
        {/* Header */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"18px 28px", borderBottom:"1px solid rgba(255,255,255,0.05)",
          background:"rgba(7,7,26,0.85)", backdropFilter:"blur(12px)",
          position:"sticky", top:0, zIndex:10,
        }}>
          <div>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:"#fff", margin:0 }}>
              Teacher Dashboard
            </h1>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.35)", margin:"2px 0 0" }}>
              Upload a file to start building your quiz
            </p>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8,
            background:"rgba(81,207,102,0.12)", border:"1px solid rgba(81,207,102,0.25)",
            borderRadius:100, padding:"5px 14px", fontSize:11, fontWeight:700, color:"#51CF66",
          }}>
            🎓 Teacher Mode
          </div>
        </div>

        <div style={{ padding:"28px", flex:1 }}>

          {/* Stats */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:28 }}>
            {[
              { icon:"📁", val: files.length, lbl:"Files Uploaded", color:"#7f9fff" },
              { icon:"📋", val: savedSets.length, lbl:"Saved Quiz Sets", color:"#51CF66" },
              { icon:"❓", val: savedSets.reduce((s,q)=>s+q.questions.length,0), lbl:"Total Questions", color:"#FFD43B" },
            ].map(s => (
              <div key={s.lbl} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:"18px 20px" }}>
                <div style={{ fontSize:22, marginBottom:10 }}>{s.icon}</div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:800, color:s.color, lineHeight:1 }}>{s.val}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginTop:4 }}>{s.lbl}</div>
              </div>
            ))}
          </div>

          {/* Upload zone */}
          <div style={{ marginBottom:28 }}>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700, color:"rgba(255,255,255,0.7)", marginBottom:14 }}>
              Upload New File
            </h2>
            <div
              onDragOver={e=>{e.preventDefault();setDragging(true)}}
              onDragLeave={()=>setDragging(false)}
              onDrop={e=>{e.preventDefault();setDragging(false)}}
              style={{
                border:`2px dashed ${dragging?"rgba(81,207,102,0.6)":"rgba(255,255,255,0.1)"}`,
                borderRadius:16, padding:"36px 24px", textAlign:"center",
                background: dragging?"rgba(81,207,102,0.05)":"rgba(255,255,255,0.02)",
                cursor:"pointer", transition:"all .2s",
              }}
            >
              <div style={{ fontSize:36, marginBottom:12 }}>📤</div>
              <div style={{ fontSize:14, fontWeight:600, color:"rgba(255,255,255,0.6)", marginBottom:6 }}>
                Drop your file here, or <span style={{ color:"#51CF66", cursor:"pointer" }}>browse</span>
              </div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.3)" }}>TXT, DOC, DOCX supported · max 1MB</div>
            </div>
          </div>

          {/* File list */}
          <div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700, color:"rgba(255,255,255,0.7)", marginBottom:14 }}>
              My Files
            </h2>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {files.map(file => (
                <div key={file.id} style={{
                  display:"flex", alignItems:"center", gap:16, padding:"16px 20px",
                  background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
                  borderRadius:14, cursor:"pointer", transition:"all .2s",
                }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(81,207,102,0.3)";e.currentTarget.style.background="rgba(81,207,102,0.04)"}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.08)";e.currentTarget.style.background="rgba(255,255,255,0.04)"}}
                  onClick={()=>onPickFile(file)}
                >
                  <div style={{ width:44, height:44, borderRadius:12, background:"linear-gradient(135deg,#FFD43B,#FFA94D)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>📄</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:"#fff", marginBottom:3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{file.name}</div>
                    <div style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>{file.size}</div>
                  </div>
                  <button style={{
                    padding:"9px 20px", borderRadius:10, border:"none",
                    background:"linear-gradient(135deg,#51CF66,#37b24d)",
                    color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer",
                    boxShadow:"0 4px 12px rgba(81,207,102,0.35)", flexShrink:0,
                  }}>
                    Create Quiz →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── SCREEN 3: Quiz Setup (Prompt + Config) ───────────────────────────────────
function SetupScreen({ file, onGenerate, onBack }) {
  const [prompt, setPrompt] = useState("")
  const [qCount, setQCount] = useState(6)
  const [difficulty, setDifficulty] = useState("moderate")
  const [focusLevels, setFocusLevels] = useState(["Remember","Understand","Apply","Analyze","Evaluate","Create"])
  const [generating, setGenerating] = useState(false)

  const toggleLevel = (lv) => {
    setFocusLevels(prev =>
      prev.includes(lv) ? prev.filter(l=>l!==lv) : [...prev, lv]
    )
  }

  const handleGenerate = () => {
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      onGenerate({ prompt, qCount, difficulty, focusLevels })
    }, 1800)
  }

  return (
    <div style={{ minHeight:"100vh", background:"#07071a", color:"#fff", display:"flex", flexDirection:"column" }}>
      {/* Header */}
      <div style={{
        display:"flex", alignItems:"center", gap:12, padding:"14px 28px",
        borderBottom:"1px solid rgba(255,255,255,0.06)",
        background:"rgba(7,7,26,0.9)", backdropFilter:"blur(12px)",
        position:"sticky", top:0, zIndex:10,
      }}>
        <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:8, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:12, fontWeight:600, fontFamily:"inherit" }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          Dashboard
        </button>
        <div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700, color:"#fff" }}>Configure Quiz Generation</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>📄 {file.name}</div>
        </div>
      </div>

      <div style={{ flex:1, padding:"32px 28px", maxWidth:680, margin:"0 auto", width:"100%" }}>

        {/* Teacher Prompt */}
        <div style={{ marginBottom:24 }}>
          <label style={{ display:"block", fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.7)", marginBottom:8 }}>
            📝 Your Instruction to AI <span style={{ fontWeight:400, color:"rgba(255,255,255,0.35)" }}>(optional)</span>
          </label>
          <textarea
            value={prompt}
            onChange={e=>setPrompt(e.target.value)}
            placeholder="e.g. Focus on the stages of mitosis and their significance. Include application questions about real-world scenarios. Avoid trivial memorization questions..."
            rows={4}
            style={{
              width:"100%", padding:"14px 16px", resize:"vertical",
              background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
              borderRadius:12, color:"#fff", fontSize:14, fontFamily:"inherit",
              outline:"none", lineHeight:1.65,
            }}
          />
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", marginTop:6 }}>
            💡 Guide the AI on what to focus on, what to avoid, or any special instructions.
          </div>
        </div>

        {/* Taxonomy level selection */}
        <div style={{ marginBottom:24 }}>
          <label style={{ display:"block", fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.7)", marginBottom:12 }}>
            🎯 Bloom's Taxonomy Levels to Include
          </label>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
            {TAXONOMY_LEVELS.map(lv => {
              const active = focusLevels.includes(lv.name)
              return (
                <button key={lv.name} onClick={()=>toggleLevel(lv.name)} style={{
                  padding:"12px 10px", borderRadius:12, cursor:"pointer",
                  border:`1.5px solid ${active ? lv.color+"50" : "rgba(255,255,255,0.08)"}`,
                  background: active ? `${lv.color}15` : "rgba(255,255,255,0.03)",
                  color: active ? lv.color : "rgba(255,255,255,0.4)",
                  fontFamily:"inherit", transition:"all .15s",
                }}>
                  <div style={{ fontSize:13, fontWeight:700, marginBottom:3 }}>{lv.name}</div>
                  <div style={{ fontSize:10, opacity:.7 }}>{lv.verbs.split(",")[0].trim()}…</div>
                  {active && <div style={{ width:8, height:8, borderRadius:"50%", background:lv.color, margin:"6px auto 0" }} />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Question count + difficulty */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:28 }}>
          <div>
            <label style={{ display:"block", fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.7)", marginBottom:10 }}>
              Questions: <span style={{ color:"#7f9fff" }}>{qCount}</span>
            </label>
            <input type="range" min={3} max={15} value={qCount} onChange={e=>setQCount(+e.target.value)}
              style={{ width:"100%", accentColor:"#51CF66" }} />
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"rgba(255,255,255,0.25)", marginTop:4 }}>
              <span>3 min</span><span>15 max</span>
            </div>
          </div>
          <div>
            <label style={{ display:"block", fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.7)", marginBottom:10 }}>Difficulty</label>
            <div style={{ display:"flex", gap:6 }}>
              {[["easy","🟢"],["moderate","🟡"],["hard","🔴"]].map(([d,icon]) => (
                <button key={d} onClick={()=>setDifficulty(d)} style={{
                  flex:1, padding:"9px 6px", borderRadius:9, cursor:"pointer",
                  border:`1px solid ${difficulty===d?"rgba(81,207,102,0.4)":"rgba(255,255,255,0.08)"}`,
                  background: difficulty===d ? "rgba(81,207,102,0.12)" : "rgba(255,255,255,0.03)",
                  color: difficulty===d ? "#51CF66" : "rgba(255,255,255,0.4)",
                  fontSize:12, fontWeight:600, fontFamily:"inherit", textTransform:"capitalize",
                }}>
                  {icon} {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate button */}
        <button onClick={handleGenerate} disabled={generating} style={{
          width:"100%", padding:"15px", borderRadius:13, border:"none",
          background: generating ? "rgba(81,207,102,0.3)" : "linear-gradient(135deg,#51CF66,#37b24d)",
          color:"#fff", fontSize:15, fontWeight:700, fontFamily:"inherit",
          cursor:generating?"not-allowed":"pointer",
          boxShadow: generating?"none":"0 8px 24px rgba(81,207,102,0.4)", transition:"all .2s",
          display:"flex", alignItems:"center", justifyContent:"center", gap:10,
        }}>
          {generating ? (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation:"spin .8s linear infinite" }}>
                <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
                <path d="M8 2A6 6 0 0114 8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Generating with AI…
            </>
          ) : "✨ Generate Quiz Questions"}
        </button>
      </div>
    </div>
  )
}

// ─── SCREEN 4: Question Editor ─────────────────────────────────────────────────
function EditorScreen({ file, config, onSaveSet, onBack }) {
  const [questions, setQuestions] = useState(
    MOCK_GENERATED_QUESTIONS.map(q => ({ ...q, status: "pending", editing: false }))
  )
  const [savedQuestions, setSavedQuestions] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [setName, setSetName] = useState(`${file.name.replace(/\.[^.]+$/, "")} Quiz`)

  const q = questions[currentIdx]
  const saved = savedQuestions

  const updateQ = (idx, updates) => {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, ...updates } : q))
  }

  const handleApprove = () => {
    setSavedQuestions(prev => {
      // avoid dupes
      if (prev.find(sq => sq.id === q.id)) return prev
      return [...prev, { ...q, status:"approved" }]
    })
    updateQ(currentIdx, { status:"approved" })
    if (currentIdx < questions.length - 1) setCurrentIdx(currentIdx + 1)
  }

  const handleSkip = () => {
    updateQ(currentIdx, { status:"skipped" })
    if (currentIdx < questions.length - 1) setCurrentIdx(currentIdx + 1)
  }

  const handleEditField = (field, value) => {
    updateQ(currentIdx, { [field]: value })
  }

  const handleOptionEdit = (optIdx, value) => {
    const newOpts = [...q.options]
    newOpts[optIdx] = value
    updateQ(currentIdx, { options: newOpts })
  }

  const handleSave = () => {
    onSaveSet({ name: setName, questions: savedQuestions, file: file.name, createdAt: new Date() })
    setShowSaveModal(false)
  }

  const statusColor = { pending:"rgba(255,255,255,0.3)", approved:"#51CF66", skipped:"rgba(255,107,107,0.6)" }
  const approvedCount = questions.filter(q=>q.status==="approved").length
  const skippedCount = questions.filter(q=>q.status==="skipped").length

  return (
    <>
      <style>{`
        .opt-input { background:rgba(255,255,255,0.05) !important; border:1px solid rgba(255,255,255,0.1) !important; border-radius:8px !important; color:#fff !important; font-family:inherit !important; font-size:13px !important; outline:none !important; padding:8px 12px !important; width:100% !important; transition:border-color .15s !important; }
        .opt-input:focus { border-color:rgba(81,207,102,0.4) !important; background:rgba(81,207,102,0.05) !important; }
        .correct-opt { border-color:rgba(81,207,102,0.4) !important; background:rgba(81,207,102,0.08) !important; }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={{ display:"flex", height:"100vh", background:"#07071a", color:"#fff", overflow:"hidden" }}>

        {/* Left panel — question list */}
        <div style={{ width:200, background:"#0d0d2b", borderRight:"1px solid rgba(255,255,255,0.06)", display:"flex", flexDirection:"column", flexShrink:0, overflow:"hidden" }}>
          <div style={{ padding:"16px 16px 12px" }}>
            <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 10px", borderRadius:8, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:11, fontWeight:600, fontFamily:"inherit", marginBottom:12 }}>
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
              Dashboard
            </button>
            <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:8 }}>Questions</div>
            {/* Stats */}
            <div style={{ display:"flex", gap:6, marginBottom:8 }}>
              {[
                { lbl:"✅", val:approvedCount, color:"#51CF66" },
                { lbl:"⏭", val:skippedCount, color:"rgba(255,107,107,0.6)" },
                { lbl:"⏳", val:questions.length-approvedCount-skippedCount, color:"rgba(255,255,255,0.3)" },
              ].map(s => (
                <div key={s.lbl} style={{ flex:1, textAlign:"center", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:8, padding:"5px 0" }}>
                  <div style={{ fontSize:14 }}>{s.lbl}</div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:800, color:s.color }}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Q list */}
          <div style={{ flex:1, overflowY:"auto", padding:"0 8px 12px" }}>
            {questions.map((qItem, idx) => {
              const lv = TAXONOMY_LEVELS.find(l=>l.name===qItem.cognitiveLevel)
              return (
                <button key={qItem.id} onClick={()=>setCurrentIdx(idx)} style={{
                  width:"100%", padding:"10px 12px", borderRadius:10, marginBottom:4,
                  border:`1px solid ${idx===currentIdx ? "rgba(81,207,102,0.3)" : "rgba(255,255,255,0.06)"}`,
                  background: idx===currentIdx ? "rgba(81,207,102,0.1)" : "rgba(255,255,255,0.03)",
                  cursor:"pointer", textAlign:"left", fontFamily:"inherit", transition:"all .15s",
                }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:5 }}>
                    <span style={{ fontSize:12, fontWeight:700, color: idx===currentIdx ? "#51CF66" : "rgba(255,255,255,0.5)" }}>
                      Q{idx+1}
                    </span>
                    <span style={{ fontSize:8, fontWeight:700, color: statusColor[qItem.status], textTransform:"uppercase", letterSpacing:".5px" }}>
                      {qItem.status === "approved" ? "✅" : qItem.status === "skipped" ? "⏭" : "⏳"}
                    </span>
                  </div>
                  <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", lineHeight:1.4, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
                    {qItem.question}
                  </div>
                  {lv && <div style={{ marginTop:5 }}><TaxonomyBadge level={qItem.cognitiveLevel} small /></div>}
                </button>
              )
            })}
          </div>

          {/* Save button */}
          {approvedCount > 0 && (
            <div style={{ padding:"12px 8px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
              <button onClick={()=>setShowSaveModal(true)} style={{
                width:"100%", padding:"11px", borderRadius:10, border:"none",
                background:"linear-gradient(135deg,#51CF66,#37b24d)",
                color:"#fff", fontSize:13, fontWeight:700, fontFamily:"inherit", cursor:"pointer",
                boxShadow:"0 4px 14px rgba(81,207,102,0.35)",
              }}>
                💾 Save Quiz Set ({approvedCount})
              </button>
            </div>
          )}
        </div>

        {/* Main editor */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          {/* Top bar */}
          <div style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"10px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)",
            background:"rgba(7,7,26,0.9)", backdropFilter:"blur(12px)", flexShrink:0,
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.5)" }}>📄 {file.name}</span>
              <span style={{ fontSize:11, color:"rgba(255,255,255,0.25)" }}>•</span>
              <span style={{ fontSize:13, color:"rgba(255,255,255,0.4)" }}>Question {currentIdx+1} of {questions.length}</span>
            </div>
            {/* Progress */}
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:160, height:5, background:"rgba(255,255,255,0.07)", borderRadius:100, overflow:"hidden" }}>
                <div style={{ width:`${(approvedCount/questions.length)*100}%`, height:"100%", background:"#51CF66", borderRadius:100, transition:"width .4s" }} />
              </div>
              <span style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>{Math.round((approvedCount/questions.length)*100)}% saved</span>
            </div>
          </div>

          {/* Editor body */}
          <div style={{ flex:1, overflowY:"auto", padding:"20px" }}>
            <div style={{ maxWidth:680, margin:"0 auto", animation:"slideUp .2s ease" }} key={currentIdx}>

              {/* Taxonomy level selector */}
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:8 }}>
                  Cognitive Level (Bloom's Taxonomy)
                </div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {TAXONOMY_LEVELS.map(lv => {
                    const active = q.cognitiveLevel === lv.name
                    return (
                      <button key={lv.name} onClick={()=>handleEditField("cognitiveLevel",lv.name)} style={{
                        padding:"6px 14px", borderRadius:100, cursor:"pointer",
                        border:`1px solid ${active ? lv.color+"60" : "rgba(255,255,255,0.08)"}`,
                        background: active ? `${lv.color}18` : "rgba(255,255,255,0.03)",
                        color: active ? lv.color : "rgba(255,255,255,0.4)",
                        fontSize:12, fontWeight:600, fontFamily:"inherit", transition:"all .15s",
                      }}>
                        {lv.name}
                      </button>
                    )
                  })}
                </div>
                {(() => {
                  const lv = TAXONOMY_LEVELS.find(l=>l.name===q.cognitiveLevel)
                  return lv ? (
                    <div style={{ marginTop:8, fontSize:11, color:"rgba(255,255,255,0.35)" }}>
                      💡 Suggested verbs: <span style={{ color:lv.color }}>{lv.verbs}</span>
                    </div>
                  ) : null
                })()}
              </div>

              {/* Question text editor */}
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:8 }}>
                  Question Text
                </div>
                <textarea
                  value={q.question}
                  onChange={e=>handleEditField("question",e.target.value)}
                  rows={3}
                  style={{
                    width:"100%", padding:"14px 16px", resize:"vertical",
                    background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
                    borderRadius:12, color:"#fff", fontSize:14, fontFamily:"inherit",
                    outline:"none", lineHeight:1.6, boxSizing:"border-box",
                  }}
                  onFocus={e=>e.target.style.borderColor="rgba(81,207,102,0.4)"}
                  onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}
                />
              </div>

              {/* Options editor */}
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:8 }}>
                  Answer Choices <span style={{ fontWeight:400, fontSize:10 }}>(click radio to set correct answer)</span>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {q.options.map((opt, optIdx) => {
                    const isCorrect = q.correctAnswer === optIdx
                    return (
                      <div key={optIdx} style={{ display:"flex", alignItems:"center", gap:10 }}>
                        {/* Letter */}
                        <div style={{
                          width:28, height:28, borderRadius:"50%", flexShrink:0,
                          background: isCorrect ? "#51CF66" : "rgba(255,255,255,0.07)",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:11, fontWeight:700, color: isCorrect ? "#fff" : "rgba(255,255,255,0.4)",
                        }}>
                          {String.fromCharCode(65+optIdx)}
                        </div>
                        {/* Input */}
                        <input
                          value={opt}
                          onChange={e=>handleOptionEdit(optIdx,e.target.value)}
                          className={`opt-input${isCorrect?" correct-opt":""}`}
                        />
                        {/* Correct toggle */}
                        <button onClick={()=>handleEditField("correctAnswer",optIdx)} style={{
                          width:28, height:28, borderRadius:8, border:"none", flexShrink:0,
                          background: isCorrect ? "rgba(81,207,102,0.2)" : "rgba(255,255,255,0.05)",
                          color: isCorrect ? "#51CF66" : "rgba(255,255,255,0.25)",
                          cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center",
                        }} title="Mark as correct">
                          {isCorrect ? "✓" : "○"}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Explanation editor */}
              <div style={{ marginBottom:24 }}>
                <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:8 }}>
                  Explanation / Rationale
                </div>
                <textarea
                  value={q.explanation}
                  onChange={e=>handleEditField("explanation",e.target.value)}
                  rows={2}
                  style={{
                    width:"100%", padding:"12px 14px", resize:"vertical",
                    background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
                    borderRadius:12, color:"rgba(255,255,255,0.7)", fontSize:13, fontFamily:"inherit",
                    outline:"none", lineHeight:1.6, boxSizing:"border-box",
                  }}
                  onFocus={e=>e.target.style.borderColor="rgba(81,207,102,0.4)"}
                  onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}
                />
              </div>

              {/* Action buttons */}
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={handleSkip} style={{
                  flex:1, padding:"12px", borderRadius:12, cursor:"pointer",
                  border:"1px solid rgba(255,107,107,0.25)", background:"rgba(255,107,107,0.08)",
                  color:"rgba(255,107,107,0.8)", fontSize:13, fontWeight:600, fontFamily:"inherit",
                }}>
                  ⏭ Skip
                </button>
                <button onClick={handleApprove} style={{
                  flex:2, padding:"12px", borderRadius:12, border:"none", cursor:"pointer",
                  background: q.status==="approved"
                    ? "rgba(81,207,102,0.2)"
                    : "linear-gradient(135deg,#51CF66,#37b24d)",
                  color: q.status==="approved" ? "#51CF66" : "#fff",
                  fontSize:13, fontWeight:700, fontFamily:"inherit",
                  boxShadow: q.status==="approved" ? "none" : "0 4px 14px rgba(81,207,102,0.35)",
                  border: q.status==="approved" ? "1px solid rgba(81,207,102,0.35)" : "none",
                }}>
                  {q.status==="approved" ? "✅ Saved to Set" : "✅ Save & Next →"}
                </button>
              </div>

              {/* Nav */}
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:14 }}>
                <button onClick={()=>setCurrentIdx(Math.max(0,currentIdx-1))} disabled={currentIdx===0}
                  style={{ padding:"8px 16px", borderRadius:9, border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.04)", color:"rgba(255,255,255,0.4)", cursor:"pointer", fontSize:12, fontFamily:"inherit", opacity:currentIdx===0?.4:1 }}>
                  ← Previous
                </button>
                <button onClick={()=>setCurrentIdx(Math.min(questions.length-1,currentIdx+1))} disabled={currentIdx===questions.length-1}
                  style={{ padding:"8px 16px", borderRadius:9, border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.04)", color:"rgba(255,255,255,0.4)", cursor:"pointer", fontSize:12, fontFamily:"inherit", opacity:currentIdx===questions.length-1?.4:1 }}>
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel — saved questions preview */}
        <div style={{ width:220, background:"#0d0d2b", borderLeft:"1px solid rgba(255,255,255,0.06)", display:"flex", flexDirection:"column", overflow:"hidden", flexShrink:0 }}>
          <div style={{ padding:"16px 16px 12px", borderBottom:"1px solid rgba(255,255,255,0.06)", flexShrink:0 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:6 }}>
              Saved to Set
            </div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:800, color:"#51CF66" }}>
              {savedQuestions.length}
            </div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>of {questions.length} questions</div>
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:"10px 10px" }}>
            {savedQuestions.length === 0 ? (
              <div style={{ textAlign:"center", padding:"20px 10px", color:"rgba(255,255,255,0.2)", fontSize:12 }}>
                No questions saved yet.<br/>Review and approve questions to build your quiz.
              </div>
            ) : savedQuestions.map((sq, i) => {
              const lv = TAXONOMY_LEVELS.find(l=>l.name===sq.cognitiveLevel)
              return (
                <div key={sq.id} style={{ background:"rgba(81,207,102,0.06)", border:"1px solid rgba(81,207,102,0.15)", borderRadius:10, padding:"10px 12px", marginBottom:8 }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:5 }}>
                    <span style={{ fontSize:11, fontWeight:700, color:"#51CF66" }}>#{i+1}</span>
                    {lv && <TaxonomyBadge level={sq.cognitiveLevel} small />}
                  </div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", lineHeight:1.4, display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                    {sq.question}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)", zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
          <div style={{ background:"#0d0d2b", border:"1px solid rgba(255,255,255,0.1)", borderRadius:22, padding:"32px 28px", maxWidth:420, width:"100%", boxShadow:"0 32px 64px rgba(0,0,0,0.6)" }}>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:"#fff", margin:"0 0 8px" }}>Save Quiz Set</h2>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginBottom:22 }}>
              You're saving <strong style={{ color:"#51CF66" }}>{savedQuestions.length} questions</strong> from {file.name}.
            </p>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.4)", letterSpacing:".9px", textTransform:"uppercase", marginBottom:7 }}>Quiz Set Name</label>
            <input
              value={setName}
              onChange={e=>setSetName(e.target.value)}
              style={{
                width:"100%", padding:"12px 14px", marginBottom:20, boxSizing:"border-box",
                background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)",
                borderRadius:10, color:"#fff", fontSize:14, fontFamily:"inherit", outline:"none",
              }}
            />
            {/* Taxonomy summary */}
            <div style={{ marginBottom:22 }}>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginBottom:8 }}>Taxonomy breakdown:</div>
              {TAXONOMY_LEVELS.map(lv => {
                const cnt = savedQuestions.filter(sq=>sq.cognitiveLevel===lv.name).length
                if (cnt === 0) return null
                return (
                  <div key={lv.name} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:lv.color, flexShrink:0 }} />
                    <span style={{ fontSize:12, color:"rgba(255,255,255,0.5)", flex:1 }}>{lv.name}</span>
                    <span style={{ fontSize:12, fontWeight:700, color:lv.color }}>{cnt}</span>
                  </div>
                )
              })}
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setShowSaveModal(false)} style={{ flex:1, padding:"12px", borderRadius:11, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.5)", fontSize:13, fontWeight:600, fontFamily:"inherit", cursor:"pointer" }}>
                Cancel
              </button>
              <button onClick={handleSave} style={{ flex:2, padding:"12px", borderRadius:11, border:"none", background:"linear-gradient(135deg,#51CF66,#37b24d)", color:"#fff", fontSize:13, fontWeight:700, fontFamily:"inherit", cursor:"pointer", boxShadow:"0 4px 14px rgba(81,207,102,0.35)" }}>
                💾 Save Quiz Set
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── SCREEN 5: Saved Sets ─────────────────────────────────────────────────────
function SavedSetScreen({ set, onBack }) {
  const [expanded, setExpanded] = useState(null)

  return (
    <div style={{ minHeight:"100vh", background:"#07071a", color:"#fff" }}>
      <div style={{
        display:"flex", alignItems:"center", gap:14, padding:"14px 28px",
        borderBottom:"1px solid rgba(255,255,255,0.06)",
        background:"rgba(7,7,26,0.9)", backdropFilter:"blur(12px)",
        position:"sticky", top:0, zIndex:10,
      }}>
        <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:8, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:12, fontWeight:600, fontFamily:"inherit" }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          Dashboard
        </button>
        <div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:800, color:"#fff" }}>{set.name}</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>{set.questions.length} questions · {set.file}</div>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", gap:10 }}>
          <button style={{ padding:"9px 18px", borderRadius:10, border:"1px solid rgba(91,110,232,0.3)", background:"rgba(91,110,232,0.1)", color:"#9baeff", fontSize:13, fontWeight:600, fontFamily:"inherit", cursor:"pointer" }}>
            🖨 Export PDF
          </button>
          <button style={{ padding:"9px 18px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#5B6EE8,#7b5ea7)", color:"#fff", fontSize:13, fontWeight:700, fontFamily:"inherit", cursor:"pointer", boxShadow:"0 4px 12px rgba(91,110,232,0.35)" }}>
            📤 Share with Students
          </button>
        </div>
      </div>
      <div style={{ padding:"28px", maxWidth:740, margin:"0 auto" }}>
        {/* Taxonomy overview */}
        <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:"18px 20px", marginBottom:24 }}>
          <div style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.7)", marginBottom:14 }}>Bloom's Taxonomy Coverage</div>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            {TAXONOMY_LEVELS.map(lv => {
              const cnt = set.questions.filter(q=>q.cognitiveLevel===lv.name).length
              if (cnt === 0) return null
              return (
                <div key={lv.name} style={{ display:"flex", alignItems:"center", gap:8, background:`${lv.color}12`, border:`1px solid ${lv.color}30`, borderRadius:100, padding:"5px 14px" }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:lv.color }} />
                  <span style={{ fontSize:12, color:lv.color, fontWeight:600 }}>{lv.name}</span>
                  <span style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>({cnt})</span>
                </div>
              )
            })}
          </div>
        </div>
        {/* Questions list */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {set.questions.map((q, i) => (
            <div key={q.id} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, overflow:"hidden" }}>
              <div
                onClick={()=>setExpanded(expanded===i?null:i)}
                style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 18px", cursor:"pointer" }}
              >
                <div style={{ width:28, height:28, borderRadius:8, background:"rgba(81,207,102,0.12)", border:"1px solid rgba(81,207,102,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:"#51CF66", flexShrink:0 }}>
                  {i+1}
                </div>
                <div style={{ flex:1, fontSize:13, fontWeight:500, color:"rgba(255,255,255,0.8)", lineHeight:1.4 }}>
                  {q.question}
                </div>
                <TaxonomyBadge level={q.cognitiveLevel} small />
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: expanded===i?"rotate(180deg)":"rotate(0deg)", transition:"transform .2s", opacity:.4 }}>
                  <path d="M2 4l4 4 4-4" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </div>
              {expanded === i && (
                <div style={{ padding:"0 18px 16px", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ paddingTop:12, display:"flex", flexDirection:"column", gap:7 }}>
                    {q.options.map((opt, oi) => (
                      <div key={oi} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:9, background: q.correctAnswer===oi ? "rgba(81,207,102,0.08)" : "rgba(255,255,255,0.02)", border: q.correctAnswer===oi ? "1px solid rgba(81,207,102,0.2)" : "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ width:22, height:22, borderRadius:"50%", background: q.correctAnswer===oi ? "#51CF66" : "rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color: q.correctAnswer===oi ? "#fff" : "rgba(255,255,255,0.4)", flexShrink:0 }}>
                          {String.fromCharCode(65+oi)}
                        </div>
                        <span style={{ fontSize:12, color: q.correctAnswer===oi ? "#a3f0b8" : "rgba(255,255,255,0.5)" }}>{opt}</span>
                        {q.correctAnswer===oi && <span style={{ marginLeft:"auto", fontSize:11, color:"#51CF66" }}>✓ Correct</span>}
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                    <div style={{ marginTop:10, padding:"10px 12px", background:"rgba(255,255,255,0.03)", borderRadius:9, fontSize:12, color:"rgba(255,255,255,0.4)", lineHeight:1.6 }}>
                      💡 {q.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function TeacherApp() {
  const [screen, setScreen] = useState("login") // login | dashboard | setup | editor | saved
  const [teacher, setTeacher] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [quizConfig, setQuizConfig] = useState(null)
  const [savedSets, setSavedSets] = useState([])
  const [viewingSet, setViewingSet] = useState(null)

  const handleLogin = (t) => { setTeacher(t); setScreen("dashboard") }
  const handlePickFile = (f) => { setSelectedFile(f); setScreen("setup") }
  const handleGenerate = (cfg) => { setQuizConfig(cfg); setScreen("editor") }
  const handleSaveSet = (set) => {
    setSavedSets(prev => [set, ...prev])
    setScreen("dashboard")
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:'DM Sans',sans-serif; }
        @keyframes blobD { 0%,100%{transform:scale(1) translateY(0)} 50%{transform:scale(1.07) translateY(-20px)} }
        textarea, input { font-family:'DM Sans',sans-serif !important; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:4px; }
      `}</style>

      {screen === "login" && <LoginScreen onLogin={handleLogin} />}
      {screen === "dashboard" && (
        <DashboardScreen
          teacher={teacher}
          onPickFile={handlePickFile}
          savedSets={savedSets}
        />
      )}
      {screen === "setup" && (
        <SetupScreen
          file={selectedFile}
          onGenerate={handleGenerate}
          onBack={()=>setScreen("dashboard")}
        />
      )}
      {screen === "editor" && (
        <EditorScreen
          file={selectedFile}
          config={quizConfig}
          onSaveSet={handleSaveSet}
          onBack={()=>setScreen("dashboard")}
        />
      )}
      {screen === "saved" && viewingSet && (
        <SavedSetScreen
          set={viewingSet}
          onBack={()=>setScreen("dashboard")}
        />
      )}
    </>
  )
}