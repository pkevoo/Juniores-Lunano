import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from '../../lib/ThemeContext';

export function ScreenContainer({ children, scroll = true }: { children: React.ReactNode; scroll?: boolean }) {
  const { palette } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: palette.bg }]}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>{children}</ScrollView>
      ) : (
        <View style={styles.plainContent}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { padding: 18, paddingBottom: 40 },
  plainContent: { flex: 1, padding: 18 },
});
