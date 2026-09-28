import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const SOURCE_URL = "https://huggingface.co/datasets/Kshitij-PES/NEET_Dataset/resolve/main/dataset.json";
const SOURCE = {
  id: "kshitij-pes-neet-dataset",
  name: "Kshitij-PES NEET Previous Year Questions",
  url: "https://huggingface.co/datasets/Kshitij-PES/NEET_Dataset",
  license: "Apache-2.0",
  attribution: "Kshitij Gupta (Kshitij-PES)"
};

const chapters = JSON.parse(await fs.readFile(path.join(ROOT, "data/chapters.json"), "utf8")).chapters;

const normalize = (s) => String(s ?? "").toLowerCase().replace(/[^a-z0-9+.-]+/g, " ");
const stop = new Set(["and","the","of","in","to","a","an","for","with","their","its","is","are","from","on","by"]);

function tokens(s) {
  return normalize(s).split(/\s+/).filter(x => x.length > 2 && !stop.has(x));
}

function mapChapter(q) {
  const subject = String(q.subject ?? "").toLowerCase();
  const pool = chapters.filter(c => String(c.subject).toLowerCase() === subject);
  const hay = normalize([q.question, q.brief_explanation].join(" "));
  let best = null;
  let bestScore = 0;
  for (const c of pool) {
    const terms = [...tokens(c.ncertChapter), ...(c.topics ?? []).flatMap(tokens)];
    let score = 0;
    for (const t of terms) {
      if (t.length > 3 && hay.includes(t)) score += t.length >= 7 ? 2 : 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return best?.id ?? null;
}

function optionsArray(value) {
  if (Array.isArray(value)) return value.map(String);
  if (!value || typeof value !== "object") return [];
  return Object.keys(value).sort((a,b) => Number(a)-Number(b)).map(k => String(value[k]));
}

const response = await fetch(SOURCE_URL);
if (!response.ok) throw new Error(`Failed to download source: ${response.status} ${response.statusText}`);
const raw = await response.json();
const rows = Array.isArray(raw) ? raw : Array.isArray(raw.data) ? raw.data : Array.isArray(raw.train) ? raw.train : [];

const questions = [];
const seen = new Set();
for (const q of rows) {
  const options = optionsArray(q.options);
  const answerKey = String(q.correct_answer_key ?? q.answer ?? "");
  const answer = /^\d+$/.test(answerKey) ? Number(answerKey) - 1 : Math.max(0, "ABCD".indexOf(answerKey.toUpperCase()));
  const prompt = String(q.question ?? "").trim();
  if (!prompt || options.length < 4 || answer < 0 || answer >= options.length) continue;
  const id = String(q.question_id ?? `${SOURCE.id}-${questions.length + 1}`);
  const dedupe = normalize(prompt);
  if (seen.has(dedupe)) continue;
  seen.add(dedupe);
  questions.push({
    id: `licensed-${id}`,
    chapterId: mapChapter(q),
    series: "pyq",
    mode: "pyq",
    prompt,
    options,
    answer,
    difficulty: "medium",
    explanation: String(q.brief_explanation ?? "").trim() || "Answer verified against the licensed source dataset.",
    reviewStatus: "reviewed",
    sourceType: "pyq",
    citation: {
      reference: SOURCE.url,
      book: SOURCE.name,
      chapter: q.subject ? String(q.subject) : undefined
    },
    sourceLicense: SOURCE.license,
    sourceId: SOURCE.id,
    sourceQuestionId: id
  });
}

await fs.writeFile(
  path.join(ROOT, "data/licensedQuestions.json"),
  JSON.stringify({ version: "1.0", generatedAt: new Date().toISOString(), source: SOURCE, questions }, null, 2) + "\n"
);

const unmapped = questions.filter(q => !q.chapterId).length;
console.log(`Imported ${questions.length} licensed questions; ${unmapped} remain unmapped.`);
