import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '../../lib/ThemeContext';

export function LoadingScreen() {
  const { palette } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.bg }}>
      <ActivityIndicator color={palette.accent} />
    </View>
  );
}
