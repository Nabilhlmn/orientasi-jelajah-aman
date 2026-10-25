import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { useThemeContext } from "../../context/ThemeContext";

export default function TabLayout() {
  const { theme } = useThemeContext();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: theme.tabBarActive,
        tabBarInactiveTintColor: theme.tabBarInactive,
        tabBarStyle: {
          backgroundColor: theme.tabBarBackground,
          borderTopColor: theme.tabBarBorder,
          height: Platform.OS === "ios" ? 88 : 64,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        headerStyle: {
          backgroundColor: theme.tabBarBackground,
          shadowColor: "transparent",
          elevation: 0,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Beranda",
          tabBarLabel: "Beranda",
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size || 22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="riwayat"
        options={{
          title: "Riwayat & Favorit",
          tabBarLabel: "Riwayat & Favorit",
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? "bookmark" : "bookmark-outline"}
              size={size || 22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="pengaturan"
        options={{
          title: "Pengaturan",
          tabBarLabel: "Pengaturan",
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={size || 22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="tentang"
        options={{
          title: "Tentang",
          tabBarLabel: "Tentang",
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? "information-circle" : "information-circle-outline"}
              size={size || 22}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
