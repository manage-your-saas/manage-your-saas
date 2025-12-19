"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setIsLoading(true);
        
        // Get the source (signup or login) from URL params
        const source = searchParams.get("source") || "login";
        const isSignupFlow = source === "signup";

        // Check for OAuth errors first
        const errorParam = searchParams.get("error");
        if (errorParam) {
          setError(`OAuth error: ${errorParam}. Please try again.`);
          setIsLoading(false);
          return;
        }

        // Get the full URL - Supabase handles both query params and hash fragments
        const fullUrl = window.location.href;
        
        // Check if URL has code parameter (in query or hash)
        const urlHasCode = fullUrl.includes("code=") || fullUrl.includes("#code=");
        
        if (!urlHasCode) {
          // Check if we're already authenticated
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            // Already authenticated, redirect based on source
            if (isSignupFlow) {
              router.replace("/dashboard");
            } else {
              router.replace("/dashboard/seo");
            }
            return;
          } else {
            setError("No authorization code found. Please try logging in again.");
            setIsLoading(false);
            return;
          }
        }
        
        // Extract code from URL to verify it exists
        const urlObj = new URL(fullUrl);
        const codeFromQuery = urlObj.searchParams.get("code");
        const codeFromHash = urlObj.hash.includes("code=") 
          ? new URLSearchParams(urlObj.hash.substring(1)).get("code")
          : null;
        const code = codeFromQuery || codeFromHash;
        
        if (!code) {
          setError("Authorization code not found in URL. Please try logging in again.");
          setIsLoading(false);
          return;
        }
        
        // After OAuth redirect, exchange the `code` for a Supabase session.
        // Supabase will extract code and code_verifier from the URL automatically
        // The code_verifier should be in localStorage from the initial OAuth request
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(
          fullUrl,
        );

        if (cancelled) return;
        if (exchangeError) {
          console.error("Exchange error:", exchangeError);
          setError(exchangeError.message || "Failed to exchange code for session. Please try again.");
          setIsLoading(false);
          return;
        }

        // Check if user is new (created within last 15 seconds)
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const userCreatedAt = new Date(user.created_at);
          const now = new Date();
          const secondsSinceCreation = (now - userCreatedAt) / 1000;
          
          // If user was created less than 15 seconds ago, they're a new user
          if (secondsSinceCreation < 15) {
            if (!isSignupFlow) {
              // User tried to login but account doesn't exist
              setIsNewUser(true);
              await supabase.auth.signOut();
              setError("Account not found. Please sign up first to create an account.");
              setIsLoading(false);
              return;
            }
            // User came from signup page, allow them to proceed
          }
        }

        // Success - redirect based on source
        // If from signup, go to dashboard; if from login, go to SEO page
        if (isSignupFlow) {
          router.replace("/dashboard");
        } else {
          router.replace("/dashboard/seo");
        }
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Authentication failed.");
        setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  if (error || isNewUser) {
    return (
      <div className="p-8 text-black max-w-lg mx-auto">
        <h1 className="text-xl font-bold mb-2">
          {isNewUser ? "Account Not Found" : "Authentication Failed"}
        </h1>
        <p className="text-sm mb-4">
          {isNewUser 
            ? "You don't have an account yet. Please sign up first to create an account, then you can log in with Google."
            : error
          }
        </p>
        <div className="flex gap-3">
          <button
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
            onClick={() => router.replace(isNewUser ? "/signup" : "/login")}
          >
            {isNewUser ? "Go to Sign Up" : "Back to Login"}
          </button>
          {isNewUser && (
            <button
              className="border border-black text-black px-4 py-2 rounded hover:bg-gray-100 transition-colors"
              onClick={() => router.replace("/login")}
            >
              Back to Login
            </button>
          )}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 text-black max-w-lg mx-auto">
        <h1 className="text-xl font-bold mb-2">Signing you in…</h1>
        <p className="text-sm text-black/70">Please wait.</p>
      </div>
    );
  }

  return null;
}


