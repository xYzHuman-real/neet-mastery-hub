const fs=require("node:fs");
const chapters=JSON.parse(fs.readFileSync("data/chapters.json","utf8")).chapters;
const questions=[];
const errors=[];
for(const ch of chapters){
  const path="data/question-bank/"+ch.id+".json";
  if(!fs.existsSync(path)){errors.push(ch.id+": missing shard");continue;}
  const shard=JSON.parse(fs.readFileSync(path,"utf8"));
  if(!Array.isArray(shard)){errors.push(ch.id+": shard is not an array");continue;}
  if(shard.length<ch.minimumQuestionCount||shard.length>ch.maximumQuestionCount) errors.push(ch.id+": count "+shard.length);
  for(const q of shard){
    if(q.chapterId!==ch.id) errors.push(q.id+": wrong chapterId");
    if(!Array.isArray(q.options)||q.options.length!==4) errors.push(q.id+": must have 4 options");
    if(!Number.isInteger(q.answer)||q.answer<0||q.answer>3) errors.push(q.id+": invalid answer");
    if(q.sourceType!=="original_neet_style") errors.push(q.id+": invalid sourceType");
    if(q.reviewStatus!=="draft") errors.push(q.id+": generated item must remain draft");
    if(q.citation?.page!=null||q.citation?.line!=null) errors.push(q.id+": citation page/line must be null");
  }
  questions.push(...shard);
}
const seen=new Set();
for(const q of questions){if(seen.has(q.id)) errors.push(q.id+": duplicate id"); seen.add(q.id);}
if(errors.length){console.error(errors.join("\n"));process.exit(1);}
fs.writeFileSync("data/questions.json",JSON.stringify({
  version:"3.0",
  description:"Original NEET-style practice questions. Generated items remain draft until subject-matter review.",
  policy:{minimumPerChapter:60,maximumPerChapter:200,variableCounts:true,noUnverifiedPYQs:true,noInventedNCERTPageCitations:true},
  questions
},null,2)+"\n");
console.log("Merged "+questions.length+" questions across "+chapters.length+" chapters.");
