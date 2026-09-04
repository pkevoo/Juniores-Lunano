import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '../../lib/ThemeContext';

export function ComingSoon({ milestone }: { milestone: string }) {
  const { palette } = useTheme();
  return (
    <Text style={{ color: palette.ink55, fontSize: 13, fontFamily: 'Manrope_500Medium', lineHeight: 20 }}>
      Questa sezione arriva in {milestone}. La struttura di navigazione e i permessi sono già collegati.
    </Text>
  );
}
