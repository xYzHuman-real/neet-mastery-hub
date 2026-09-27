import { loadContent } from "./content";

function normalize(s:string){return s.toLowerCase().replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim()}

function localAnswer(prompt:string, context?:{subject?:string;chapter?:string;question?:string}){
 const p=normalize(prompt);
 if(!p) return "Ask me a NEET question and I’ll explain it step by step.";
 return loadContent().then(qs=>{
  const target=normalize(context?.question||prompt);
  let best:any=null,bestScore=0;
  for(const q of qs){
   const text=normalize(q.prompt+" "+(q.explanation||""));
   const words=new Set(target.split(" ").filter(w=>w.length>3));
   let score=0; for(const w of words) if(text.includes(w)) score++;
   if(score>bestScore){bestScore=score;best=q;}
  }
  if(best && bestScore>=Math.min(4,Math.max(2,Math.floor(target.split(" ").length*.2)))){
   const answer=best.options?.[best.answer];
   return "Here’s the BuzNeet explanation:\n\n"+(best.explanation||"The correct answer is "+answer+".")+"\n\nCorrect answer: "+answer;
  }
  return "I can help with this as an offline NEET tutor. Break the question into: (1) what is given, (2) the concept or NCERT fact involved, (3) the options, and (4) why the correct option follows.\n\nFor the most accurate explanation, paste the full question and all four options.";
 });
}

export async function askBuzNeet(prompt:string,context?:{subject?:string;chapter?:string;question?:string}){
 const url=process.env.EXPO_PUBLIC_BUZNEET_AI_URL;
 if(url){
  try{
   const res=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt,context,app:"BuzNeet",mode:"neet-tutor"})});
   if(res.ok){const data=await res.json();const answer=String(data.answer??data.output??"");if(answer)return answer;}
  }catch{}
 }
 return localAnswer(prompt,context);
}
