import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { flatLessons, getCourse, lessonUnlocked } from "@/lib/curriculum/courses";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export default async function CoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { courseId } = await params;
  const { tab } = await searchParams;
  const course = getCourse(courseId);
  if (!course) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/learn/${courseId}`);

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id, status, current_step")
    .eq("user_id", user.id)
    .eq("course_id", courseId);

  const done = new Set((progress ?? []).filter((row) => row.status === "completed").map((row) => row.lesson_id));
  const steps = new Map((progress ?? []).map((row) => [row.lesson_id, row.current_step as number]));
  const lessons = flatLessons(course);
  const nextLesson = lessons.find((lesson, index) => lessonUnlocked(lessons, index, done) && !done.has(lesson.id)) ?? lessons[0];

  return (
    <>
      <SiteHeader userEmail={user.email} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <Link href="/learn" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)]">← All tracks</Link>
        <div className="mt-4 flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl" style={{ background: `${course.accent}22` }}>{course.icon}</div>
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">{course.title}</h1>
            <p className="mt-1 text-[var(--muted)]">{course.tagline}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href={`/learn/${course.id}/${nextLesson.id}`}><Button size="lg">{done.size === 0 ? "Start first lesson" : "Continue"}</Button></Link>
          <Link href={tab === "sheet" ? `/learn/${course.id}` : `/learn/${course.id}?tab=sheet`}><Button variant="secondary" size="lg">{tab === "sheet" ? "Path" : "Cheat sheet"}</Button></Link>
        </div>

        {tab === "sheet" ? (
          <div className="mt-8 space-y-4">
            {course.modules.map((module, moduleIndex) => {
              const firstIndex = lessons.findIndex((lesson) => lesson.moduleId === module.id);
              const unlocked = lessonUnlocked(lessons, firstIndex, done);
              return (
                <section key={module.id} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5">
                  <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">{module.title}</h2>
                  {unlocked ? module.cheatsheet.map((sheet) => (
                    <div key={sheet.title} className="mt-3">
                      <p className="text-sm font-semibold text-[var(--ink)]">{sheet.title}</p>
                      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-[var(--muted)]">
                        {sheet.items.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                  )) : <p className="mt-2 text-sm text-[var(--muted)]">Finish module {moduleIndex === 0 ? "the first lesson" : course.modules[moduleIndex - 1].title} to open this sheet.</p>}
                </section>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {course.modules.map((module) => {
              const moduleLessons = module.lessons;
              const moduleDone = moduleLessons.filter((lesson) => done.has(lesson.id)).length;
              return (
                <section key={module.id}>
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">{module.title}</h2>
                      <p className="text-sm text-[var(--muted)]">{module.summary}</p>
                    </div>
                    <span className="text-xs font-semibold text-[var(--muted)]">{moduleDone}/{moduleLessons.length}</span>
                  </div>
                  <ol className="mt-3 space-y-3">
                    {moduleLessons.map((lesson) => {
                      const index = lessons.findIndex((item) => item.id === lesson.id);
                      const unlocked = lessonUnlocked(lessons, index, done);
                      const completed = done.has(lesson.id);
                      const started = (steps.get(lesson.id) ?? 0) > 0 && !completed;
                      const body = (
                        <div className={cn("flex items-center gap-4 rounded-2xl border px-4 py-4", completed ? "border-[var(--accent)]/40 bg-[var(--accent)]/5" : "border-[var(--line)] bg-[var(--surface)]/70", !unlocked && "opacity-60")}>
                          <span className={cn("flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold", completed ? "bg-[var(--accent)] text-[var(--accent-fg)]" : "bg-[var(--surface-2)] text-[var(--muted)]")}>
                            {completed ? "✓" : unlocked ? index + 1 : "•"}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-[var(--ink)]">{lesson.title} {lesson.capstone ? "· Capstone" : ""}</p>
                            <p className="text-sm text-[var(--muted)]">{lesson.minutes} min{started ? ` · step ${steps.get(lesson.id)}` : ""}{!unlocked ? " · locked" : ""}</p>
                          </div>
                        </div>
                      );
                      return <li key={lesson.id}>{unlocked ? <Link href={`/learn/${course.id}/${lesson.id}`}>{body}</Link> : body}</li>;
                    })}
                  </ol>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
