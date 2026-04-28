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
  folderId?: string | null // Reference to folder, null means root
}

export interface Folder {
  id: string
  userId: string
  name: string
  color?: string // Optional custom color
  createdAt: Date
  updatedAt: Date
}

// Cognitive level types for Bloom's Taxonomy
export type CognitiveLevel = "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create"

export interface CognitiveLevelStats {
  total: number
  correct: number
}

export type CognitiveLevelStatsRecord = Record<CognitiveLevel, CognitiveLevelStats>

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
  cognitiveLevelStats?: CognitiveLevelStatsRecord // Bloom's Taxonomy breakdown per quiz
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
      folderId: doc.data().folderId || null,
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
  points = 0,
  cognitiveLevelStats?: CognitiveLevelStatsRecord, // Bloom's Taxonomy breakdown
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
      cognitiveLevelStats: cognitiveLevelStats || null, // Store Bloom's Taxonomy breakdown
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
      cognitiveLevelStats: cognitiveLevelStats,
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

    // Get today's date at midnight
    const today = new Date()
    today.setHours(0, 0, 0, 0)

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
        points: doc.data().points || 0,
        cognitiveLevelStats: doc.data().cognitiveLevelStats || null, // Bloom's Taxonomy breakdown
        completedAt: doc.data().completedAt.toDate(),
      }))
      .filter((quiz) => validFileIds.has(quiz.fileId))
      // Filter to only today's quizzes
      .filter((quiz) => {
        const quizDate = new Date(quiz.completedAt)
        quizDate.setHours(0, 0, 0, 0)
        return quizDate.getTime() === today.getTime()
      })
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

// Get ALL quiz history (not filtered to today) - for history page
export async function getAllQuizHistory(): Promise<QuizHistory[]> {
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
        points: doc.data().points || 0,
        cognitiveLevelStats: doc.data().cognitiveLevelStats || null,
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
    console.error("Error fetching all quiz history:", error)
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

// Helper to create empty cognitive stats record
function createEmptyCognitiveStats(): CognitiveLevelStatsRecord {
  return {
    Remember: { total: 0, correct: 0 },
    Understand: { total: 0, correct: 0 },
    Apply: { total: 0, correct: 0 },
    Analyze: { total: 0, correct: 0 },
    Evaluate: { total: 0, correct: 0 },
    Create: { total: 0, correct: 0 },
  }
}

// Get aggregated cognitive stats for today (daily reset)
export async function getDailyCognitiveStats(): Promise<CognitiveLevelStatsRecord | null> {
  const user = auth.currentUser
  if (!user) throw new Error("User not authenticated")

  try {
    const quizzes = await getQuizHistory() // Already filtered to today only
    
    if (quizzes.length === 0) return null

    // Aggregate cognitive stats from all today's quizzes
    const aggregated = createEmptyCognitiveStats()
    let hasAnyStats = false

    for (const quiz of quizzes) {
      if (quiz.cognitiveLevelStats) {
        hasAnyStats = true
        const levels: CognitiveLevel[] = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"]
        for (const level of levels) {
          const stats = quiz.cognitiveLevelStats[level]
          if (stats) {
            aggregated[level].total += stats.total
            aggregated[level].correct += stats.correct
          }
        }
      }
    }

    return hasAnyStats ? aggregated : null
  } catch (error) {
    console.error("Error fetching daily cognitive stats:", error)
    throw error
  }
}

// Get aggregated cognitive stats for a specific file (today only)
export async function getFileCognitiveStats(fileId: string): Promise<CognitiveLevelStatsRecord | null> {
  const user = auth.currentUser
  if (!user) throw new Error("User not authenticated")

  try {
    const quizzes = await getQuizHistory() // Already filtered to today only
    const fileQuizzes = quizzes.filter(q => q.fileId === fileId)
    
    if (fileQuizzes.length === 0) return null

    // Aggregate cognitive stats from file's quizzes today
    const aggregated = createEmptyCognitiveStats()
    let hasAnyStats = false

    for (const quiz of fileQuizzes) {
      if (quiz.cognitiveLevelStats) {
        hasAnyStats = true
        const levels: CognitiveLevel[] = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"]
        for (const level of levels) {
          const stats = quiz.cognitiveLevelStats[level]
          if (stats) {
            aggregated[level].total += stats.total
            aggregated[level].correct += stats.correct
          }
        }
      }
    }

    return hasAnyStats ? aggregated : null
  } catch (error) {
    console.error("Error fetching file cognitive stats:", error)
    throw error
  }
}

// Get cognitive stats by file name (today only) - for dashboard dropdown
export async function getFileCognitiveStatsByName(fileName: string): Promise<CognitiveLevelStatsRecord | null> {
  const user = auth.currentUser
  if (!user) throw new Error("User not authenticated")

  try {
    const quizzes = await getQuizHistory() // Already filtered to today only
    const fileQuizzes = quizzes.filter(q => q.fileName === fileName)
    
    if (fileQuizzes.length === 0) return null

    // Aggregate cognitive stats from file's quizzes today
    const aggregated = createEmptyCognitiveStats()
    let hasAnyStats = false

    for (const quiz of fileQuizzes) {
      if (quiz.cognitiveLevelStats) {
        hasAnyStats = true
        const levels: CognitiveLevel[] = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"]
        for (const level of levels) {
          const stats = quiz.cognitiveLevelStats[level]
          if (stats) {
            aggregated[level].total += stats.total
            aggregated[level].correct += stats.correct
          }
        }
      }
    }

    return hasAnyStats ? aggregated : null
  } catch (error) {
    console.error("Error fetching file cognitive stats by name:", error)
    throw error
  }
}

// ─── Folder CRUD Operations ────────────────────────────────────────────────────

export async function createFolder(name: string, color?: string): Promise<Folder> {
  const user = auth.currentUser
  if (!user) throw new Error("User not authenticated")

  try {
    const folderRef = await addDoc(collection(db, "users", user.uid, "folders"), {
      name: name.trim(),
      color: color || "#F5A623", // Default folder color
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })

    return {
      id: folderRef.id,
      userId: user.uid,
      name: name.trim(),
      color: color || "#F5A623",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  } catch (error) {
    console.error("Error creating folder:", error)
    throw error
  }
}

export async function getUserFolders(): Promise<Folder[]> {
  const user = auth.currentUser
  if (!user) throw new Error("User not authenticated")

  try {
    const q = query(collection(db, "users", user.uid, "folders"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs
      .map((doc) => ({
        id: doc.id,
        userId: user.uid,
        name: doc.data().name,
        color: doc.data().color || "#F5A623",
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  } catch (error) {
    console.error("Error fetching folders:", error)
    throw error
  }
}

export async function updateFolder(folderId: string, updates: { name?: string; color?: string }): Promise<void> {
  const user = auth.currentUser
  if (!user) throw new Error("User not authenticated")

  try {
    const folderDoc = doc(db, "users", user.uid, "folders", folderId)
    await updateDoc(folderDoc, {
      ...updates,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error("Error updating folder:", error)
    throw error
  }
}

export async function deleteFolder(folderId: string): Promise<void> {
  const user = auth.currentUser
  if (!user) throw new Error("User not authenticated")

  try {
    // Move all files in this folder back to root (set folderId to null)
    const filesInFolder = query(collection(db, "users", user.uid, "files"), where("folderId", "==", folderId))
    const filesSnapshot = await getDocs(filesInFolder)
    
    for (const fileDoc of filesSnapshot.docs) {
      await updateDoc(fileDoc.ref, { folderId: null })
    }

    // Delete the folder
    const folderDoc = doc(db, "users", user.uid, "folders", folderId)
    await deleteDoc(folderDoc)
  } catch (error) {
    console.error("Error deleting folder:", error)
    throw error
  }
}

export async function moveFileToFolder(fileId: string, folderId: string | null): Promise<void> {
  const user = auth.currentUser
  if (!user) throw new Error("User not authenticated")

  try {
    const fileDoc = doc(db, "users", user.uid, "files", fileId)
    await updateDoc(fileDoc, {
      folderId: folderId,
      lastModified: Timestamp.now(),
    })
  } catch (error) {
    console.error("Error moving file to folder:", error)
    throw error
  }
}

export async function moveMultipleFilesToFolder(fileIds: string[], folderId: string | null): Promise<void> {
  const user = auth.currentUser
  if (!user) throw new Error("User not authenticated")

  try {
    for (const fileId of fileIds) {
      const fileDoc = doc(db, "users", user.uid, "files", fileId)
      await updateDoc(fileDoc, {
        folderId: folderId,
        lastModified: Timestamp.now(),
      })
    }
  } catch (error) {
    console.error("Error moving files to folder:", error)
    throw error
  }
}

export async function getFilesInFolder(folderId: string | null): Promise<StudyFile[]> {
  const user = auth.currentUser
  if (!user) throw new Error("User not authenticated")

  try {
    let q
    if (folderId === null) {
      // Get files not in any folder (root level)
      q = query(collection(db, "users", user.uid, "files"), where("folderId", "in", [null, ""]))
    } else {
      q = query(collection(db, "users", user.uid, "files"), where("folderId", "==", folderId))
    }
    
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs
      .map((doc) => ({
        id: doc.id,
        userId: user.uid,
        fileName: doc.data().fileName,
        displayName: doc.data().displayName || doc.data().fileName,
        fileSize: doc.data().fileSize,
        fileType: doc.data().fileType,
        fileData: doc.data().fileData,
        uploadedAt: doc.data().uploadedAt.toDate(),
        lastModified: doc.data().lastModified?.toDate(),
        folderId: doc.data().folderId || null,
      }))
      .sort((a, b) => (a.displayName || a.fileName).localeCompare(b.displayName || b.fileName))
  } catch (error) {
    console.error("Error fetching files in folder:", error)
    throw error
  }
}
