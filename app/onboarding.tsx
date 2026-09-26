import { useState } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Phone } from "../native/ui";
import { C } from "../native/theme";
import { useStore } from "../native/store";

const slides = [
  ["📖","Every NCERT line, mastered","Line-by-line MCQs, fill-in-the-blanks, diagrams and A&R — straight from your textbook."],
  ["🧠","Never forget with smart revision","Spaced repetition brings cards back on Day 1, 3, 7 and 30 so they stick."],
  ["🎯","Test like the real NEET","Timed chapter tests with +4/−1 marking and a mistake notebook that fixes weak spots."]
];

export default function Onboarding(){
  const [i,setI]=useState(0);
  const {patch}=useStore();
  const finish=()=>{patch({onboarded:true});router.replace("/login")};
  const z=slides[i];
  return <Phone>
    <View style={{flex:1,padding:24}}>
      <Pressable onPress={finish} style={{alignItems:"flex-end"}}><Text style={{color:C.mutedText,fontWeight:"700"}}>Skip</Text></Pressable>
      <View style={{flex:1,alignItems:"center",justifyContent:"center"}}>
        <View style={{height:150,width:150,borderRadius:75,backgroundColor:C.accent,alignItems:"center",justifyContent:"center"}}><Text style={{fontSize:65}}>{z[0]}</Text></View>
        <Text style={{fontSize:26,fontWeight:"800",color:C.foreground,textAlign:"center",marginTop:28}}>{z[1]}</Text>
        <Text style={{fontSize:14,lineHeight:22,color:C.mutedText,textAlign:"center",marginTop:10}}>{z[2]}</Text>
      </View>
      <View>
        <View style={{flexDirection:"row",justifyContent:"center",gap:7,marginBottom:20}}>{slides.map((_,k)=><View key={k} style={{height:8,width:k===i?24:8,borderRadius:4,backgroundColor:k===i?C.primary:C.muted}}/>)}</View>
        <Pressable onPress={()=>i<2?setI(i+1):finish()} style={a.button}><Text style={a.buttonText}>{i<2?"Next":"Get started"}</Text></Pressable>
      </View>
    </View>
  </Phone>
}

const a=StyleSheet.create({
  button:{minHeight:52,borderRadius:16,alignItems:"center",justifyContent:"center",paddingHorizontal:18,backgroundColor:C.primary},
  buttonText:{fontSize:15,fontWeight:"800",color:C.primaryText}
});