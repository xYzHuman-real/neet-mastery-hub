const fs = require("node:fs");
const chapters = JSON.parse(fs.readFileSync("data/chapters.json","utf8")).chapters;
const bank = JSON.parse(fs.readFileSync("data/questions.json","utf8")).questions;
const seriesNames = ["ncert","mcq","ar","pyq","revision"];
const counts = Object.fromEntries(chapters.map(c => [c.id, Object.fromEntries(seriesNames.map(s => [s, 0]))]));
const errors = [];
for (const q of bank) {
  if (counts[q.chapterId] !== undefined && counts[q.series] !== undefined) counts[q.chapterId][q.series]++;
  if (!q.topicId) errors.push(q.id + ": missing topicId");
  if (!q.sourceType) errors.push(q.id + ": missing sourceType");
  if (!q.reviewStatus) errors.push(q.id + ": missing reviewStatus");
  if (["reviewed","verified"].includes(q.reviewStatus) && q.quality?.placeholder) errors.push(q.id + ": released reviewStatus on placeholder");
  if (q.sourceType === "pyq" && !q.pyq?.verified) errors.push(q.id + ": PYQ is not explicitly verified");
  if (q.citation?.page != null || q.citation?.line != null) errors.push(q.id + ": NCERT page/line must remain null until independently verified");
}
for (const c of chapters) {
  for (const series of seriesNames) {
    const count = counts[c.id]?.[series] || 0;
    if (series === "pyq") continue;
    if (count < (c.minimumQuestionCount || 60)) errors.push(c.id + "/" + series + ": " + count + " questions; minimum is " + (c.minimumQuestionCount || 60));
    if (count > (c.maximumQuestionCount || 200)) errors.push(c.id + "/" + series + ": " + count + " questions; maximum is " + (c.maximumQuestionCount || 200));
  }
}
console.log(JSON.stringify({total: bank.length, chapters: counts, errors}, null, 2));
if (errors.length) process.exit(1);