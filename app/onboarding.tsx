import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, Text, View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Phone } from "../native/ui";
import { C } from "../native/theme";
import { useStore } from "../native/store";

const slides = [
  ["📖","Every NCERT line, mastered","Line-by-line recall, diagrams, MCQs and statement logic built around the prescribed syllabus."],
  ["🧠","Never forget what you learn","Smart revision brings questions back on a spaced schedule so weak areas stay visible."],
  ["🎯","Practice like your real exam","Timed tests, mistake tracking and session review keep your preparation measurable."]
];

export default function Onboarding(){
  const [i,setI]=useState(0);
  const {patch}=useStore();
  const motion=useRef(new Animated.Value(0)).current;
  const finish=()=>{patch({onboarded:true});router.replace("/login")};

  useEffect(()=>{
    motion.setValue(0);
    Animated.parallel([
      Animated.timing(motion,{toValue:1,duration:520,easing:Easing.out(Easing.cubic),useNativeDriver:true}),
      Animated.spring(motion,{toValue:1,useNativeDriver:true,stiffness:110,damping:14,mass:0.8})
    ]).start();
  },[i]);

  const z=slides[i];
  const translate=motion.interpolate({inputRange:[0,1],outputRange:[34,0]});
  const scale=motion.interpolate({inputRange:[0,1],outputRange:[0.88,1]});
  const rotate=motion.interpolate({inputRange:[0,0.5,1],outputRange:["-7deg","2deg","0deg"]});

  return <Phone><View style={{flex:1,padding:24}}>
    <Pressable onPress={finish} style={{alignItems:"flex-end"}}><Text style={{color:C.mutedText,fontWeight:"700"}}>Skip</Text></Pressable>
    <View style={{flex:1,alignItems:"center",justifyContent:"center"}}>
      <Animated.View style={{height:158,width:158,borderRadius:46,backgroundColor:C.accent,alignItems:"center",justifyContent:"center",opacity:motion,transform:[{perspective:900},{translateY:translate},{scale},{rotateY:rotate}]}}>
        <Text style={{fontSize:66}}>{z[0]}</Text>
      </Animated.View>
      <Animated.View style={{opacity:motion,transform:[{translateY:translate}]}}>
        <Text style={{fontSize:27,fontWeight:"900",color:C.foreground,textAlign:"center",marginTop:28}}>{z[1]}</Text>
        <Text style={{fontSize:14,lineHeight:22,color:C.mutedText,textAlign:"center",marginTop:10}}>{z[2]}</Text>
      </Animated.View>
    </View>
    <View>
      <View style={{flexDirection:"row",justifyContent:"center",gap:7,marginBottom:20}}>
        {slides.map((_,k)=><Pressable key={k} hitSlop={10} onPress={()=>setI(k)}><Animated.View style={{height:8,width:k===i?26:8,borderRadius:5,backgroundColor:k===i?C.primary:C.muted,opacity:k===i?1:0.8}}/></Pressable>)}
      </View>
      <Pressable onPress={()=>i<2?setI(i+1):finish()} style={a.button}><Text style={a.buttonText}>{i<2?"Next":"Get started"}</Text></Pressable>
    </View>
  </View></Phone>;
}

const a=StyleSheet.create({button:{minHeight:52,borderRadius:16,alignItems:"center",justifyContent:"center",paddingHorizontal:18,backgroundColor:C.primary},buttonText:{fontSize:15,fontWeight:"800",color:C.primaryText}});
