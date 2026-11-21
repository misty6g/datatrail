import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { CourseCard } from "@/components/course-card";
import { Button } from "@/components/ui/button";
import { courses } from "@/lib/curriculum/courses";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LearnPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/learn");

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("course_id, lesson_id, status")
    .eq("user_id", user.id)
    .eq("status", "completed");

  const completedByCourse = new Map<string, Set<string>>();
  for (const row of progress ?? []) {
    const set = completedByCourse.get(row.course_id) ?? new Set();
    set.add(row.lesson_id);
    completedByCourse.set(row.course_id, set);
  }

  const totalCompleted = progress?.length ?? 0;
  const totalLessons = courses.reduce((n, c) => n + c.lessons.length, 0);

  return (
    <>
      <SiteHeader userEmail={user.email} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Learning hub
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-[var(--ink)] sm:text-5xl">
              Pick a track
            </h1>
            <p className="mt-2 text-[var(--muted)]">
              {totalCompleted} of {totalLessons} lessons completed
            </p>
          </div>
          <form action="/auth/signout" method="post">
            <Button variant="secondary" type="submit">
              Sign out
            </Button>
          </form>
        </div>

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
              total={course.lessons.length}
              index={index}
            />
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-[var(--muted)]">
          Inspired by bite-sized coding apps — rebuilt as an original DataTrail
          experience.{" "}
          <Link href="/" className="underline">
            Home
          </Link>
        </p>
      </main>
    </>
  );
}