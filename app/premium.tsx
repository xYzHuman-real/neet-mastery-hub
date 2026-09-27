import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Shell, Card } from "../native/ui";
import { C } from "../native/theme";
import { PREMIUM_FEATURES, PREMIUM_PLANS, subscriptionUrl } from "../native/premium";

export default function Premium(){
 const subscribe=(plan:any)=>{const url=subscriptionUrl(plan);if(url)Linking.openURL(url);};
 return <Shell title="BuzNeet Premium" subtitle="More intelligence for your preparation" right={<Pressable onPress={()=>router.back()}><Text style={{fontSize:24,color:C.foreground}}>×</Text></Pressable>}>
  <Card style={s.hero}><Text style={s.eyebrow}>BUZNEET PREMIUM</Text><Text style={s.heroTitle}>Prepare smarter.</Text><Text style={s.heroSub}>Unlock deeper analytics, adaptive revision, advanced tests and personalized preparation tools.</Text></Card>
  <Text style={s.section}>Premium features</Text>
  <View style={{gap:8}}>{PREMIUM_FEATURES.map(f=><Card key={f.title}><View style={s.featureRow}><View style={s.icon}><Text style={s.iconText}>{f.icon}</Text></View><View style={{flex:1}}><Text style={s.featureTitle}>{f.title}</Text><Text style={s.featureDetail}>{f.detail}</Text></View></View></Card>)}</View>
  <Text style={s.section}>Choose your plan</Text>
  <View style={{gap:10}}>{PREMIUM_PLANS.map(p=><Pressable key={p.id} onPress={()=>subscribe(p)} style={[s.plan,p.badge==="BEST VALUE"&&s.featured]}>
   {p.badge&&<View style={s.badge}><Text style={s.badgeText}>{p.badge}</Text></View>}
   <View style={{flex:1}}><Text style={s.planName}>{p.label}</Text><Text style={s.planMeta}>Premium access · WhatsApp subscription</Text></View>
   <View style={{alignItems:"flex-end"}}><View style={s.priceRow}><Text style={s.price}>₹{p.price}</Text><Text style={s.original}>₹{p.original}</Text></View><Text style={s.subscribe}>Subscribe →</Text></View>
  </Pressable>)}</View>
  <Card style={{marginTop:12,backgroundColor:C.accent}}><Text style={s.noteTitle}>How subscription works</Text><Text style={s.note}>Tap a plan to contact BuzNeet on WhatsApp. We will guide you through payment and activate Premium on your BuzNeet account after verification.</Text></Card>
  <Text style={s.foot}>Premium access is tied to your BuzNeet account, so reinstalling or updating the app does not remove an active subscription.</Text>
 </Shell>;
}
const s=StyleSheet.create({
hero:{backgroundColor:C.primary,borderColor:C.primary,padding:20},eyebrow:{fontSize:9,fontWeight:"900",letterSpacing:1.5,color:C.primaryText},heroTitle:{fontSize:31,fontWeight:"900",color:C.primaryText,marginTop:7},heroSub:{fontSize:12,lineHeight:18,color:C.primaryText,marginTop:7},
section:{fontSize:19,fontWeight:"900",color:C.foreground,marginTop:22,marginBottom:10},featureRow:{flexDirection:"row",alignItems:"center"},icon:{width:42,height:42,borderRadius:14,backgroundColor:C.accent,alignItems:"center",justifyContent:"center",marginRight:12},iconText:{fontSize:14,fontWeight:"900",color:C.primary},featureTitle:{fontSize:13,fontWeight:"900",color:C.foreground},featureDetail:{fontSize:10,color:C.mutedText,lineHeight:15,marginTop:3},
plan:{position:"relative",minHeight:76,borderRadius:18,borderWidth:1,borderColor:C.border,backgroundColor:C.card,padding:14,flexDirection:"row",alignItems:"center"},featured:{borderColor:C.primary,backgroundColor:C.accent},badge:{position:"absolute",right:10,top:8,borderRadius:8,backgroundColor:C.primary,paddingHorizontal:7,paddingVertical:4},badgeText:{fontSize:7,fontWeight:"900",color:C.primaryText,letterSpacing:.5},planName:{fontSize:14,fontWeight:"900",color:C.foreground},planMeta:{fontSize:9,color:C.mutedText,marginTop:3},priceRow:{flexDirection:"row",alignItems:"center",gap:6},price:{fontSize:21,fontWeight:"900",color:C.foreground},original:{fontSize:10,color:C.mutedText,textDecorationLine:"line-through"},subscribe:{fontSize:9,fontWeight:"900",color:C.primary,marginTop:3},noteTitle:{fontSize:13,fontWeight:"900",color:C.foreground},note:{fontSize:10,color:C.mutedText,lineHeight:16,marginTop:4},foot:{fontSize:9,color:C.mutedText,lineHeight:14,textAlign:"center",marginTop:14,marginBottom:10}});
