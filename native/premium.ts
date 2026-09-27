export type PremiumPlan = { id:"monthly"|"quarterly"|"halfyear"|"yearly"|"twoYear"; label:string; price:number; original:number; durationDays:number; badge?:string };
export const PREMIUM_PLANS:PremiumPlan[]=[
{id:"monthly",label:"1 Month",price:49,original:99,durationDays:30},
{id:"quarterly",label:"3 Months",price:149,original:299,durationDays:90},
{id:"halfyear",label:"6 Months",price:249,original:499,durationDays:180},
{id:"yearly",label:"12 Months",price:399,original:699,durationDays:365,badge:"BEST VALUE"},
{id:"twoYear",label:"2 Years",price:799,original:1499,durationDays:730,badge:"BEST LONG-TERM"}];
export const PREMIUM_FEATURES=[
{icon:"◈",title:"Advanced Analytics",detail:"Deep subject, chapter, series and test performance insights."},
{icon:"↻",title:"Smart Revision 2.0",detail:"Prioritise mistakes, weak areas and revision due dates."},
{icon:"⚡",title:"Fix My Weakness",detail:"Generate targeted drills from your lowest-performing areas."},
{icon:"▣",title:"Advanced Test Builder",detail:"Build tests from subjects, chapters, series, mistakes and bookmarks."},
{icon:"◇",title:"Flashcards",detail:"Revision decks for formulas, facts and your own mistakes."},
{icon:"◷",title:"Personal Study Planner",detail:"A practical daily plan based on your progress and revision backlog."},
{icon:"AI",title:"BuzNeet AI Premium",detail:"Higher AI allowance and deeper question/test explanations when AI is connected."},
{icon:"▤",title:"Detailed Test Reports",detail:"Review score, accuracy, timing, weak chapters and next actions."}];
const WHATSAPP_NUMBER=process.env.EXPO_PUBLIC_BUZNEET_WHATSAPP_NUMBER||"";
export function subscriptionUrl(plan:PremiumPlan){
 const text=encodeURIComponent("Hi BuzNeet! I want to subscribe to BuzNeet Premium.\nPlan: "+plan.label+"\nOffer price: ₹"+plan.price+"\nPlease tell me the payment steps.");
 return WHATSAPP_NUMBER ? "https://wa.me/"+WHATSAPP_NUMBER+"?text="+text : "";
}