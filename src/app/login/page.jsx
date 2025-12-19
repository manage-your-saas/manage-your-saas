"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;
      if (data?.user) router.replace("/dashboard/seo"); // already logged in -> SEO page
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleLogin() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return setMsg(error.message);

    window.location.href = "/dashboard/seo"; // after login -> SEO page
  }

  async function handleGoogleLogin() {
    setMsg("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?source=login`,
      },
    });
    if (error) {
      // Check if it's the "provider not enabled" error
      if (error.message?.includes("not enabled") || error.message?.includes("Unsupported provider")) {
        setMsg("Google login is not configured. Please enable Google OAuth in your Supabase project settings.");
      } else {
        setMsg(error.message);
      }
    }
  }

  return (
    <div className="p-8 text-black max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-6">Login</h1>

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
            handleLogin();
          }
        }}
      />

      <button
        onClick={handleLogin}
        className="bg-black text-white px-4 py-2 rounded w-full hover:bg-gray-800 transition-colors"
      >
        Login
      </button>

      <div className="my-4 flex items-center gap-3">
        <div className="h-px bg-black/20 flex-1" />
        <span className="text-xs text-black/60">OR</span>
        <div className="h-px bg-black/20 flex-1" />
      </div>

      <button
        onClick={handleGoogleLogin}
        className="border border-black px-4 py-2 rounded w-full hover:bg-gray-50 transition-colors"
      >
        Continue with Google
      </button>

      {msg && (
        <div className={`mt-3 p-3 rounded ${
          msg.includes("not configured") 
            ? "bg-yellow-50 border border-yellow-200 text-yellow-800" 
            : "bg-red-50 border border-red-200 text-red-800"
        }`}>
          <p className="text-sm font-medium">{msg}</p>
          {msg.includes("not configured") && (
            <div className="mt-2 text-xs">
              <p className="mb-1">To enable Google login:</p>
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
          Don't have an account?{" "}
          <a
            href="/signup"
            className="text-black font-semibold hover:underline"
          >
            Sign up here
          </a>
        </p>
      </div>
    </div>
  );
}
