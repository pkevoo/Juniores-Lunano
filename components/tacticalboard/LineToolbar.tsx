import { HandGrabbing } from 'phosphor-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Line as SvgLine, Path } from 'react-native-svg';
import { useTheme } from '../../lib/ThemeContext';
import { LINE_COLORS, LINE_TOOL_DEFS, LineTool } from '../../lib/tacticalBoardTypes';
import type { TacticalBoardState } from './useTacticalBoard';

function ToolPreview({ tool, color }: { tool: LineTool | null; color: string }) {
  if (tool === null) return <HandGrabbing size={16} color={color} />;
  if (tool === 'wave') {
    return (
      <Svg width={22} height={14} viewBox="0 0 22 14">
        <Path d="M1 7 Q6 1 11 7 T21 7" stroke={color} strokeWidth={1.6} fill="none" />
      </Svg>
    );
  }
  return (
    <Svg width={22} height={14} viewBox="0 0 22 14">
      <SvgLine x1={1} y1={7} x2={21} y2={7} stroke={color} strokeWidth={1.6} />
      {tool === 'arrow' && <Path d="M21 7 L16 4 L16 10 Z" fill={color} />}
    </Svg>
  );
}

export function LineToolbar({ board }: { board: TacticalBoardState }) {
  const { palette } = useTheme();

  const options: { tool: LineTool | null; label: string }[] = [
    { tool: null, label: 'Nessuna linea' },
    ...LINE_TOOL_DEFS,
  ];

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={[styles.sectionLabel, { color: palette.ink50 }]}>Linee</Text>
      <View style={styles.row}>
        {options.map((opt) => {
          const active = board.lineTool === opt.tool;
          return (
            <Pressable
              key={opt.label}
              onPress={() => board.setLineTool(opt.tool)}
              style={[styles.toolButton, { backgroundColor: active ? palette.accentSoft : palette.bg2, borderColor: active ? palette.accent : 'transparent' }]}
            >
              <ToolPreview tool={opt.tool} color={active ? palette.accent : palette.tx2} />
              <Text style={{ fontSize: 9.5, color: active ? palette.accent : palette.ink55, fontFamily: 'Manrope_600SemiBold', marginTop: 4 }}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {board.lineTool != null && (
        <>
          <Text style={[styles.hint, { color: palette.ink50 }]}>
            Tieni il dito sul campo e trascina per allungare o accorciare la linea.
          </Text>
          <View style={styles.colorRow}>
            {LINE_COLORS.map((c) => (
              <Pressable
                key={c}
                onPress={() => board.setDrawColor(c)}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: c, borderWidth: board.drawColor === c ? 2 : 1, borderColor: board.drawColor === c ? palette.accent : 'rgba(0,0,0,0.15)' },
                ]}
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: { fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'Manrope_700Bold', marginBottom: 10 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  toolButton: { width: 76, alignItems: 'center', borderWidth: 1.5, borderRadius: 10, paddingVertical: 10 },
  hint: { fontSize: 10.5, marginTop: 10, lineHeight: 15, fontFamily: 'Manrope_400Regular' },
  colorRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  colorSwatch: { width: 24, height: 24, borderRadius: 12 },
});
