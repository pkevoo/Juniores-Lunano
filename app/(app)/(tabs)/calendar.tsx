import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { XMLParser } from 'fast-xml-parser';
import { Trash } from 'phosphor-react-native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { PillTabs } from '../../../components/shared/PillTabs';
import { ScreenContainer } from '../../../components/shared/ScreenContainer';
import { ScreenHeader } from '../../../components/shared/ScreenHeader';
import { XmlImportPanel } from '../../../components/shared/XmlImportPanel';
import { useAuth } from '../../../lib/AuthContext';
import { roleDef } from '../../../lib/permissions';
import { useAddMatch, useBulkImportMatches, useDeleteMatch, useMatches } from '../../../lib/queries/matches';
import { useTheme } from '../../../lib/ThemeContext';

const TEMPLATE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<partite>
  <partita>
    <data>2026-09-20</data>
    <ora>16:00</ora>
    <avversario>Virtus Ponente</avversario>
    <sede>Casa</sede>
  </partita>
</partite>`;

export default function CalendarScreen() {
  const { palette } = useTheme();
  const { profile } = useAuth();
  const def = roleDef(profile?.role);
  const { data: matches } = useMatches();
  const addMatch = useAddMatch();
  const bulkImport = useBulkImportMatches();
  const deleteMatch = useDeleteMatch();

  const [tab, setTab] = useState<'prossime' | 'passate'>('prossime');
  const [formOpen, setFormOpen] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [opponent, setOpponent] = useState('');
  const [isHome, setIsHome] = useState<'true' | 'false'>('true');

  const list = (matches ?? [])
    .filter((m) => (tab === 'prossime' ? !m.played : m.played))
    .sort((a, b) => (tab === 'prossime' ? a.match_date.localeCompare(b.match_date) : b.match_date.localeCompare(a.match_date)));

  const submitAdd = () => {
    if (!date.trim() || !opponent.trim()) return;
    addMatch.mutate(
      { match_date: date.trim(), match_time: time.trim() || null, opponent: opponent.trim(), is_home: isHome === 'true', played: false },
      { onSuccess: () => { setDate(''); setTime(''); setOpponent(''); setFormOpen(false); } }
    );
  };

  const parseMatchesXml = async (xmlText: string) => {
    try {
      const parser = new XMLParser();
      const parsed = parser.parse(xmlText);
      const rawList = parsed?.partite?.partita;
      const rows = Array.isArray(rawList) ? rawList : rawList ? [rawList] : [];
      if (rows.length === 0) return { error: 'Nessuna partita trovata nel file.' };
      const toInsert = rows
        .map((r: Record<string, unknown>) => ({
          match_date: String(r.data ?? '').trim(),
          match_time: r.ora ? String(r.ora).trim() : null,
          opponent: String(r.avversario ?? '').trim(),
          is_home: String(r.sede ?? '').trim().toLowerCase().startsWith('casa'),
          played: false,
        }))
        .filter((r) => r.match_date && r.opponent);
      if (toInsert.length === 0) return { error: 'Il file non contiene righe valide.' };
      await bulkImport.mutateAsync(toInsert);
      return { count: toInsert.length };
    } catch {
      return { error: 'File XML non valido.' };
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader eyebrow="Calendario partite" title="Partite" showBack={false} />

      <View style={{ marginBottom: 16 }}>
        <PillTabs
          variant="segmented"
          options={[{ value: 'prossime', label: 'Prossime' }, { value: 'passate', label: 'Passate' }]}
          value={tab}
          onChange={setTab}
        />
      </View>

      <View style={{ gap: 10, marginBottom: 16 }}>
        {list.map((m) => (
          <View key={m.id} style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.ink08 }]}>
            <View style={{ flex: 1 }}>
              <View style={styles.rowBetween}>
                <Text style={[styles.opponentText, { color: palette.tx }]}>
                  Juniores Ponente {m.is_home ? 'vs' : '@'} {m.opponent}
                </Text>
                {m.played && (
                  <Text style={[styles.score, { color: palette.accent }]}>
                    {m.score_for ?? '-'}-{m.score_against ?? '-'}
                  </Text>
                )}
              </View>
              <Text style={[styles.meta, { color: palette.ink55 }]}>
                {format(new Date(m.match_date), 'd MMM yyyy', { locale: it })}
                {m.match_time ? ` · ${m.match_time.slice(0, 5)}` : ''} · {m.is_home ? 'Casa' : 'Trasferta'}
              </Text>
            </View>
            {def?.canManageMatches && (
              <Pressable onPress={() => deleteMatch.mutate(m.id)} hitSlop={8} style={{ padding: 4 }}>
                <Trash size={17} color={palette.danger70} />
              </Pressable>
            )}
          </View>
        ))}
        {list.length === 0 && (
          <Text style={{ color: palette.ink50, fontSize: 12.5, fontFamily: 'Manrope_500Medium' }}>
            Nessuna partita {tab === 'prossime' ? 'in programma' : 'disputata'}.
          </Text>
        )}
      </View>

      {def?.canManageMatches && (
        <>
          <XmlImportPanel
            title="Importa calendario da XML"
            description="Una partita per riga, con data (AAAA-MM-GG), ora, avversario e sede."
            templateFilename="modello_partite.xml"
            templateXml={TEMPLATE_XML}
            onParse={parseMatchesXml}
          />

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
                placeholder="Ora (es. 16:00)"
                placeholderTextColor={palette.ink40}
                style={[styles.input, { borderColor: palette.ink15, color: palette.tx }]}
              />
              <TextInput
                value={opponent}
                onChangeText={setOpponent}
                placeholder="Avversario"
                placeholderTextColor={palette.ink40}
                style={[styles.input, { borderColor: palette.ink15, color: palette.tx }]}
              />
              <PillTabs
                options={[{ value: 'true', label: 'Casa' }, { value: 'false', label: 'Trasferta' }]}
                value={isHome}
                onChange={setIsHome}
              />
              <Pressable onPress={submitAdd} style={[styles.submitButton, { backgroundColor: palette.accent }]}>
                <Text style={styles.submitButtonText}>Aggiungi partita</Text>
              </Pressable>
            </View>
          )}
          <Pressable onPress={() => setFormOpen((o) => !o)} style={[styles.dashedButton, { borderColor: palette.accent40 }]}>
            <Text style={[styles.dashedButtonText, { color: palette.accent }]}>{formOpen ? 'Annulla' : '+ Aggiungi partita'}</Text>
          </Pressable>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 12, padding: 13 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  opponentText: { fontSize: 13.5, fontFamily: 'Manrope_700Bold' },
  score: { fontSize: 14, fontFamily: 'Manrope_800ExtraBold' },
  meta: { fontSize: 11.5, fontFamily: 'Manrope_500Medium' },
  formCard: { borderWidth: 1, borderRadius: 14, padding: 16, gap: 10, marginBottom: 14 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 11, paddingVertical: 9, fontSize: 13, fontFamily: 'Manrope_400Regular' },
  submitButton: { borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  submitButtonText: { color: '#fff', fontSize: 13, fontFamily: 'Manrope_700Bold' },
  dashedButton: { borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 12, padding: 12, alignItems: 'center' },
  dashedButtonText: { fontSize: 13, fontFamily: 'Manrope_700Bold' },
});
