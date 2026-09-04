import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/ThemeContext';

interface Option<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  variant?: 'pills' | 'segmented';
}

export function PillTabs<T extends string>({ options, value, onChange, variant = 'pills' }: Props<T>) {
  const { palette } = useTheme();
  const segmented = variant === 'segmented';

  return (
    <View style={[styles.row, segmented && [styles.segmentedWrap, { borderColor: palette.ink15 }]]}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[
              segmented ? styles.segmentedItem : styles.pill,
              { backgroundColor: active ? palette.accent : segmented ? 'transparent' : palette.bg2 },
            ]}
          >
            <Text style={[styles.label, { color: active ? '#fff' : palette.tx2 }]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingHorizontal: 13, paddingVertical: 6, borderRadius: 999 },
  segmentedWrap: { borderWidth: 1, borderRadius: 8, overflow: 'hidden', alignSelf: 'flex-start', gap: 0 },
  segmentedItem: { paddingHorizontal: 13, paddingVertical: 8 },
  label: { fontSize: 12, fontFamily: 'Manrope_700Bold' },
});
