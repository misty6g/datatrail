import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { SiteHeader } from "@/components/site-header";

export default function SignupPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <Link
          href="/"
          className="mb-6 text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)]"
        >
          ← DataTrail
        </Link>
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">
          Start free
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Create an account so your lesson progress is saved.
        </p>
        <div className="mt-8 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm">
          <AuthForm mode="signup" />
        </div>
      </main>
    </>
  );
}