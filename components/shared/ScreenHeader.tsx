import { router } from 'expo-router';
import { ArrowLeft } from 'phosphor-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/ThemeContext';

interface Props {
  eyebrow: string;
  title: string;
  showBack?: boolean;
}

export function ScreenHeader({ eyebrow, title, showBack = true }: Props) {
  const { palette } = useTheme();

  return (
    <View style={{ marginBottom: 18 }}>
      <View style={styles.row}>
        {showBack && router.canGoBack() && (
          <Pressable onPress={() => router.back()} hitSlop={8} style={{ padding: 0 }}>
            <ArrowLeft size={18} color={palette.accent} />
          </Pressable>
        )}
        <Text style={[styles.eyebrow, { color: palette.accent }]}>{eyebrow}</Text>
      </View>
      <Text style={[styles.title, { color: palette.tx }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  eyebrow: { fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', fontFamily: 'Manrope_700Bold' },
  title: { fontSize: 22, fontFamily: 'Manrope_800ExtraBold' },
});
