export const dynamic = 'force-dynamic';
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc, increment, serverTimestamp } from "firebase/firestore";
import { redirect } from "next/navigation";

export default async function RedirectPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  // 1. Find the project with this slug
  const q = query(collection(db, "projects"), where("slug", "==", slug));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    redirect("/404");
  }

  const projectDoc = querySnapshot.docs[0];
  const projectData = projectDoc.data();

  // 2. Log the engagement (Update clicks and timestamp)
  await updateDoc(doc(db, "projects", projectDoc.id), {
    clicks: increment(1),
    lastClickedAt: serverTimestamp(),
  });

  // 3. Fire the redirect
  redirect(projectData.destinationUrl);

  return null;
}