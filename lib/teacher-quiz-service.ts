import { db, auth } from "@/lib/firebase"
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
  setDoc,
} from "firebase/firestore"
import type { CognitiveLevel, CognitiveLevelStatsRecord } from "./file-service"

/**
 * Teacher Quiz Question with iteration history
 */
export interface TeacherQuestion {
  id: string
  text: string
  options: string[]
  correctAnswer: number
  bloomsLevel: CognitiveLevel
  explanation?: string
  iterationHistory: {
    timestamp: Date
    originalText: string
    action: "regenerated" | "manually_edited"
    previousBloomsLevel: CognitiveLevel
  }[]
}

/**
 * Teacher Quiz stored in Firestore
 */
export interface TeacherQuiz {
  id: string
  userId: string
  sourceFileId: string
  sourceFileName: string
  title: string
  questions: TeacherQuestion[]
  metadata: {
    overallBloomsDistribution: CognitiveLevelStatsRecord
    difficulty: "easy" | "moderate" | "hard"
    questionCount: number
    status: "draft" | "saved"
  }
  createdAt: Date
  lastEdited: Date
}

/**
 * Generate a quiz for a teacher from a file
 * Returns a draft quiz that the teacher can edit
 */
export async function generateTeacherQuiz(
  fileId: string,
  fileName: string,
  options: {
    length?: number
    difficulty?: "easy" | "moderate" | "hard"
  } = {}
): Promise<TeacherQuiz> {
  const user = auth.currentUser
  if (!user) throw new Error("User not authenticated")

  try {
    // Call the quiz generation API
    const response = await fetch("/api/generate-quiz-from-file", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileId,
        userId: user.uid,
        length: options.length || 10,
        difficulty: options.difficulty || "moderate",
        isTeacher: true,
      }),
    })

    if (!response.ok) throw new Error("Failed to generate quiz")

    const data = await response.json()
    const { questions } = data

    // Transform questions to TeacherQuestion format
    const teacherQuestions: TeacherQuestion[] = questions.map((q: any, idx: number) => ({
      id: `q-${idx}`,
      text: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      bloomsLevel: q.bloomsLevel || "Remember",
      explanation: q.explanation || "",
      iterationHistory: [],
    }))

    // Calculate Bloom's distribution
    const distribution = calculateBloomsDistribution(teacherQuestions)

    // Create quiz document in teacherFiles/{fileId}/quizzes collection
    const quizRef = await addDoc(
      collection(db, "users", user.uid, "teacherFiles", fileId, "quizzes"),
      {
        sourceFileId: fileId,
        sourceFileName: fileName,
        title: `Quiz from ${fileName} - ${new Date().toLocaleDateString()}`,
        questions: teacherQuestions,
        metadata: {
          overallBloomsDistribution: distribution,
          difficulty: options.difficulty || "moderate",
          questionCount: teacherQuestions.length,
          status: "draft",
        },
        createdAt: Timestamp.now(),
        lastEdited: Timestamp.now(),
      }
    )

    return {
      id: quizRef.id,
      userId: user.uid,
      sourceFileId: fileId,
      sourceFileName: fileName,
      title: `Quiz from ${fileName} - ${new Date().toLocaleDateString()}`,
      questions: teacherQuestions,
      metadata: {
        overallBloomsDistribution: distribution,
        difficulty: options.difficulty || "moderate",
        questionCount: teacherQuestions.length,
        status: "draft",
      },
      createdAt: new Date(),
      lastEdited: new Date(),
    }
  } catch (error) {
    console.error("[v0] Error generating teacher quiz:", error)
    throw error
  }
}

/**
 * Get a teacher quiz by ID
 */
export async function getTeacherQuiz(fileId: string, quizId: string): Promise<TeacherQuiz | null> {
  const user = auth.currentUser
  if (!user) throw new Error("User not authenticated")

  try {
    const docRef = doc(
      db,
      "users",
      user.uid,
      "teacherFiles",
      fileId,
      "quizzes",
      quizId
    )
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) return null

    const data = docSnap.data()
    return {
      id: docSnap.id,
      userId: user.uid,
      sourceFileId: data.sourceFileId,
      sourceFileName: data.sourceFileName,
      title: data.title,
      questions: data.questions,
      metadata: data.metadata,
      createdAt: data.createdAt?.toDate() || new Date(),
      lastEdited: data.lastEdited?.toDate() || new Date(),
    }
  } catch (error) {
    console.error("[v0] Error getting teacher quiz:", error)
    return null
  }
}

/**
 * Save edits to a question in the quiz
 */
export async function saveQuestionEdits(
  fileId: string,
  quizId: string,
  questionId: string,
  updates: Partial<{
    text: string
    options: string[]
    correctAnswer: number
    bloomsLevel: CognitiveLevel
    explanation: string
  }>
): Promise<void> {
  const user = auth.currentUser
  if (!user) throw new Error("User not authenticated")

  try {
    const quizRef = doc(
      db,
      "users",
      user.uid,
      "teacherFiles",
      fileId,
      "quizzes",
      quizId
    )

    const quizSnap = await getDoc(quizRef)
    if (!quizSnap.exists()) throw new Error("Quiz not found")

    const quiz = quizSnap.data()
    const questions = [...quiz.questions]
    const qIndex = questions.findIndex((q: any) => q.id === questionId)

    if (qIndex === -1) throw new Error("Question not found")

    const originalQuestion = questions[qIndex]

    // Update the question
    questions[qIndex] = {
      ...originalQuestion,
      ...updates,
      iterationHistory: [
        ...originalQuestion.iterationHistory,
        {
          timestamp: new Date(),
          originalText: originalQuestion.text,
          action: "manually_edited",
          previousBloomsLevel: originalQuestion.bloomsLevel,
        },
      ],
    }

    // Recalculate Bloom's distribution
    const distribution = calculateBloomsDistribution(questions)

    await updateDoc(quizRef, {
      questions,
      metadata: {
        ...quiz.metadata,
        overallBloomsDistribution: distribution,
      },
      lastEdited: Timestamp.now(),
    })
  } catch (error) {
    console.error("[v0] Error saving question edits:", error)
    throw error
  }
}

/**
 * Regenerate a single question with target Bloom's level
 */
export async function regenerateSingleQuestion(
  fileId: string,
  quizId: string,
  questionId: string,
  bloomsLevel: CognitiveLevel
): Promise<TeacherQuestion | null> {
  const user = auth.currentUser
  if (!user) throw new Error("User not authenticated")

  try {
    const quizRef = doc(
      db,
      "users",
      user.uid,
      "teacherFiles",
      fileId,
      "quizzes",
      quizId
    )

    const quizSnap = await getDoc(quizRef)
    if (!quizSnap.exists()) throw new Error("Quiz not found")

    const quiz = quizSnap.data()
    const questions = quiz.questions as TeacherQuestion[]
    const qIndex = questions.findIndex((q: any) => q.id === questionId)

    if (qIndex === -1) throw new Error("Question not found")

    const originalQuestion = questions[qIndex]

    // Call API to regenerate just this question
    const response = await fetch("/api/regenerate-question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileId,
        originalQuestion: originalQuestion.text,
        bloomsLevel,
        questionIndex: qIndex,
        totalQuestions: questions.length,
      }),
    })

    if (!response.ok) throw new Error("Failed to regenerate question")

    const newQuestionData = await response.json()

    // Update the question with regenerated content
    const updatedQuestion: TeacherQuestion = {
      ...originalQuestion,
      text: newQuestionData.question,
      options: newQuestionData.options,
      correctAnswer: newQuestionData.correctAnswer,
      bloomsLevel: bloomsLevel,
      explanation: newQuestionData.explanation || "",
      iterationHistory: [
        ...originalQuestion.iterationHistory,
        {
          timestamp: new Date(),
          originalText: originalQuestion.text,
          action: "regenerated",
          previousBloomsLevel: originalQuestion.bloomsLevel,
        },
      ],
    }

    // Update questions array
    questions[qIndex] = updatedQuestion

    // Recalculate Bloom's distribution
    const distribution = calculateBloomsDistribution(questions)

    // Save updated quiz
    await updateDoc(quizRef, {
      questions,
      metadata: {
        ...quiz.metadata,
        overallBloomsDistribution: distribution,
      },
      lastEdited: Timestamp.now(),
    })

    return updatedQuestion
  } catch (error) {
    console.error("[v0] Error regenerating question:", error)
    throw error
  }
}

/**
 * Save teacher quiz to library (mark as "saved")
 */
export async function saveTeacherQuiz(fileId: string, quizId: string, title: string): Promise<void> {
  const user = auth.currentUser
  if (!user) throw new Error("User not authenticated")

  try {
    const quizRef = doc(
      db,
      "users",
      user.uid,
      "teacherFiles",
      fileId,
      "quizzes",
      quizId
    )

    await updateDoc(quizRef, {
      title,
      metadata: {
        status: "saved",
      },
      lastEdited: Timestamp.now(),
    })
  } catch (error) {
    console.error("[v0] Error saving teacher quiz:", error)
    throw error
  }
}

/**
 * Delete teacher quiz
 */
export async function deleteTeacherQuiz(fileId: string, quizId: string): Promise<void> {
  const user = auth.currentUser
  if (!user) throw new Error("User not authenticated")

  try {
    await deleteDoc(
      doc(db, "users", user.uid, "teacherFiles", fileId, "quizzes", quizId)
    )
  } catch (error) {
    console.error("[v0] Error deleting teacher quiz:", error)
    throw error
  }
}

/**
 * Get all quizzes for a teacher file
 */
export async function getTeacherFileQuizzes(fileId: string): Promise<TeacherQuiz[]> {
  const user = auth.currentUser
  if (!user) throw new Error("User not authenticated")

  try {
    const q = query(collection(db, "users", user.uid, "teacherFiles", fileId, "quizzes"))
    const querySnapshot = await getDocs(q)

    const quizzes: TeacherQuiz[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      quizzes.push({
        id: doc.id,
        userId: user.uid,
        sourceFileId: data.sourceFileId,
        sourceFileName: data.sourceFileName,
        title: data.title,
        questions: data.questions,
        metadata: data.metadata,
        createdAt: data.createdAt?.toDate() || new Date(),
        lastEdited: data.lastEdited?.toDate() || new Date(),
      })
    })

    return quizzes
  } catch (error) {
    console.error("[v0] Error getting teacher file quizzes:", error)
    return []
  }
}

/**
 * Calculate Bloom's Taxonomy distribution for a set of questions
 */
function calculateBloomsDistribution(
  questions: TeacherQuestion[]
): CognitiveLevelStatsRecord {
  const levels: CognitiveLevel[] = [
    "Remember",
    "Understand",
    "Apply",
    "Analyze",
    "Evaluate",
    "Create",
  ]

  const distribution: CognitiveLevelStatsRecord = {} as CognitiveLevelStatsRecord

  levels.forEach((level) => {
    distribution[level] = {
      total: 0,
      correct: 0,
    }
  })

  questions.forEach((q) => {
    distribution[q.bloomsLevel].total += 1
  })

  return distribution
}
