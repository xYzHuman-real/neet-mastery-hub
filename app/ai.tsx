import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Shell, Card } from "../native/ui";
import { C } from "../native/theme";
import { askBuzNeet } from "../native/ai";
import { useStore } from "../native/store";

export default function AI() {
  const { aiUsage, consumeAi, premium } = useStore();
  const [input,setInput]=useState(""); const [answer,setAnswer]=useState(""); const [busy,setBusy]=useState(false); const [error,setError]=useState("");
  const today=new Date().toISOString().slice(0,10); const used=aiUsage.day===today?aiUsage.count:0;
  const ask=async()=>{ if(!input.trim()||busy)return; setError(""); const limit=premium.active?25:5; if(!consumeAi(limit)){setError("Daily AI limit reached.");return;} setBusy(true); try{setAnswer(await askBuzNeet(input.trim()));}catch(e){setError(e instanceof Error?e.message:"AI request failed.");}finally{setBusy(false)} };
  return <Shell title="Ask BuzNeet" subtitle="AI study assistant">
    <Card style={{backgroundColor:C.accent}}><Text style={{fontSize:16,fontWeight:"900",color:C.foreground}}>Study smarter · {premium.active?"Premium AI active":"Free AI"}</Text><Text style={{fontSize:11,lineHeight:18,color:C.mutedText,marginTop:4}}>Ask for a concept explanation, question solution, revision plan, or help understanding an answer.</Text></Card>
    <View style={{gap:8,marginTop:12}}>{["Explain this concept simply","Why is my answer wrong?","Give me a quick revision plan","Teach me this topic with an example"].map(x=><Pressable key={x} onPress={()=>setInput(x)} style={{padding:12,borderRadius:14,borderWidth:1,borderColor:C.border,backgroundColor:C.card}}><Text style={{fontSize:12,fontWeight:"700",color:C.foreground}}>{x}</Text></Pressable>)}</View>
    <TextInput value={input} onChangeText={setInput} multiline placeholder="Ask BuzNeet..." placeholderTextColor={C.mutedText} style={{minHeight:120,borderWidth:1,borderColor:C.border,borderRadius:18,backgroundColor:C.card,padding:15,color:C.foreground,fontSize:14,marginTop:12,textAlignVertical:"top"}}/>
    <Pressable disabled={busy||!input.trim()} onPress={ask} style={{marginTop:10,minHeight:52,borderRadius:16,alignItems:"center",justifyContent:"center",backgroundColor:busy||!input.trim()?C.muted:C.primary}}>{busy?<ActivityIndicator color={C.primaryText}/>:<Text style={{fontWeight:"900",color:busy||!input.trim()?C.mutedText:C.primaryText}}>Ask · {Math.max(0,(premium.active?25:5)-used)} requests left today</Text>}</Pressable>
    {!!error&&<Text style={{color:C.destructive,fontSize:12,lineHeight:18,marginTop:10}}>{error}</Text>}
    {!!answer&&<Card style={{marginTop:12}}><Text style={{fontSize:11,fontWeight:"900",color:C.primary}}>BUZNEET AI</Text><Text style={{fontSize:14,lineHeight:22,color:C.foreground,marginTop:8}}>{answer}</Text></Card>}
  </Shell>;
}
