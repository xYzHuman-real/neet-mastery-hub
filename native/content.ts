import questionData from "../data/questions.json";
import chapterData from "../data/chapters.json";

export type ContentMode = "ncert" | "mcq" | "ar" | "pyq" | "revision";

export type NativeQuestion = {
  id: string;
  chapterId: string;
  mode: "mcq" | "ar" | "pyq";
  prompt: string;
  options: string[];
  answer: number;
  difficulty: "easy" | "medium" | "hard";
  explanation?: string;
  reviewStatus: "draft" | "reviewed" | "verified";
  sourceType: "ncert_based" | "original_neet_style" | "pyq";
  topicId?: string;
  citation?: { book?: string; chapter?: string; page?: number | null; line?: number | null; reference?: string };
};

export type NativeChapter = {
  id: string;
  subject: "physics" | "chemistry" | "biology";
  classLevel: 11 | 12;
  name: string;
  unitId: string;
  topics: string[];
};

const rawChapters = (chapterData as any).chapters as any[];
const rawQuestions = (questionData as any).questions as any[];

export const CHAPTERS = rawChapters.map((c) => ({
  id: c.id,
  subject: String(c.subject).toLowerCase() as NativeChapter["subject"],
  classLevel: c.class as 11 | 12,
  name: c.ncertChapter,
  unitId: c.unitId,
  topics: c.topics ?? [],
})) as NativeChapter[];

export const QUESTIONS = rawQuestions
  .filter((q) => Array.isArray(q.options) && q.options.length >= 2 && Number.isInteger(q.answer))
  .map((q) => ({
    id: q.id,
    chapterId: q.chapterId,
    mode: q.sourceType === "pyq" && q.pyq?.verified ? "pyq" : q.type === "statement" ? "ar" : "mcq",
    prompt: q.question,
    options: q.options,
    answer: q.answer,
    difficulty: q.difficulty,
    explanation: q.explanation,
    reviewStatus: q.reviewStatus,
    sourceType: q.sourceType,
    topicId: q.topicId,
    citation: q.citation,
  })) as NativeQuestion[];

export const SUBJECTS = [
  { id: "physics" as const, name: "Physics", emoji: "⚛" },
  { id: "chemistry" as const, name: "Chemistry", emoji: "⚗" },
  { id: "biology" as const, name: "Biology", emoji: "🧬" },
];

export const MODES: { id: ContentMode; label: string; desc: string }[] = [
  { id: "ncert", label: "NCERT Line-by-Line", desc: "NCERT-aligned recall" },
  { id: "mcq", label: "MCQ Series", desc: "NEET-style practice" },
  { id: "ar", label: "Assertion & Reason", desc: "Statement logic" },
  { id: "pyq", label: "PYQ Series", desc: "Verified previous-year questions" },
  { id: "revision", label: "Revision Series", desc: "Mixed active recall" },
];

export function chapterById(id?: string) {
  return CHAPTERS.find((c) => c.id === id);
}

export function questionById(id?: string) {
  return QUESTIONS.find((q) => q.id === id);
}

export function filterQuestions(chapterId?: string, mode?: ContentMode) {
  let list = QUESTIONS;
  if (chapterId) list = list.filter((q) => q.chapterId === chapterId);
  if (!mode || mode === "revision") return list;
  if (mode === "ncert") return list.filter((q) => q.sourceType === "ncert_based");
  return list.filter((q) => q.mode === mode);
}

export function chapterQuestionCount(chapterId: string, mode: ContentMode) {
  return filterQuestions(chapterId, mode).length;
}
