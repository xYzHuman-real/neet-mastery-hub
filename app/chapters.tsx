import { useMemo, useState } from "react";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Shell } from "../native/ui";
import { C } from "../native/theme";
import chapterData from "../data/chapters.json";

const CHAPTERS=(chapterData as any).chapters.map((c:any)=>({
  id:c.id, subject:String(c.subject).toLowerCase(), classLevel:c.class===11||c.class===12?c.class:null,
  name:c.ncertChapter, topics:c.topics??[], questionTarget:c.questionTarget??50
}));
const SUBJECTS=[{id:"physics",name:"Physics"},{id:"chemistry",name:"Chemistry"},{id:"biology",name:"Biology"}];
const MODES=[["ncert","NCERT Line-by-Line","NCERT-aligned recall"],["mcq","MCQ Series","NEET-style practice"],["ar","Assertion & Reason","Statement logic"],["pyq","PYQ Series","Verified previous-year questions"],["revision","Revision Series","Mixed active recall"]];

export default function Chapters(){
 const[sub,setSub]=useState("biology"); const[open,setOpen]=useState<string|null>(null);
 const chapters=useMemo(()=>CHAPTERS.filter((c:any)=>c.subject===sub),[sub]);
 return <Shell title="Chapter Hub" subtitle="87 chapters">
  <View style={{flexDirection:"row",backgroundColor:C.muted,borderRadius:16,padding:4}}>
   {SUBJECTS.map(s=><Pressable key={s.id} onPress={()=>{setSub(s.id);setOpen(null)}} style={{flex:1,paddingVertical:10,borderRadius:12,backgroundColor:sub===s.id?C.card:"transparent",alignItems:"center"}}><Text style={{fontSize:12,fontWeight:"800",color:sub===s.id?C.primary:C.mutedText}}>{s.name}</Text></Pressable>)}
  </View>
  {[11,12,null].map(cls=><View key={String(cls)} style={{marginTop:20}}>
   <Text style={{fontSize:11,fontWeight:"800",letterSpacing:1.5,color:C.mutedText}}>{cls===null?"SYLLABUS SECTIONS":"CLASS "+cls}</Text>
   {chapters.filter((c:any)=>c.classLevel===cls).map((c:any)=>{const isOpen=open===c.id;return <View key={c.id} style={{marginTop:8,borderRadius:20,borderWidth:1,borderColor:C.border,backgroundColor:C.card,overflow:"hidden"}}>
    <Pressable onPress={()=>setOpen(isOpen?null:c.id)} style={{padding:16}}><View style={{flexDirection:"row",alignItems:"center"}}><View style={{flex:1}}><Text style={{fontSize:14,fontWeight:"800",color:C.foreground}}>{c.name}</Text><Text style={{fontSize:11,color:C.mutedText,marginTop:4}}>{c.questionTarget} questions target · {c.topics.length} core topics</Text></View><Text style={{fontSize:19,color:C.mutedText}}>{isOpen?"⌃":"⌄"}</Text></View></Pressable>
    {isOpen&&<View style={{borderTopWidth:1,borderTopColor:C.border,padding:10,gap:8}}>{MODES.map(([id,label,desc])=><Pressable key={id} onPress={()=>router.push({pathname:"/practice",params:{chapter:c.id,mode:id}})} style={{padding:13,borderRadius:16,backgroundColor:C.accent}}><View style={{flexDirection:"row",justifyContent:"space-between"}}><Text style={{fontSize:12,fontWeight:"900",color:C.primary}}>{label}</Text><Text style={{fontSize:11,fontWeight:"800",color:C.foreground}}>Open</Text></View><Text style={{fontSize:10,color:C.mutedText,marginTop:3}}>{desc}</Text></Pressable>)}</View>}
   </View>})}
  </View>)}
 </Shell>;
}