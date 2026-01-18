export const dynamic = 'force-dynamic';
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc, increment, serverTimestamp } from "firebase/firestore";
import { redirect } from "next/navigation";

// Updated type definition to reflect that params is now a Promise in Next.js 15+
export default async function RedirectPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  // 1. Await the params to unwrap the Promise
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // 2. Find the project with this slug
  const q = query(collection(db, "projects"), where("slug", "==", slug));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    redirect("/404");
  }

  const projectDoc = querySnapshot.docs[0];
  const projectData = projectDoc.data();

  // 3. Log the engagement (Update clicks and timestamp)
  await updateDoc(doc(db, "projects", projectDoc.id), {
    clicks: increment(1),
    lastClickedAt: serverTimestamp(),
  });

  // 4. Fire the redirect
  // We use the destinationUrl stored in your Firestore document
  redirect(projectData.destinationUrl);

  return null;
}