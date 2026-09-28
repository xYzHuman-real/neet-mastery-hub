import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Shell, Card } from "../native/ui";
import { C } from "../native/theme";
import { useStore } from "../native/store";
import { getDailyMissions, testsToday } from "../native/personalization";

export default function Home() {
  const { user, streak, todayCount, goal, due, testHistory, premium } = useStore();
  const answered=Math.min(todayCount,goal), pct=goal?Math.min(1,answered/goal):0;
  const missions=getDailyMissions(todayCount,goal,due.length,testsToday(testHistory));
  return <Shell title="Good to see you" subtitle="BuzNeet">
    <View style={s.greeting}><View style={{flex:1}}><Text style={s.name}>{user?.name||"NEET Aspirant"}</Text><Text style={s.muted}>Your NEET preparation workspace.</Text></View><View style={s.streak}><Text style={s.streakNumber}>{streak}</Text><Text style={s.streakLabel}>DAY STREAK</Text></View></View>
    <Card style={s.progressCard}><View style={s.row}><View><Text style={s.cardEyebrow}>TODAY'S PRACTICE</Text><Text style={s.big}>{answered}<Text style={s.small}> / {goal}</Text></Text></View><Text style={s.percent}>{Math.round(pct*100)}%</Text></View><View style={s.track}><View style={[s.fill,{width:`${pct*100}%`}]} /></View><Text style={s.progressNote}>{goal-answered>0?`${goal-answered} questions left today`:"Daily goal completed."}</Text></Card>

    <View style={s.sectionRow}><Text style={s.sectionTitle}>Today's mission</Text><Text style={s.missionCount}>{missions.filter(m=>m.done).length}/{missions.length}</Text></View>
    <View style={{gap:8}}>{missions.map(m=><Pressable key={m.id} onPress={()=>m.id==="test"?router.push("/tests"):m.id==="revision"?router.push({pathname:"/practice",params:{review:"1"}}):router.push("/chapters")} style={s.mission}><View style={[s.check,m.done&&s.checkDone]}><Text style={{color:m.done?C.primaryText:C.mutedText,fontWeight:"900"}}>{m.done?"✓":"·"}</Text></View><View style={{flex:1}}><Text style={s.missionTitle}>{m.title}</Text><Text style={s.missionSub}>{m.detail} · {m.progress}/{m.target}</Text></View></Pressable>)}</View>

    <Pressable onPress={()=>router.push("/premium")} style={{marginTop:14,borderRadius:19,backgroundColor:C.card,borderWidth:1,borderColor:C.primary,padding:15}}><Text style={{fontSize:9,fontWeight:"900",letterSpacing:1.1,color:C.primary}}>BUZNEET PREMIUM</Text><Text style={{fontSize:16,fontWeight:"900",color:C.foreground,marginTop:4}}>{premium.active?"Premium is active":"Unlock advanced preparation tools"}</Text><Text style={{fontSize:10,color:C.mutedText,marginTop:3}}>{premium.active&&premium.expiresAt?"Active · Expires "+new Date(premium.expiresAt).toLocaleDateString():"Analytics · Smart Revision 2.0 · Advanced Tests · AI"}</Text></Pressable>
    <Text style={[s.sectionTitle,{marginTop:20}]}>Preparation tools</Text>
    <View style={s.toolGrid}>
      <Pressable onPress={()=>router.push("/tests")} style={s.tool}><Text style={s.toolIcon}>◷</Text><Text style={s.toolTitle}>Advanced Tests</Text><Text style={s.toolSub}>Custom mock & chapter tests</Text></Pressable>
      <Pressable onPress={()=>router.push("/flashcards")} style={s.tool}><Text style={s.toolIcon}>▣</Text><Text style={s.toolTitle}>Flashcards</Text><Text style={s.toolSub}>Active recall decks</Text></Pressable>
      <Pressable onPress={()=>router.push("/planner")} style={s.tool}><Text style={s.toolIcon}>◫</Text><Text style={s.toolTitle}>Study Planner</Text><Text style={s.toolSub}>Personal weekly plan</Text></Pressable>
      <Pressable onPress={()=>router.push("/ai")} style={s.tool}><Text style={s.toolIcon}>✦</Text><Text style={s.toolTitle}>BuzNeet AI</Text><Text style={s.toolSub}>AI study assistant</Text></Pressable>
      <Pressable onPress={()=>router.push({pathname:"/practice",params:{weak:"1"}})} style={s.tool}><Text style={s.toolIcon}>↘</Text><Text style={s.toolTitle}>Fix My Weakness</Text><Text style={s.toolSub}>Target your weak questions</Text></Pressable>
      <Pressable onPress={()=>router.push("/progress")} style={s.tool}><Text style={s.toolIcon}>▤</Text><Text style={s.toolTitle}>Advanced Analytics</Text><Text style={s.toolSub}>Chapter & test insights</Text></Pressable>
    </View>

    <Text style={s.sectionTitle}>Continue preparing</Text>
    <View style={s.grid}>
      <Pressable onPress={()=>router.push("/chapters")} style={s.quick}><Text style={s.icon}>▦</Text><Text style={s.quickTitle}>Practice</Text><Text style={s.quickSub}>87 chapters</Text></Pressable>
      <Pressable onPress={()=>router.push("/tests")} style={s.quick}><Text style={s.icon}>◷</Text><Text style={s.quickTitle}>Tests</Text><Text style={s.quickSub}>Timed NEET tests</Text></Pressable>
      <Pressable onPress={()=>router.push("/progress")} style={s.quick}><Text style={s.icon}>▤</Text><Text style={s.quickTitle}>Progress</Text><Text style={s.quickSub}>{testHistory.length} tests · analytics</Text></Pressable>
      <Pressable onPress={()=>router.push({pathname:"/practice",params:{review:"1"}})} style={s.quick}><Text style={s.icon}>↻</Text><Text style={s.quickTitle}>Review</Text><Text style={s.quickSub}>{due.length} due now</Text></Pressable>
    </View>
    <Card style={{marginTop:14}}><Text style={s.cardEyebrowDark}>SYLLABUS</Text><Text style={s.cardTitle}>Physics · Chemistry · Biology</Text><Text style={s.muted}>Official syllabus structure and question practice are ready inside the Chapter Hub.</Text><Pressable onPress={()=>router.push("/chapters")} style={s.primary}><Text style={s.primaryText}>Open Chapter Hub</Text></Pressable></Card>
  </Shell>;
}
const s=StyleSheet.create({
 greeting:{flexDirection:"row",alignItems:"center",marginBottom:14},name:{fontSize:23,fontWeight:"900",color:C.foreground},muted:{fontSize:11,color:C.mutedText,marginTop:4,lineHeight:17},
 streak:{width:72,height:66,borderRadius:20,backgroundColor:C.highlight,alignItems:"center",justifyContent:"center"},streakNumber:{fontSize:22,fontWeight:"900",color:C.highlightText,lineHeight:23},streakLabel:{fontSize:7,fontWeight:"900",letterSpacing:.8,color:C.highlightText,marginTop:3},
 progressCard:{backgroundColor:C.primary,borderColor:C.primary},row:{flexDirection:"row",alignItems:"center"},cardEyebrow:{fontSize:9,fontWeight:"900",letterSpacing:1.2,color:C.primaryText},cardEyebrowDark:{fontSize:9,fontWeight:"900",letterSpacing:1.2,color:C.primary},big:{fontSize:34,fontWeight:"900",color:C.primaryText,marginTop:2},small:{fontSize:15,fontWeight:"800"},percent:{marginLeft:"auto",fontSize:13,fontWeight:"900",color:C.primaryText},track:{height:7,borderRadius:5,backgroundColor:"rgba(255,255,255,.24)",overflow:"hidden",marginTop:12},fill:{height:7,borderRadius:5,backgroundColor:"#FFFFFF"},progressNote:{fontSize:11,marginTop:7,color:C.primaryText},
 sectionRow:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginTop:20,marginBottom:10},sectionTitle:{fontSize:18,fontWeight:"900",color:C.foreground},missionCount:{fontSize:11,fontWeight:"900",color:C.primary},mission:{minHeight:62,borderRadius:17,borderWidth:1,borderColor:C.border,backgroundColor:C.card,padding:12,flexDirection:"row",alignItems:"center"},check:{width:34,height:34,borderRadius:12,backgroundColor:C.muted,alignItems:"center",justifyContent:"center",marginRight:10},checkDone:{backgroundColor:C.primary},missionTitle:{fontSize:13,fontWeight:"900",color:C.foreground},missionSub:{fontSize:10,color:C.mutedText,marginTop:3},
 grid:{flexDirection:"row",flexWrap:"wrap",gap:9},toolGrid:{flexDirection:"row",flexWrap:"wrap",gap:9,marginTop:10},tool:{width:"48.2%",minHeight:104,borderRadius:19,backgroundColor:C.card,borderWidth:1,borderColor:C.border,padding:14},toolIcon:{fontSize:20,color:C.primary,fontWeight:"800"},toolTitle:{fontSize:12,fontWeight:"900",color:C.foreground,marginTop:7},toolSub:{fontSize:9,color:C.mutedText,marginTop:3,lineHeight:14},quick:{width:"48.2%",minHeight:96,borderRadius:19,backgroundColor:C.card,borderWidth:1,borderColor:C.border,padding:14},icon:{fontSize:20,color:C.primary,fontWeight:"800"},quickTitle:{fontSize:13,fontWeight:"900",color:C.foreground,marginTop:8},quickSub:{fontSize:10,color:C.mutedText,marginTop:2},
 cardTitle:{fontSize:16,fontWeight:"900",color:C.foreground,marginTop:6},primary:{marginTop:14,minHeight:46,borderRadius:15,backgroundColor:C.primary,alignItems:"center",justifyContent:"center"},primaryText:{fontSize:13,fontWeight:"900",color:C.primaryText}
});