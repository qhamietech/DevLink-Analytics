// src/app/layout.tsx
import "@/app/globals.css";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased"> 
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}