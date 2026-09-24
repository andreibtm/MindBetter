import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeAnswer,
  scoreAnswers,
  type StoredAnswer,
} from "./memory-storage.ts";

test("normalizes case, whitespace, and conservative trailing punctuation", () => {
  assert.equal(normalizeAnswer("  PINEAPPLE!!!  "), "pineapple");
  assert.equal(normalizeAnswer("roller skate."), "roller skate");
});

test("does not erase meaningful internal punctuation", () => {
  assert.equal(normalizeAnswer("mother-in-law"), "mother-in-law");
});

test("scores only normalized exact matches", () => {
  const answers: StoredAnswer[] = [
    { raw: "PINEAPPLE!", normalized: normalizeAnswer("PINEAPPLE!") },
    { raw: "stairs", normalized: normalizeAnswer("stairs") },
    { raw: "roller skate", normalized: normalizeAnswer("roller skate") },
  ];

  assert.equal(
    scoreAnswers(answers, ["Pineapple", "Ladder", "Roller skate"]),
    2,
  );
});

