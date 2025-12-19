"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleSignup() {
    setMsg("");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMsg(error.message);
      return;
    }

    // Check if user is automatically logged in (email confirmation disabled)
    // or if they need to verify email first
    if (data.user) {
      // Wait a moment for session to be established
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if email confirmation is required
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // User is logged in, redirect to dashboard
        router.push("/dashboard");
      } else {
        // Email confirmation required
        setMsg("Signup successful! Please check your email to verify your account before logging in.");
      }
    } else {
      setMsg("Signup successful! Please check your email to verify your account.");
    }
  }

  async function handleGoogleSignup() {
    setMsg("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?source=signup`,
      },
    });
    if (error) {
      // Check if it's the "provider not enabled" error
      if (error.message?.includes("not enabled") || error.message?.includes("Unsupported provider")) {
        setMsg("Google signup is not configured. Please enable Google OAuth in your Supabase project settings.");
      } else {
        setMsg(error.message);
      }
    }
  }

  return (
    <div className="p-8 text-black max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-6">Create Account</h1>

      <input
        type="email"
        className="border p-2 w-full mb-3 rounded"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        className="border p-2 w-full mb-3 rounded"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSignup();
          }
        }}
      />

      <button
        onClick={handleSignup}
        className="bg-black text-white px-4 py-2 rounded w-full hover:bg-gray-800 transition-colors"
      >
        Sign Up
      </button>

      <div className="my-4 flex items-center gap-3">
        <div className="h-px bg-black/20 flex-1" />
        <span className="text-xs text-black/60">OR</span>
        <div className="h-px bg-black/20 flex-1" />
      </div>

      <button
        onClick={handleGoogleSignup}
        className="border border-black px-4 py-2 rounded w-full hover:bg-gray-50 transition-colors"
      >
        Continue with Google
      </button>

      {msg && (
        <div className={`mt-3 p-3 rounded ${
          msg.includes("not configured") 
            ? "bg-yellow-50 border border-yellow-200 text-yellow-800" 
            : msg.includes("successful")
            ? "bg-green-50 border border-green-200 text-green-800"
            : "bg-red-50 border border-red-200 text-red-800"
        }`}>
          <p className="text-sm font-medium">{msg}</p>
          {msg.includes("not configured") && (
            <div className="mt-2 text-xs">
              <p className="mb-1">To enable Google signup:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Go to Supabase Dashboard → Authentication → Providers</li>
                <li>Enable the Google provider</li>
                <li>Add your Google OAuth Client ID and Secret</li>
                <li>Add redirect URL: <code className="bg-yellow-100 px-1 rounded">{window.location.origin}/auth/callback</code></li>
              </ol>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 text-center">
        <p className="text-sm text-black/60">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-black font-semibold hover:underline"
          >
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}
