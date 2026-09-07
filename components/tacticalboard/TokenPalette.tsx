import { Minus, Plus } from 'phosphor-react-native';
import React, { useRef } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/ThemeContext';
import { DragGhost, PitchMeasurements, TOKEN_COLORS } from '../../lib/tacticalBoardTypes';
import type { TacticalBoardState } from './useTacticalBoard';

function Swatch({
  color,
  size,
  board,
  pitchMeasurements,
  setDragGhost,
}: {
  color: string;
  size: number;
  board: TacticalBoardState;
  pitchMeasurements: PitchMeasurements | null;
  setDragGhost: (g: DragGhost | null) => void;
}) {
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        setDragGhost({ kind: 'player', color, pageX: evt.nativeEvent.pageX, pageY: evt.nativeEvent.pageY });
      },
      onPanResponderMove: (evt) => {
        setDragGhost({ kind: 'player', color, pageX: evt.nativeEvent.pageX, pageY: evt.nativeEvent.pageY });
      },
      onPanResponderRelease: (evt) => {
        setDragGhost(null);
        const { pageX, pageY } = evt.nativeEvent;
        if (!pitchMeasurements) return;
        const relX = pageX - pitchMeasurements.pageX;
        const relY = pageY - pitchMeasurements.pageY;
        if (relX < 0 || relY < 0 || relX > pitchMeasurements.width || relY > pitchMeasurements.height) return;
        board.addPlayerToken(color, (relX / pitchMeasurements.width) * 100, (relY / pitchMeasurements.height) * 100);
      },
    })
  ).current;

  const textColor = color === '#ffffff' ? '#16201a' : '#ffffff';

  return (
    <View
      {...panResponder.panHandlers}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.15)',
      }}
    >
      <Text style={{ fontSize: size * 0.4, fontFamily: 'Manrope_700Bold', color: textColor }}>+</Text>
    </View>
  );
}

export function TokenPalette({
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
      <View style={styles.headerRow}>
        <Text style={[styles.sectionLabel, { color: palette.ink50 }]}>Giocatori</Text>
        <View style={styles.stepper}>
          <Pressable onPress={() => board.bumpPlayerSize(-2)} style={[styles.stepperButton, { backgroundColor: palette.bg2 }]}>
            <Minus size={12} color={palette.tx} />
          </Pressable>
          <Text style={{ fontSize: 11, color: palette.ink55, fontFamily: 'Manrope_600SemiBold' }}>{board.playerSize}px</Text>
          <Pressable onPress={() => board.bumpPlayerSize(2)} style={[styles.stepperButton, { backgroundColor: palette.bg2 }]}>
            <Plus size={12} color={palette.tx} />
          </Pressable>
        </View>
      </View>
      <View style={styles.row}>
        {TOKEN_COLORS.map((c) => (
          <Swatch key={c} color={c} size={board.playerSize} board={board} pitchMeasurements={pitchMeasurements} setDragGhost={setDragGhost} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionLabel: { fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'Manrope_700Bold' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepperButton: { width: 22, height: 22, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});
