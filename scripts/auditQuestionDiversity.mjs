import fs from "node:fs";

const chapters = JSON.parse(fs.readFileSync("data/chapters.json","utf8")).chapters;
const bank = JSON.parse(fs.readFileSync("data/questions.json","utf8")).questions;
const seriesNames = ["ncert","mcq","ar","pyq","revision"];

const stop = new Set(["a","an","the","is","are","was","were","be","been","being","of","to","in","on","for","from","with","and","or","as","by","at","which","what","when","where","how","does","do","did","this","that","these","those","following","option","options","correct","statement","question","answer","according","given","usually","generally","only","most","directly","primarily"]);

function tokens(s) {
  return String(s||"").toLowerCase()
    .replace(/assertion and reason|ncert-aligned|pyq practice|revision practice/g," ")
    .replace(/[^a-z0-9]+/g," ")
    .split(/\s+/).filter(Boolean).filter(x=>!stop.has(x));
}
function stem(s) { return tokens(s).slice(0, 12).join(" "); }
function jaccard(a,b) {
  const A=new Set(a), B=new Set(b);
  let hit=0; for(const x of A) if(B.has(x)) hit++;
  return hit/(A.size+B.size-hit||1);
}
function semanticKey(q) {
  const assertion = q.assertion ? tokens(q.assertion).slice(0,18).join(" ") : "";
  const reason = q.reason ? tokens(q.reason).slice(0,18).join(" ") : "";
  return [q.chapterId,q.topicId,assertion,reason,stem(q.question)].join("|");
}

const errors=[], warnings=[], byBucket=new Map(), seenPrompt=new Map(), seenSemantic=new Map();
for(const q of bank){
  const bucket=q.chapterId+"/"+q.series;
  const p=stem(q.question);
  if(p && seenPrompt.has(bucket+"|"+p)) errors.push({type:"duplicate_prompt",ids:[seenPrompt.get(bucket+"|"+p),q.id]});
  else seenPrompt.set(bucket+"|"+p,q.id);

  const sk=semanticKey(q);
  if(sk && seenSemantic.has(bucket+"|"+sk)) errors.push({type:"duplicate_semantic_signature",ids:[seenSemantic.get(bucket+"|"+sk),q.id]});
  else seenSemantic.set(bucket+"|"+sk,q.id);

  if(!byBucket.has(bucket)) byBucket.set(bucket,[]);
  byBucket.get(bucket).push(q);
}

for(const [bucket,items] of byBucket){
  let pairs=0;
  for(let i=0;i<items.length;i++){
    const a=tokens(items[i].question);
    if(a.length<5) continue;
    for(let j=i+1;j<items.length;j++){
      if(items[i].topicId!==items[j].topicId) continue;
      const b=tokens(items[j].question);
      if(jaccard(a,b)>=0.82) {
        pairs++;
        if(warnings.length<500) warnings.push({type:"near_duplicate",bucket,ids:[items[i].id,items[j].id],similarity:Number(jaccard(a,b).toFixed(3))});
      }
    }
  }
  if(pairs>Math.floor(items.length*0.2)) errors.push({type:"low_semantic_diversity",bucket,count:items.length,nearDuplicatePairs:pairs});
}

const chapterMap=new Map(chapters.map(c=>[c.id,c]));
const report={
  generatedAt:new Date().toISOString(),
  totalQuestions:bank.length,
  chapters:chapters.length,
  series:seriesNames,
  errors,
  warningCount:warnings.length,
  warnings:warnings.slice(0,200),
  policy:{
    duplicatePrompt:"error",
    duplicateSemanticSignature:"error",
    nearDuplicateSimilarity:0.82,
    lowDiversityThreshold:"more than 20% of possible same-topic pairs flagged"
  },
  status:errors.length?"FAIL":"PASS"
};
fs.writeFileSync("question-diversity-report.json",JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify({status:report.status,totalQuestions:report.totalQuestions,errors:errors.length,warnings:warnings.length},null,2));
if(errors.length) process.exit(1);
