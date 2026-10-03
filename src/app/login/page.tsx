"use client";

import { SpinningMark } from "@/components/landing/bike-scene";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { LOGIN_ID, resolveLoginEmail, SHOP_NAME } from "@/lib/shop";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Please enter login ID and password");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const loginEmail = resolveLoginEmail(email);
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });
      if (authError) {
        setError("Invalid credentials. Please try again.");
        setLoading(false);
        return;
      }
      if (remember) {
        localStorage.setItem("rg-remember", "1");
      }
      router.push("/app/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen">
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>
      <div className="relative hidden w-1/2 lg:block">
        <Image
          src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1400&q=80"
          alt="Motorcycle on the road"
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-x-8 bottom-10 rounded-2xl bg-white/95 p-6 text-slate-900 shadow-card">
          <div className="flex items-center gap-3">
            <SpinningMark />
            <span className="text-sm font-semibold leading-tight">{SHOP_NAME}</span>
          </div>
          <p className="mt-4 text-base font-medium text-slate-700">
            Professional billing for your bike service shop — fast, simple, reliable.
          </p>
        </div>
      </div>
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16 bg-background-light dark:bg-background-dark">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <SpinningMark />
            <span className="text-sm font-semibold leading-tight">{SHOP_NAME}</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground dark:text-slate-100">
            Welcome back
          </h1>
          <p className="mt-2 text-foreground-muted">Sign in to manage your shop</p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Input
              label="Login ID"
              type="text"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={LOGIN_ID}
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPass ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-foreground-muted"
                onClick={() => setShowPass((s) => !s)}
                aria-label="Toggle password visibility"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-border"
                />
                Remember Me
              </label>
              <button type="button" className="text-primary hover:underline">
                Forgot Password
              </button>
            </div>
            {error && (
              <p className="text-sm text-danger" role="alert">{error}</p>
            )}
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Login
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-foreground-muted">
            Don&apos;t have an account?{" "}
            <span className="text-primary">Contact Admin</span>
          </p>
          <Link
            href="/"
            className="mt-4 block text-center text-sm text-primary hover:underline"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
