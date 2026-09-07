import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { router } from 'expo-router';
import { Trash } from 'phosphor-react-native';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { ScreenHeader } from '../../components/shared/ScreenHeader';
import { useDeleteScheme, useSchemes } from '../../lib/queries/schemes';
import { useTheme } from '../../lib/ThemeContext';

export default function TrainingArchiveScreen() {
  const { palette } = useTheme();
  const { data: schemes } = useSchemes();
  const deleteScheme = useDeleteScheme();

  const confirmDelete = (id: number, name: string) => {
    Alert.alert('Elimina schema', `Eliminare lo schema "${name}"?`, [
      { text: 'Annulla', style: 'cancel' },
      { text: 'Elimina', style: 'destructive', onPress: () => deleteScheme.mutate(id) },
    ]);
  };

  return (
    <ScreenContainer>
      <ScreenHeader eyebrow="Archivio allenamenti" title="Schemi salvati" />
      <View style={{ gap: 10 }}>
        {(schemes ?? []).map((s) => {
          const playerCount = s.tokens.filter((t) => t.kind === 'player').length;
          return (
            <View key={s.id} style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.ink08 }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: palette.tx }]}>{s.name}</Text>
                <Text style={[styles.meta, { color: palette.ink50 }]}>
                  {format(new Date(s.created_at), 'd MMM yyyy', { locale: it })} · {playerCount} giocatori
                </Text>
              </View>
              <Pressable
                onPress={() => router.navigate({ pathname: '/(app)/tacticalboard', params: { schemeId: String(s.id) } } as never)}
                style={[styles.openButton, { backgroundColor: palette.accent }]}
              >
                <Text style={styles.openButtonText}>Apri</Text>
              </Pressable>
              <Pressable onPress={() => confirmDelete(s.id, s.name)} hitSlop={8}>
                <Trash size={17} color={palette.danger70} />
              </Pressable>
            </View>
          );
        })}
        {(schemes ?? []).length === 0 && (
          <Text style={{ color: palette.ink50, fontSize: 12.5, fontFamily: 'Manrope_500Medium' }}>
            Nessuno schema salvato. Crea uno schema nella Lavagna tattica e salvalo qui.
          </Text>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 12, padding: 13 },
  name: { fontSize: 13.5, fontFamily: 'Manrope_700Bold' },
  meta: { fontSize: 11, marginTop: 2, fontFamily: 'Manrope_500Medium' },
  openButton: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  openButtonText: { color: '#fff', fontSize: 11.5, fontFamily: 'Manrope_700Bold' },
});
