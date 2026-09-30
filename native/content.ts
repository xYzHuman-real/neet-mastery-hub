import chapterData from "../data/chapters.json";
import licensedData from "../data/licensedQuestions.json";
import questionBank from "../data/questionBank.json";

export type ContentMode="ncert"|"mcq"|"ar"|"pyq"|"revision";
export const SERIES_MIN=61;
export const SERIES_MAX=199;
export type NativeQuestion={id:string;chapterId:string;series:ContentMode;mode:"mcq"|"ar"|"pyq";prompt:string;assertion?:string;reason?:string;options:string[];answer:number;difficulty:"easy"|"medium"|"hard";explanation?:string;reviewStatus:"draft"|"reviewed"|"verified";sourceType:"ncert_based"|"original_neet_style"|"pyq";topicId?:string;citation?:{book?:string;chapter?:string;page?:number|null;line?:number|null;reference?:string};sourceLicense?:string;sourceId?:string;sourceQuestionId?:string};

export type NativeChapter={id:string;subject:"physics"|"chemistry"|"biology";classLevel:11|12;name:string;unitId:string;topics:string[]};
const rawChapters=(chapterData as any).chapters as any[];
export const CHAPTERS=rawChapters.map(c=>({id:c.id,subject:String(c.subject).toLowerCase() as NativeChapter["subject"],classLevel:c.class as 11|12,name:c.ncertChapter,unitId:c.unitId,topics:c.topics??[]})) as NativeChapter[];
export const SUBJECTS=[{id:"physics" as const,name:"Physics",emoji:"⚛"},{id:"chemistry" as const,name:"Chemistry",emoji:"⚗"},{id:"biology" as const,name:"Biology",emoji:"🧬"}];
export const MODES:{id:ContentMode;label:string;desc:string}[]=[
{id:"ncert",label:"NCERT-Aligned Practice",desc:"NCERT-aligned recall"},
{id:"mcq",label:"MCQ Series",desc:"NEET-style practice"},
{id:"ar",label:"Assertion & Reason",desc:"Statement logic"},
{id:"pyq",label:"PYQ Practice",desc:"Licensed PYQ practice"},
{id:"revision",label:"Revision Series",desc:"Mixed active recall"}];

let cache:NativeQuestion[]|null=null;

function shuffleOptions(options:string[],answer:number){
  const pairs=options.map((text,index)=>({text,index}));
  for(let i=pairs.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pairs[i],pairs[j]]=[pairs[j],pairs[i]];}
  return {options:pairs.map(x=>x.text),answer:pairs.findIndex(x=>x.index===answer)};
}

/**
 * Normalise question language for semantic-repeat avoidance.
 * This is intentionally lightweight: it is not a claim that two questions
 * are mathematically equivalent. It only prevents obvious near-duplicates
 * from appearing back-to-back in the mobile practice deck.
 */
const STOP_WORDS=new Set(["a","an","the","is","are","was","were","be","being","been","of","to","in","on","for","from","with","and","or","by","as","at","which","what","who","how","why","when","where","using","called","option","options","correct","best","most","following","select","choose","scientifically","conventionally","written","matches","concept","tested","practice","answer","response"]);
function tokens(text:string){
  return new Set(
    text.toLowerCase()
      .replace(/\[[^\]]*\]/g," ")
      .replace(/[^a-z0-9]+/g," ")
      .split(/\s+/)
      .filter(Boolean)
      .map(w=>w.length>5&&w.endsWith("ing")?w.slice(0,-3):w.length>4&&w.endsWith("ed")?w.slice(0,-2):w)
      .filter(w=>!STOP_WORDS.has(w))
  );
}
function semanticSimilarity(a:NativeQuestion,b:NativeQuestion){
  const A=tokens(a.prompt+" "+(a.assertion??"")+" "+(a.reason??""));
  const B=tokens(b.prompt+" "+(b.assertion??"")+" "+(b.reason??""));
  if(!A.size||!B.size)return 0;
  let intersection=0;
  for(const x of A)if(B.has(x))intersection++;
  return intersection/Math.min(A.size,B.size);
}
function orderForPractice(list:NativeQuestion[]){
  const remaining=shuffle(list);
  const ordered:NativeQuestion[]=[];
  const recent:NativeQuestion[]=[];
  while(remaining.length){
    let best=0;
    let bestScore=Infinity;
    for(let i=0;i<remaining.length;i++){
      const candidate=remaining[i];
      const scores=recent.slice(-6).map(prev=>semanticSimilarity(candidate,prev));
      const maxSimilarity=scores.length?Math.max(...scores):0;
      const sameTopic=recent.some(prev=>prev.topicId&&candidate.topicId&&prev.topicId===candidate.topicId);
      const score=maxSimilarity+(sameTopic?0.12:0);
      if(score<bestScore){bestScore=score;best=i;}
      if(score===0)break;
    }
    const [next]=remaining.splice(best,1);
    ordered.push(next);
    recent.push(next);
  }
  return ordered;
}

export async function loadContent(){
  if(cache)return cache;
  const licensed=licensedData as any;
  const editorial=questionBank as any;
  const combined=[...(licensed?.questions??[]),...(editorial?.questions??[])];
  const seen=new Set<string>();
  cache=combined
    .filter((q:any)=>typeof q.chapterId==="string"&&Array.isArray(q.options)&&q.options.length>=2&&Number.isInteger(q.answer)&&q.answer>=0&&q.answer<q.options.length)
    .filter((q:any)=>{const key=String(q.prompt||"").trim().toLowerCase().replace(/\\s+/g," ");if(!key||seen.has(key))return false;seen.add(key);return true;})
    .map((q:any)=>{
      const shuffled=shuffleOptions(q.options,q.answer);
      return ({
        id:q.id,
        chapterId:q.chapterId,
        series:(q.series??q.mode??"mcq") as ContentMode,
        mode:(q.mode??q.series??"mcq") as NativeQuestion["mode"],
        prompt:String(q.prompt||"").trim(),
        assertion:q.assertion,
        reason:q.reason,
        options:shuffled.options,
        answer:shuffled.answer,
        difficulty:q.difficulty??"medium",
        explanation:String(q.explanation||"").trim(),
        reviewStatus:q.reviewStatus??"reviewed",
        sourceType:q.sourceType??(q.mode==="pyq"?"pyq":"original_neet_style"),
        topicId:q.topicId,
        citation:q.citation,
        sourceLicense:q.sourceLicense,
        sourceId:q.sourceId,
        sourceQuestionId:q.sourceQuestionId,
      }) as NativeQuestion;
    });
  return cache;
}
export function chapterById(id?:string){return CHAPTERS.find(c=>c.id===id)}
export function filterQuestions(questions:NativeQuestion[],chapterId?:string,mode?:ContentMode){
  let list=questions;
  if(chapterId)list=list.filter(q=>q.chapterId===chapterId);
  if(!mode)return list;
  return mode==="pyq"?list.filter(q=>q.series==="pyq"):list.filter(q=>q.series===mode);
}
export function chapterQuestionCount(questions:NativeQuestion[],chapterId:string,mode:ContentMode){return filterQuestions(questions,chapterId,mode).length}
export { orderForPractice };
