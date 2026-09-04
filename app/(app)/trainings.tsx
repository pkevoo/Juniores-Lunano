import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { ScreenHeader } from '../../components/shared/ScreenHeader';
import { useAuth } from '../../lib/AuthContext';
import { roleDef } from '../../lib/permissions';
import { useAddTraining, useTrainings } from '../../lib/queries/trainings';
import { useTheme } from '../../lib/ThemeContext';

export default function TrainingsScreen() {
  const { palette } = useTheme();
  const { profile } = useAuth();
  const def = roleDef(profile?.role);
  const { data: trainings } = useTrainings();
  const addTraining = useAddTraining();

  const [formOpen, setFormOpen] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [place, setPlace] = useState('Campo comunale');
  const [focus, setFocus] = useState('');

  const list = [...(trainings ?? [])].sort((a, b) => a.training_date.localeCompare(b.training_date));

  const submitAdd = () => {
    if (!date.trim() || !time.trim()) return;
    addTraining.mutate(
      { training_date: date.trim(), training_time: time.trim(), place: place.trim() || 'Campo comunale', focus: focus.trim() || null },
      { onSuccess: () => { setDate(''); setTime(''); setFocus(''); setFormOpen(false); } }
    );
  };

  return (
    <ScreenContainer>
      <ScreenHeader eyebrow="Allenamenti" title="Programma settimanale" />

      <View style={{ gap: 10, marginBottom: 16 }}>
        {list.map((t) => (
          <View key={t.id} style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.ink08 }]}>
            <View style={styles.rowBetween}>
              <Text style={[styles.focusText, { color: palette.tx }]}>{t.focus ?? 'Allenamento'}</Text>
            </View>
            <Text style={[styles.meta, { color: palette.ink55 }]}>
              {format(new Date(t.training_date), 'd MMM yyyy', { locale: it })} · {t.training_time.slice(0, 5)} · {t.place}
            </Text>
          </View>
        ))}
        {list.length === 0 && (
          <Text style={{ color: palette.ink50, fontSize: 12.5, fontFamily: 'Manrope_500Medium' }}>
            Nessun allenamento programmato.
          </Text>
        )}
      </View>

      {def?.canManageTrainings && (
        <>
          {formOpen && (
            <View style={[styles.formCard, { backgroundColor: palette.surface, borderColor: palette.ink08 }]}>
              <TextInput
                value={date}
                onChangeText={setDate}
                placeholder="Data (AAAA-MM-GG)"
                placeholderTextColor={palette.ink40}
                style={[styles.input, { borderColor: palette.ink15, color: palette.tx }]}
              />
              <TextInput
                value={time}
                onChangeText={setTime}
                placeholder="Ora (es. 18:30)"
                placeholderTextColor={palette.ink40}
                style={[styles.input, { borderColor: palette.ink15, color: palette.tx }]}
              />
              <TextInput
                value={place}
                onChangeText={setPlace}
                placeholder="Luogo"
                placeholderTextColor={palette.ink40}
                style={[styles.input, { borderColor: palette.ink15, color: palette.tx }]}
              />
              <TextInput
                value={focus}
                onChangeText={setFocus}
                placeholder="Focus allenamento"
                placeholderTextColor={palette.ink40}
                style={[styles.input, { borderColor: palette.ink15, color: palette.tx }]}
              />
              <Pressable onPress={submitAdd} style={[styles.submitButton, { backgroundColor: palette.accent }]}>
                <Text style={styles.submitButtonText}>Programma allenamento</Text>
              </Pressable>
            </View>
          )}
          <Pressable onPress={() => setFormOpen((o) => !o)} style={[styles.dashedButton, { borderColor: palette.accent40 }]}>
            <Text style={[styles.dashedButtonText, { color: palette.accent }]}>{formOpen ? 'Annulla' : '+ Programma allenamento'}</Text>
          </Pressable>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, padding: 13 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  focusText: { fontSize: 13.5, fontFamily: 'Manrope_700Bold' },
  meta: { fontSize: 11.5, fontFamily: 'Manrope_500Medium' },
  formCard: { borderWidth: 1, borderRadius: 14, padding: 16, gap: 10, marginBottom: 14 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 11, paddingVertical: 9, fontSize: 13, fontFamily: 'Manrope_400Regular' },
  submitButton: { borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  submitButtonText: { color: '#fff', fontSize: 13, fontFamily: 'Manrope_700Bold' },
  dashedButton: { borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 12, padding: 12, alignItems: 'center' },
  dashedButtonText: { fontSize: 13, fontFamily: 'Manrope_700Bold' },
});
