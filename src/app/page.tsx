import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { courses } from "@/lib/curriculum/courses";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <SiteHeader userEmail={user?.email} />
      <main className="relative flex-1 overflow-hidden">
        <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              Data skills, five minutes at a time
            </p>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl leading-[1.05] tracking-tight text-[var(--ink)] sm:text-6xl lg:text-7xl">
              DataTrail
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--muted)]">
              Interactive lessons for SQL, Tableau, Power BI, Python, and R —
              built for phone and laptop. Sign in once, and your progress stays
              with you.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={user ? "/learn" : "/signup"}>
                <Button size="lg">
                  {user ? "Continue learning" : "Start learning free"}
                </Button>
              </Link>
              <Link href="/learn">
                <Button size="lg" variant="secondary">
                  Browse tracks
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_30%_20%,rgba(244,162,97,0.35),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(15,118,110,0.25),transparent_50%)] blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]/90 p-6 shadow-lg backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Your path
              </p>
              <ul className="mt-4 space-y-3">
                {courses.map((course, i) => (
                  <li
                    key={course.id}
                    className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--bg)]/70 px-4 py-3"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <span className="text-xl">{course.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[var(--ink)]">
                        {course.title}
                      </p>
                      <p className="truncate text-sm text-[var(--muted)]">
                        {course.tagline}
                      </p>
                    </div>
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: course.accent }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--line)]/80 bg-[var(--surface)]/50">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-3">
            {[
              {
                title: "Short lessons",
                body: "Each step teaches one idea, then asks you to prove it with a quick exercise.",
              },
              {
                title: "Hands-on practice",
                body: "Write SQL, Python, and R. Order Tableau steps. Answer Power BI concept checks.",
              },
              {
                title: "Saved progress",
                body: "Create an account so completed lessons sync across your devices.",
              },
            ].map((item) => (
              <div key={item.title}>
                <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
                  {item.title}
                </h2>
                <p className="mt-2 text-[var(--muted)]">{item.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}