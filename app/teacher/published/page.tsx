"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function TeacherPublishedPage() {
  const router = useRouter()

  useEffect(() => {
    const isTeacher = sessionStorage.getItem("isTeacher")
    if (!isTeacher) {
      router.push("/teacher/login")
      return
    }
    // Redirect to quizzes with published filter
    router.push("/teacher/quizzes?filter=published")
  }, [router])

  return null
}
