import fs from "node:fs";

const chapters = JSON.parse(fs.readFileSync("data/chapters.json", "utf8")).chapters;
const bank = JSON.parse(fs.readFileSync("data/questionBank.json", "utf8")).questions;
const licensedPath = "data/licensedQuestions.json";
const licensed = fs.existsSync(licensedPath)
  ? JSON.parse(fs.readFileSync(licensedPath, "utf8")).questions
  : [];

const all = [...licensed, ...bank];
const series = ["ncert", "mcq", "ar", "pyq", "revision"];
const chapterIds = new Set(chapters.map(c => c.id));
const topicMap = new Map(chapters.map(c => [c.id, new Set(c.topics ?? [])]));
const errors = [];
const seenIds = new Set();
const seenPrompts = new Set();
const poolCounts = new Map();

for (const q of all) {
  if (!q || typeof q !== "object") { errors.push("Invalid question object"); continue; }
  if (!q.id) errors.push("Missing question id");
  else if (seenIds.has(q.id)) errors.push(`Duplicate ID: ${q.id}`);
  else seenIds.add(q.id);

  const prompt = String(q.prompt ?? "").trim().toLowerCase().replace(/\s+/g, " ");
  if (!prompt) errors.push(`Missing prompt: ${q.id}`);
  else if (seenPrompts.has(prompt)) errors.push(`Duplicate prompt: ${q.id}`);
  else seenPrompts.add(prompt);

  if (!chapterIds.has(q.chapterId)) errors.push(`Invalid chapter ${q.chapterId}: ${q.id}`);
  if (!series.includes(q.series)) errors.push(`Invalid series ${q.series}: ${q.id}`);
  if (!Array.isArray(q.options) || q.options.length !== 4) errors.push(`Expected 4 options: ${q.id}`);
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= (q.options?.length ?? 0)) errors.push(`Invalid answer: ${q.id}`);
  if (!String(q.explanation ?? "").trim()) errors.push(`Missing explanation: ${q.id}`);
  if (!q.difficulty || !["easy","medium","hard"].includes(q.difficulty)) errors.push(`Invalid difficulty: ${q.id}`);
  if (q.series === "ar" && (!String(q.assertion ?? "").trim() || !String(q.reason ?? "").trim())) {
    errors.push(`Incomplete A/R: ${q.id}`);
  }
  if (q.series === "pyq" && q.sourceType === "pyq" && !q.sourceQuestionId && !q.sourceId) {
    errors.push(`Unverified PYQ provenance: ${q.id}`);
  }
  if (q.topicId && topicMap.has(q.chapterId) && !topicMap.get(q.chapterId).has(q.topicId)) {
    errors.push(`Invalid topicId ${q.topicId}: ${q.id}`);
  }

  const key = `${q.chapterId}::${q.series}`;
  poolCounts.set(key, (poolCounts.get(key) ?? 0) + 1);
}

for (const chapter of chapters) {
  for (const s of series) {
    const key = `${chapter.id}::${s}`;
    const n = poolCounts.get(key) ?? 0;
    if (n < 61 || n > 199) errors.push(`INVALID POOL ${chapter.id} / ${s}: ${n}`);
  }
}

const invalidPools = [];
for (const chapter of chapters) {
  for (const s of series) {
    const n = poolCounts.get(`${chapter.id}::${s}`) ?? 0;
    if (n < 61 || n > 199) invalidPools.push([chapter.id, s, n]);
  }
}

console.log(`Chapters: ${chapters.length}`);
console.log(`Series: ${series.length}`);
console.log(`Pools: ${chapters.length * series.length}`);
console.log(`Questions: ${all.length}`);
console.log(`Invalid pools: ${invalidPools.length}`);
console.log(`Validation errors: ${errors.length}`);

if (invalidPools.length) {
  console.log("\nInvalid pools:");
  for (const [c,s,n] of invalidPools) console.log(`  ${c} / ${s}: ${n}`);
}
if (errors.length) {
  console.log("\nFirst 100 errors:");
  for (const e of errors.slice(0,100)) console.log("  " + e);
}

if (errors.length) process.exit(1);
