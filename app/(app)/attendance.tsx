import { addMonths, addWeeks, format } from 'date-fns';
import { it } from 'date-fns/locale';
import { CaretLeft, CaretRight, Trash } from 'phosphor-react-native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MonthGrid } from '../../components/attendance/MonthGrid';
import { WeekGrid } from '../../components/attendance/WeekGrid';
import { PillTabs } from '../../components/shared/PillTabs';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { ScreenHeader } from '../../components/shared/ScreenHeader';
import { useAuth } from '../../lib/AuthContext';
import { buildWeekDates } from '../../lib/dateUtils';
import { roleDef } from '../../lib/permissions';
import { useAllAttendance, useDeleteAttendance, useUpsertAttendance } from '../../lib/queries/attendance';
import { usePlayers } from '../../lib/queries/players';
import { useTrainings } from '../../lib/queries/trainings';
import { useTheme } from '../../lib/ThemeContext';
import type { AttendanceStatus } from '../../types/database';

const STATUS_OPTIONS: { value: AttendanceStatus; label: string }[] = [
  { value: 'present', label: 'Presente' },
  { value: 'absent', label: 'Assente' },
  { value: 'planned_absence', label: 'Assenza programmata' },
];

export default function AttendanceScreen() {
  const { palette } = useTheme();
  const { profile } = useAuth();
  const def = roleDef(profile?.role);
  const { data: trainings } = useTrainings();
  const { data: players } = usePlayers();
  const { data: attendance } = useAllAttendance();
  const upsert = useUpsertAttendance();
  const deleteAttendance = useDeleteAttendance();

  const [view, setView] = useState<'month' | 'week'>('month');
  const [cursor, setCursor] = useState(new Date());
  const [selectedTrainingId, setSelectedTrainingId] = useState<number | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [status, setStatus] = useState<AttendanceStatus>('planned_absence');
  const [motivo, setMotivo] = useState('');

  const shift = (dir: 1 | -1) => setCursor((c) => (view === 'month' ? addMonths(c, dir) : addWeeks(c, dir)));

  const onSlot = (_date: Date, trainingId: number | null) => {
    setSelectedTrainingId(trainingId);
    setSelectedPlayerId(null);
    setMotivo('');
  };

  const submit = () => {
    if (!selectedTrainingId || !selectedPlayerId) return;
    upsert.mutate(
      { training_id: selectedTrainingId, player_id: selectedPlayerId, status, motivo: motivo.trim() || null, created_by: profile?.id ?? null },
      { onSuccess: () => { setSelectedTrainingId(null); setSelectedPlayerId(null); setMotivo(''); } }
    );
  };

  const entries = (attendance ?? [])
    .filter((a) => a.status !== 'present')
    .map((a) => {
      const training = trainings?.find((t) => t.id === a.training_id);
      const player = players?.find((p) => p.id === a.player_id);
      return { ...a, training, player };
    })
    .filter((e) => e.training && e.player)
    .sort((a, b) => (a.training!.training_date < b.training!.training_date ? 1 : -1));

  const selectedTraining = trainings?.find((t) => t.id === selectedTrainingId);

  return (
    <ScreenContainer>
      <ScreenHeader eyebrow="Presenze & assenze" title="Calendario" />

      <View style={styles.navRow}>
        <Pressable onPress={() => shift(-1)} hitSlop={8}>
          <CaretLeft size={17} color={palette.tx} />
        </Pressable>
        <Text style={[styles.periodLabel, { color: palette.tx }]}>
          {view === 'month' ? format(cursor, 'MMMM yyyy', { locale: it }) : `Settimana del ${format(buildWeekDates(cursor)[0], 'd MMM', { locale: it })}`}
        </Text>
        <Pressable onPress={() => shift(1)} hitSlop={8}>
          <CaretRight size={17} color={palette.tx} />
        </Pressable>
      </View>

      <View style={{ marginBottom: 14 }}>
        <PillTabs
          variant="segmented"
          options={[{ value: 'month', label: 'Mese' }, { value: 'week', label: 'Settimana' }]}
          value={view}
          onChange={setView}
        />
      </View>

      <View style={{ marginBottom: 18 }}>
        {view === 'month' ? (
          <MonthGrid cursor={cursor} trainings={trainings ?? []} onDayPress={onSlot} />
        ) : (
          <WeekGrid weekDates={buildWeekDates(cursor)} trainings={trainings ?? []} onSlotPress={onSlot} />
        )}
      </View>

      {def?.canManageAttendance && selectedTrainingId != null && (
        <View style={[styles.formCard, { backgroundColor: palette.surface, borderColor: palette.ink08 }]}>
          <Text style={[styles.formTitle, { color: palette.tx }]}>
            Segnala assenza — {selectedTraining ? format(new Date(selectedTraining.training_date), 'd MMM', { locale: it }) : ''}
          </Text>
          <View style={styles.playerWrap}>
            {(players ?? []).map((p) => (
              <Pressable
                key={p.id}
                onPress={() => setSelectedPlayerId(p.id)}
                style={[
                  styles.playerChip,
                  { borderColor: palette.ink15, backgroundColor: selectedPlayerId === p.id ? palette.accent : 'transparent' },
                ]}
              >
                <Text style={{ fontSize: 11.5, fontFamily: 'Manrope_600SemiBold', color: selectedPlayerId === p.id ? '#fff' : palette.tx2 }}>
                  {p.nome} {p.cognome}
                </Text>
              </Pressable>
            ))}
          </View>
          <PillTabs options={STATUS_OPTIONS} value={status} onChange={setStatus} />
          <TextInput
            value={motivo}
            onChangeText={setMotivo}
            placeholder="Motivazione (facoltativa)"
            placeholderTextColor={palette.ink40}
            style={[styles.input, { borderColor: palette.ink15, color: palette.tx }]}
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable onPress={() => setSelectedTrainingId(null)} style={[styles.button, { backgroundColor: palette.bg2 }]}>
              <Text style={{ color: palette.tx, fontFamily: 'Manrope_700Bold', fontSize: 12.5 }}>Annulla</Text>
            </Pressable>
            <Pressable onPress={submit} style={[styles.button, { backgroundColor: palette.accent }]}>
              <Text style={{ color: '#fff', fontFamily: 'Manrope_700Bold', fontSize: 12.5 }}>Salva</Text>
            </Pressable>
          </View>
        </View>
      )}

      <Text style={[styles.sectionLabel, { color: palette.ink50 }]}>Assenze registrate</Text>
      <View style={{ gap: 8 }}>
        {entries.map((e) => (
          <View key={`${e.training_id}-${e.player_id}`} style={[styles.entryRow, { backgroundColor: palette.surface, borderColor: palette.ink08 }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.entryName, { color: palette.tx }]}>{e.player!.nome} {e.player!.cognome}</Text>
              <Text style={[styles.entryMeta, { color: palette.ink50 }]}>
                {format(new Date(e.training!.training_date), 'd MMM', { locale: it })} · {e.training!.focus ?? 'Allenamento'}
                {e.status === 'planned_absence' ? ' · programmata' : ' · assente'}
                {e.motivo ? ` · ${e.motivo}` : ''}
              </Text>
            </View>
            {def?.canManageAttendance && (
              <Pressable onPress={() => deleteAttendance.mutate({ trainingId: e.training_id, playerId: e.player_id })} hitSlop={8}>
                <Trash size={16} color={palette.danger70} />
              </Pressable>
            )}
          </View>
        ))}
        {entries.length === 0 && (
          <Text style={{ color: palette.ink50, fontSize: 12.5, fontFamily: 'Manrope_500Medium' }}>Nessuna assenza registrata.</Text>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  periodLabel: { fontSize: 14, fontFamily: 'Manrope_700Bold', textTransform: 'capitalize' },
  formCard: { borderWidth: 1, borderRadius: 14, padding: 16, gap: 10, marginBottom: 18 },
  formTitle: { fontSize: 13, fontFamily: 'Manrope_700Bold' },
  playerWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  playerChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 11, paddingVertical: 9, fontSize: 13, fontFamily: 'Manrope_400Regular' },
  button: { flex: 1, borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  sectionLabel: { fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'Manrope_700Bold', marginBottom: 10 },
  entryRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 12, padding: 12 },
  entryName: { fontSize: 13, fontFamily: 'Manrope_700Bold' },
  entryMeta: { fontSize: 11, marginTop: 2, fontFamily: 'Manrope_500Medium' },
});
