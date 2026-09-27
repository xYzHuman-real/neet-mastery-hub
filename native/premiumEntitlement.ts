import AsyncStorage from "@react-native-async-storage/async-storage";

const PROJECT_ID="buzneet";
const BASE=`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const CACHE="buzneet-premium-entitlement-v1";

export type Entitlement={active:boolean;plan:string|null;expiresAt:number|null};

function decodeField(v:any):any{
 if(v?.booleanValue!==undefined)return v.booleanValue;
 if(v?.stringValue!==undefined)return v.stringValue;
 if(v?.integerValue!==undefined)return Number(v.integerValue);
 if(v?.doubleValue!==undefined)return Number(v.doubleValue);
 if(v?.timestampValue!==undefined)return Date.parse(v.timestampValue);
 return null;
}
export async function fetchEntitlement(uid:string,idToken:string):Promise<Entitlement>{
 try{
  const res=await fetch(`${BASE}/users/${encodeURIComponent(uid)}`,{headers:{Authorization:`Bearer ${idToken}`}});
  if(!res.ok)throw new Error("ENTITLEMENT_READ_FAILED");
  const data=await res.json();
  const f=data.fields||{};
  const expiresAt=decodeField(f.premiumExpiresAt);
  const active=Boolean(decodeField(f.premiumActive)) && (!expiresAt || expiresAt>Date.now());
  const out={active,plan:decodeField(f.premiumPlan),expiresAt};
  await AsyncStorage.setItem(CACHE,JSON.stringify(out));
  return out;
 }catch{
  const raw=await AsyncStorage.getItem(CACHE);
  if(raw)try{return JSON.parse(raw) as Entitlement}catch{}
  return {active:false,plan:null,expiresAt:null};
 }
}