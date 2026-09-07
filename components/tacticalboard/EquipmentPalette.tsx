import React, { useRef } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/ThemeContext';
import { DragGhost, EQUIPMENT_DEFS, EquipmentKind, PitchMeasurements } from '../../lib/tacticalBoardTypes';
import type { TacticalBoardState } from './useTacticalBoard';

const GLYPH: Record<EquipmentKind, { shape: 'triangle' | 'circle' | 'square'; color: string; label: string }> = {
  cone: { shape: 'triangle', color: '#e07a2c', label: '▲' },
  ladder: { shape: 'square', color: '#2c3e66', label: '≡' },
  hurdle: { shape: 'square', color: '#b3412f', label: '⊓' },
  marker: { shape: 'circle', color: '#e8c93c', label: '' },
  ring: { shape: 'circle', color: '#3a7bd5', label: '' },
  minigoal: { shape: 'square', color: '#ffffff', label: '⛁' },
};

function EquipmentSwatch({
  kind,
  label,
  board,
  pitchMeasurements,
  setDragGhost,
}: {
  kind: EquipmentKind;
  label: string;
  board: TacticalBoardState;
  pitchMeasurements: PitchMeasurements | null;
  setDragGhost: (g: DragGhost | null) => void;
}) {
  const { palette } = useTheme();
  const glyph = GLYPH[kind];

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        setDragGhost({ kind: 'equipment', equipment: kind, pageX: evt.nativeEvent.pageX, pageY: evt.nativeEvent.pageY });
      },
      onPanResponderMove: (evt) => {
        setDragGhost({ kind: 'equipment', equipment: kind, pageX: evt.nativeEvent.pageX, pageY: evt.nativeEvent.pageY });
      },
      onPanResponderRelease: (evt) => {
        setDragGhost(null);
        const { pageX, pageY } = evt.nativeEvent;
        if (!pitchMeasurements) return;
        const relX = pageX - pitchMeasurements.pageX;
        const relY = pageY - pitchMeasurements.pageY;
        if (relX < 0 || relY < 0 || relX > pitchMeasurements.width || relY > pitchMeasurements.height) return;
        board.addEquipmentToken(kind, (relX / pitchMeasurements.width) * 100, (relY / pitchMeasurements.height) * 100);
      },
    })
  ).current;

  return (
    <View {...panResponder.panHandlers} style={styles.item}>
      <View
        style={[
          styles.icon,
          { backgroundColor: glyph.color, borderRadius: glyph.shape === 'circle' ? 14 : 6 },
        ]}
      >
        <Text style={{ fontSize: 13, color: '#16201a' }}>{glyph.label}</Text>
      </View>
      <Text style={{ fontSize: 9.5, color: palette.ink55, fontFamily: 'Manrope_500Medium' }}>{label}</Text>
    </View>
  );
}

export function EquipmentPalette({
  board,
  pitchMeasurements,
  setDragGhost,
}: {
  board: TacticalBoardState;
  pitchMeasurements: PitchMeasurements | null;
  setDragGhost: (g: DragGhost | null) => void;
}) {
  const { palette } = useTheme();

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={[styles.sectionLabel, { color: palette.ink50 }]}>Attrezzatura</Text>
      <View style={styles.row}>
        {EQUIPMENT_DEFS.map((e) => (
          <EquipmentSwatch key={e.kind} kind={e.kind} label={e.label} board={board} pitchMeasurements={pitchMeasurements} setDragGhost={setDragGhost} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: { fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'Manrope_700Bold', marginBottom: 10 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  item: { alignItems: 'center', gap: 4, width: 52 },
  icon: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
});
