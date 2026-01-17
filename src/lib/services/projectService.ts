import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, deleteDoc, updateDoc, increment } from "firebase/firestore";
import { nanoid } from "nanoid";

export const createProject = async (name: string, userId: string, destinationUrl: string) => {
  try {
    const slug = nanoid(6); 
    const docRef = await addDoc(collection(db, "projects"), {
      name: name,
      userId: userId,
      destinationUrl: destinationUrl,
      slug: slug,
      clicks: 0,
      lastClickedAt: null, // Initialized as null
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id, slug };
  } catch (error) {
    console.error("Error adding project: ", error);
    return { success: false, error };
  }
};

export const deleteProject = async (projectId: string) => {
  try {
    const projectRef = doc(db, "projects", projectId);
    await deleteDoc(projectRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting project: ", error);
    return { success: false, error };
  }
};

// NEW: Function to record a hit with a timestamp
export const recordClick = async (projectId: string) => {
  const projectRef = doc(db, "projects", projectId);
  await updateDoc(projectRef, {
    clicks: increment(1),
    lastClickedAt: serverTimestamp() // Tracks exactly when the recruiter clicked
  });
};

/**
 * JOB TRACKER FEATURES
 * Simple functions to manage your application pipeline.
 */

// 1. Add a new job application
export const addApplication = async (userId: string, company: string, role: string) => {
  try {
    const docRef = await addDoc(collection(db, "applications"), {
      userId,
      company,
      role,
      status: "Applied", // Initial status for first-time seekers
      appliedAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding application:", error);
    return { success: false, error };
  }
};

// 2. Update the status (e.g., move from 'Applied' to 'Interviewing')
export const updateApplicationStatus = async (appId: string, newStatus: string) => {
  try {
    const appRef = doc(db, "applications", appId);
    await updateDoc(appRef, { status: newStatus });
    return { success: true };
  } catch (error) {
    console.error("Error updating status:", error);
    return { success: false };
  }
};

// 3. Delete an application record
export const deleteApplication = async (appId: string) => {
  try {
    const appRef = doc(db, "applications", appId);
    await deleteDoc(appRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting application:", error);
    return { success: false };
  }
};