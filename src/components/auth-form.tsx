"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function AuthForm({
  mode,
  nextPath = "/learn",
}: {
  mode: "login" | "signup";
  nextPath?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      const supabase = createClient();
      if (mode === "signup") {
        const { data, error: signError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signError) throw signError;
        if (data.session) {
          router.push(nextPath);
          router.refresh();
        } else {
          setInfo(
            "Account created. If email confirmation is enabled, check your inbox, then log in.",
          );
        }
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginError) throw loginError;
        router.push(nextPath);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[var(--ink)]">
          Email
        </label>
        <Input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[var(--ink)]">
          Password
        </label>
        <Input
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
        />
      </div>
      {error && (
        <p className="rounded-xl bg-[#FEF3F2] px-3 py-2 text-sm text-[#B42318]">
          {error}
        </p>
      )}
      {info && (
        <p className="rounded-xl bg-[#ECFDF3] px-3 py-2 text-sm text-[#027A48]">
          {info}
        </p>
      )}
      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading
          ? "Working…"
          : mode === "signup"
            ? "Create account"
            : "Log in"}
      </Button>
      <p className="text-center text-sm text-[var(--muted)]">
        {mode === "signup" ? (
          <>
            Already learning?{" "}
            <Link href="/login" className="font-semibold text-[var(--ink)]">
              Log in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/signup" className="font-semibold text-[var(--ink)]">
              Start free
            </Link>
          </>
        )}
      </p>
    </form>
  );
}