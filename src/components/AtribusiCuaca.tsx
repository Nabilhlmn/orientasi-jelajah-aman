// src/components/AtribusiCuaca.tsx
import { Linking, Text, TouchableOpacity } from "react-native";
import { useThemeContext } from "../context/ThemeContext";

export default function AtribusiCuaca() {
  const { theme } = useThemeContext();

  return (
    <TouchableOpacity
      onPress={() => Linking.openURL("https://open-meteo.com/")}
      style={{ paddingVertical: 12 }}
    >
      <Text style={{ fontSize: 11, color: theme.textMuted, textAlign: "center" }}>
        Data cuaca disediakan oleh Open-Meteo.com
      </Text>
    </TouchableOpacity>
  );
}
