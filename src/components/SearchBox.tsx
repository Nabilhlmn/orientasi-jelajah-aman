// src/components/SearchBox.tsx
import { useState } from "react";
import { TextInput, View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeContext } from "../context/ThemeContext";

interface SearchBoxProps {
  onCari: (teks: string) => void;
  nilai?: string;
  placeholder?: string;
}

export default function SearchBox({
  onCari,
  nilai,
  placeholder = "Cari nama kota (misal: Jakarta, Bandung)...",
}: SearchBoxProps) {
  const [internalTeks, setInternalTeks] = useState(nilai || "");
  const [prevNilai, setPrevNilai] = useState(nilai);
  const { theme } = useThemeContext();

  if (nilai !== undefined && nilai !== prevNilai) {
    setPrevNilai(nilai);
    setInternalTeks(nilai);
  }

  function handleChange(nilaiBaru: string) {
    setInternalTeks(nilaiBaru);
    onCari(nilaiBaru);
  }

  function handleClear() {
    setInternalTeks("");
    onCari("");
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
      ]}
    >
      <Ionicons
        name="search-outline"
        size={20}
        color={theme.textMuted}
        style={styles.iconKiri}
      />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        value={internalTeks}
        onChangeText={handleChange}
        accessibilityLabel="Cari cuaca untuk kota yang dimasukkan"
        style={[
          styles.input,
          {
            color: theme.text,
          },
        ]}
      />
      {internalTeks.length > 0 && (
        <TouchableOpacity
          onPress={handleClear}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Hapus teks pencarian"
        >
          <Ionicons name="close-circle" size={18} color={theme.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  iconKiri: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
});
