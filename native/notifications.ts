import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export type NotificationPrefs = { enabled:boolean; hour:number; minute:number; revision:boolean; tests:boolean; streak:boolean; mission:boolean };
const CHANNEL="buzneet-study";

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldPlaySound:true, shouldSetBadge:false, shouldShowBanner:true, shouldShowList:true }),
});

export async function prepareNotifications() {
  if (Platform.OS==="android") {
    await Notifications.setNotificationChannelAsync(CHANNEL,{name:"BuzNeet Study Reminders",importance:Notifications.AndroidImportance.DEFAULT,vibrationPattern:[0,150,100,150]});
  }
  const current=await Notifications.getPermissionsAsync();
  if(current.granted)return true;
  const requested=await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function cancelStudyNotifications(){ await Notifications.cancelAllScheduledNotificationsAsync(); }

export async function scheduleStudyNotifications(p:NotificationPrefs){
  await cancelStudyNotifications();
  if(!p.enabled)return;
  if(!(await prepareNotifications()))return;
  const add=async(title:string,body:string,offset:number)=>{
    const total=p.hour*60+p.minute+offset; const hour=Math.floor((total%1440)/60); const minute=total%60;
    await Notifications.scheduleNotificationAsync({
      content:{title,body,data:{source:"buzneet"},...(Platform.OS==="android"?{channelId:CHANNEL}:{})},
      trigger:{type:Notifications.SchedulableTriggerInputTypes.DAILY,hour,minute}
    });
  };
  if(p.mission)await add("Today's BuzNeet mission","Your daily study mission is waiting.",0);
  if(p.revision)await add("Revision is due","Open BuzNeet and clear your smart-revision queue.",30);
  if(p.tests)await add("Test time","Take a timed test and track your progress.",60);
  if(p.streak)await add("Keep your streak going","A little practice today keeps your study streak alive.",90);
}
