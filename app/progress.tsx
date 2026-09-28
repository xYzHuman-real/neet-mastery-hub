import { useEffect, useMemo, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { Shell, Card } from "../native/ui";
import { C } from "../native/theme";
import { useStore } from "../native/store";
import { loadContent } from "../native/content";
import { buildAnalytics, smartRevision } from "../native/analytics";
import { getAchievements } from "../native/personalization";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Progress(){
 const{answered,mistakes,testHistory,streak,premium}=useStore(); const[content,setContent]=useState<any[]>([]);
 useEffect(()=>{loadContent().then(setContent)},[]);
 const a=useMemo(()=>buildAnalytics(content,answered,testHistory),[content,answered,testHistory]);
 const weak=useMemo(()=>smartRevision(content,answered,mistakes),[content,answered,mistakes]);
 const achievements=getAchievements(a.attempted,streak,a.accuracy,a.tests);
 const unlockKey=achievements.filter(x=>x.unlocked).map(x=>x.id).join(",");
 const[newAchievement,setNewAchievement]=useState<typeof achievements[number]|null>(null);
 const badgeScale=useState(()=>new Animated.Value(0.72))[0];
 const badgeOpacity=useState(()=>new Animated.Value(0))[0];
 useEffect(()=>{
   if(!unlockKey)return;
   AsyncStorage.getItem("buzneet-seen-achievements-v1").then(raw=>{
     let seen:string[]=[];
     try{seen=raw?JSON.parse(raw):[]}catch{}
     const newlyUnlocked=achievements.find(x=>x.unlocked&&!seen.includes(x.id));
     if(newlyUnlocked){
       setNewAchievement(newlyUnlocked);
       badgeScale.setValue(0.72);
       badgeOpacity.setValue(0);
       Animated.parallel([
         Animated.spring(badgeScale,{toValue:1,useNativeDriver:true,damping:9,stiffness:180}),
         Animated.timing(badgeOpacity,{toValue:1,duration:220,useNativeDriver:true})
       ]).start();
       setTimeout(()=>{
         Animated.timing(badgeOpacity,{toValue:0,duration:220,useNativeDriver:true}).start(({finished})=>{
           if(finished)setNewAchievement(null);
         });
       },2600);
     }
     AsyncStorage.setItem("buzneet-seen-achievements-v1",JSON.stringify(Array.from(new Set([...seen,...achievements.filter(x=>x.unlocked).map(x=>x.id)]))));
   });
 },[unlockKey]);
 return <Shell title="Progress" subtitle="Your preparation data">
  {newAchievement&&<Animated.View style={{opacity:badgeOpacity,transform:[{scale:badgeScale}],marginTop:4,marginBottom:10}}>
    <Card style={{backgroundColor:C.primary,borderColor:C.primary}}>
      <View style={{flexDirection:"row",alignItems:"center"}}>
        <View style={{width:48,height:48,borderRadius:16,backgroundColor:"rgba(255,255,255,.18)",alignItems:"center",justifyContent:"center"}}>
          <Text style={{fontSize:25}}>🏅</Text>
        </View>
        <View style={{marginLeft:12,flex:1}}>
          <Text style={{fontSize:9,fontWeight:"900",letterSpacing:1,color:C.primaryText}}>ACHIEVEMENT UNLOCKED</Text>
          <Text style={{fontSize:17,fontWeight:"900",color:C.primaryText,marginTop:2}}>{newAchievement.title}</Text>
          <Text style={{fontSize:10,color:C.primaryText,opacity:.86,marginTop:2}}>{newAchievement.detail}</Text>
        </View>
      </View>
    </Card>
  </Animated.View>}
  <View style={{flexDirection:"row",gap:8}}><Card style={{flex:1}}><Text style={{fontSize:24,fontWeight:"900",color:C.foreground}}>{a.attempted}</Text><Text style={{fontSize:10,color:C.mutedText}}>Attempted</Text></Card><Card style={{flex:1}}><Text style={{fontSize:24,fontWeight:"900",color:C.foreground}}>{a.accuracy}%</Text><Text style={{fontSize:10,color:C.mutedText}}>Accuracy</Text></Card><Card style={{flex:1}}><Text style={{fontSize:24,fontWeight:"900",color:C.foreground}}>{a.tests}</Text><Text style={{fontSize:10,color:C.mutedText}}>Tests</Text></Card></View>
  <Card style={{marginTop:10,backgroundColor:C.highlight}}><Text style={{fontSize:10,fontWeight:"900",letterSpacing:1,color:C.highlightText}}>CONSISTENCY</Text><Text style={{fontSize:28,fontWeight:"900",color:C.highlightText,marginTop:3}}>{streak} day streak</Text><Text style={{fontSize:11,color:C.highlightText,marginTop:2}}>Keep practicing daily to maintain it.</Text></Card>
  {premium.active&&<Text style={{fontSize:18,fontWeight:"900",color:C.foreground,marginTop:20}}>Advanced Analytics</Text>}{!premium.active&&<Card style={{marginTop:20}}><Text style={{fontSize:18,fontWeight:"900",color:C.foreground}}>Advanced Analytics</Text><Text style={{fontSize:11,color:C.mutedText,marginTop:5}}>Premium unlocks deeper chapter, subject, series and test-performance insights.</Text><Pressable onPress={()=>router.push("/premium")} style={{marginTop:10,backgroundColor:C.primary,borderRadius:14,padding:12,alignItems:"center"}}><Text style={{fontWeight:"900",color:C.primaryText}}>Unlock Analytics</Text></Pressable></Card>}
{premium.active&&<View style={{flexDirection:"row",gap:8,marginTop:10}}>{a.subjectStats.map((x:any)=><Card key={x.subject} style={{flex:1}}><Text style={{fontSize:9,fontWeight:"900",color:C.primary}}>{x.subject.toUpperCase()}</Text><Text style={{fontSize:20,fontWeight:"900",color:C.foreground,marginTop:4}}>{x.accuracy}%</Text><Text style={{fontSize:9,color:C.mutedText}}>{x.attempted} attempted</Text></Card>)}</View>}
{premium.active&&<View style={{marginTop:8,gap:8}}>{a.seriesStats.map((x:any)=><Card key={x.series}><View style={{flexDirection:"row",justifyContent:"space-between"}}><Text style={{fontWeight:"900",color:C.foreground}}>{x.series==="ncert"?"NCERT":x.series==="ar"?"Assertion & Reason":x.series==="mcq"?"MCQ":x.series==="pyq"?"PYQ":"Revision"}</Text><Text style={{fontWeight:"900",color:C.primary}}>{x.accuracy}%</Text></View><Text style={{fontSize:10,color:C.mutedText,marginTop:3}}>{x.correct}/{x.attempted} correct</Text></Card>)}</View>}
{premium.active&&<Text style={{fontSize:18,fontWeight:"900",color:C.foreground,marginTop:20}}>Test performance</Text>}
{premium.active&&(testHistory.length?testHistory.slice(0,8).map((t:any)=><Card key={t.id} style={{marginTop:8}}><View style={{flexDirection:"row",justifyContent:"space-between"}}><Text style={{fontWeight:"900",color:C.foreground}}>{t.title}</Text><Text style={{fontWeight:"900",color:C.primary}}>{t.score}/{t.total*4}</Text></View><Text style={{fontSize:10,color:C.mutedText,marginTop:3}}>{t.accuracy}% accuracy · {Math.round(t.timeSec/60)} min</Text></Card>):<Card style={{marginTop:8}}><Text style={{color:C.mutedText}}>Complete a timed test to build test analytics.</Text></Card>)}
{premium.active&&<Text style={{fontSize:18,fontWeight:"900",color:C.foreground,marginTop:20}}>Chapter performance</Text>}
  {!premium.active?null:a.chapterStats.length===0?<Card style={{marginTop:10}}><Text style={{color:C.mutedText}}>Complete some practice to build your analytics.</Text></Card>:a.chapterStats.slice().sort((x,y)=>x.accuracy-y.accuracy).slice(0,8).map(x=><Card key={x.id} style={{marginTop:8}}><View style={{flexDirection:"row",justifyContent:"space-between"}}><Text style={{fontWeight:"800",color:C.foreground,flex:1}}>{x.name}</Text><Text style={{fontWeight:"900",color:x.accuracy<60?C.destructive:C.primary}}>{x.accuracy}%</Text></View><Text style={{fontSize:10,color:C.mutedText,marginTop:3}}>{x.correct}/{x.attempted} correct</Text></Card>)}
  {premium.active&&<Text style={{fontSize:18,fontWeight:"900",color:C.foreground,marginTop:20}}>Smart Revision 2.0</Text>}{!premium.active&&<Card style={{marginTop:20}}><Text style={{fontSize:18,fontWeight:"900",color:C.foreground}}>Smart Revision 2.0</Text><Text style={{fontSize:11,color:C.mutedText,marginTop:5}}>Premium adds targeted revision from weak chapters, mistakes and saved questions.</Text><Pressable onPress={()=>router.push("/premium")} style={{marginTop:10,backgroundColor:C.primary,borderRadius:14,padding:12,alignItems:"center"}}><Text style={{fontWeight:"900",color:C.primaryText}}>Unlock Smart Revision</Text></Pressable></Card>}
  <Card style={{marginTop:10,backgroundColor:C.accent}}><Text style={{fontWeight:"800",color:C.foreground}}>Questions selected from your mistakes and revision schedule.</Text><Text style={{fontSize:11,color:C.mutedText,marginTop:5}}>{weak.length} questions are ready for revision.</Text><Pressable onPress={()=>router.push({pathname:"/practice",params:{review:"1"}})} style={{marginTop:12,backgroundColor:C.primary,borderRadius:14,padding:12,alignItems:"center"}}><Text style={{fontWeight:"900",color:C.primaryText}}>Start Smart Revision</Text></Pressable></Card>
  <Text style={{fontSize:18,fontWeight:"900",color:C.foreground,marginTop:20}}>Achievements</Text>
  <View style={{gap:8,marginTop:10}}>{achievements.map(x=><Card key={x.id} style={{opacity:x.unlocked?1:.55}}><View style={{flexDirection:"row",alignItems:"center"}}><View style={{width:36,height:36,borderRadius:12,backgroundColor:x.unlocked?C.primary:C.muted,alignItems:"center",justifyContent:"center"}}><Text style={{fontWeight:"900",color:x.unlocked?C.primaryText:C.mutedText}}>{x.unlocked?"✓":"•"}</Text></View><View style={{marginLeft:10,flex:1}}><Text style={{fontWeight:"900",color:C.foreground}}>{x.title}</Text><Text style={{fontSize:10,color:C.mutedText,marginTop:2}}>{x.detail}</Text></View></View></Card>)}</View>
 </Shell>;
}