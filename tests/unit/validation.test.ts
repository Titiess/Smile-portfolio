import test from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";

const enquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(10).max(5000),
  website: z.string().max(200).optional(),
});

test("enquirySchema accepts valid contact submissions", () => {
  const valid = {
    name: "Dr. Jane Smith",
    email: "jane.smith@example.com",
    subject: "Environmental Consultation",
    message: "We would like to discuss an environmental management audit.",
  };
  const result = enquirySchema.safeParse(valid);
  assert.equal(result.success, true);
});

test("enquirySchema rejects invalid email addresses", () => {
  const invalid = {
    name: "Jane",
    email: "not-an-email",
    subject: "HSE Consultation",
    message: "Detailed message text here with sufficient length.",
  };
  const result = enquirySchema.safeParse(invalid);
  assert.equal(result.success, false);
});

test("enquirySchema enforces message minimum length", () => {
  const tooShort = {
    name: "Jane",
    email: "jane@example.com",
    subject: "HSE Consultation",
    message: "Hi",
  };
  const result = enquirySchema.safeParse(tooShort);
  assert.equal(result.success, false);
});

test("enquirySchema identifies honeypot bot trap", () => {
  const spam = {
    name: "Spam Bot",
    email: "bot@spam.com",
    subject: "Free SEO",
    message: "Buy cheap backlinks now from this spam site.",
    website: "https://spam.example.com",
  };
  const result = enquirySchema.safeParse(spam);
  assert.equal(result.success, true);
  assert.ok(Boolean(result.data?.website));
});
