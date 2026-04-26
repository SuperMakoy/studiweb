"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/firebase"
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth"
import { useAuth } from "@/hooks/use-auth"
import Sidebar from "@/components/dashboard/sidebar"
import MobileHeaderNav from "@/components/dashboard/mobile-header-nav"
import { Lock, Check, AlertCircle } from "lucide-react"

type FormStep = "current-password" | "new-password" | "success"

export default function PasswordResetPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [step, setStep] = useState<FormStep>("current-password")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)

  // Redirect if not authenticated
  if (!authLoading && !user) {
    router.push("/login")
    return null
  }

  const handleVerifyCurrentPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (!user || !user.email) {
        throw new Error("User not authenticated")
      }

      // Reauthenticate user with current password
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)

      setStep("new-password")
    } catch (error: any) {
      console.error("Error verifying password:", error)
      if (error.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.")
      } else if (error.code === "auth/invalid-credential") {
        setError("Invalid credentials. Please check your password.")
      } else {
        setError(error.message || "Failed to verify password")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate new password
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (newPassword === currentPassword) {
      setError("New password must be different from current password")
      return
    }

    setLoading(true)

    try {
      if (!user) {
        throw new Error("User not authenticated")
      }

      // Update password
      await updatePassword(user, newPassword)
      setStep("success")

      // Redirect to profile after 3 seconds
      setTimeout(() => {
        router.push("/student-profile")
      }, 3000)
    } catch (error: any) {
      console.error("Error updating password:", error)
      setError(error.message || "Failed to update password")
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push("/student-profile")
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .pr-wrap { font-family: 'DM Sans', 'Segoe UI', sans-serif; }
        .pr-input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: #fff;
          font-size: 13px;
          font-family: inherit;
          transition: all .2s;
        }
        .pr-input:focus {
          outline: none;
          border-color: rgba(91,110,232,0.3);
          background: rgba(91,110,232,0.08);
        }
        .pr-input::placeholder {
          color: rgba(255,255,255,0.35);
        }
        .pr-btn {
          transition: all .2s;
          cursor: pointer;
          font-family: inherit;
          font-weight: 600;
        }
        .pr-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          opacity: 0.9;
        }
        .pr-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        @keyframes prFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .pr-fadein { animation: prFadeIn .3s ease forwards; }
      `}</style>

      <div
        className="pr-wrap"
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "#07071a",
          color: "#fff",
        }}
      >
        <MobileHeaderNav />
        <Sidebar />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            position: "relative",
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
                Change Password
              </h1>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: "2px 0 0" }}>
                Update your account password
              </p>
            </div>

            <Link href="/student-profile" style={{ textDecoration: "none" }}>
              <button
                className="pr-btn"
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  fontSize: 12,
                  color: "rgba(255,255,255,0.7)",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                Back
              </button>
            </Link>
          </div>

          {/* Content */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px 28px",
              overflow: "auto",
            }}
          >
            <div className="pr-fadein" style={{ width: "100%", maxWidth: 420 }}>
              {step === "current-password" && (
                <div
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 16,
                    padding: "32px 24px",
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      background: "rgba(91,110,232,0.12)",
                      border: "1px solid rgba(91,110,232,0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 24px",
                    }}
                  >
                    <Lock size={24} style={{ color: "#5B6EE8" }} />
                  </div>

                  <h2
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      fontSize: 18,
                      fontWeight: 800,
                      margin: "0 0 12px",
                      textAlign: "center",
                    }}
                  >
                    Verify Current Password
                  </h2>

                  <p
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.5)",
                      textAlign: "center",
                      marginBottom: 24,
                    }}
                  >
                    For security, please enter your current password to proceed.
                  </p>

                  <form onSubmit={handleVerifyCurrentPassword} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
                        Current Password
                      </label>
                      <input
                        type={showPasswords ? "text" : "password"}
                        className="pr-input"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your current password"
                        required
                      />
                    </div>

                    {error && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 12px",
                          borderRadius: 10,
                          background: "rgba(255,107,107,0.1)",
                          border: "1px solid rgba(255,107,107,0.2)",
                          color: "#FF6B6B",
                          fontSize: 12,
                        }}
                      >
                        <AlertCircle size={16} />
                        {error}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 12 }}>
                      <button
                        type="button"
                        className="pr-btn"
                        onClick={handleCancel}
                        style={{
                          flex: 1,
                          padding: "12px",
                          borderRadius: 10,
                          fontSize: 13,
                          color: "rgba(255,255,255,0.7)",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="pr-btn"
                        disabled={loading || !currentPassword}
                        style={{
                          flex: 1,
                          padding: "12px",
                          borderRadius: 10,
                          fontSize: 13,
                          color: "#fff",
                          background: "linear-gradient(135deg,#5B6EE8,#7b5ea7)",
                          border: "none",
                          opacity: loading || !currentPassword ? 0.6 : 1,
                        }}
                      >
                        {loading ? "Verifying..." : "Next"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {step === "new-password" && (
                <div
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 16,
                    padding: "32px 24px",
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      background: "rgba(91,110,232,0.12)",
                      border: "1px solid rgba(91,110,232,0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 24px",
                    }}
                  >
                    <Lock size={24} style={{ color: "#5B6EE8" }} />
                  </div>

                  <h2
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      fontSize: 18,
                      fontWeight: 800,
                      margin: "0 0 12px",
                      textAlign: "center",
                    }}
                  >
                    Create New Password
                  </h2>

                  <p
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.5)",
                      textAlign: "center",
                      marginBottom: 24,
                    }}
                  >
                    Enter a strong password that's different from your current one.
                  </p>

                  <form onSubmit={handleUpdatePassword} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
                        New Password
                      </label>
                      <input
                        type={showPasswords ? "text" : "password"}
                        className="pr-input"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password (min 6 characters)"
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
                        Confirm Password
                      </label>
                      <input
                        type={showPasswords ? "text" : "password"}
                        className="pr-input"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        required
                      />
                    </div>

                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={showPasswords}
                        onChange={(e) => setShowPasswords(e.target.checked)}
                        style={{ cursor: "pointer" }}
                      />
                      <span>Show passwords</span>
                    </label>

                    {error && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 12px",
                          borderRadius: 10,
                          background: "rgba(255,107,107,0.1)",
                          border: "1px solid rgba(255,107,107,0.2)",
                          color: "#FF6B6B",
                          fontSize: 12,
                        }}
                      >
                        <AlertCircle size={16} />
                        {error}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 12 }}>
                      <button
                        type="button"
                        className="pr-btn"
                        onClick={() => {
                          setStep("current-password")
                          setError("")
                        }}
                        style={{
                          flex: 1,
                          padding: "12px",
                          borderRadius: 10,
                          fontSize: 13,
                          color: "rgba(255,255,255,0.7)",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        Back
                      </button>

                      <button
                        type="submit"
                        className="pr-btn"
                        disabled={loading || !newPassword || !confirmPassword}
                        style={{
                          flex: 1,
                          padding: "12px",
                          borderRadius: 10,
                          fontSize: 13,
                          color: "#fff",
                          background: "linear-gradient(135deg,#5B6EE8,#7b5ea7)",
                          border: "none",
                          opacity: loading || !newPassword || !confirmPassword ? 0.6 : 1,
                        }}
                      >
                        {loading ? "Updating..." : "Update Password"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {step === "success" && (
                <div
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 16,
                    padding: "32px 24px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      background: "rgba(81,207,102,0.15)",
                      border: "1px solid rgba(81,207,102,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 24px",
                    }}
                  >
                    <Check size={24} style={{ color: "#51CF66" }} />
                  </div>

                  <h2
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      fontSize: 20,
                      fontWeight: 800,
                      margin: "0 0 12px",
                      color: "#51CF66",
                    }}
                  >
                    Password Updated!
                  </h2>

                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>
                    Your password has been successfully changed. You will be redirected to your profile shortly.
                  </p>

                  <Link href="/student-profile" style={{ textDecoration: "none" }}>
                    <button
                      className="pr-btn"
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: 10,
                        fontSize: 13,
                        color: "#fff",
                        background: "linear-gradient(135deg,#5B6EE8,#7b5ea7)",
                        border: "none",
                      }}
                    >
                      Back to Profile
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
