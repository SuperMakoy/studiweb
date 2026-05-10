import { db } from "@/lib/firebase"
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore"

export type UserRole = "student" | "teacher" | "evaluator"

export interface UserProfile {
  uid: string
  fullName: string
  email: string
  role: UserRole
  createdAt: Date
}

/**
 * Get user role from Firestore
 * Defaults to "student" if role is not set
 */
export async function getUserRole(uid: string): Promise<UserRole> {
  try {
    const userDoc = await getDoc(doc(db, "users", uid))
    if (userDoc.exists()) {
      return userDoc.data().role || "student"
    }
    return "student"
  } catch (error) {
    console.error("[v0] Error getting user role:", error)
    return "student"
  }
}

/**
 * Set user role in Firestore
 */
export async function setUserRole(uid: string, role: UserRole): Promise<void> {
  try {
    await updateDoc(doc(db, "users", uid), { role })
  } catch (error) {
    console.error("[v0] Error setting user role:", error)
    throw error
  }
}

/**
 * Create user profile with role
 * Called during signup
 */
export async function createUserProfile(
  uid: string,
  fullName: string,
  email: string,
  role: UserRole = "student"
): Promise<void> {
  try {
    await setDoc(doc(db, "users", uid), {
      uid,
      fullName,
      email,
      role,
      createdAt: new Date(),
    })
  } catch (error) {
    console.error("[v0] Error creating user profile:", error)
    throw error
  }
}

/**
 * Get full user profile
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", uid))
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile
    }
    return null
  } catch (error) {
    console.error("[v0] Error getting user profile:", error)
    return null
  }
}
