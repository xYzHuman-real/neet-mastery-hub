import { useEffect, useMemo, useState } from "react";
import { Alert, BackHandler, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Shell, Card } from "../native/ui";
import { C } from "../native/theme";
import { loadContent, CHAPTERS } from "../native/content";
import { useStore } from "../native/store";

type PendingTest={subject?:string;n:number;minutes:number;chapterIds?:string[];title:string};

export default function Tests() {
  const [qs,setQs]=useState<any[]>([]);
  const [content,setContent]=useState<any[]|null>(null);
  const [i,setI]=useState(0);
  const [picks,setPicks]=useState<(number|null)[]>([]);
  const [left,setLeft]=useState(0);
  const [started,setStarted]=useState(0);
  const [done,setDone]=useState(false);
  const [contentError,setContentError]=useState(false);
  const [subject,setSubject]=useState<string|undefined>();
  const [chapterCounts,setChapterCounts]=useState<Record<string,number>>({physics:1,chemistry:1,biology:1});
  const [mockChapters,setMockChapters]=useState<string[]>([]);
  const [pickerSubject,setPickerSubject]=useState<string|null>(null);
  const [pending,setPending]=useState<PendingTest|null>(null);
  const [rulesVisible,setRulesVisible]=useState(false);
  const [startError,setStartError]=useState("");
  const {saveTest,premium}=useStore();

  useEffect(()=>{loadContent().then(setContent).catch(()=>setContentError(true))},[]);

  useEffect(()=>{
    if(!qs.length||done)return;
    const t=setInterval(()=>setLeft(x=>{if(x<=1){setDone(true);return 0}return x-1}),1000);
    return()=>clearInterval(t);
  },[qs.length,done]);

  useEffect(()=>{
    if(!qs.length||done)return;
    const handler=()=>true;
    const sub=BackHandler.addEventListener("hardwareBackPress",handler);
    return()=>sub.remove();
  },[qs.length,done]);

  const start=(test:PendingTest)=>{
    const pool=(content??[]).filter(q=>q.options?.length&&(!test.subject||CHAPTERS.find(c=>c.id===q.chapterId)?.subject===test.subject)&&(!test.chapterIds||test.chapterIds.includes(q.chapterId)));
    if(pool.length<test.n){
      setStartError(`Only ${pool.length} questions are available from the selected chapters. Please select more chapters.`);
      return;
    }
    const a=[...pool].sort(()=>Math.random()-0.5).slice(0,test.n);
    setQs(a);setPicks(a.map(()=>null));setI(0);setLeft(test.minutes*60);setStarted(Date.now());setDone(false);setSubject(test.subject);setRulesVisible(false);setPending(null);setStartError("");
  };

  const requestStart=(test:PendingTest)=>{
    setStartError("");
    setPending(test);
    setRulesVisible(true);
  };

  const selectedCounts=useMemo(()=>({
    physics:mockChapters.filter(id=>CHAPTERS.find(c=>c.id===id)?.subject==="physics").length,
    chemistry:mockChapters.filter(id=>CHAPTERS.find(c=>c.id===id)?.subject==="chemistry").length,
    biology:mockChapters.filter(id=>CHAPTERS.find(c=>c.id===id)?.subject==="biology").length
  }),[mockChapters]);

  if(contentError)return <Shell title="Tests unavailable" subtitle="BuzNeet"><Text style={{fontSize:14,color:C.mutedText}}>The question bank could not be loaded.</Text></Shell>;
  if(!content)return <Shell title="Loading tests" subtitle="BuzNeet"><Text style={{fontSize:14,color:C.mutedText}}>Preparing the test bank…</Text></Shell>;

  if(qs.length){
    if(done){
      const correct=picks.filter((x,k)=>x===qs[k].answer).length;
      const wrong=picks.filter((x,k)=>x!==null&&x!==qs[k].answer).length;
      const skipped=qs.length-correct-wrong;
      const elapsed=Math.max(1,Math.round((Date.now()-started)/1000));
      return <Shell title="Test Review" subtitle="Completed">
        <Card style={{backgroundColor:C.primary,borderColor:C.primary}}><Text style={{fontSize:11,color:C.primaryText}}>SCORE</Text><Text style={{fontSize:40,fontWeight:"900",color:C.primaryText}}>{correct*4-wrong}<Text style={{fontSize:17}}> / {qs.length*4}</Text></Text></Card>
        <View style={{flexDirection:"row",gap:8,marginTop:10}}>
          <Card style={{flex:1,alignItems:"center"}}><Text style={{fontWeight:"900"}}>{correct}</Text><Text style={{fontSize:10,color:C.mutedText}}>Correct</Text></Card>
          <Card style={{flex:1,alignItems:"center"}}><Text style={{fontWeight:"900"}}>{wrong}</Text><Text style={{fontSize:10,color:C.mutedText}}>Wrong</Text></Card>
          <Card style={{flex:1,alignItems:"center"}}><Text style={{fontWeight:"900"}}>{skipped}</Text><Text style={{fontSize:10,color:C.mutedText}}>Skipped</Text></Card>
        </View>
        <Pressable onPress={()=>{saveTest({id:String(Date.now()),title:"Timed Test",subject:subject||"mixed",total:qs.length,score:correct*4-wrong,accuracy:Math.round(correct/qs.length*100),correct,wrong,skipped,timeSec:elapsed,at:Date.now()});setQs([]);setDone(false)}} style={{marginTop:16,borderWidth:1,borderColor:C.border,borderRadius:16,padding:14,alignItems:"center"}}><Text style={{fontWeight:"700"}}>Back to tests</Text></Pressable>
      </Shell>;
    }

    const q=qs[i];
    const selected=picks[i];
    return <SafeAreaView style={{flex:1,backgroundColor:C.background}} edges={["top","bottom"]}>
      <View style={{flex:1,paddingHorizontal:18}}>
        <View style={{height:58,flexDirection:"row",alignItems:"center",justifyContent:"space-between"}}>
          <View><Text style={{fontSize:10,fontWeight:"900",letterSpacing:1,color:C.primary}}>BUZNEET MOCK TEST</Text><Text style={{fontSize:20,fontWeight:"900",color:C.foreground}}>Question {i+1} / {qs.length}</Text></View>
          <View style={{backgroundColor:left<60?C.destructive:C.accent,borderRadius:12,paddingHorizontal:10,paddingVertical:8}}><Text style={{fontWeight:"900",color:left<60?C.primaryText:C.primary}}>{Math.floor(left/60)}:{String(left%60).padStart(2,"0")}</Text></View>
        </View>
        <View style={{height:6,borderRadius:4,backgroundColor:C.muted,overflow:"hidden"}}><View style={{height:6,width:(`${((i)/qs.length)*100}%` as any),backgroundColor:C.primary}}/></View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingVertical:14,paddingBottom:30}}>
          <Card><Text style={{fontSize:18,fontWeight:"800",lineHeight:26,color:C.foreground}}>{q.prompt}</Text></Card>
          <View style={{gap:9,marginTop:12}}>{q.options.map((o:any,k:number)=><Pressable key={k} onPress={()=>setPicks(a=>a.map((x,j)=>j===i?(x===k?null:k):x))} style={{padding:15,borderRadius:16,borderWidth:1,borderColor:selected===k?C.primary:C.border,backgroundColor:selected===k?C.accent:C.card}}><Text style={{fontSize:13,color:C.foreground}}>{String.fromCharCode(65+k)}. {o}</Text></Pressable>)}</View>
          <View style={{flexDirection:"row",gap:8,marginTop:16}}>
            <Pressable disabled={i===0} onPress={()=>setI(i-1)} style={{flex:1,borderWidth:1,borderColor:C.border,borderRadius:16,padding:14,alignItems:"center",opacity:i===0?.45:1}}><Text style={{fontWeight:"800",color:C.foreground}}>Previous</Text></Pressable>
            <Pressable onPress={()=>i===qs.length-1?setDone(true):setI(i+1)} style={{flex:1,backgroundColor:C.primary,borderRadius:16,padding:14,alignItems:"center"}}><Text style={{fontWeight:"900",color:C.primaryText}}>{i===qs.length-1?"Submit test":"Next"}</Text></Pressable>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>;
  }

  const totalSelected=Object.values(chapterCounts).reduce((a,b)=>a+b,0);
  const allSelected=mockChapters.length===totalSelected;

  return <>
    <Shell title="Tests" subtitle="Timed · +4 / −1">
      <Text style={{fontSize:13,color:C.mutedText}}>Choose a test or build a custom one. Correct +4 · wrong −1 · skipped 0.</Text>

      <Text style={{fontSize:18,fontWeight:"900",color:C.foreground,marginTop:20}}>Quick tests</Text>
      <View style={{gap:8,marginTop:10}}>{[
        [undefined,"Full NEET Mock",180,180],
        ["biology","Biology Test",45,45],
        ["chemistry","Chemistry Test",45,45],
        ["physics","Physics Test",45,45],
      ].map(([id,title,n,minutes])=><Pressable key={String(title)} onPress={()=>requestStart({subject:id as string|undefined,n:n as number,minutes:minutes as number,title:String(title)})} style={{padding:16,borderRadius:18,borderWidth:1,borderColor:C.border,backgroundColor:C.card}}>
        <Text style={{fontWeight:"800",color:C.foreground}}>{title}</Text><Text style={{fontSize:11,color:C.mutedText,marginTop:3}}>{n} questions · {minutes} minutes</Text>
      </Pressable>)}</View>

      <Text style={{fontSize:18,fontWeight:"900",color:C.foreground,marginTop:20}}>Advanced Test Builder {premium.active?"":"· Premium"}</Text>
      <Card style={{marginTop:10,opacity:premium.active?1:.55}}>
        <Text style={{fontSize:11,fontWeight:"900",color:C.primary}}>CUSTOM NEET MOCK</Text>
        <Text style={{fontSize:12,lineHeight:18,color:C.mutedText,marginTop:5}}>Choose how many chapters to include from each subject, then select the chapters. The mock contains 180 questions, 720 marks and a 180-minute exam timer.</Text>
        {["physics","chemistry","biology"].map(sub=>{
          const selected=mockChapters.filter(id=>CHAPTERS.find(ch=>ch.id===id)?.subject===sub);
          const count=chapterCounts[sub]||1;
          const max=CHAPTERS.filter(ch=>ch.subject===sub).length;
          return <View key={sub} style={{marginTop:10,padding:13,borderRadius:14,borderWidth:1,borderColor:C.border,backgroundColor:C.card}}>
            <View style={{flexDirection:"row",alignItems:"center",justifyContent:"space-between"}}>
              <Text style={{fontSize:10,fontWeight:"900",letterSpacing:1,color:C.primary}}>{sub.toUpperCase()}</Text>
              <View style={{flexDirection:"row",alignItems:"center",gap:10}}>
                <Pressable disabled={!premium.active||count<=1} onPress={()=>{const next=Math.max(1,count-1);setChapterCounts(x=>({...x,[sub]:next}));setMockChapters(x=>{const ids=x.filter(id=>CHAPTERS.find(ch=>ch.id===id)?.subject===sub);const keep=ids.slice(0,next);return x.filter(id=>CHAPTERS.find(ch=>ch.id===id)?.subject!==sub).concat(keep)})}}><Text style={{fontSize:20,fontWeight:"900",color:count<=1?C.mutedText:C.foreground}}>−</Text></Pressable>
                <Text style={{fontSize:15,fontWeight:"900",color:C.foreground}}>{count}</Text>
                <Pressable disabled={!premium.active||count>=max} onPress={()=>setChapterCounts(x=>({...x,[sub]:Math.min(max,count+1)}))}><Text style={{fontSize:20,fontWeight:"900",color:count>=max?C.mutedText:C.foreground}}>+</Text></Pressable>
              </View>
            </View>
            <Text style={{fontSize:10,color:C.mutedText,marginTop:4}}>{selected.length}/{count} chapters selected</Text>
            <Pressable disabled={!premium.active} onPress={()=>setPickerSubject(sub)} style={{marginTop:9,padding:11,borderRadius:12,backgroundColor:C.accent}}><Text style={{fontSize:11,fontWeight:"800",color:C.foreground}}>{selected.length?selected.map(id=>CHAPTERS.find(ch=>ch.id===id)?.name).join(", "):"Select chapters"} <Text style={{color:C.primary}}> · Edit</Text></Text></Pressable>
          </View>;
        })}
        <View style={{flexDirection:"row",gap:8,marginTop:12}}>
          <View style={{flex:1,padding:12,borderRadius:14,backgroundColor:C.accent}}><Text style={{fontSize:9,fontWeight:"900",color:C.primary}}>QUESTIONS</Text><Text style={{fontSize:18,fontWeight:"900",color:C.foreground,marginTop:3}}>180</Text></View>
          <View style={{flex:1,padding:12,borderRadius:14,backgroundColor:C.accent}}><Text style={{fontSize:9,fontWeight:"900",color:C.primary}}>MARKS</Text><Text style={{fontSize:18,fontWeight:"900",color:C.foreground,marginTop:3}}>720</Text></View>
          <View style={{flex:1,padding:12,borderRadius:14,backgroundColor:C.accent}}><Text style={{fontSize:9,fontWeight:"900",color:C.primary}}>TIME</Text><Text style={{fontSize:18,fontWeight:"900",color:C.foreground,marginTop:3}}>180m</Text></View>
        </View>
        {!!startError&&<Text style={{fontSize:11,lineHeight:17,color:C.destructive,marginTop:10}}>{startError}</Text>}
        <Pressable disabled={!premium.active||!allSelected} onPress={()=>requestStart({n:180,minutes:180,chapterIds:mockChapters,title:"Custom NEET Mock"})} style={{marginTop:14,backgroundColor:premium.active&&allSelected?C.primary:C.muted,borderRadius:15,padding:14,alignItems:"center"}}>
          <Text style={{fontWeight:"900",color:premium.active&&allSelected?C.primaryText:C.mutedText}>{premium.active?(allSelected?"Start 180Q Mock":"Select all required chapters"):"Premium Required"}</Text>
        </Pressable>
      </Card>

      <Modal visible={!!pickerSubject} transparent animationType="slide" onRequestClose={()=>setPickerSubject(null)}>
        <View style={{flex:1,justifyContent:"flex-end",backgroundColor:"rgba(0,0,0,.35)"}}>
          <View style={{maxHeight:"78%",backgroundColor:C.background,borderTopLeftRadius:24,borderTopRightRadius:24,padding:18}}>
            <View style={{flexDirection:"row",alignItems:"center",justifyContent:"space-between"}}><Text style={{fontSize:18,fontWeight:"900",color:C.foreground}}>Choose {pickerSubject}</Text><Pressable onPress={()=>setPickerSubject(null)}><Text style={{fontSize:15,fontWeight:"900",color:C.primary}}>Done</Text></Pressable></View>
            <ScrollView style={{marginTop:10}}>
              {pickerSubject&&<Text style={{fontSize:11,color:C.mutedText,marginBottom:10}}>Select exactly {chapterCounts[pickerSubject]} chapter{chapterCounts[pickerSubject]===1?"":"s"}.</Text>}
              {CHAPTERS.filter(ch=>ch.subject===pickerSubject).map(ch=>{
                const selected=mockChapters.includes(ch.id);
                const limit=chapterCounts[pickerSubject||"physics"]||1;
                return <Pressable key={ch.id} onPress={()=>{if(!pickerSubject)return;setMockChapters(prev=>{const current=prev.filter(id=>CHAPTERS.find(x=>x.id===id)?.subject===pickerSubject);if(selected)return prev.filter(id=>id!==ch.id);if(current.length>=limit)return prev;return [...prev,ch.id]})}} style={{padding:13,borderRadius:14,borderWidth:1,borderColor:selected?C.primary:C.border,backgroundColor:selected?C.accent:C.card,marginBottom:7}}><Text style={{fontSize:12,fontWeight:"800",color:C.foreground}}>{selected?"✓ ":""}{ch.name}</Text></Pressable>;
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Shell>

    <Modal visible={rulesVisible} animationType="fade" onRequestClose={()=>setRulesVisible(false)}>
      <SafeAreaView style={{flex:1,backgroundColor:C.background}} edges={["top","bottom"]}>
        <ScrollView contentContainerStyle={{padding:22,paddingBottom:35}}>
          <Text style={{fontSize:10,fontWeight:"900",letterSpacing:1.5,color:C.primary}}>BUZNEET EXAM MODE</Text>
          <Text style={{fontSize:30,fontWeight:"900",color:C.foreground,marginTop:5}}>Before you start</Text>
          <Card style={{marginTop:18,backgroundColor:C.primary,borderColor:C.primary}}>
            <Text style={{fontSize:12,fontWeight:"900",color:C.primaryText}}>EXAM RULES</Text>
            {[
              "Answer the questions on your own. Do not use books, answer keys, websites or other outside help during the mock.",
              "Do not share questions or answers with another person while the test is running.",
              "The timer keeps running once the mock begins.",
              "You can move between questions and leave questions unanswered; skipped questions receive 0 marks.",
              "Scoring follows NEET-style marking: +4 for correct, −1 for wrong, 0 for skipped.",
              "Once you submit the test, your result will be calculated from your recorded answers."
            ].map((rule,n)=><View key={n} style={{flexDirection:"row",marginTop:12}}><Text style={{width:25,fontWeight:"900",color:C.primaryText}}>{n+1}.</Text><Text style={{flex:1,fontSize:12,lineHeight:18,color:C.primaryText}}>{rule}</Text></View>)}
          </Card>
          {pending&&<Card style={{marginTop:12}}><Text style={{fontSize:10,fontWeight:"900",color:C.primary}}>YOUR TEST</Text><Text style={{fontSize:18,fontWeight:"900",color:C.foreground,marginTop:4}}>{pending.title}</Text><Text style={{fontSize:11,color:C.mutedText,marginTop:3}}>{pending.n} questions · {pending.n*4} marks · {pending.minutes} minutes</Text></Card>}
          {!!startError&&<Text style={{fontSize:11,color:C.destructive,lineHeight:17,marginTop:10}}>{startError}</Text>}
          <Pressable onPress={()=>pending&&start(pending)} style={{marginTop:18,backgroundColor:C.primary,borderRadius:17,padding:16,alignItems:"center"}}><Text style={{fontSize:15,fontWeight:"900",color:C.primaryText}}>I Understand — Start Test</Text></Pressable>
          <Pressable onPress={()=>{setRulesVisible(false);setPending(null)}} style={{marginTop:10,borderWidth:1,borderColor:C.border,borderRadius:17,padding:15,alignItems:"center"}}><Text style={{fontWeight:"800",color:C.foreground}}>Cancel</Text></Pressable>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  </>;
}
