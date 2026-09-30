import fs from "node:fs";
import path from "node:path";

const chapters = JSON.parse(fs.readFileSync("data/chapters.json", "utf8")).chapters;
const authoredRoot = process.argv[2] || "generated-authored";
const SERIES = ["ncert", "mcq", "ar", "pyq", "revision"];

function norm(s) {
  return String(s ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}
function tokens(s) {
  return new Set(norm(s).replace(/[^a-z0-9]+/g, " ").split(" ").filter(x => x.length > 3));
}
function similarity(a, b) {
  const A = tokens(a), B = tokens(b);
  if (!A.size || !B.size) return 0;
  let hit = 0;
  for (const x of A) if (B.has(x)) hit++;
  return hit / Math.min(A.size, B.size);
}
function filesUnder(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name);
    if (name.isDirectory()) out.push(...filesUnder(p));
    else if (name.isFile() && name.name.endsWith(".json")) out.push(p);
  }
  return out;
}

const files = filesUnder(authoredRoot);
const byChapter = new Map();
for (const file of files) {
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!data.chapterId || !Array.isArray(data.questions)) continue;
  byChapter.set(data.chapterId, data.questions);
}

const all = [];
const errors = [];
const globalPromptKeys = new Set();
const globalIds = new Set();

for (const ch of chapters) {
  const target = Math.max(61, Math.min(199, Number(ch.questionTarget) || 61));
  const items = byChapter.get(ch.id);
  if (!items) {
    errors.push(ch.id + ": authored file missing");
    continue;
  }

  const counts = Object.fromEntries(SERIES.map(s => [s, 0]));
  const localPrompts = [];
  const localIds = new Set();

  for (const q of items) {
    const series = q.series || q.mode;
    if (!SERIES.includes(series)) {
      errors.push(ch.id + ": invalid series " + series);
      continue;
    }
    if (q.chapterId !== ch.id) errors.push(ch.id + ": wrong chapterId on " + q.id);
    if (!q.id || localIds.has(q.id) || globalIds.has(q.id)) errors.push(ch.id + ": duplicate id " + q.id);
    localIds.add(q.id); globalIds.add(q.id);

    const prompt = String(q.prompt || q.question || "").trim();
    if (!prompt) errors.push(ch.id + "/" + series + ": empty prompt");
    const key = norm(prompt);
    if (localPrompts.some(x => similarity(x, prompt) >= 0.86)) {
      errors.push(ch.id + ": near-duplicate prompt detected: " + prompt.slice(0, 100));
    }
    localPrompts.push(prompt);
    if (globalPromptKeys.has(key)) errors.push("global duplicate prompt: " + prompt.slice(0, 100));
    globalPromptKeys.add(key);

    if (!Array.isArray(q.options) || q.options.length !== 4) errors.push(ch.id + "/" + series + ": " + q.id + " must have exactly 4 options");
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) errors.push(ch.id + "/" + series + ": " + q.id + " invalid answer index");
    if (/(variant|draft question|practice variant|placeholder|dummy)/i.test(prompt)) errors.push(ch.id + "/" + series + ": artificial wording in prompt");

    if (series === "ar") {
      if (!String(q.assertion || "").trim() || !String(q.reason || "").trim()) errors.push(ch.id + "/ar: " + q.id + " missing assertion/reason");
      const arOptions = [
        "Both A and R are true, and R is the correct explanation of A.",
        "Both A and R are true, but R is not the correct explanation of A.",
        "A is true, but R is false.",
        "A is false, but R is true."
      ];
      if (JSON.stringify(q.options) !== JSON.stringify(arOptions)) errors.push(ch.id + "/ar: " + q.id + " has non-standard A/R options");
    }

    counts[series]++;
    all.push({
      ...q,
      prompt,
      question: prompt,
      series,
      mode: series === "ncert" ? "ncert" : series === "pyq" ? "pyq" : series,
      sourceType: series === "pyq" ? "pyq_style_original" : "ncert_derived_original",
      sourceLicense: "original_authoring",
      sourceId: "buzneet-nta-authoring-v1",
      reviewStatus: "draft",
      quality: { ...(q.quality || {}), aiAuthored: true, requiresHumanReview: true, conceptuallyUnique: true }
    });
  }

  for (const s of SERIES) {
    if (counts[s] !== target) errors.push(ch.id + "/" + s + ": expected exactly " + target + ", got " + counts[s]);
    const answers = items.filter(q => (q.series || q.mode) === s).map(q => q.answer);
    const answerCounts = [0,1,2,3].map(i => answers.filter(a => a === i).length);
    if (answers.length && Math.min(...answerCounts) < Math.max(2, Math.floor(answers.length * 0.08))) {
      errors.push(ch.id + "/" + s + ": answer positions are too imbalanced " + answerCounts.join("/"));
    }
  }
}

if (errors.length) {
  console.error("QUESTION BANK AUTHORING VALIDATION FAILED");
  for (const e of errors.slice(0, 250)) console.error(" - " + e);
  console.error("Total errors: " + errors.length);
  process.exit(1);
}

const policy = {
  minimumPerSeriesPerChapter: 61,
  maximumPerSeriesPerChapter: 199,
  exactTargetPerChapterSeries: true,
  series: SERIES,
  authoringStandard: "NTA-style original practice authored with NCERT grounding; not official NTA material",
  pyqSeriesMode: "original paraphrased PYQ-derived practice; not verbatim official PYQs",
  noVerbatimCopyrightedPYQs: true,
  noInventedNCERTPageCitations: true,
  semanticDuplicateThreshold: 0.86
};

fs.writeFileSync("data/questions.json", JSON.stringify({
  version: "6.0",
  description: "AI-authored NEET practice bank with NTA-style construction, semantic duplicate checks and balanced answer positions.",
  policy,
  questions: all
}, null, 2) + "\n");

fs.writeFileSync("data/questionBank.json", JSON.stringify({
  version: "4.0",
  policy,
  questions: all
}, null, 2) + "\n");

console.log("AUTHORED BANK COMPLETE: " + all.length + " questions across " + chapters.length + " chapters and " + SERIES.length + " series.");
