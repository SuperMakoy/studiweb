import { db } from "./firebase"
import {
  collection,
  addDoc,
  query,
  getDocs,
  getDoc,
  doc,
  setDoc,
  Timestamp,
  collectionGroup,
} from "firebase/firestore"

export type CognitiveLevel = "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create"

export interface QuizQuestion {
  id: number
  question: string
  options: string[]
  correctAnswers: number[]
  type: "single" | "multiple"
  cognitiveLevel?: CognitiveLevel
}

export interface QuizForEvaluation {
  id: string
  fileId: string
  fileName: string
  userId: string
  difficulty: "easy" | "moderate" | "hard"
  questions: QuizQuestion[]
  questionCount: number
  createdAt: number
  evaluationStatus: "pending" | "evaluated"
}

export interface QuestionEvaluation {
  questionId: number
  alignmentScore: number // 1-5
  suggestedLevel: CognitiveLevel
  notes: string
}

export interface QuizEvaluation {
  id?: string
  quizId: string
  fileName: string
  evaluatorNotes: string
  questionEvaluations: QuestionEvaluation[]
  overallRating: number
  evaluatedAt: Date
}

// Check if evaluator is logged in
export function isEvaluatorLoggedIn(): boolean {
  if (typeof window === "undefined") return false
  
  const session = localStorage.getItem("evaluator_session")
  if (!session) return false
  
  try {
    const parsed = JSON.parse(session)
    // Session expires after 24 hours
    const isExpired = Date.now() - parsed.loginTime > 24 * 60 * 60 * 1000
    return parsed.isEvaluator && !isExpired
  } catch {
    return false
  }
}

// Logout evaluator
export function logoutEvaluator(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("evaluator_session")
  }
}

// Get all generated quizzes from all users for evaluation
export async function getQuizzesForEvaluation(): Promise<QuizForEvaluation[]> {
  try {
    const quizzesRef = collection(db, "generatedQuizzes")
    const querySnapshot = await getDocs(quizzesRef)

    const quizzes: QuizForEvaluation[] = querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        fileId: data.fileId || "",
        fileName: data.fileName || "Unknown",
        userId: data.userId || "",
        difficulty: data.difficulty || "moderate",
        questions: data.questions || [],
        questionCount: data.questions?.length || 0,
        createdAt: data.createdAt?.toMillis?.() || data.createdAt || Date.now(),
        evaluationStatus: data.evaluationStatus || "pending",
      }
    })

    return quizzes.sort((a, b) => b.createdAt - a.createdAt)
  } catch (error) {
    console.error("Error fetching quizzes for evaluation:", error)
    throw error
  }
}

// Get a single quiz for evaluation
export async function getQuizForEvaluation(quizId: string): Promise<QuizForEvaluation | null> {
  try {
    const quizDoc = await getDoc(doc(db, "generatedQuizzes", quizId))
    if (!quizDoc.exists()) return null

    const data = quizDoc.data()
    return {
      id: quizDoc.id,
      fileId: data.fileId || "",
      fileName: data.fileName || "Unknown",
      userId: data.userId || "",
      difficulty: data.difficulty || "moderate",
      questions: data.questions || [],
      questionCount: data.questions?.length || 0,
      createdAt: data.createdAt?.toMillis?.() || data.createdAt || Date.now(),
      evaluationStatus: data.evaluationStatus || "pending",
    }
  } catch (error) {
    console.error("Error fetching quiz for evaluation:", error)
    throw error
  }
}

// Save evaluation for a quiz
export async function saveEvaluation(
  quizId: string,
  questionEvaluations: QuestionEvaluation[],
  evaluatorName: string
): Promise<void> {
  try {
    // Save to evaluations collection
    await setDoc(doc(db, "evaluations", quizId), {
      quizId,
      evaluatorName,
      questionEvaluations,
      evaluatedAt: Timestamp.now(),
    })

    // Update quiz status
    await setDoc(
      doc(db, "generatedQuizzes", quizId),
      { evaluationStatus: "evaluated" },
      { merge: true }
    )
  } catch (error) {
    console.error("Error saving evaluation:", error)
    throw error
  }
}

// Save quiz evaluation
export async function saveQuizEvaluation(evaluation: Omit<QuizEvaluation, "id">): Promise<string> {
  try {
    const evalRef = await addDoc(collection(db, "quizEvaluations"), {
      ...evaluation,
      evaluatedAt: Timestamp.now(),
    })
    return evalRef.id
  } catch (error) {
    console.error("Error saving quiz evaluation:", error)
    throw error
  }
}

// Get all evaluations
export async function getQuizEvaluations(): Promise<QuizEvaluation[]> {
  try {
    const evalsRef = collection(db, "quizEvaluations")
    const querySnapshot = await getDocs(evalsRef)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      quizId: doc.data().quizId,
      fileName: doc.data().fileName,
      evaluatorNotes: doc.data().evaluatorNotes,
      questionEvaluations: doc.data().questionEvaluations,
      overallRating: doc.data().overallRating,
      evaluatedAt: doc.data().evaluatedAt?.toDate() || new Date(),
    }))
  } catch (error) {
    console.error("Error fetching quiz evaluations:", error)
    throw error
  }
}
