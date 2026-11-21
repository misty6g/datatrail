import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLesson } from "@/lib/curriculum/courses";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("lesson_progress")
    .select("course_id, lesson_id, status, score, current_step, xp_earned, completed_at, updated_at")
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ progress: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const courseId = String(body.courseId ?? "");
  const lessonId = String(body.lessonId ?? "");
  const status = body.status === "completed" ? "completed" : "started";
  const score = typeof body.score === "number" ? body.score : null;
  const found = getLesson(courseId, lessonId);
  if (!found) {
    return NextResponse.json({ error: "Unknown lesson" }, { status: 400 });
  }

  const requestedStep = Number(body.currentStep ?? 0);
  const currentStep = Number.isFinite(requestedStep)
    ? Math.max(0, Math.min(found.lesson.steps.length, Math.floor(requestedStep)))
    : 0;
  const xpEarned = typeof body.xpEarned === "number"
    ? Math.max(0, Math.min(found.lesson.steps.length * 20 + 30, Math.floor(body.xpEarned)))
    : currentStep * 20;

  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: user.id,
      course_id: courseId,
      lesson_id: lessonId,
      status,
      score,
      current_step: currentStep,
      xp_earned: xpEarned,
      completed_at: status === "completed" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,course_id,lesson_id" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
