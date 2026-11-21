import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { CourseCard } from "@/components/course-card";
import { Button } from "@/components/ui/button";
import { courses, flatLessons, resumeTarget } from "@/lib/curriculum/courses";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { ProgressRow } from "@/lib/curriculum/types";

export default async function LearnPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/learn");

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("course_id, lesson_id, status, score, current_step, xp_earned, completed_at, updated_at")
    .eq("user_id", user.id);

  const rows = (progress ?? []) as ProgressRow[];
  const completedByCourse = new Map<string, Set<string>>();
  for (const row of rows) {
    if (row.status !== "completed") continue;
    const set = completedByCourse.get(row.course_id) ?? new Set();
    set.add(row.lesson_id);
    completedByCourse.set(row.course_id, set);
  }

  const totalCompleted = rows.filter((row) => row.status === "completed").length;
  const totalLessons = courses.reduce((sum, course) => sum + flatLessons(course).length, 0);
  const xp = rows.reduce((sum, row) => sum + (row.xp_earned ?? 0), 0);
  const resume = resumeTarget(rows);
  const resumeLesson = resume ? courses.flatMap((course) => flatLessons(course).map((lesson) => ({ course, lesson }))).find((item) => item.course.id === resume.course_id && item.lesson.id === resume.lesson_id) : null;

  return (
    <>
      <SiteHeader userEmail={user.email} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Learning hub</p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-[var(--ink)] sm:text-5xl">Pick a track</h1>
            <p className="mt-2 text-[var(--muted)]">{totalCompleted} of {totalLessons} lessons · {xp} XP</p>
          </div>
          <form action="/auth/signout" method="post">
            <Button variant="secondary" type="submit">Sign out</Button>
          </form>
        </div>

        {resumeLesson && (
          <Link href={`/learn/${resumeLesson.course.id}/${resumeLesson.lesson.id}`} className="mt-6 block rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Continue learning</p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">{resumeLesson.course.title} · {resumeLesson.lesson.title}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">{resumeLesson.course.modules.find((module) => module.id === resumeLesson.lesson.moduleId)?.title}</p>
          </Link>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, index) => (
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.title}
              tagline={course.tagline}
              color={course.color}
              accent={course.accent}
              icon={course.icon}
              completed={completedByCourse.get(course.id)?.size ?? 0}
              total={flatLessons(course).length}
              index={index}
            />
          ))}
        </div>
      </main>
    </>
  );
}
