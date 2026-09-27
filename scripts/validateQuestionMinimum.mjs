import fs from "node:fs";

const chapters = JSON.parse(fs.readFileSync("data/chapters.json", "utf8")).chapters;
const questions = JSON.parse(fs.readFileSync("data/questions.json", "utf8"));

const counts = new Map();
for (const q of questions) counts.set(q.chapterId, (counts.get(q.chapterId) ?? 0) + 1);

const missing = chapters
  .map(c => ({ id: c.id, title: c.ncertChapter, count: counts.get(c.id) ?? 0 }))
  .filter(x => x.count < 60 || x.count > 200);

console.log(`Chapters: ${chapters.length}`);
console.log(`Questions: ${questions.length}`);
console.log(`Required range: 60–200 questions per chapter`);
console.log(`Chapters outside range: ${missing.length}`);

if (missing.length) {
  for (const x of missing) console.log(`- ${x.id}: ${x.title} — ${x.count} (must be 60–200)`);
  process.exitCode = 1;
} else {
  console.log("PASS: every chapter has 60–200 questions.");
}
