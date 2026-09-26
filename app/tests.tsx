import{useEffect,useMemo,useState}from"react";
import{Pressable,Text,View}from"react-native";
import{Shell,Card}from"../native/ui";
import{C}from"../native/theme";import{loadContent,CHAPTERS}from"../native/content";


export default function Tests(){
  const[qs,setQs]=useState<any[]>([]); const[content,setContent]=useState<any>(null);
  const[i,setI]=useState(0);
  const[picks,setPicks]=useState<(number|null)[]>([]);
  const[left,setLeft]=useState(0);
  const[started,setStarted]=useState(0);
  const[done,setDone]=useState(false); const[contentError,setContentError]=useState(false);

  const start=(sub?:string)=>{
    const a=content!.filter(q=>q.options.length&&(!sub||CHAPTERS.find(c=>c.id===q.chapterId)?.subject===sub)).slice(0,50);
    setQs(a);setPicks(a.map(()=>null));setI(0);setLeft(a.length*60);setStarted(Date.now());setDone(false);
  };
  useEffect(()=>{loadContent().then(setContent).catch(()=>setContentError(true));},[]); useEffect(()=>{if(!qs.length||done)return;const t=setInterval(()=>setLeft(x=>{if(x<=1){setDone(true);return 0}return x-1}),1000);return()=>clearInterval(t)},[qs.length,done]);

  if(contentError)return <Shell title="Tests unavailable" subtitle="BuzNeet"><Text style={{fontSize:14,color:C.mutedText}}>The question bank could not be loaded.</Text></Shell>;
  if(!content)return <Shell title="Loading tests" subtitle="BuzNeet"><Text style={{fontSize:14,color:C.mutedText}}>Preparing the test bank…</Text></Shell>;
  if(!qs.length)return <Shell title="Tests" subtitle="Timed · +4 / −1"><Text style={{fontSize:13,color:C.mutedText}}>50-question tests from the full bank. Correct +4, wrong −1, unattempted 0.</Text>{[[undefined,"Full Mixed Test"],["biology","Biology Test"],["chemistry","Chemistry Test"],["physics","Physics Test"]].map(([id,n])=><Pressable key={String(n)} onPress={()=>start(id as string|undefined)} style={{marginTop:9,padding:16,borderRadius:18,borderWidth:1,borderColor:C.border,backgroundColor:C.card}}><Text style={{fontWeight:"800",color:C.foreground}}>{n}</Text><Text style={{fontSize:11,color:C.mutedText,marginTop:3}}>50 questions · 50 minute limit</Text></Pressable>)}</Shell>;

  if(done){
    const correct=picks.filter((x,k)=>x===qs[k].answer).length;
    const wrong=picks.filter((x,k)=>x!==null&&x!==qs[k].answer).length;
    const elapsed=Math.max(1,Math.round((Date.now()-started)/1000));
    return <Shell title="Test Review" subtitle="Completed">
      <Card style={{backgroundColor:C.primary,borderColor:C.primary}}><Text style={{fontSize:11,color:C.primaryText}}>SCORE</Text><Text style={{fontSize:40,fontWeight:"900",color:C.primaryText}}>{correct*4-wrong}<Text style={{fontSize:17}}> / {qs.length*4}</Text></Text></Card>
      <View style={{flexDirection:"row",gap:8,marginTop:10}}><Card style={{flex:1,alignItems:"center"}}><Text style={{fontWeight:"900"}}>{correct}</Text><Text style={{fontSize:10,color:C.mutedText}}>Correct</Text></Card><Card style={{flex:1,alignItems:"center"}}><Text style={{fontWeight:"900"}}>{wrong}</Text><Text style={{fontSize:10,color:C.mutedText}}>Wrong</Text></Card><Card style={{flex:1,alignItems:"center"}}><Text style={{fontWeight:"900"}}>{Math.floor(elapsed/60)}:{String(elapsed%60).padStart(2,"0")}</Text><Text style={{fontSize:10,color:C.mutedText}}>Time</Text></Card></View>
      <Text style={{fontSize:17,fontWeight:"900",marginTop:18,color:C.foreground}}>Review your questions</Text>
      <Pressable onPress={()=>{setQs([]);setDone(false)}} style={{marginTop:16,borderWidth:1,borderColor:C.border,borderRadius:16,padding:14,alignItems:"center"}}><Text style={{fontWeight:"700"}}>Back to tests</Text></Pressable>
    </Shell>
  }

  const q=qs[i];
  return <Shell title={`Question ${i+1}/${qs.length}`} subtitle="Timed test" right={<Text style={{fontWeight:"800",color:C.primary}}>{Math.floor(left/60)}:{String(left%60).padStart(2,"0")}</Text>}>
    <Card><Text style={{fontSize:18,fontWeight:"800",lineHeight:25,color:C.foreground}}>{q.prompt}</Text></Card>
    <View style={{gap:8,marginTop:12}}>{q.options.map((o,k)=><Pressable onPress={()=>setPicks(a=>a.map((x,j)=>j===i?(x===k?null:k):x))} key={k} style={{padding:14,borderRadius:16,borderWidth:1,borderColor:picks[i]===k?C.primary:C.border,backgroundColor:picks[i]===k?C.accent:C.card}}><Text style={{fontSize:13,color:C.foreground}}>{String.fromCharCode(65+k)}. {o}</Text></Pressable>)}</View>
    <View style={{flexDirection:"row",gap:8,marginTop:14}}><Pressable disabled={i===0} onPress={()=>setI(i-1)} style={{flex:1,borderWidth:1,borderColor:C.border,borderRadius:16,padding:13,alignItems:"center"}}><Text style={{fontWeight:"700"}}>Prev</Text></Pressable><Pressable onPress={()=>i===qs.length-1?setDone(true):setI(i+1)} style={{flex:1,backgroundColor:C.primary,borderRadius:16,padding:13,alignItems:"center"}}><Text style={{fontWeight:"700",color:C.primaryText}}>{i===qs.length-1?"Submit":"Next"}</Text></Pressable></View>
  </Shell>
}
