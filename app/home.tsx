import { View, Text } from "react-native";
import { C } from "../native/theme";
import { useStore } from "../native/store";

export default function Home() {
  const { user } = useStore();
  return (
    <View style={{ flex: 1, backgroundColor: C.background, alignItems: "center", justifyContent: "center", padding: 24 }}>
      <View style={{ height: 92, width: 92, borderRadius: 30, backgroundColor: C.primary, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 46, fontWeight: "900", color: C.primaryText }}>B</Text>
      </View>
      <Text style={{ fontSize: 32, fontWeight: "900", color: C.foreground, marginTop: 18 }}>BuzNeet</Text>
      <Text style={{ fontSize: 14, color: C.mutedText, marginTop: 8 }}>
        Home diagnostic · {user?.name || "NEET Aspirant"}
      </Text>
    </View>
  );
}
