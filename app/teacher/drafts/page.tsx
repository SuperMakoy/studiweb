"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function TeacherDraftsPage() {
  const router = useRouter()

  useEffect(() => {
    const isTeacher = sessionStorage.getItem("isTeacher")
    if (!isTeacher) {
      router.push("/teacher/login")
      return
    }
    // Redirect to quizzes with draft filter
    router.push("/teacher/quizzes?filter=draft")
  }, [router])

  return null
}
