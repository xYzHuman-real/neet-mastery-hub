export type Mission = { id: string; title: string; detail: string; progress: number; target: number; done: boolean };

export function getDailyMissions(todayCount: number, goal: number, dueCount: number, testsToday: number): Mission[] {
  const target = Math.max(1, goal);
  return [
    { id: "practice", title: "Daily Practice", detail: "Answer questions", progress: Math.min(todayCount, target), target, done: todayCount >= target },
    { id: "revision", title: "Smart Revision", detail: dueCount ? "Clear your due questions" : "No revision due right now", progress: dueCount ? 0 : 1, target: dueCount || 1, done: dueCount === 0 },
    { id: "test", title: "Take a Test", detail: "Complete one timed test", progress: Math.min(testsToday, 1), target: 1, done: testsToday > 0 },
  ];
}

export type Achievement = { id: string; title: string; detail: string; unlocked: boolean };

export function getAchievements(totalAnswered: number, streak: number, accuracy: number, tests: number): Achievement[] {
  return [
    { id: "first-questions", title: "First 10", detail: "Answer 10 questions", unlocked: totalAnswered >= 10 },
    { id: "hundred", title: "100 Questions", detail: "Answer 100 questions", unlocked: totalAnswered >= 100 },
    { id: "five-hundred", title: "500 Questions", detail: "Answer 500 questions", unlocked: totalAnswered >= 500 },
    { id: "first-test", title: "First Test", detail: "Complete a test", unlocked: tests >= 1 },
    { id: "week", title: "7 Day Streak", detail: "Reach a 7 day streak", unlocked: streak >= 7 },
    { id: "month", title: "30 Day Streak", detail: "Reach a 30 day streak", unlocked: streak >= 30 },
    { id: "accuracy", title: "90% Accuracy", detail: "Reach 90% overall accuracy", unlocked: accuracy >= 90 },
  ];
}

export function testsToday(history: Array<{ at: number }>): number {
  const today = new Date().toISOString().slice(0, 10);
  return history.filter(x => new Date(x.at).toISOString().slice(0, 10) === today).length;
}
