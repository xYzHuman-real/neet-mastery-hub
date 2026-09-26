import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Shell, Card } from "../native/ui";
import { C } from "../native/theme";
import { CHAPTERS, QUESTIONS, SUBJECTS } from "../native/content";
import { useStore } from "../native/store";

const subjectColor = (id: string) => id === "physics" ? "#E7F1ED" : id === "chemistry" ? "#F4EFE1" : "#EAF0F5";

export default function Home() {
  const { user, streak, todayCount, goal, due, mistakes } = useStore();
  const answered = Math.min(todayCount, goal);
  const pct = goal ? Math.min(1, answered / goal) : 0;
  const dueCount = due.length;
  const mistakeCount = Object.keys(mistakes).length;

  return (
    <Shell title="Good to see you" subtitle="BuzNeet">
      <View style={s.greeting}>
        <View style={{ flex: 1 }}>
          <Text style={s.name}>{user?.name || "NEET Aspirant"}</Text>
          <Text style={s.muted}>Keep today's preparation moving.</Text>
        </View>
        <View style={s.streak}>
          <Text style={s.streakNumber}>{streak}</Text>
          <Text style={s.streakLabel}>DAY STREAK</Text>
        </View>
      </View>

      <Card style={s.progressCard}>
        <View style={s.row}>
          <View>
            <Text style={s.cardEyebrow}>TODAY'S PRACTICE</Text>
            <Text style={s.big}>{answered}<Text style={s.small}> / {goal}</Text></Text>
          </View>
          <Text style={s.percent}>{Math.round(pct * 100)}%</Text>
        </View>
        <View style={s.track}><View style={[s.fill, { width: `${pct * 100}%` }]} /></View>
        <Text style={[s.progressNote, { color: C.primaryText }]}>{goal - answered > 0 ? `${goal - answered} questions left in today's goal` : "Daily goal completed."}</Text>
      </Card>

      <View style={s.quickGrid}>
        <Pressable onPress={() => router.push("/chapters")} style={s.quick}>
          <Text style={s.quickIcon}>▦</Text>
          <Text style={s.quickTitle}>Practice</Text>
          <Text style={s.quickSub}>87 chapters</Text>
        </Pressable>
        <Pressable onPress={() => router.push("/tests")} style={s.quick}>
          <Text style={s.quickIcon}>◷</Text>
          <Text style={s.quickTitle}>Tests</Text>
          <Text style={s.quickSub}>Timed NEET tests</Text>
        </Pressable>
        <Pressable onPress={() => router.push({ pathname: "/practice", params: { review: "1" } })} style={s.quick}>
          <Text style={s.quickIcon}>↻</Text>
          <Text style={s.quickTitle}>Review</Text>
          <Text style={s.quickSub}>{dueCount} due now</Text>
        </Pressable>
        <Pressable onPress={() => router.push("/mistakes")} style={s.quick}>
          <Text style={s.quickIcon}>▤</Text>
          <Text style={s.quickTitle}>Notebook</Text>
          <Text style={s.quickSub}>{mistakeCount} saved</Text>
        </Pressable>
      </View>

      <View style={s.sectionRow}>
        <Text style={s.sectionTitle}>Your syllabus</Text>
        <Pressable onPress={() => router.push("/chapters")}><Text style={s.link}>View all</Text></Pressable>
      </View>

      {SUBJECTS.map(subject => {
        const total = CHAPTERS.filter(c => c.subject === subject.id).length;
        const qTotal = QUESTIONS.filter(q => CHAPTERS.find(c => c.id === q.chapterId)?.subject === subject.id).length;
        return (
          <Pressable key={subject.id} onPress={() => router.push({ pathname: "/chapters", params: { subject: subject.id } })}>
            <Card style={{ marginTop: 9 }}>
              <View style={s.row}>
                <View style={[s.subjectIcon, { backgroundColor: subjectColor(subject.id) }]}>
                  <Text style={{ fontSize: 19 }}>{subject.emoji}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.subjectName}>{subject.name}</Text>
                  <Text style={s.muted}>{total} chapters · {qTotal} bank questions</Text>
                </View>
                <Text style={s.arrow}>›</Text>
              </View>
            </Card>
          </Pressable>
        );
      })}

      <View style={s.sectionRow}>
        <Text style={s.sectionTitle}>Continue preparing</Text>
      </View>
      <Card>
        <Text style={s.cardEyebrow}>ACTIVE RECALL</Text>
        <Text style={s.continueTitle}>Pick up where you left off</Text>
        <Text style={[s.muted, { marginTop: 4 }]}>Use chapter practice for focused question-by-question revision.</Text>
        <Pressable onPress={() => router.push("/chapters")} style={s.primary}>
          <Text style={s.primaryText}>Open Chapter Hub</Text>
        </Pressable>
      </Card>
      <View style={{ height: 8 }} />
    </Shell>
  );
}

const s = StyleSheet.create({
  greeting:{flexDirection:"row",alignItems:"center",marginBottom:14},
  name:{fontSize:23,fontWeight:"900",color:C.foreground},
  muted:{fontSize:11,color:C.mutedText,marginTop:3},
  streak:{width:72,height:66,borderRadius:20,backgroundColor:C.highlight,alignItems:"center",justifyContent:"center"},
  streakNumber:{fontSize:22,fontWeight:"900",color:C.highlightText,lineHeight:23},
  streakLabel:{fontSize:7,fontWeight:"900",letterSpacing:.8,color:C.highlightText,marginTop:3},
  progressCard:{backgroundColor:C.primary,borderColor:C.primary},
  row:{flexDirection:"row",alignItems:"center"},
  cardEyebrow:{fontSize:9,fontWeight:"900",letterSpacing:1.2,color:C.primaryText},
  big:{fontSize:34,fontWeight:"900",color:C.primaryText,marginTop:2},
  small:{fontSize:15,fontWeight:"800"},
  percent:{marginLeft:"auto",fontSize:13,fontWeight:"900",color:C.primaryText},
  track:{height:7,borderRadius:5,backgroundColor:"rgba(255,255,255,.24)",overflow:"hidden",marginTop:12},
  fill:{height:7,borderRadius:5,backgroundColor:"#FFFFFF"},
  progressNote:{fontSize:11,marginTop:7},
  quickGrid:{flexDirection:"row",flexWrap:"wrap",gap:9,marginTop:12},
  quick:{width:"48.2%",minHeight:96,borderRadius:19,backgroundColor:C.card,borderWidth:1,borderColor:C.border,padding:14},
  quickIcon:{fontSize:20,color:C.primary,fontWeight:"800"},
  quickTitle:{fontSize:13,fontWeight:"900",color:C.foreground,marginTop:8},
  quickSub:{fontSize:10,color:C.mutedText,marginTop:2},
  sectionRow:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginTop:21,marginBottom:1},
  sectionTitle:{fontSize:17,fontWeight:"900",color:C.foreground},
  link:{fontSize:11,fontWeight:"800",color:C.primary},
  subjectIcon:{width:42,height:42,borderRadius:14,alignItems:"center",justifyContent:"center"},
  subjectName:{fontSize:14,fontWeight:"900",color:C.foreground},
  arrow:{fontSize:24,color:C.mutedText},
  continueTitle:{fontSize:16,fontWeight:"900",color:C.foreground,marginTop:6},
  primary:{marginTop:14,minHeight:46,borderRadius:15,backgroundColor:C.primary,alignItems:"center",justifyContent:"center"},
  primaryText:{fontSize:13,fontWeight:"900",color:C.primaryText},
});