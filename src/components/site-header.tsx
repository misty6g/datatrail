import Link from "next/link";
import { Button } from "./ui/button";

export function SiteHeader({
  userEmail,
}: {
  userEmail?: string | null;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)]/70 bg-[var(--bg)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-[family-name:var(--font-display)] text-2xl tracking-tight text-[var(--ink)]">
          DataTrail
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/learn"
            className="hidden text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)] sm:inline"
          >
            Tracks
          </Link>
          {userEmail ? (
            <>
              <span className="hidden max-w-[10rem] truncate text-sm text-[var(--muted)] md:inline">
                {userEmail}
              </span>
              <Link href="/learn">
                <Button size="sm">Continue</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Start free</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}