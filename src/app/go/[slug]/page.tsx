import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc, increment, serverTimestamp } from "firebase/firestore";
import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";

export default async function RedirectPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  // 1. Await params for Next.js 15+
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  // 2. Identify if the "visitor" is a bot
  const headerList = await headers();
  const userAgent = headerList.get("user-agent") || "";
  
  console.log("DEBUG - Received User-Agent:", userAgent);

  // Added 'thunder' to the bot list so you can test easily without fighting headers!
  const isBot = /bot|crawl|spider|facebook|external|chrome-lighthouse|slack|twitter|linkedin|discord|thunder/i.test(userAgent);

  // 3. Find the project
  const q = query(collection(db, "projects"), where("slug", "==", slug));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    notFound();
  }

  const projectDoc = querySnapshot.docs[0];
  const projectData = projectDoc.data();
  const destination = projectData.destinationUrl;

  // 4. Analytics Logic: Only increment if a human clicked
  if (!isBot) {
    try {
      await updateDoc(doc(db, "projects", projectDoc.id), {
        clicks: increment(1),
        lastClickedAt: serverTimestamp() 
      });
      console.log("✅ Human detected: Count incremented.");
    } catch (error) {
      console.error("Analytics update failed:", error);
    }
  } else {
    console.log(`🤖 Bot detected: Skipping count for ${userAgent}`);
  }

  // 5. Final Redirect
  const finalUrl = destination.startsWith("http") ? destination : `https://${destination}`;
  
  redirect(finalUrl);
}