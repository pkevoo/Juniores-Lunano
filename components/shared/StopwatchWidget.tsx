import { ArrowCounterClockwise, Pause, Play, Timer } from 'phosphor-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/ThemeContext';

function format(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function StopwatchWidget() {
  const { palette } = useTheme();
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  return (
    <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.ink08 }]}>
      <View style={styles.headerRow}>
        <Timer size={18} color={palette.accent} weight="duotone" />
        <Text style={[styles.title, { color: palette.tx }]}>Cronometro</Text>
      </View>
      <Text style={[styles.subtitle, { color: palette.ink55 }]}>Utile durante esercitazioni e lavori a tempo.</Text>
      <Text style={[styles.display, { color: palette.tx }]}>{format(seconds)}</Text>
      <View style={styles.row}>
        <Pressable
          onPress={() => setRunning((r) => !r)}
          style={[styles.button, { backgroundColor: palette.accentSoft }]}
        >
          {running ? <Pause size={14} color={palette.accent} weight="fill" /> : <Play size={14} color={palette.accent} weight="fill" />}
          <Text style={[styles.buttonText, { color: palette.accent }]}>{running ? 'Pausa' : 'Avvia'}</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setRunning(false);
            setSeconds(0);
          }}
          style={[styles.button, { backgroundColor: palette.bg2 }]}
        >
          <ArrowCounterClockwise size={14} color={palette.tx} />
          <Text style={[styles.buttonText, { color: palette.tx }]}>Reset</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 28 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  title: { fontSize: 13.5, fontFamily: 'Manrope_700Bold' },
  subtitle: { fontSize: 11, marginBottom: 12, fontFamily: 'Manrope_400Regular' },
  display: { fontSize: 32, fontFamily: 'Manrope_800ExtraBold', marginBottom: 12, fontVariant: ['tabular-nums'] },
  row: { flexDirection: 'row', gap: 8 },
  button: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 8, paddingVertical: 10 },
  buttonText: { fontSize: 12.5, fontFamily: 'Manrope_700Bold' },
});
