import { CHAPTERS, type NativeQuestion } from "./content";

export function buildAnalytics(questions: NativeQuestion[], answered: Record<string, boolean>, history: any[]) {
  const attempted = Object.keys(answered);
  const correct = attempted.filter(id => answered[id]).length;
  const accuracy = attempted.length ? Math.round(correct / attempted.length * 100) : 0;
  const chapterStats = CHAPTERS.map(ch => {
    const ids = questions.filter(q => q.chapterId === ch.id).map(q => q.id);
    const a = ids.filter(id => id in answered);
    const c = a.filter(id => answered[id]).length;
    return { ...ch, attempted: a.length, correct: c, accuracy: a.length ? Math.round(c / a.length * 100) : 0 };
  }).filter(x => x.attempted > 0);
  const subjectStats=["physics","chemistry","biology"].map(subject=>{const ids=questions.filter(q=>CHAPTERS.find(ch=>ch.id===q.chapterId)?.subject===subject).map(q=>q.id);const a=ids.filter(id=>id in answered);const cc=a.filter(id=>answered[id]).length;return {subject,attempted:a.length,correct:cc,accuracy:a.length?Math.round(cc/a.length*100):0};});
  const seriesStats=["ncert","mcq","ar","pyq","revision"].map(series=>{const a=questions.filter(q=>q.mode===series&&q.id in answered);const cc=a.filter(q=>answered[q.id]).length;return {series,attempted:a.length,correct:cc,accuracy:a.length?Math.round(cc/a.length*100):0};});
  return { attempted: attempted.length, correct, accuracy, chapterStats, subjectStats, seriesStats, tests: history.length };
}

export function smartRevision(questions: NativeQuestion[], answered: Record<string, boolean>, mistakes: Record<string, any>) {
  const mistakeIds = Object.keys(mistakes);
  const weak = questions.filter(q => mistakeIds.includes(q.id) || (q.id in answered && !answered[q.id]));
  return weak.slice(0, 20);
}
