import { readFileSync } from "fs";
import { spawnSync } from "child_process";
import { courses, flatLessons } from "../src/lib/curriculum/courses";
import { pythonDatasetSetup } from "../src/lib/curriculum/datasets";
import { gradeSql } from "../src/lib/sandboxes/sql-runner";
import { gradeR } from "../src/lib/sandboxes/r-engine";
import { gradeBi } from "../src/lib/sandboxes/bi-engine";
import type { LessonStep } from "../src/lib/curriculum/types";

const wasm = new Uint8Array(readFileSync("public/wasm/sql-wasm.wasm"));
const failures: string[] = [];

function fail(message: string) {
  failures.push(message);
}

const lessons = courses.flatMap((course) => flatLessons(course).map((lesson) => ({ course: course.id, lesson })));
const ids = new Set<string>();
const expected = { sql: 19, tableau: 17, powerbi: 17, python: 19, r: 18 };

for (const course of courses) {
  const count = flatLessons(course).length;
  if (count !== expected[course.id as keyof typeof expected]) {
    fail(`${course.id} has ${count} lessons, expected ${expected[course.id as keyof typeof expected]}`);
  }
}

for (const { course, lesson } of lessons) {
  if (ids.has(lesson.id)) fail(`duplicate lesson id ${lesson.id}`);
  ids.add(lesson.id);
  if (lesson.steps.length < 5 || lesson.steps.length > 7) {
    fail(`${lesson.id} has ${lesson.steps.length} steps`);
  }
  for (const step of lesson.steps) checkStep(course, lesson.id, step);
}

const preserved = ["sql-1", "sql-2", "sql-3", "sql-4", "tab-1", "tab-2", "tab-3", "pbi-1", "pbi-2", "pbi-3", "py-1", "py-2", "py-3", "py-4", "r-1", "r-2", "r-3"];
for (const id of preserved) if (!ids.has(id)) fail(`missing preserved lesson ${id}`);

async function checkStep(course: string, lessonId: string, step: LessonStep) {
  if (step.kind === "multiple_choice" && (step.answer < 0 || step.answer >= step.choices.length)) {
    fail(`${lessonId} mcq answer out of range`);
  }
  if (step.kind === "spot_bug") {
    if (step.buggyLine < 0 || step.buggyLine >= step.lines.length) fail(`${lessonId} buggy line`);
    if (step.fixAnswer < 0 || step.fixAnswer >= step.fixChoices.length) fail(`${lessonId} fix answer`);
  }
  if (step.kind === "tap_tokens") {
    const blanks = step.template.filter((token) => token === "").length;
    if (blanks !== step.answer.length) fail(`${lessonId} token blanks ${blanks} != answers ${step.answer.length}`);
  }
  if (step.kind === "sql_sandbox") {
    const graded = await gradeSql(step.solutionQuery, step.solutionQuery, step.requiredClauses, wasm);
    if (!graded.ok) fail(`${lessonId} SQL solution failed: ${graded.message}\n${step.solutionQuery}`);
  }
  if (step.kind === "r_sandbox") {
    const graded = gradeR(step.solutionCode, step.solutionCode, step.expectedExpr, step.checkVariable);
    if (!graded.ok) fail(`${lessonId} R solution failed: ${graded.message}`);
  }
  if (step.kind === "bi_sandbox") {
    const graded = gradeBi(step.targetSpec, step.targetSpec);
    if (!graded.ok) fail(`${lessonId} BI spec failed: ${graded.message}`);
  }
  if (step.kind === "python_sandbox") {
    const script = `${pythonDatasetSetup()}\n${step.setupCode ?? ""}\n${step.solutionCode}\n${step.validationCode}\n`;
    const result = spawnSync("python3", ["-c", script], { encoding: "utf8" });
    if (result.status !== 0) fail(`${lessonId} Python solution failed: ${result.stderr || result.stdout}`);
  }
  void course;
}

Promise.all(lessons.flatMap(({ course, lesson }) => lesson.steps.map((step) => checkStep(course, lesson.id, step)))).then(() => {
  console.log(`Checked ${lessons.length} lessons`);
  if (failures.length) {
    console.error(failures.join("\n\n"));
    process.exit(1);
  }
  console.log("Curriculum checks passed");
});
