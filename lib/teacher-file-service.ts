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
} from "firebase/firestore"
import type { StudyFile } from "./file-service"

/**
 * Teacher File - extends StudyFile with fileType: "teacher"
 */
export interface TeacherFile extends StudyFile {
  fileType: "teacher"
}

/**
 * Upload a file for teacher use
 * Stored in users/{uid}/teacherFiles collection
 */
export async function uploadTeacherFile(file: File, folderId?: string): Promise<TeacherFile> {
  const user = auth.currentUser
  if (!user) throw new Error("User not authenticated")

  try {
    // Convert file to base64
    const fileData = await fileToBase64(file)

    // Save to Firestore in teacherFiles collection
    const fileRef = await addDoc(collection(db, "users", user.uid, "teacherFiles"), {
      fileName: file.name,
      displayName: file.name,
      fileSize: file.size,
      fileType: "teacher",
      fileData: fileData,
      folderId: folderId || null,
      uploadedAt: Timestamp.now(),
      lastModified: Timestamp.now(),
    })

    return {
      id: fileRef.id,
      userId: user.uid,
      fileName: file.name,
      displayName: file.name,
      fileSize: file.size,
      fileType: "teacher",
      fileData: fileData,
      folderId: folderId || null,
      uploadedAt: new Date(),
      lastModified: new Date(),
    }
  } catch (error) {
    console.error("[v0] Error uploading teacher file:", error)
    throw error
  }
}

/**
 * Get all files uploaded by teacher
 */
export async function getTeacherFiles(): Promise<TeacherFile[]> {
  const user = auth.currentUser
  if (!user) throw new Error("User not authenticated")

  try {
    const q = query(collection(db, "users", user.uid, "teacherFiles"))
    const querySnapshot = await getDocs(q)
    
    const files: TeacherFile[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      files.push({
        id: doc.id,
        userId: user.uid,
        fileName: data.fileName,
        displayName: data.displayName,
        fileSize: data.fileSize,
        fileType: "teacher" as const,
        fileData: data.fileData,
        folderId: data.folderId || null,
        uploadedAt: data.uploadedAt?.toDate() || new Date(),
        lastModified: data.lastModified?.toDate() || new Date(),
      })
    })
    
    return files
  } catch (error) {
    console.error("[v0] Error getting teacher files:", error)
    throw error
  }
}

/**
 * Get a single teacher file by ID
 */
export async function getTeacherFile(fileId: string): Promise<TeacherFile | null> {
  const user = auth.currentUser
  if (!user) throw new Error("User not authenticated")

  try {
    const docRef = doc(db, "users", user.uid, "teacherFiles", fileId)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) return null
    
    const data = docSnap.data()
    return {
      id: docSnap.id,
      userId: user.uid,
      fileName: data.fileName,
      displayName: data.displayName,
      fileSize: data.fileSize,
      fileType: "teacher" as const,
      fileData: data.fileData,
      folderId: data.folderId || null,
      uploadedAt: data.uploadedAt?.toDate() || new Date(),
      lastModified: data.lastModified?.toDate() || new Date(),
    }
  } catch (error) {
    console.error("[v0] Error getting teacher file:", error)
    return null
  }
}

/**
 * Delete a teacher file
 */
export async function deleteTeacherFile(fileId: string): Promise<void> {
  const user = auth.currentUser
  if (!user) throw new Error("User not authenticated")

  try {
    // Delete the file document
    await deleteDoc(doc(db, "users", user.uid, "teacherFiles", fileId))
    
    // Note: Firestore will NOT cascade delete the quizzes subcollection
    // You may want to delete quizzes explicitly if needed
  } catch (error) {
    console.error("[v0] Error deleting teacher file:", error)
    throw error
  }
}

/**
 * Update teacher file metadata (e.g., folders, displayName)
 */
export async function updateTeacherFile(
  fileId: string,
  updates: Partial<{ displayName: string; folderIds: string[] }>
): Promise<void> {
  const user = auth.currentUser
  if (!user) throw new Error("User not authenticated")

  try {
    const docRef = doc(db, "users", user.uid, "teacherFiles", fileId)
    await updateDoc(docRef, {
      ...updates,
      lastModified: Timestamp.now(),
    })
  } catch (error) {
    console.error("[v0] Error updating teacher file:", error)
    throw error
  }
}

/**
 * Convert File to base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
