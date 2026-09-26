import { useEffect, useState } from "react";
import { Pressable, Text, View, StyleSheet, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { Phone } from "../native/ui";
import { C } from "../native/theme";
import { useStore } from "../native/store";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";

GoogleSignin.configure();

export default function Login(){
  const [mode,setMode]=useState<"login"|"signup">("signup");
  const [err,setErr]=useState("");
  const [busy,setBusy]=useState(false);
  const {patch}=useStore();

  useEffect(()=>{setErr("")},[mode]);

  const google=async()=>{
    setErr("");setBusy(true);
    try{
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog:true});
      const response=await GoogleSignin.signIn();
      const user=response.data?.user;
      if(user?.email){
        patch({user:{name:user.name||user.givenName||"NEET Aspirant",email:user.email},onboarded:true});
        router.replace("/telegram");
      }else setErr("Google sign-in did not return an account.");
    }catch(e:any){
      if(e?.code===statusCodes.SIGN_IN_CANCELLED){setErr("Sign-in cancelled.");}
      else if(e?.code===statusCodes.IN_PROGRESS){setErr("Google sign-in is already in progress.");}
      else if(e?.code===statusCodes.PLAY_SERVICES_NOT_AVAILABLE){setErr("Google Play Services is unavailable or needs an update.");}
      else setErr("Google sign-in needs the Android OAuth configuration for com.buzneet.app.");
    }finally{setBusy(false)}
  };

  return <Phone><View style={{flex:1,justifyContent:"center",padding:24}}>
    <View style={{height:56,width:56,borderRadius:18,backgroundColor:C.highlight,alignItems:"center",justifyContent:"center"}}><Text style={{fontSize:28,fontWeight:"900",color:C.highlightText}}>B</Text></View>
    <Text style={{fontSize:31,fontWeight:"900",color:C.foreground,marginTop:22}}>{mode==="signup"?"Create your BuzNeet account":"Welcome back"}</Text>
    <Text style={{fontSize:14,color:C.mutedText,marginTop:4}}>{mode==="signup"?"One Google account. One NEET workspace.":"Continue with your Google account."}</Text>
    <View style={{flexDirection:"row",backgroundColor:C.muted,borderRadius:15,padding:4,marginTop:22}}>
      {(["login","signup"] as const).map(x=><Pressable key={x} onPress={()=>setMode(x)} style={{flex:1,paddingVertical:10,borderRadius:11,backgroundColor:mode===x?C.card:"transparent",alignItems:"center"}}><Text style={{fontWeight:"800",color:mode===x?C.primary:C.mutedText}}>{x==="login"?"Log in":"Sign up"}</Text></Pressable>)}
    </View>
    <View style={{marginTop:20}}>
      <Pressable onPress={google} disabled={busy} style={[a.google,{opacity:busy?.65:1}]}>{busy?<ActivityIndicator/>:<Text style={{fontSize:18,fontWeight:"900",color:"#4285F4"}}>G</Text>}<Text style={{fontSize:14,fontWeight:"800",color:C.foreground}}>{mode==="signup"?"Continue with Google":"Continue with Google"}</Text></Pressable>
      <Text style={{fontSize:11,lineHeight:17,color:C.mutedText,textAlign:"center",marginTop:12}}>Android will use the native Google account chooser when Google OAuth is configured for this app.</Text>
      {err&&<Text style={{color:C.destructive,fontSize:12,lineHeight:17,textAlign:"center",marginTop:12}}>{err}</Text>}
    </View>
  </View></Phone>
}
const a=StyleSheet.create({google:{minHeight:54,borderRadius:17,alignItems:"center",justifyContent:"center",flexDirection:"row",gap:10,paddingHorizontal:18,backgroundColor:C.card,borderWidth:1,borderColor:C.border}});
