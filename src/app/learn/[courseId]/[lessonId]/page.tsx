import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { LessonPlayer } from "@/components/lesson-player";
import { getLesson } from "@/lib/curriculum/courses";
import { createClient } from "@/lib/supabase/server";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  const found = getLesson(courseId, lessonId);
  if (!found) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/learn/${courseId}/${lessonId}`);

  const { course, lesson, index, next } = found;
  const nextHref = next
    ? `/learn/${course.id}/${next.id}`
    : null;

  return (
    <>
      <SiteHeader userEmail={user.email} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-5 flex items-center justify-between gap-3 text-sm">
          <Link
            href={`/learn/${course.id}`}
            className="font-medium text-[var(--muted)] hover:text-[var(--ink)]"
          >
            ← {course.title}
          </Link>
          <span className="text-[var(--muted)]">
            Lesson {index + 1} of {course.lessons.length}
          </span>
        </div>
        <LessonPlayer
          courseId={course.id}
          lesson={lesson}
          nextHref={nextHref}
        />
      </main>
    </>
  );
}