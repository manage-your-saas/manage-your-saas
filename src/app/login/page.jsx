"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin() {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);
    if (error) return setMsg(error.message);

    window.location.href = "/dashboard";
  }

  async function handleGoogleLogin() {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://manageyoursaas-nu.vercel.app/dashboard'
      }
    });

    setIsLoading(false);
    if (error) return setMsg(error.message);
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex flex-row items-center gap-2 group mb-8 ">
            <div className="relative">
              <img src="/myslogo.svg" alt="ManageYourSaaS" className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span className="font-semibold text-lg tracking-tight">ManageYourSaaS</span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Welcome back
            </h1>
            <p className="text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Link href="#" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full py-3 text-base font-medium group"
            >
              {isLoading ? "Signing in..." : "Sign in"}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
            </Button>

            {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Google Button */}
          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            variant="outline"
            className="w-full py-3 text-base font-medium bg-background hover:bg-muted/50 border-border"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isLoading ? "Connecting..." : "Continue with Google"}
          </Button>

          {msg && (
            <div className="bg-red-500/10 text-red-600 border border-red-500/20 p-3 rounded-lg text-sm">
              {msg}
            </div>
          )}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline font-medium">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/5 to-accent/5 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-lg mx-auto p-8">
            <div className="w-16 h-16  rounded-2xl flex items-center justify-center mx-auto mb-6">
              <img src="/myslogo.svg" alt="Logo" />
            </div>
            <h2 className="text-2xl font-bold mb-4">
              Welcome back to your dashboard
            </h2>
            <p className="text-muted-foreground mb-8">
              Access all your SaaS metrics, analytics, and insights in one place. 
              Track your growth and make data-driven decisions.
            </p>
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="bg-background/50 rounded-xl p-4 backdrop-blur-sm">
                <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-2">
                  <div className="w-4 h-4 bg-emerald-500 rounded-full" />
                </div>
                <h3 className="font-semibold mb-1">Real-time Analytics</h3>
                <p className="text-sm text-muted-foreground">Track your metrics live</p>
              </div>
              <div className="bg-background/50 rounded-xl p-4 backdrop-blur-sm">
                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center mb-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full" />
                </div>
                <h3 className="font-semibold mb-1">SEO Insights</h3>
                <p className="text-sm text-muted-foreground">Optimize your search rankings</p>
              </div>
              <div className="bg-background/50 rounded-xl p-4 backdrop-blur-sm">
                <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center mb-2">
                  <div className="w-4 h-4 bg-purple-500 rounded-full" />
                </div>
                <h3 className="font-semibold mb-1">Revenue Tracking</h3>
                <p className="text-sm text-muted-foreground">Monitor your growth</p>
              </div>
              <div className="bg-background/50 rounded-xl p-4 backdrop-blur-sm">
                <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center mb-2">
                  <div className="w-4 h-4 bg-orange-500 rounded-full" />
                </div>
                <h3 className="font-semibold mb-1">Social Metrics</h3>
                <p className="text-sm text-muted-foreground">Track social performance</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
