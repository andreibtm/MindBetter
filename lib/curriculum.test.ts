import assert from "node:assert/strict";
import test from "node:test";

import {
  ALL_LESSONS,
  COURSE_UNITS,
  FOUNDATION_CONTENT,
  getNextLessonId,
  isLessonPlayable,
} from "./curriculum.ts";

test("curriculum contains eight progressive units and fifty unique lessons", () => {
  assert.equal(COURSE_UNITS.length, 8);
  assert.equal(ALL_LESSONS.length, 50);
  assert.equal(new Set(ALL_LESSONS.map((lesson) => lesson.id)).size, 50);
});

test("next lesson follows the curriculum sequence", () => {
  assert.equal(getNextLessonId([]), "foundation-baseline");
  assert.equal(
    getNextLessonId(["foundation-baseline", "foundation-attention"]),
    "foundation-association",
  );
  assert.equal(getNextLessonId(ALL_LESSONS.map((lesson) => lesson.id)), null);
});

test("the complete foundation unit is playable", () => {
  for (const lesson of COURSE_UNITS[0].lessons) {
    assert.equal(isLessonPlayable(lesson.id), true);
    if (lesson.id !== "foundation-association") {
      assert.ok(FOUNDATION_CONTENT[lesson.id]?.length);
    }
  }
  assert.equal(isLessonPlayable("palace-why-space"), false);
});
