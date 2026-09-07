import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowCounterClockwise,
  Broom,
  FlipHorizontal,
  Trash,
} from 'phosphor-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { EquipmentPalette } from '../../components/tacticalboard/EquipmentPalette';
import { LineToolbar } from '../../components/tacticalboard/LineToolbar';
import { Pitch } from '../../components/tacticalboard/Pitch';
import { TokenPalette } from '../../components/tacticalboard/TokenPalette';
import { useTacticalBoard } from '../../components/tacticalboard/useTacticalBoard';
import { ScreenHeader } from '../../components/shared/ScreenHeader';
import { useAuth } from '../../lib/AuthContext';
import { useSaveScheme, useSchemes } from '../../lib/queries/schemes';
import type { DragGhost, PitchMeasurements } from '../../lib/tacticalBoardTypes';
import { useTheme } from '../../lib/ThemeContext';

export default function TacticalBoardScreen() {
  const { palette } = useTheme();
  const { profile } = useAuth();
  const params = useLocalSearchParams<{ schemeId?: string }>();
  const board = useTacticalBoard();
  const { data: schemes } = useSchemes();
  const saveScheme = useSaveScheme();

  const [pitchMeasurements, setPitchMeasurements] = useState<PitchMeasurements | null>(null);
  const [dragGhost, setDragGhost] = useState<DragGhost | null>(null);
  const [rootOffset, setRootOffset] = useState({ x: 0, y: 0 });
  const rootRef = useRef<View>(null);
  const [schemeName, setSchemeName] = useState('');
  const loadedSchemeRef = useRef<string | null>(null);

  const onRootLayout = (_e: LayoutChangeEvent) => {
    rootRef.current?.measure((_x, _y, _w, _h, pageX, pageY) => setRootOffset({ x: pageX, y: pageY }));
  };

  useEffect(() => {
    if (params.schemeId && schemes && loadedSchemeRef.current !== params.schemeId) {
      const scheme = schemes.find((s) => String(s.id) === params.schemeId);
      if (scheme) {
        board.loadScheme(scheme);
        loadedSchemeRef.current = params.schemeId;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.schemeId, schemes]);

  const save = () => {
    if (!schemeName.trim() || (board.tokens.length === 0 && board.lines.length === 0)) return;
    saveScheme.mutate(
      { name: schemeName.trim(), tokens: board.tokens, lines: board.lines, player_size: board.playerSize, created_by: profile?.id ?? null },
      { onSuccess: () => { setSchemeName(''); router.navigate('/(app)/trainingarchive' as never); } }
    );
  };

  return (
    <View ref={rootRef} onLayout={onRootLayout} style={{ flex: 1, backgroundColor: palette.bg }}>
      <View style={{ paddingHorizontal: 18, paddingTop: 14 }}>
        <ScreenHeader eyebrow="Lavagna tattica" title="Schema" />
      </View>

      <View style={{ paddingHorizontal: 18 }}>
        <Pitch board={board} onMeasured={setPitchMeasurements} />

        <View style={styles.toolbarRow}>
          <Pressable onPress={board.undo} disabled={!board.canUndo} style={[styles.toolbarButton, { backgroundColor: palette.bg2, opacity: board.canUndo ? 1 : 0.4 }]}>
            <ArrowCounterClockwise size={15} color={palette.tx} />
            <Text style={[styles.toolbarButtonText, { color: palette.tx }]}>Indietro</Text>
          </Pressable>
          <Pressable onPress={board.clearLines} style={[styles.toolbarButton, { backgroundColor: palette.bg2 }]}>
            <Broom size={15} color={palette.tx} />
            <Text style={[styles.toolbarButtonText, { color: palette.tx }]}>Pulisci linee</Text>
          </Pressable>
          <Pressable onPress={board.clearBoard} style={[styles.toolbarButton, { backgroundColor: palette.dangerSoft }]}>
            <Trash size={15} color={palette.danger} />
            <Text style={[styles.toolbarButtonText, { color: palette.danger }]}>Pulisci lavagna</Text>
          </Pressable>
          <Pressable onPress={board.mirror} style={[styles.toolbarButton, { backgroundColor: palette.accentSoft }]}>
            <FlipHorizontal size={15} color={palette.accent} />
            <Text style={[styles.toolbarButtonText, { color: palette.accent }]}>Specchia</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18, paddingTop: 16 }}>
        <TokenPalette board={board} pitchMeasurements={pitchMeasurements} setDragGhost={setDragGhost} />
        <EquipmentPalette board={board} pitchMeasurements={pitchMeasurements} setDragGhost={setDragGhost} />
        <LineToolbar board={board} />

        {board.selectedId != null && (
          <View style={[styles.selectedBar, { backgroundColor: palette.surface, borderColor: palette.ink08 }]}>
            <Text style={{ fontSize: 12, color: palette.tx, fontFamily: 'Manrope_600SemiBold' }}>Elemento selezionato</Text>
            <Pressable onPress={board.removeSelected} style={[styles.removeButton, { backgroundColor: palette.dangerSoft }]}>
              <Text style={{ color: palette.danger, fontSize: 11.5, fontFamily: 'Manrope_700Bold' }}>Rimuovi</Text>
            </Pressable>
          </View>
        )}

        <Text style={[styles.sectionLabel, { color: palette.ink50 }]}>Salva nell'archivio allenamenti</Text>
        <View style={styles.saveRow}>
          <TextInput
            value={schemeName}
            onChangeText={setSchemeName}
            placeholder="Nome schema"
            placeholderTextColor={palette.ink40}
            style={[styles.input, { borderColor: palette.ink15, color: palette.tx }]}
          />
          <Pressable onPress={save} style={[styles.saveButton, { backgroundColor: palette.accent }]}>
            <Text style={styles.saveButtonText}>Salva</Text>
          </Pressable>
        </View>
        <Pressable onPress={() => router.navigate('/(app)/trainingarchive' as never)} style={{ marginTop: 14 }}>
          <Text style={{ color: palette.accent, fontSize: 12.5, fontFamily: 'Manrope_700Bold' }}>Vai all'archivio allenamenti →</Text>
        </Pressable>
      </ScrollView>

      {dragGhost && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: dragGhost.pageX - rootOffset.x - 18,
            top: dragGhost.pageY - rootOffset.y - 18,
            width: 36,
            height: 36,
            borderRadius: dragGhost.kind === 'player' ? 18 : 8,
            backgroundColor: dragGhost.kind === 'player' ? dragGhost.color : palette.accent,
            opacity: 0.85,
            borderWidth: 2,
            borderColor: '#fff',
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  toolbarRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, marginBottom: 6 },
  toolbarButton: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  toolbarButtonText: { fontSize: 11, fontFamily: 'Manrope_700Bold' },
  selectedBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 18 },
  removeButton: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  sectionLabel: { fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'Manrope_700Bold', marginBottom: 10 },
  saveRow: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, borderWidth: 1, borderRadius: 8, paddingHorizontal: 11, paddingVertical: 9, fontSize: 13, fontFamily: 'Manrope_400Regular' },
  saveButton: { borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center' },
  saveButtonText: { color: '#fff', fontSize: 13, fontFamily: 'Manrope_700Bold' },
});
