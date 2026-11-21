import type { Course, Lesson, ProgressRow } from "./types";
import { sqlModules } from "./tracks/sql";
import { tableauModules } from "./tracks/tableau";
import { powerBiModules } from "./tracks/powerbi";
import { pythonModules } from "./tracks/python";
import { rModules } from "./tracks/r";

export const courses: Course[] = [
  {
    id: "sql",
    title: "SQL",
    tagline: "Query the Northstar tables",
    color: "#0F3D3E",
    accent: "#2A9D8F",
    icon: "🗄️",
    modules: sqlModules,
  },
  {
    id: "tableau",
    title: "Tableau",
    tagline: "Build views from line items",
    color: "#1B4332",
    accent: "#52B788",
    icon: "📊",
    modules: tableauModules,
  },
  {
    id: "powerbi",
    title: "Power BI",
    tagline: "Model and measure the same sales",
    color: "#9A3412",
    accent: "#E76F51",
    icon: "⚡",
    modules: powerBiModules,
  },
  {
    id: "python",
    title: "Python",
    tagline: "Script the Northstar book of record",
    color: "#264653",
    accent: "#E9C46A",
    icon: "🐍",
    modules: pythonModules,
  },
  {
    id: "r",
    title: "R",
    tagline: "Vectors, pipes, and charts",
    color: "#1D3557",
    accent: "#457B9D",
    icon: "📈",
    modules: rModules,
  },
];

export function flatLessons(course: Course): Lesson[] {
  return course.modules.flatMap((module) => module.lessons);
}

export function getCourse(courseId: string) {
  return courses.find((course) => course.id === courseId);
}

export function getLesson(courseId: string, lessonId: string) {
  const course = getCourse(courseId);
  if (!course) return null;
  const lessons = flatLessons(course);
  const index = lessons.findIndex((lesson) => lesson.id === lessonId);
  if (index < 0) return null;
  return {
    course,
    lesson: lessons[index],
    index,
    prev: lessons[index - 1] ?? null,
    next: lessons[index + 1] ?? null,
  };
}

export function lessonUnlocked(lessons: Lesson[], index: number, completed: Set<string>) {
  if (index <= 0) return true;
  return completed.has(lessons[index - 1].id);
}

export function resumeTarget(progress: ProgressRow[]) {
  const inProgress = [...progress]
    .filter((row) => row.status !== "completed" && row.current_step > 0)
    .sort((a, b) => String(b.updated_at ?? "").localeCompare(String(a.updated_at ?? "")))[0];
  if (inProgress) return inProgress;
  for (const course of courses) {
    const lessons = flatLessons(course);
    const completed = new Set(progress.filter((row) => row.course_id === course.id && row.status === "completed").map((row) => row.lesson_id));
    const next = lessons.find((lesson, index) => lessonUnlocked(lessons, index, completed) && !completed.has(lesson.id));
    if (next) return { course_id: course.id, lesson_id: next.id, current_step: 0, status: "started" as const };
  }
  return null;
}
