"use client"
import { useParams, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import QuizGame from "@/components/quiz/quiz-game"
import type { Quiz, QuizOptions } from "@/lib/quiz-service"
import { generateQuizFromFile } from "@/lib/quiz-service"

// ── styles injected once ──────────────────────────────────────────────────────
const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
  @keyframes qpSpin { to { transform: rotate(360deg); } }
  .qp-spinner { animation: qpSpin 0.9s linear infinite; }
  @keyframes qpBlob {
    0%,100% { transform: scale(1); }
    50% { transform: scale(1.08); }
  }
  .qp-blob { animation: qpBlob ease-in-out infinite; }
`

export default function QuizPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const fileId = params.id as string
  const { user, loading: authLoading } = useAuth()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ── logic unchanged ───────────────────────────────────────────────────────
  const quizOptions: QuizOptions = {
    length: (() => {
      const lengthParam = searchParams.get("length")
      const parsed = lengthParam ? Number.parseInt(lengthParam) : null
      return parsed && [5, 10, 20].includes(parsed) ? parsed : 10
    })() as 5 | 10 | 20,
    difficulty:
      (searchParams.get("difficulty") as "easy" | "moderate" | "hard") ||
      "moderate",
  }

  const totalTimeMinutes = Math.round(quizOptions.length! * 1.5)

  useEffect(() => {
    if (authLoading || !user) {
      if (!authLoading && !user) {
        setError("Please log in to access quizzes")
        setLoading(false)
      }
      return
    }

    const loadQuiz = async () => {
      try {
        setLoading(true)
        setError(null)
        const generatedQuiz = await generateQuizFromFile(
          fileId,
          user.uid,
          quizOptions
        )
        setQuiz(generatedQuiz)
      } catch (err: any) {
        setError(err.message || "Failed to generate quiz. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadQuiz()
  }, [fileId, user, authLoading])
  // ─────────────────────────────────────────────────────────────────────────

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading || authLoading) {
    return (
      <>
        <style>{pageStyles}</style>
        <div
          style={{
            minHeight: "100vh",
            background: "#07071a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            position: "relative",
            overflow: "hidden",
            fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
          }}
        >
          {/* Ambient blobs */}
          <div
            className="qp-blob"
            style={{
              position: "absolute",
              width: 360,
              height: 360,
              borderRadius: "50%",
              background: "rgba(91,110,232,0.1)",
              filter: "blur(90px)",
              top: -80,
              left: "20%",
              animationDuration: "9s",
              pointerEvents: "none",
            }}
          />
          <div
            className="qp-blob"
            style={{
              position: "absolute",
              width: 260,
              height: 260,
              borderRadius: "50%",
              background: "rgba(123,94,167,0.07)",
              filter: "blur(70px)",
              bottom: 60,
              right: "10%",
              animationDuration: "13s",
              animationDelay: "4s",
              pointerEvents: "none",
            }}
          />

          <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
            {/* Spinner ring */}
            <div
              style={{
                width: 72,
                height: 72,
                margin: "0 auto 24px",
                position: "relative",
              }}
            >
              <svg
                className="qp-spinner"
                width="72"
                height="72"
                viewBox="0 0 72 72"
                fill="none"
                style={{ position: "absolute", inset: 0 }}
              >
                <circle
                  cx="36"
                  cy="36"
                  r="30"
                  stroke="rgba(91,110,232,0.15)"
                  strokeWidth="3"
                />
                <path
                  d="M36 6A30 30 0 0166 36"
                  stroke="#5B6EE8"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                }}
              >
                🎮
              </div>
            </div>

            <h2
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 20,
                fontWeight: 800,
                color: "#fff",
                margin: "0 0 8px",
              }}
            >
              Generating your quiz…
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.4)",
                maxWidth: 300,
                lineHeight: 1.6,
              }}
            >
              Extracting and analyzing your study material. This takes a few
              seconds.
            </p>

            {/* Animated dots */}
            <div
              style={{
                display: "flex",
                gap: 6,
                justifyContent: "center",
                marginTop: 20,
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#5B6EE8",
                    animation: `qpBlob 1.2s ease-in-out infinite`,
                    animationDelay: `${i * 0.2}s`,
                    opacity: 0.7,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </>
    )
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <>
        <style>{pageStyles}</style>
        <div
          style={{
            minHeight: "100vh",
            background: "#07071a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 400,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,107,107,0.2)",
              borderRadius: 20,
              padding: "32px 28px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 42, marginBottom: 16 }}>⚠️</div>
            <h2
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 20,
                fontWeight: 800,
                color: "#FF6B6B",
                margin: "0 0 10px",
              }}
            >
              Something went wrong
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.5)",
                marginBottom: 24,
                lineHeight: 1.6,
              }}
            >
              {error}
            </p>
            <a
              href="/file-library"
              style={{
                display: "inline-block",
                padding: "10px 24px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                color: "#fff",
                background: "linear-gradient(135deg,#5B6EE8,#7b5ea7)",
                textDecoration: "none",
              }}
            >
              ← Back to File Library
            </a>
          </div>
        </div>
      </>
    )
  }

  // ── No questions state ────────────────────────────────────────────────────
  if (!quiz || quiz.questions.length === 0) {
    return (
      <>
        <style>{pageStyles}</style>
        <div
          style={{
            minHeight: "100vh",
            background: "#07071a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 400,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20,
              padding: "32px 28px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 42, marginBottom: 16 }}>📭</div>
            <h2
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 20,
                fontWeight: 800,
                color: "#fff",
                margin: "0 0 10px",
              }}
            >
              No Questions Generated
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.5)",
                marginBottom: 24,
                lineHeight: 1.6,
              }}
            >
              Could not generate quiz questions from this file. Please try
              another file.
            </p>
            <a
              href="/file-library"
              style={{
                display: "inline-block",
                padding: "10px 24px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                color: "#fff",
                background: "linear-gradient(135deg,#5B6EE8,#7b5ea7)",
                textDecoration: "none",
              }}
            >
              ← Back to File Library
            </a>
          </div>
        </div>
      </>
    )
  }

  // ── Quiz game ─────────────────────────────────────────────────────────────
  return (
    <>
      <style>{pageStyles}</style>
      <div
        style={{
          minHeight: "100vh",
          background: "#07071a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient blobs */}
        <div
          className="qp-blob"
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(91,110,232,0.08)",
            filter: "blur(80px)",
            top: -60,
            left: "15%",
            animationDuration: "10s",
            pointerEvents: "none",
          }}
        />
        <div
          className="qp-blob"
          style={{
            position: "absolute",
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "rgba(123,94,167,0.06)",
            filter: "blur(60px)",
            bottom: 40,
            right: "10%",
            animationDuration: "14s",
            animationDelay: "3s",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
          <QuizGame
            quiz={quiz}
            fileId={fileId}
            totalTimeMinutes={totalTimeMinutes}
            difficulty={quizOptions.difficulty}
          />
        </div>
      </div>
    </>
  )
}