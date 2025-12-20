"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleSignup() {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
    emailRedirectTo: 'https://manageyoursaas-nu.vercel.app/login'
  }
    });

    if (error) return setMsg(error.message);

    setMsg("Signup successful! Check your email to verify.");
  }

  return (
    <div className="p-8 text-black max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-6">Create Account</h1>

      <input
        className="border p-2 w-full mb-3"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        className="border p-2 w-full mb-3"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleSignup}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Sign Up
      </button>

      <p className="mt-3 text-sm">{msg}</p>
    </div>
  );
}
