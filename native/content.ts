import chapterData from "../data/chapters.json";
import questionData from "../data/questions.json";

export type ContentMode="ncert"|"mcq"|"ar"|"pyq"|"revision";
export const SERIES_MIN=60;
export const SERIES_MAX=200;
export type NativeQuestion={id:string;chapterId:string;series:ContentMode;mode:"mcq"|"ar"|"pyq";prompt:string;options:string[];answer:number;difficulty:"easy"|"medium"|"hard";explanation?:string;reviewStatus:"draft"|"reviewed"|"verified";sourceType:"ncert_based"|"original_neet_style"|"pyq";topicId?:string;citation?:{book?:string;chapter?:string;page?:number|null;line?:number|null;reference?:string}};
export type NativeChapter={id:string;subject:"physics"|"chemistry"|"biology";classLevel:11|12;name:string;unitId:string;topics:string[]};

const rawChapters=(chapterData as any).chapters as any[];
export const CHAPTERS=rawChapters.map(c=>({id:c.id,subject:String(c.subject).toLowerCase() as NativeChapter["subject"],classLevel:c.class as 11|12,name:c.ncertChapter,unitId:c.unitId,topics:c.topics??[]})) as NativeChapter[];
export const SUBJECTS=[{id:"physics" as const,name:"Physics",emoji:"⚛"},{id:"chemistry" as const,name:"Chemistry",emoji:"⚗"},{id:"biology" as const,name:"Biology",emoji:"🧬"}];
export const MODES: {id:ContentMode;label:string;desc:string}[]=[{id:"ncert",label:"NCERT-Aligned Practice",desc:"NCERT-aligned recall"},{id:"mcq",label:"MCQ Series",desc:"NEET-style practice"},{id:"ar",label:"Assertion & Reason",desc:"Statement logic"},{id:"pyq",label:"PYQ Practice",desc:"Original PYQ-derived practice"},{id:"revision",label:"Revision Series",desc:"Mixed active recall"}];

let cache: NativeQuestion[] | null = null;

export async function loadContent() {
  if (cache) return cache;

  const data = questionData as any;
  cache = (data?.questions ?? [])
    .filter(
      (q: any) =>
        Array.isArray(q.options) &&
        q.options.length >= 2 &&
        Number.isInteger(q.answer),
    )
    .map(
      (q: any) =>
        ({
          id: q.id,
          chapterId: q.chapterId,
          series: q.series ?? (q.sourceType === "pyq" ? "pyq" : q.type === "statement" ? "ar" : "mcq"),
          mode:
            q.sourceType === "pyq" && q.pyq?.verified
              ? "pyq"
              : q.type === "statement"
                ? "ar"
                : "mcq",
          prompt: q.question,
          options: q.options,
          answer: q.answer,
          difficulty: q.difficulty,
          explanation: q.explanation,
          reviewStatus: q.reviewStatus,
          sourceType: q.sourceType,
          topicId: q.topicId,
          citation: q.citation,
        }) as NativeQuestion,
    );

  return cache;
}
export function chapterById(id?:string){return CHAPTERS.find(c=>c.id===id)}
export function filterQuestions(questions:NativeQuestion[],chapterId?:string,mode?:ContentMode){
  let list=questions;
  if(chapterId)list=list.filter(q=>q.chapterId===chapterId);
  if(!mode)return list;
  if(mode==="revision")return list.filter(q=>q.series==="revision");
  if(mode==="ncert")return list.filter(q=>q.series==="ncert");
  if(mode==="pyq")return list.filter(q=>q.series==="pyq" && q.sourceType==="original_neet_style");
  return list.filter(q=>q.series===mode);
}
export function chapterQuestionCount(questions:NativeQuestion[],chapterId:string,mode:ContentMode){return filterQuestions(questions,chapterId,mode).length}
