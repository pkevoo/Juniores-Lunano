import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/ThemeContext';

export function KpiCard({ value, label, color }: { value: string | number; label: string; color?: string }) {
  const { palette } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.ink08 }]}>
      <Text style={[styles.value, { color: color ?? palette.tx }]}>{value}</Text>
      <Text style={[styles.label, { color: palette.ink55 }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderWidth: 1, borderRadius: 14, padding: 14 },
  value: { fontSize: 26, fontFamily: 'Manrope_800ExtraBold' },
  label: { fontSize: 11, marginTop: 4, fontFamily: 'Manrope_500Medium' },
});
