import { Pressable, Text, View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Phone } from "../native/ui";
import { C } from "../native/theme";
import { useStore } from "../native/store";

export default function Login(){
  const {patch}=useStore();
  const continueWithGoogle=()=>{
    // Keep this entry point visible, but do not fake an account chooser.
    // Native Google OAuth will be enabled after the Android OAuth client/SHA-1 is configured.
    patch({user:{name:"NEET Aspirant",email:""} as any,onboarded:true});
    router.replace("/telegram");
  };
  return <Phone><View style={{flex:1,justifyContent:"center",padding:24}}>
    <View style={{height:56,width:56,borderRadius:18,backgroundColor:C.highlight,alignItems:"center",justifyContent:"center"}}><Text style={{fontSize:28,fontWeight:"900",color:C.highlightText}}>B</Text></View>
    <Text style={{fontSize:31,fontWeight:"900",color:C.foreground,marginTop:22}}>Welcome to BuzNeet</Text>
    <Text style={{fontSize:14,color:C.mutedText,marginTop:4}}>Your focused NEET preparation workspace.</Text>
    <Pressable onPress={continueWithGoogle} style={a.google}><Text style={{fontSize:18,fontWeight:"900",color:"#4285F4"}}>G</Text><Text style={{fontSize:14,fontWeight:"800",color:C.foreground}}>Continue with Google</Text></Pressable>
    <Text style={{fontSize:11,lineHeight:17,color:C.mutedText,textAlign:"center",marginTop:12}}>Google account selection will be connected through the app's Android OAuth configuration. No fake account list is shown.</Text>
  </View></Phone>
}
const a=StyleSheet.create({google:{minHeight:54,borderRadius:17,alignItems:"center",justifyContent:"center",flexDirection:"row",gap:10,paddingHorizontal:18,backgroundColor:C.card,borderWidth:1,borderColor:C.border}});
