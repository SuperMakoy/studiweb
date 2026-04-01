import { db, auth } from "./firebase"
import {
  collection,
  addDoc,
  query,
  getDocs,
  deleteDoc,
  doc,
  Timestamp,
  getDoc,
  updateDoc,
  where,
} from "firebase/firestore"

export interface StudyFile {
  id: string
  userId: string
  fileName: string
  displayName?: string
  fileSize: number
  fileType: string
  fileData: string // base64 encoded file data
  uploadedAt: Date
  lastModified?: Date
}

export interface QuizHistory {
  id: string
  userId: string
  fileId: string
  fileName: string
  score: number
  totalQuestions: number
  timeElapsed: string
  difficulty: "easy" | "moderate" | "hard"
  points?: number // Added points field
  completedAt: Date
}

export async function uploadStudyFile(file: File): Promise<StudyFile> {
  const user = auth.currentUser
  if (!user) throw new Error("User not authenticated")

  try {
    // Convert file to base64
    const fileData = await fileToBase64(file)

    // Save to Firestore
    const fileRef = await addDoc(collection(db, "users", user.uid, "files"), {
      fileName: file.name,
      displayName: file.name,
      fileSize: file.size,
      fileType: file.type,
      fileData: fileData,
      uploadedAt: Timestamp.now(),
      lastModified: Timestamp.now(),
    })

    return {
      id: fileRef.id,
      userId: user.uid,
      fileName: file.name,
      displayName: file.name,
      fileSize: file.size,
      fileType: file.type,
      fileData: fileData,
      uploadedAt: new Date(),
    }
  } catch (error) {
    console.error("Error uploading study file:", error)
    throw error
  }
}

export async function getUserFiles(): Promise<StudyFile[]> {
  const user = auth.currentUser
  if (!user) throw new Error("User not authenticated")

  try {
    const q = query(collection(db, "users", user.uid, "files"))
    const querySnapshot = await getDocs(q)

    const files = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      userId: user.uid,
      fileName: doc.data().fileName,
      displayName: doc.data().displayName || doc.data().fileName,
      fileSize: doc.data().fileSize,
      fileType: doc.data().fileType,
      fileData: doc.data().fileData,
      uploadedAt: doc.data().uploadedAt.toDate(),
      lastModified: doc.data().lastModified?.toDate(),
    }))

    return files.sort((a, b) => (a.displayName || a.fileName).localeCompare(b.displayName || b.fileName))
  } catch (error) {
    console.error("Error fetching user files:", error)
    throw error
  }
}

export async function deleteStudyFile(fileId: string): Promise<void> {
  const user = auth.currentUser
  if (!user) throw new Error("User not authenticated")

  try {
    // Cascade deletion of associated quiz history records
    const quizHistoryQuery = query(collection(db, "users", user.uid, "quizHistory"), where("fileId", "==", fileId))
    const quizHistoryDocs = await getDocs(quizHistoryQuery)
    for (const quizDoc of quizHistoryDocs.docs) {
      await deleteDoc(quizDoc.ref)
    }

    // Then delete the file
    const fileDoc = doc(db, "users", user.uid, "files", fileId)
    await deleteDoc(fileDoc)
  } catch (error) {
    console.error("Error deleting study file:", error)
    throw error
  }
}

export async function deleteMultipleFiles(fileIds: string[]): Promise<void> {
  const user = auth.currentUser
  if (!user) throw new Error("User not authenticated")

  try {
    for (const fileId of fileIds) {
      // Cascade deletion of associated quiz history records for each file
      const quizHistoryQuery = query(collection(db, "users", user.uid, "quizHistory"), where("fileId", "==", fileId))
      const quizHistoryDocs = await getDocs(quizHistoryQuery)
      for (const quizDoc of quizHistoryDocs.docs) {
        await deleteDoc(quizDoc.ref)
      }

      // Then delete the file
      const fileDoc = doc(db, "users", user.uid, "files", fileId)
      await deleteDoc(fileDoc)
    }
  } catch (error) {
    console.error("Error deleting multiple files:", error)
    throw error
  }
}

export async function getStudyFileById(userId: string, fileId: string): Promise<StudyFile | null> {
  if (!userId || typeof userId !== "string") {
    console.error("[v0] Invalid userId:", userId)
    throw new Error("Invalid user ID - User not authenticated")
  }

  if (!fileId || typeof fileId !== "string") {
    console.error("[v0] Invalid fileId:", fileId)
    throw new Error("Invalid file ID")
  }

  try {
    const fileDoc = doc(db, "users", userId, "files", fileId)
    const fileSnapshot = await getDoc(fileDoc)

    if (!fileSnapshot.exists()) {
      console.log("[v0] File not found in Firebase:", fileId)
      return null
    }

    return {
      id: fileSnapshot.id,
      userId: userId,
      fileName: fileSnapshot.data().fileName,
      displayName: fileSnapshot.data().displayName || fileSnapshot.data().fileName,
      fileSize: fileSnapshot.data().fileSize,
      fileType: fileSnapshot.data().fileType,
      fileData: fileSnapshot.data().fileData,
      uploadedAt: fileSnapshot.data().uploadedAt.toDate(),
      lastModified: fileSnapshot.data().lastModified?.toDate(),
    }
  } catch (error) {
    console.error("[v0] Error fetching file by ID:", error)
    throw error
  }
}

export async function saveQuizResult(
  fileId: string,
  fileName: string,
  score: number,
  totalQuestions: number,
  timeElapsed: string,
  difficulty: "easy" | "moderate" | "hard" = "moderate",
  points = 0, // Added points parameter
): Promise<QuizHistory> {
  const user = auth.currentUser
  if (!user) throw new Error("User not authenticated")

  try {
    const recentQuizzes = await getDocs(query(collection(db, "users", user.uid, "quizHistory")))

    const now = new Date()
    const fiveSecondsAgo = new Date(now.getTime() - 5000)

    // Check if there's an identical quiz result from the last 5 seconds
    const isDuplicate = recentQuizzes.docs.some((doc) => {
      const data = doc.data()
      const completedTime = data.completedAt.toDate()
      return (
        data.fileId === fileId &&
        data.score === score &&
        data.totalQuestions === totalQuestions &&
        completedTime > fiveSecondsAgo
      )
    })

    if (isDuplicate) {
      console.log("[v0] Duplicate quiz result detected, skipping save")
      throw new Error("Duplicate quiz result detected")
    }

    const historyRef = await addDoc(collection(db, "users", user.uid, "quizHistory"), {
      fileId: fileId,
      fileName: fileName,
      score: score,
      totalQuestions: totalQuestions,
      timeElapsed: timeElapsed,
      difficulty: difficulty,
      points: points,
      completedAt: Timestamp.now(),
    })

    return {
      id: historyRef.id,
      userId: user.uid,
      fileId: fileId,
      fileName: fileName,
      score: score,
      totalQuestions: totalQuestions,
      timeElapsed: timeElapsed,
      difficulty: difficulty,
      points: points,
      completedAt: new Date(),
    }
  } catch (error) {
    console.error("Error saving quiz result:", error)
    throw error
  }
}

export async function getQuizHistory(): Promise<QuizHistory[]> {
  const user = auth.currentUser
  if (!user) throw new Error("User not authenticated")

  try {
    const q = query(collection(db, "users", user.uid, "quizHistory"))
    const querySnapshot = await getDocs(q)

    const allFiles = await getUserFiles()
    const validFileIds = new Set(allFiles.map((f) => f.id))

    const allQuizzes = querySnapshot.docs
      .map((doc) => ({
        id: doc.id,
        userId: user.uid,
        fileId: doc.data().fileId,
        fileName: doc.data().fileName,
        score: doc.data().score,
        totalQuestions: doc.data().totalQuestions,
        timeElapsed: doc.data().timeElapsed,
        difficulty: doc.data().difficulty || "moderate",
        points: doc.data().points || 0, // Added points field with fallback
        completedAt: doc.data().completedAt.toDate(),
      }))
      .filter((quiz) => validFileIds.has(quiz.fileId))
      .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())

    // Keep only the first occurrence of each duplicate within 1-minute windows
    const seen = new Set<string>()
    const deduplicated = allQuizzes.filter((quiz) => {
      const timeInMinutes = Math.floor(quiz.completedAt.getTime() / 60000)
      const signature = `${quiz.fileId}-${quiz.score}-${quiz.totalQuestions}-${timeInMinutes}`

      if (seen.has(signature)) {
        return false
      }
      seen.add(signature)
      return true
    })

    return deduplicated
  } catch (error) {
    console.error("Error fetching quiz history:", error)
    throw error
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(",")[1] || "") // Remove data:image/png;base64, prefix
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function base64ToObjectUrl(base64: string, fileType: string): string {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  const blob = new Blob([bytes], { type: fileType })
  return URL.createObjectURL(blob)
}

export async function updateFileDisplayName(fileId: string, displayName: string): Promise<void> {
  const user = auth.currentUser
  if (!user) throw new Error("User not authenticated")

  try {
    const fileDoc = doc(db, "users", user.uid, "files", fileId)
    const fileSnapshot = await getDoc(fileDoc)

    if (!fileSnapshot.exists()) {
      throw new Error("File not found")
    }

    // Update using Firebase updateDoc
    await updateDoc(fileDoc, {
      displayName: displayName,
      lastModified: Timestamp.now(),
    })
  } catch (error) {
    console.error("Error updating file display name:", error)
    throw error
  }
}

export async function getFileContent(fileId: string): Promise<string> {
  const user = auth.currentUser
  if (!user) throw new Error("User not authenticated")

  try {
    const file = await getStudyFileById(user.uid, fileId)
    if (!file) {
      throw new Error("File not found")
    }

    // Decode base64 file data to text content
    const binaryString = atob(file.fileData)
    return binaryString
  } catch (error) {
    console.error("Error getting file content:", error)
    throw error
  }
}
