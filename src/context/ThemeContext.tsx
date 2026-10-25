import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "../constants/theme";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
  colorScheme: "light" | "dark";
  theme: (typeof Colors)["light"] | (typeof Colors)["dark"];
  isDark: boolean;
}

const STORAGE_KEY_THEME = "@jelajah_aman:theme_mode";

const ThemeContext = createContext<ThemeContextValue>({
  mode: "system",
  setMode: async () => {},
  colorScheme: "light",
  theme: Colors.light,
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const systemScheme = useRNColorScheme();

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY_THEME)
      .then((saved) => {
        if (saved === "light" || saved === "dark" || saved === "system") {
          setModeState(saved);
        }
      })
      .catch(() => {});
  }, []);

  const setMode = async (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_THEME, newMode);
    } catch {
      // Abaikan kegagalan penyimpanan lokal
    }
  };

  const resolvedScheme: "light" | "dark" =
    mode === "system"
      ? systemScheme === "dark"
        ? "dark"
        : "light"
      : mode;

  const theme = Colors[resolvedScheme];
  const isDark = resolvedScheme === "dark";

  return (
    <ThemeContext.Provider
      value={{
        mode,
        setMode,
        colorScheme: resolvedScheme,
        theme,
        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  return useContext(ThemeContext);
}
