import{router}from"expo-router";
import{Pressable,Text,View}from"react-native";
import{Shell,Card}from"../native/ui";
import{C}from"../native/theme";
import{useStore}from"../native/store";

export default function Profile(){
  const{user,streak,answered,mistakes,goal,logout}=useStore();
  const done=Object.keys(answered).length,correct=Object.values(answered).filter(Boolean).length;
  return <Shell title="Profile" subtitle="Account" right={<Pressable onPress={()=>router.push("/settings")} style={{height:40,width:40,borderRadius:14,backgroundColor:C.card,borderWidth:1,borderColor:C.border,alignItems:"center",justifyContent:"center"}}><Text style={{fontSize:19}}>⚙</Text></Pressable>}>
    <View style={{backgroundColor:C.primary,borderRadius:24,padding:20,flexDirection:"row",alignItems:"center"}}><View style={{height:62,width:62,borderRadius:31,backgroundColor:C.highlight,alignItems:"center",justifyContent:"center"}}><Text style={{fontSize:25,fontWeight:"900",color:C.highlightText}}>{user?.name?.[0]?.toUpperCase()}</Text></View><View style={{marginLeft:13}}><Text style={{fontSize:20,fontWeight:"900",color:C.primaryText}}>{user?.name}</Text><Text style={{fontSize:11,color:C.primaryText}}>{user?.email}</Text><Text style={{fontSize:11,fontWeight:"700",color:C.primaryText,marginTop:3}}>NEET 2027 aspirant</Text></View></View>
    <View style={{flexDirection:"row",gap:8,marginTop:10}}><Card style={{flex:1,alignItems:"center"}}><Text style={{fontWeight:"900"}}>🔥 {streak}</Text><Text style={{fontSize:10,color:C.mutedText}}>Streak</Text></Card><Card style={{flex:1,alignItems:"center"}}><Text style={{fontWeight:"900"}}>{done?Math.round(correct/done*100):0}%</Text><Text style={{fontSize:10,color:C.mutedText}}>Accuracy</Text></Card><Card style={{flex:1,alignItems:"center"}}><Text style={{fontWeight:"900"}}>{Object.keys(mistakes).length}</Text><Text style={{fontSize:10,color:C.mutedText}}>Mistakes</Text></Card></View>
    <View style={{marginTop:12,borderWidth:1,borderColor:C.border,borderRadius:18,overflow:"hidden",backgroundColor:C.card}}>
      <Pressable onPress={()=>router.push("/practice")} style={{padding:16,borderBottomWidth:1,borderBottomColor:C.border}}><Text style={{fontWeight:"700",color:C.foreground}}>⚡ Mixed practice</Text></Pressable>
      <Pressable onPress={()=>router.push("/settings")} style={{padding:16,borderBottomWidth:1,borderBottomColor:C.border}}><Text style={{fontWeight:"700",color:C.foreground}}>⚙ Settings</Text></Pressable>
      <View style={{padding:16}}><Text style={{fontWeight:"700",color:C.foreground}}>◎ Daily goal <Text style={{color:C.mutedText,fontWeight:"400"}}>{goal} questions</Text></Text></View>
    </View>
    <Pressable onPress={()=>{logout();router.replace("/login")}} style={{marginTop:12,borderWidth:1,borderColor:"#E7B5AC",borderRadius:16,padding:14,alignItems:"center"}}><Text style={{fontWeight:"800",color:C.destructive}}>Log out</Text></Pressable>
  </Shell>
}
