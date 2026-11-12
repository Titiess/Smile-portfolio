import test from "node:test";
import assert from "node:assert/strict";
import {
  slugify,
  splitLines,
  splitTags,
  isAdminModule,
  dateValue,
} from "../../src/lib/admin-modules.ts";

test("slugify generates clean URL-safe slugs", () => {
  assert.equal(slugify("Environmental Impact Assessment"), "environmental-impact-assessment");
  assert.equal(slugify("HSE & Safety Protocols (2026)"), "hse-safety-protocols-2026");
  assert.equal(slugify("  Ughelli Power Station — HSE Review  "), "ughelli-power-station-hse-review");
  assert.equal(slugify("Crème Brûlée & Café"), "creme-brulee-cafe");
  assert.equal(slugify("Multiple---Hyphens___Underlines"), "multiple-hyphens-underlines");
});

test("splitLines parses multiline strings correctly", () => {
  const multiline = "Objective 1\nObjective 2\r\nObjective 3\n\n  \nObjective 4  ";
  const result = splitLines(multiline);
  assert.deepEqual(result, [
    "Objective 1",
    "Objective 2",
    "Objective 3",
    "Objective 4",
  ]);
  assert.deepEqual(splitLines(undefined), []);
  assert.deepEqual(splitLines(""), []);
});

test("splitTags parses comma-separated tags into clean arrays", () => {
  const input = "HSE, Environmental Engineering, , Compliance , Safety";
  const result = splitTags(input);
  assert.deepEqual(result, [
    "HSE",
    "Environmental Engineering",
    "Compliance",
    "Safety",
  ]);
  assert.deepEqual(splitTags(undefined), []);
});

test("isAdminModule validates registered admin modules", () => {
  assert.equal(isAdminModule("projects"), true);
  assert.equal(isAdminModule("articles"), true);
  assert.equal(isAdminModule("research"), true);
  assert.equal(isAdminModule("publications"), true);
  assert.equal(isAdminModule("experience"), true);
  assert.equal(isAdminModule("education"), true);
  assert.equal(isAdminModule("certifications"), true);

  assert.equal(isAdminModule("unknown"), false);
  assert.equal(isAdminModule("users"), false);
  assert.equal(isAdminModule(""), false);
});

test("dateValue parses valid dates and handles invalid inputs", () => {
  const valid = dateValue("2026-03-15");
  assert.ok(valid instanceof Date);
  assert.equal(valid?.toISOString().startsWith("2026-03-15"), true);

  assert.equal(dateValue(undefined), null);
  assert.equal(dateValue(""), null);
  assert.equal(dateValue("not-a-date"), null);
});
