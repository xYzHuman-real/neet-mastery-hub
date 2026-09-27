import { router, usePathname } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View, type ReactNode } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "./store";
import { C, R } from "./theme";

export function Phone({ children }: { children: ReactNode }) {
  return <View style={s.root}><SafeAreaView style={s.phone} edges={["top", "bottom", "left", "right"]}>{children}</SafeAreaView></View>;
}

export function Shell({ title, subtitle, children, right }: { title: string; subtitle?: string; children: ReactNode; right?: ReactNode }) {
  const { hydrated, onboarded, user, telegramDone } = useStore();
  if (!hydrated || !onboarded || !user) return <Phone><View style={{ flex: 1, backgroundColor: C.background }} /></Phone>;
  return <Phone><View style={{ flex: 1 }}>
    <View style={s.header}><View>{subtitle && <Text style={s.eyebrow}>{subtitle}</Text>}<Text style={s.title}>{title}</Text></View>{right}</View>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>{children}</ScrollView>
    <Nav />
  </View></Phone>;
}

function Nav() {
  const p = usePathname();
  const a = [["/home","⌂","Home"],["/chapters","▦","Practice"],["/progress","◒","Progress"],["/tests","◷","Tests"],["/profile","◯","Profile"]];
  return <View style={s.navWrap}><View style={s.navGlass}>{a.map(([h,i,l]) =>
    <Pressable key={h} onPress={()=>router.push(h as any)} style={[s.navItem, p === h && s.navActive]}>
      <Text style={[s.navIcon, p === h && { color:C.primary }]}>{i}</Text>
      <Text style={[s.navLabel, p === h && { color:C.primary }]}>{l}</Text>
    </Pressable>
  )}</View></View>;
}

export function Card({ children, style }: { children: ReactNode; style?: any }) {
  return <View style={[s.card, style]}>{children}</View>;
}
export const styles = s;

const s = StyleSheet.create({
  root:{flex:1,backgroundColor:"#E9E8E1",alignItems:"center"},
  phone:{width:"100%",maxWidth:420,height:"100%",backgroundColor:C.background},
  header:{paddingHorizontal:20,paddingTop:18,paddingBottom:12,flexDirection:"row",alignItems:"flex-end",justifyContent:"space-between"},
  eyebrow:{fontSize:11,fontWeight:"700",letterSpacing:1.5,color:C.primary,textTransform:"uppercase",marginBottom:3},
  title:{fontSize:26,fontWeight:"800",color:C.foreground},
  content:{paddingHorizontal:20,paddingBottom:118},
  card:{backgroundColor:C.card,borderWidth:1,borderColor:"rgba(225,222,213,0.72)",borderRadius:R.lg,padding:16},
  navWrap:{position:"absolute",left:12,right:12,bottom:10},
  navGlass:{height:78,borderRadius:27,backgroundColor:"rgba(255,255,255,0.78)",borderWidth:1,borderColor:"rgba(255,255,255,0.95)",flexDirection:"row",justifyContent:"space-around",paddingTop:6,paddingBottom:7,shadowColor:"#263C3A",shadowOpacity:0.12,shadowRadius:18,shadowOffset:{width:0,height:8},elevation:10},
  navItem:{alignItems:"center",justifyContent:"center",width:72,borderRadius:18},
  navActive:{backgroundColor:"rgba(231,241,237,0.88)"},
  navIcon:{fontSize:27,color:C.mutedText},
  navLabel:{fontSize:13,fontWeight:"800",color:C.mutedText,marginTop:1},
  button:{minHeight:52,borderRadius:16,alignItems:"center",justifyContent:"center",paddingHorizontal:18},
  primaryButton:{backgroundColor:C.primary},
  buttonText:{fontSize:15,fontWeight:"800",color:C.primaryText}
});