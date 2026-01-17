import "./globals.css"; // Added this to link Tailwind styles
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