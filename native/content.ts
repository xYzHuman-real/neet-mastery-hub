import chapterData from "../data/chapters.json";
import questionData from "../data/questions.json";

export type ContentMode="ncert"|"mcq"|"ar"|"pyq"|"revision";
export const SERIES_MIN=60;
export const SERIES_MAX=200;
export type NativeQuestion={id:string;chapterId:string;series:ContentMode;mode:"mcq"|"ar"|"pyq";prompt:string;assertion?:string;reason?:string;options:string[];answer:number;difficulty:"easy"|"medium"|"hard";explanation?:string;reviewStatus:"draft"|"reviewed"|"verified";sourceType:"ncert_based"|"original_neet_style"|"pyq";topicId?:string;citation?:{book?:string;chapter?:string;page?:number|null;line?:number|null;reference?:string}};

export type NativeChapter={id:string;subject:"physics"|"chemistry"|"biology";classLevel:11|12;name:string;unitId:string;topics:string[]};
const rawChapters=(chapterData as any).chapters as any[];
export const CHAPTERS=rawChapters.map(c=>({id:c.id,subject:String(c.subject).toLowerCase() as NativeChapter["subject"],classLevel:c.class as 11|12,name:c.ncertChapter,unitId:c.unitId,topics:c.topics??[]})) as NativeChapter[];
export const SUBJECTS=[{id:"physics" as const,name:"Physics",emoji:"⚛"},{id:"chemistry" as const,name:"Chemistry",emoji:"⚗"},{id:"biology" as const,name:"Biology",emoji:"🧬"}];
export const MODES:{id:ContentMode;label:string;desc:string}[]=[
{id:"ncert",label:"NCERT-Aligned Practice",desc:"NCERT-aligned recall"},
{id:"mcq",label:"MCQ Series",desc:"NEET-style practice"},
{id:"ar",label:"Assertion & Reason",desc:"Statement logic"},
{id:"pyq",label:"PYQ Practice",desc:"Original PYQ-derived practice"},
{id:"revision",label:"Revision Series",desc:"Mixed active recall"}];

let cache:NativeQuestion[]|null=null;

function shuffleOptions(options:string[],answer:number){
  const pairs=options.map((text,index)=>({text,index}));
  for(let i=pairs.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pairs[i],pairs[j]]=[pairs[j],pairs[i]];}
  return {options:pairs.map(x=>x.text),answer:pairs.findIndex(x=>x.index===answer)};
}

/**
 * Explanations are rebuilt from the FINAL option order.
 * The generator previously created the explanation before shuffling options,
 * which could make a correct explanation point to the wrong letter/text.
 */
function buildExplanation(q:any,options:string[],answer:number){
  const correct=options[answer]??"the correct option";
  if(q.type==="statement"||q.series==="ar"){
    const labels=[
      "Both A and R are true, and R correctly explains A.",
      "Both A and R are true, but R does not correctly explain A.",
      "A is true, but R is false.",
      "A is false, but R is true."
    ];
    return `Correct option: ${String.fromCharCode(65+answer)}. ${correct}. ${labels[answer]||"This option gives the required Assertion–Reason relationship."}`;
  }
  return `Correct option: ${String.fromCharCode(65+answer)}. ${correct}. This option matches the concept or condition asked in the question.`;
}

export async function loadContent(){
  if(cache)return cache;
  const data=questionData as any;
  cache=(data?.questions??[])
    .filter((q:any)=>Array.isArray(q.options)&&q.options.length>=2&&Number.isInteger(q.answer)&&q.answer>=0&&q.answer<q.options.length)
    .map((q:any)=>{
      const shuffled=shuffleOptions(q.options,q.answer);
      return ({
        id:q.id,
        chapterId:q.chapterId,
        series:q.series??(q.sourceType==="pyq"?"pyq":q.type==="statement"?"ar":"mcq"),
        mode:q.sourceType==="pyq"&&q.pyq?.verified?"pyq":q.type==="statement"?"ar":"mcq",
        prompt:String(q.question||"").replace(/^(NCERT-aligned: |Revision: |PYQ Practice: )/i,"").replace(/\s*Focus:\s*(NCERT-aligned practice|PYQ-derived practice|revision practice|Assertion–Reason practice|MCQ practice)\.?$/i,"").trim(),
        assertion:q.assertion,
        reason:q.reason,
        options:shuffled.options,
        answer:shuffled.answer,
        difficulty:q.difficulty,
        explanation:buildExplanation(q,shuffled.options,shuffled.answer),
        reviewStatus:q.reviewStatus,
        sourceType:q.sourceType,
        topicId:q.topicId,
        citation:q.citation,
      }) as NativeQuestion;
    });
  return cache;
}
export function chapterById(id?:string){return CHAPTERS.find(c=>c.id===id)}
export function filterQuestions(questions:NativeQuestion[],chapterId?:string,mode?:ContentMode){
  let list=questions;
  if(chapterId)list=list.filter(q=>q.chapterId===chapterId);
  if(!mode)return list;
  if(mode==="revision")return list.filter(q=>q.series==="revision");
  if(mode==="ncert")return list.filter(q=>q.series==="ncert");
  if(mode==="pyq")return list.filter(q=>q.series==="pyq");
  return list.filter(q=>q.series===mode);
}
export function chapterQuestionCount(questions:NativeQuestion[],chapterId:string,mode:ContentMode){return filterQuestions(questions,chapterId,mode).length}
