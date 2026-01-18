"use client";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "firebase/auth";
import { useRouter } from "next/navigation";

interface AuthFormProps {
  type: "login" | "signup";
}

export default function AuthForm({ type }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (type === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md w-full p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl z-10">
      <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
        {type === "login" ? "Welcome Back" : "Create Account"}
      </h2>
      <p className="text-gray-400 mb-8 text-sm">
        {type === "login" 
          ? "Access your Career Intelligence dashboard." 
          : "Start tracking your professional outreach."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 text-left">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
            placeholder="name@company.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 text-left">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
            placeholder="••••••••"
            required
          />
        </div>

        {error && (
          <p className="text-red-400 text-xs bg-red-400/10 p-2 rounded border border-red-400/20">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]"
        >
          {type === "login" ? "Login" : "Sign Up"}
        </button>
      </form>

      {/* Social Login Section */}
      <div className="mt-8">
        <div className="relative flex items-center justify-center mb-6">
          <div className="w-full border-t border-white/10"></div>
          <span className="absolute bg-[#0b0b0b] px-3 text-xs text-gray-500 uppercase tracking-widest text-gray-400">
            Or continue with
          </span>
        </div>

        <button 
          onClick={handleGoogleSignIn}
          type="button"
          className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white py-3 rounded-lg transition-all"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" className="w-5 h-5" alt="Google" />
          <span className="text-sm font-medium">Google</span>
        </button>
      </div>

      <p className="mt-8 text-center text-gray-500 text-sm">
        {type === "login" ? "New here?" : "Already have an account?"}{" "}
        <button 
          onClick={() => router.push(type === "login" ? "/signup" : "/login")}
          className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
        >
          {type === "login" ? "Create an account" : "Log in"}
        </button>
      </p>
    </div>
  );
}