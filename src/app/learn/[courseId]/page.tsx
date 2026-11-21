import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { getCourse } from "@/lib/curriculum/courses";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = getCourse(courseId);
  if (!course) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/learn/${courseId}`);

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id, status")
    .eq("user_id", user.id)
    .eq("course_id", courseId);

  const done = new Set(
    (progress ?? [])
      .filter((p) => p.status === "completed")
      .map((p) => p.lesson_id),
  );

  const nextLesson =
    course.lessons.find((l) => !done.has(l.id)) ?? course.lessons[0];

  return (
    <>
      <SiteHeader userEmail={user.email} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <Link
          href="/learn"
          className="text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)]"
        >
          ← All tracks
        </Link>
        <div className="mt-4 flex items-start gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl"
            style={{ background: `${course.accent}22` }}
          >
            {course.icon}
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">
              {course.title}
            </h1>
            <p className="mt-1 text-[var(--muted)]">{course.tagline}</p>
          </div>
        </div>

        <div className="mt-6">
          <Link href={`/learn/${course.id}/${nextLesson.id}`}>
            <Button size="lg">
              {done.size === 0 ? "Start first lesson" : "Continue"}
            </Button>
          </Link>
        </div>

        <ol className="mt-8 space-y-3">
          {course.lessons.map((lesson, i) => {
            const completed = done.has(lesson.id);
            return (
              <li key={lesson.id}>
                <Link
                  href={`/learn/${course.id}/${lesson.id}`}
                  className={cn(
                    "flex items-center gap-4 rounded-2xl border px-4 py-4 transition hover:bg-[var(--surface)]",
                    completed
                      ? "border-[var(--accent)]/40 bg-[var(--accent)]/5"
                      : "border-[var(--line)] bg-[var(--surface)]/70",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold",
                      completed
                        ? "bg-[var(--accent)] text-[var(--accent-fg)]"
                        : "bg-[var(--surface-2)] text-[var(--muted)]",
                    )}
                  >
                    {completed ? "✓" : i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[var(--ink)]">
                      {lesson.title}
                    </p>
                    <p className="text-sm text-[var(--muted)]">
                      {lesson.minutes} min
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      </main>
    </>
  );
}