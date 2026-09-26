import{useMemo,useState}from"react";
import{router,useLocalSearchParams}from"expo-router";
import{Pressable,Text,View}from"react-native";
import{Shell}from"../native/ui";
import{C}from"../native/theme";
import{CHAPTERS,SUBJECTS,MODES,chapterQuestionCount,type ContentMode}from"../native/content";

export default function Chapters(){
  const p=useLocalSearchParams<{subject?:string}>();
  const[sub,setSub]=useState<"biology"|"chemistry"|"physics">((p.subject as any)||"biology");
  const[open,setOpen]=useState<string|null>(null);
  const chapters=useMemo(()=>CHAPTERS.filter(c=>c.subject===sub),[sub]);

  return <Shell title="Chapter Hub" subtitle="87 chapters">
    <View style={{flexDirection:"row",backgroundColor:C.muted,borderRadius:16,padding:4}}>
      {SUBJECTS.map(s=><Pressable key={s.id} onPress={()=>{setSub(s.id);setOpen(null)}} style={{flex:1,paddingVertical:10,borderRadius:12,backgroundColor:sub===s.id?C.card:"transparent",alignItems:"center"}}><Text style={{fontSize:12,fontWeight:"800",color:sub===s.id?C.primary:C.mutedText}}>{s.name}</Text></Pressable>)}
    </View>
    {[11,12].map(cls=><View key={cls} style={{marginTop:20}}>
      <Text style={{fontSize:11,fontWeight:"800",letterSpacing:1.5,color:C.mutedText}}>CLASS {cls}</Text>
      {chapters.filter(c=>c.classLevel===cls).map(c=>{
        const qs=chapterQuestionCount(c.id,"revision");
        const isOpen=open===c.id;
        return <View key={c.id} style={{marginTop:8,borderRadius:20,borderWidth:1,borderColor:C.border,backgroundColor:C.card,overflow:"hidden"}}>
          <Pressable onPress={()=>setOpen(isOpen?null:c.id)} style={{padding:16}}>
            <View style={{flexDirection:"row",alignItems:"center"}}><View style={{flex:1}}><Text style={{fontSize:14,fontWeight:"800",color:C.foreground}}>{c.name}</Text><Text style={{fontSize:11,color:C.mutedText,marginTop:4}}>{qs} questions · {c.topics.length} core topics</Text></View><Text style={{fontSize:19,color:C.mutedText}}>{isOpen?"⌃":"⌄"}</Text></View>
          </Pressable>
          {isOpen&&<View style={{borderTopWidth:1,borderTopColor:C.border,padding:10,gap:8}}>
            {MODES.map(m=>{
              const n=chapterQuestionCount(c.id,m.id as ContentMode);
              const disabled=n===0;
              return <Pressable key={m.id} disabled={disabled} onPress={()=>router.push({pathname:"/practice",params:{chapter:c.id,mode:m.id}})} style={{padding:13,borderRadius:16,backgroundColor:disabled?"#F2F1EB":C.accent,opacity:disabled?.58:1}}>
                <View style={{flexDirection:"row",justifyContent:"space-between"}}><Text style={{fontSize:12,fontWeight:"900",color:disabled?C.mutedText:C.primary}}>{m.label}</Text><Text style={{fontSize:11,fontWeight:"800",color:C.foreground}}>{n}</Text></View>
                <Text style={{fontSize:10,color:C.mutedText,marginTop:3}}>{m.desc}{m.id==="ncert"&&n===0?" · source-review queue":""}</Text>
              </Pressable>
            })}
            <Pressable onPress={()=>router.push({pathname:"/practice",params:{chapter:c.id,mode:"revision"}})} style={{padding:14,borderRadius:16,backgroundColor:C.primary,alignItems:"center"}}><Text style={{fontWeight:"900",color:C.primaryText}}>Start full chapter revision</Text></Pressable>
          </View>}
        </View>
      })}
    </View>)}
  </Shell>
}
