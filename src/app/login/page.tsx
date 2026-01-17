;import AuthForm from "@/components/auth/AuthForm"

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <AuthForm type="login" /> {/* Change to type="signup" for the signup page */}
    </main>
  );
}