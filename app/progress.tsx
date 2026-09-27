import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Shell, Card } from "../native/ui";
import { C } from "../native/theme";
import { useStore } from "../native/store";
import { loadContent } from "../native/content";
import { buildAnalytics, smartRevision } from "../native/analytics";
import { router } from "expo-router";

export default function Progress() {
  const { answered, mistakes, testHistory } = useStore();
  const [content, setContent] = useState<any[]>([]);
  useEffect(() => { loadContent().then(setContent); }, []);
  const a = useMemo(() => buildAnalytics(content, answered, testHistory), [content, answered, testHistory]);
  const weak = useMemo(() => smartRevision(content, answered, mistakes), [content, answered, mistakes]);
  return <Shell title="Progress" subtitle="Your preparation data">
    <View style={{flexDirection:"row",gap:8}}>
      <Card style={{flex:1}}><Text style={{fontSize:24,fontWeight:"900",color:C.foreground}}>{a.attempted}</Text><Text style={{fontSize:10,color:C.mutedText}}>Attempted</Text></Card>
      <Card style={{flex:1}}><Text style={{fontSize:24,fontWeight:"900",color:C.foreground}}>{a.accuracy}%</Text><Text style={{fontSize:10,color:C.mutedText}}>Accuracy</Text></Card>
      <Card style={{flex:1}}><Text style={{fontSize:24,fontWeight:"900",color:C.foreground}}>{a.tests}</Text><Text style={{fontSize:10,color:C.mutedText}}>Tests</Text></Card>
    </View>
    <Text style={{fontSize:18,fontWeight:"900",color:C.foreground,marginTop:20}}>Chapter performance</Text>
    {a.chapterStats.length===0 ? <Card style={{marginTop:10}}><Text style={{color:C.mutedText}}>Complete some practice to build your analytics.</Text></Card> : a.chapterStats.slice().sort((x,y)=>x.accuracy-y.accuracy).slice(0,8).map(x=><Card key={x.id} style={{marginTop:8}}><View style={{flexDirection:"row",justifyContent:"space-between"}}><Text style={{fontWeight:"800",color:C.foreground,flex:1}}>{x.name}</Text><Text style={{fontWeight:"900",color:x.accuracy<60?C.destructive:C.primary}}>{x.accuracy}%</Text></View><Text style={{fontSize:10,color:C.mutedText,marginTop:3}}>{x.correct}/{x.attempted} correct</Text></Card>)}
    <Text style={{fontSize:18,fontWeight:"900",color:C.foreground,marginTop:20}}>Smart Revision</Text>
    <Card style={{marginTop:10,backgroundColor:C.accent}}><Text style={{fontWeight:"800",color:C.foreground}}>Questions selected from your mistakes and incorrect answers.</Text><Text style={{fontSize:11,color:C.mutedText,marginTop:5}}>{weak.length} questions are ready for revision.</Text><Pressable onPress={()=>router.push({pathname:"/practice",params:{review:"1"}})} style={{marginTop:12,backgroundColor:C.primary,borderRadius:14,padding:12,alignItems:"center"}}><Text style={{fontWeight:"900",color:C.primaryText}}>Start Smart Revision</Text></Pressable></Card>
  </Shell>;
}
