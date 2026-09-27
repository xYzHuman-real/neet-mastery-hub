import{useLocalSearchParams,router}from"expo-router";
import{useMemo,useState,useEffect}from"react";
import{Pressable,Text,View}from"react-native";
import{Shell,Card}from"../native/ui";
import{C}from"../native/theme";
import{useStore,type Rating}from"../native/store";
import{loadContent,filterQuestions,chapterById}from"../native/content";

export default function Practice(){
  const p=useLocalSearchParams<{chapter?:string;mode?:string;review?:string;mistakes?:string}>();
  const{due,mistakes,record,rate}=useStore();
  const[content,setContent]=useState<any[]|null>(null);
  const[contentError,setContentError]=useState(false);
  useEffect(()=>{loadContent().then(setContent).catch(()=>setContentError(true))},[]);
  const mode=p.mode||"revision";
  const deck=useMemo(()=>{
    if(!content)return [];
    if(p.review)return filterQuestions(content,undefined,"revision").filter(x=>due.includes(x.id));
    if(p.mistakes)return filterQuestions(content,undefined,"revision").filter((x:any)=>mistakes[x.id]);
    return filterQuestions(content,p.chapter,mode);
  },[content,p.chapter,p.mode,p.review,p.mistakes,due,mistakes]);
  const[i,setI]=useState(0);
  const[pick,setPick]=useState<number|null>(null);
  const[shown,setShown]=useState(false);
  const[startedAt]=useState(Date.now());
  const[results,setResults]=useState<{qid:string;correct:boolean;pick:number|null;time:number}[]>([]);
  const q=deck[i];

  if(contentError)return <Shell title="Practice unavailable" subtitle="BuzNeet"><Card><Text style={{fontSize:16,fontWeight:"800",color:C.foreground}}>The question bank could not be loaded.</Text><Pressable onPress={()=>router.back()} style={{marginTop:16,backgroundColor:C.primary,borderRadius:16,padding:14,alignItems:"center"}}><Text style={{fontWeight:"800",color:C.primaryText}}>Go back</Text></Pressable></Card></Shell>;
  if(!content)return <Shell title="Loading practice" subtitle="BuzNeet"><Card><Text style={{fontSize:16,fontWeight:"800",color:C.foreground}}>Preparing your question bank…</Text></Card></Shell>;
  if(!deck.length)return <Shell title="Series empty" subtitle="Content review"><Card><Text style={{fontSize:22,fontWeight:"900",color:C.foreground}}>No released questions here yet.</Text><Text style={{fontSize:13,lineHeight:20,color:C.mutedText,marginTop:8}}>{mode==="pyq"?"PYQ-derived practice is being prepared; verified official PYQs will be added separately when source-verified.":"This chapter series does not have released questions yet."}</Text><Pressable onPress={()=>router.back()} style={{marginTop:16,backgroundColor:C.primary,borderRadius:16,padding:14,alignItems:"center"}}><Text style={{fontWeight:"800",color:C.primaryText}}>Go back</Text></Pressable></Card></Shell>;

  if(i>=deck.length){
    const correct=results.filter(r=>r.correct).length;
    const answered=results.length;
    const accuracy=answered?Math.round(correct/answered*100):0;
    const elapsed=Math.max(1,Math.round((Date.now()-startedAt)/1000));
    const mins=Math.floor(elapsed/60),secs=elapsed%60;
    return <Shell title="Session Review" subtitle="Completed">
      <Card style={{backgroundColor:C.primary,borderColor:C.primary}}>
        <Text style={{fontSize:11,color:C.primaryText}}>YOUR SCORE</Text>
        <Text style={{fontSize:42,fontWeight:"900",color:C.primaryText,marginTop:4}}>{correct}<Text style={{fontSize:18}}> / {deck.length}</Text></Text>
        <Text style={{fontSize:12,color:C.primaryText,marginTop:2}}>{accuracy}% accuracy</Text>
      </Card>
      <View style={{flexDirection:"row",gap:8,marginTop:10}}>
        <Card style={{flex:1,alignItems:"center"}}><Text style={{fontSize:20,fontWeight:"900",color:C.foreground}}>{answered}</Text><Text style={{fontSize:10,color:C.mutedText}}>Attempted</Text></Card>
        <Card style={{flex:1,alignItems:"center"}}><Text style={{fontSize:20,fontWeight:"900",color:C.foreground}}>{deck.length-answered}</Text><Text style={{fontSize:10,color:C.mutedText}}>Unattempted</Text></Card>
        <Card style={{flex:1,alignItems:"center"}}><Text style={{fontSize:20,fontWeight:"900",color:C.foreground}}>{mins}:{String(secs).padStart(2,"0")}</Text><Text style={{fontSize:10,color:C.mutedText}}>Time</Text></Card>
      </View>
      <Text style={{fontSize:17,fontWeight:"900",color:C.foreground,marginTop:18}}>Review your questions</Text>
      <View style={{gap:8,marginTop:10}}>{results.slice().reverse().map((r,idx)=><Pressable key={r.qid} onPress={()=>{const at=deck.findIndex(x=>x.id===r.qid);if(at>=0){setI(at);setShown(true);setPick(r.pick)}}} style={{padding:14,borderRadius:17,borderWidth:1,borderColor:r.correct?C.success:C.destructive,backgroundColor:C.card}}><Text style={{fontSize:11,fontWeight:"800",color:r.correct?C.success:C.destructive}}>{r.correct?"✓ Correct":"× Review this"}</Text><Text numberOfLines={2} style={{fontSize:12,color:C.foreground,marginTop:4}}>{deck.find(x=>x.id===r.qid)?.prompt}</Text></Pressable>)}</View>
      <Pressable onPress={()=>router.replace("/chapters")} style={{marginTop:16,backgroundColor:C.primary,borderRadius:16,padding:14,alignItems:"center"}}><Text style={{fontWeight:"800",color:C.primaryText}}>Back to chapters</Text></Pressable>
    </Shell>;
  }

  const modeLabel=p.review?"Revision Deck":p.mistakes?"Mistake Revision":mode==="ncert"?"NCERT Line-by-Line":mode==="pyq"?"PYQ Practice":mode==="ar"?"Assertion & Reason":mode==="mcq"?"MCQ Series":"Full Chapter Revision";
  const correct=pick===q.answer;

  const submit=()=>{
    if(shown || pick===null)return;
    const isCorrect=pick===q.answer;
    record(q.id,isCorrect);
    setResults(x=>[...x,{qid:q.id,correct:isCorrect,pick,time:Date.now()}]);
    setShown(true);
  };

  const next=(r:Rating)=>{
    rate(q.id,r);
    setPick(null);
    setShown(false);
    setI(x=>x+1);
  };

  return <Shell title={p.chapter?(chapterById(p.chapter)?.name||"Practice"):modeLabel} subtitle={modeLabel} right={<Text style={{fontWeight:"800",color:C.primary}}>{i+1}/{deck.length}</Text>}>
    <View style={{height:6,borderRadius:4,backgroundColor:C.muted,overflow:"hidden",marginBottom:12}}><View style={{height:6,width:(`${((i)/deck.length)*100}%` as any),backgroundColor:C.primary}}/></View>

    <Card>
      {mode==="ar" ? <View>
        <Text style={{fontSize:12,fontWeight:"900",color:C.primary,letterSpacing:.4}}>Assertion (A)</Text>
        <Text style={{fontSize:17,fontWeight:"800",lineHeight:25,color:C.foreground,marginTop:6}}>{q.assertion||q.prompt}</Text>
        <Text style={{fontSize:12,fontWeight:"900",color:C.primary,letterSpacing:.4,marginTop:16}}>Reason (R)</Text>
        <Text style={{fontSize:17,fontWeight:"800",lineHeight:25,color:C.foreground,marginTop:6}}>{q.reason||"Reason statement unavailable."}</Text>
      </View> : <Text style={{fontSize:18,fontWeight:"800",lineHeight:25,color:C.foreground}}>{q.prompt}</Text>}
      {mode==="ar"&&<Text style={{fontSize:11,lineHeight:17,color:C.mutedText,marginTop:14}}>Choose the option that correctly evaluates A and R and whether R explains A.</Text>}
      {q.reviewStatus==="draft"&&<Text style={{fontSize:10,color:C.mutedText,marginTop:10}}>Draft bank item · subject review is still required before treating this as final released content.</Text>}
    </Card>

    <View style={{gap:8,marginTop:12}}>
      {q.options.map((o,k)=><Pressable key={k} disabled={shown} onPress={()=>setPick(k)} style={{
        padding:15,borderRadius:16,borderWidth:1,
        borderColor:shown&&k===q.answer?C.success:pick===k?C.primary:C.border,
        backgroundColor:shown&&k===q.answer?C.accent:pick===k?"#EEF5F1":C.card
      }}>
        <Text style={{fontSize:13,fontWeight:pick===k?"800":"500",color:C.foreground}}>{String.fromCharCode(65+k)}. {o}</Text>
      </Pressable>)}
    </View>

    {!shown&&<Pressable disabled={pick===null} onPress={submit} style={{marginTop:14,minHeight:52,borderRadius:16,alignItems:"center",justifyContent:"center",backgroundColor:pick===null?C.muted:C.primary}}>
      <Text style={{fontSize:15,fontWeight:"900",color:pick===null?C.mutedText:C.primaryText}}>Submit answer</Text>
    </Pressable>}

    {shown&&<Card style={{marginTop:12,backgroundColor:C.accent}}>
      <Text style={{fontWeight:"900",color:correct?C.success:C.destructive}}>{correct?"Correct answer":"Incorrect answer"}</Text>
      {!correct&&<Text style={{fontSize:12,fontWeight:"800",color:C.foreground,marginTop:5}}>Correct option: {String.fromCharCode(65+q.answer)}</Text>}
      {q.explanation&&<Text style={{fontSize:12,lineHeight:19,color:C.foreground,marginTop:6}}>{q.explanation}</Text>}
    </Card>}

    {shown&&<View style={{marginTop:10}}>
      <Pressable onPress={()=>next("good")} style={{minHeight:52,borderRadius:16,alignItems:"center",justifyContent:"center",backgroundColor:C.primary}}>
        <Text style={{fontSize:15,fontWeight:"900",color:C.primaryText}}>{i===deck.length-1?"Finish":"Next question"}</Text>
      </Pressable>
      <View style={{flexDirection:"row",gap:7,marginTop:8}}>
        {(["again","hard","good","easy"] as Rating[]).map(r=><Pressable key={r} onPress={()=>rate(q.id,r)} style={{flex:1,paddingVertical:9,borderRadius:12,backgroundColor:C.card,borderWidth:1,borderColor:C.border}}><Text style={{fontSize:10,fontWeight:"800",textAlign:"center"}}>{r}</Text></Pressable>)}
      </View>
    </View>}
  </Shell>
}