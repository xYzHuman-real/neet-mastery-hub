import { useState } from "react";
import { Pressable, Text, TextInput, View, StyleSheet, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { Phone } from "../native/ui";
import { C, R } from "../native/theme";
import { useStore } from "../native/store";

export default function Login(){
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [pw,setPw]=useState("");
  const [mode,setMode]=useState<"login"|"signup">("signup");
  const [err,setErr]=useState("");
  const [busy,setBusy]=useState(false);
  const {patch}=useStore();

  const submit=()=>{
    if(!name.trim()||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||pw.length<6){setErr("Enter your name, valid email and a 6+ character password.");return}
    setBusy(true);
    setTimeout(()=>{patch({user:{name:name.trim(),email},onboarded:true});router.replace("/telegram")},220);
  };

  const google=()=>{
    setErr("Google account chooser needs the app's Google OAuth configuration. The button is ready; no fake account list is shown.");
  };

  const input={borderWidth:1,borderColor:C.border,backgroundColor:C.card,borderRadius:R.md,padding:15,fontSize:14,color:C.foreground,marginBottom:10};
  return <Phone><View style={{flex:1,justifyContent:"center",padding:24}}>
    <View style={{height:56,width:56,borderRadius:18,backgroundColor:C.highlight,alignItems:"center",justifyContent:"center"}}><Text style={{fontSize:28,fontWeight:"900",color:C.highlightText}}>B</Text></View>
    <Text style={{fontSize:31,fontWeight:"900",color:C.foreground,marginTop:22}}>{mode==="signup"?"Create your BuzNeet account":"Welcome back"}</Text>
    <Text style={{fontSize:14,color:C.mutedText,marginTop:4}}>{mode==="signup"?"Start your NEET mastery journey.":"Continue your NEET preparation."}</Text>
    <View style={{flexDirection:"row",backgroundColor:C.muted,borderRadius:15,padding:4,marginTop:22}}>
      {(["login","signup"] as const).map(x=><Pressable key={x} onPress={()=>{setMode(x);setErr("")}} style={{flex:1,paddingVertical:10,borderRadius:11,backgroundColor:mode===x?C.card:"transparent",alignItems:"center"}}><Text style={{fontWeight:"800",color:mode===x?C.primary:C.mutedText}}>{x==="login"?"Log in":"Sign up"}</Text></Pressable>)}
    </View>
    <View style={{marginTop:18}}>
      {mode==="signup"&&<TextInput placeholder="Full name" placeholderTextColor={C.mutedText} value={name} onChangeText={setName} style={input}/>}
      <TextInput placeholder="Email" placeholderTextColor={C.mutedText} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={input}/>
      <TextInput placeholder="Password" placeholderTextColor={C.mutedText} value={pw} onChangeText={setPw} secureTextEntry style={input}/>
      {err&&<Text style={{color:C.destructive,fontSize:12,marginBottom:10}}>{err}</Text>}
      <Pressable onPress={submit} disabled={busy} style={[a.button,{opacity:busy?.65:1}]}>{busy?<ActivityIndicator color={C.primaryText}/>:<Text style={a.buttonText}>{mode==="signup"?"Create account":"Log in"}</Text>}</Pressable>
      <View style={{flexDirection:"row",alignItems:"center",gap:10,marginVertical:16}}><View style={{flex:1,height:1,backgroundColor:C.border}}/><Text style={{fontSize:11,color:C.mutedText}}>OR</Text><View style={{flex:1,height:1,backgroundColor:C.border}}/></View>
      <Pressable onPress={google} style={a.google}><Text style={{fontSize:18,fontWeight:"900",color:"#4285F4"}}>G</Text><Text style={{fontSize:14,fontWeight:"800",color:C.foreground}}>Continue with Google</Text></Pressable>
    </View>
  </View></Phone>
}
const a=StyleSheet.create({button:{minHeight:52,borderRadius:16,alignItems:"center",justifyContent:"center",paddingHorizontal:18,backgroundColor:C.primary},buttonText:{fontSize:15,fontWeight:"800",color:C.primaryText},google:{minHeight:52,borderRadius:16,alignItems:"center",justifyContent:"center",flexDirection:"row",gap:10,paddingHorizontal:18,backgroundColor:C.card,borderWidth:1,borderColor:C.border}});
