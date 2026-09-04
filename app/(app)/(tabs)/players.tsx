import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { CaretDown, CaretUp, Trash } from 'phosphor-react-native';
import { PillTabs } from '../../../components/shared/PillTabs';
import { ScreenContainer } from '../../../components/shared/ScreenContainer';
import { ScreenHeader } from '../../../components/shared/ScreenHeader';
import { TwoStageDeleteModal } from '../../../components/shared/TwoStageDeleteModal';
import { XmlImportPanel } from '../../../components/shared/XmlImportPanel';
import { useAuth } from '../../../lib/AuthContext';
import { ageFromBirthdate } from '../../../lib/dateUtils';
import { roleDef } from '../../../lib/permissions';
import { useAddPlayer, useBulkImportPlayers, useDeletePlayer, usePlayers } from '../../../lib/queries/players';
import { POS_TAG } from '../../../lib/theme';
import { useTheme } from '../../../lib/ThemeContext';
import type { Position } from '../../../types/database';
import { XMLParser } from 'fast-xml-parser';

const POSITION_LABEL: Record<Position, string> = { POR: 'Portiere', DIF: 'Difensore', CEN: 'Centrocampista', ATT: 'Attaccante' };
const ROLE_MAP: Record<string, Position> = {
  portiere: 'POR', por: 'POR',
  difensore: 'DIF', dif: 'DIF',
  centrocampista: 'CEN', cen: 'CEN',
  attaccante: 'ATT', att: 'ATT',
};

const FILTER_OPTIONS: { value: Position | 'Tutti'; label: string }[] = [
  { value: 'Tutti', label: 'Tutti' },
  { value: 'POR', label: 'POR' },
  { value: 'DIF', label: 'DIF' },
  { value: 'CEN', label: 'CEN' },
  { value: 'ATT', label: 'ATT' },
];

const TEMPLATE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<giocatori>
  <giocatore>
    <nome>Mario</nome>
    <cognome>Rossi</cognome>
    <dataNascita>2008-04-12</dataNascita>
    <ruolo>Difensore</ruolo>
  </giocatore>
</giocatori>`;

export default function PlayersScreen() {
  const { palette } = useTheme();
  const { profile } = useAuth();
  const def = roleDef(profile?.role);
  const { data: players } = usePlayers();
  const addPlayer = useAddPlayer();
  const bulkImport = useBulkImportPlayers();
  const deletePlayer = useDeletePlayer();

  const [filter, setFilter] = useState<Position | 'Tutti'>('Tutti');
  const [openId, setOpenId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [pos, setPos] = useState<Position>('CEN');

  const list = (players ?? []).filter((p) => filter === 'Tutti' || p.pos === filter);

  const positionGroups = (players ?? []).reduce<Record<Position, typeof players>>((acc, p) => {
    (acc[p.pos] ??= []).push(p);
    return acc;
  }, {} as Record<Position, typeof players>);

  const submitAdd = () => {
    if (!nome.trim() || !cognome.trim()) return;
    addPlayer.mutate(
      { nome: nome.trim(), cognome: cognome.trim(), pos, birthdate: birthdate.trim() || null },
      { onSuccess: () => { setNome(''); setCognome(''); setBirthdate(''); setFormOpen(false); } }
    );
  };

  const parsePlayersXml = async (xmlText: string) => {
    try {
      const parser = new XMLParser();
      const parsed = parser.parse(xmlText);
      const rawList = parsed?.giocatori?.giocatore;
      const rows = Array.isArray(rawList) ? rawList : rawList ? [rawList] : [];
      if (rows.length === 0) return { error: 'Nessun giocatore trovato nel file.' };
      const toInsert = rows.map((r: Record<string, unknown>) => {
        const ruolo = String(r.ruolo ?? '').trim().toLowerCase();
        return {
          nome: String(r.nome ?? '').trim(),
          cognome: String(r.cognome ?? '').trim(),
          birthdate: r.dataNascita ? String(r.dataNascita).trim() : null,
          pos: ROLE_MAP[ruolo] ?? 'CEN',
        };
      }).filter((r) => r.nome && r.cognome);
      if (toInsert.length === 0) return { error: 'Il file non contiene righe valide.' };
      await bulkImport.mutateAsync(toInsert);
      return { count: toInsert.length };
    } catch {
      return { error: 'File XML non valido.' };
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader eyebrow="Lista giocatori" title="Rosa Juniores" showBack={false} />

      <View style={{ marginBottom: 16 }}>
        <PillTabs options={FILTER_OPTIONS} value={filter} onChange={setFilter} />
      </View>

      <View style={{ gap: 8, marginBottom: 18 }}>
        {list.map((p) => {
          const age = ageFromBirthdate(p.birthdate);
          const tag = POS_TAG[p.pos];
          const isOpen = openId === p.id;
          const group = (positionGroups[p.pos] ?? []).filter(Boolean);
          const maxGoals = Math.max(1, ...group.map((g) => g!.goals));
          const maxAssists = Math.max(1, ...group.map((g) => g!.assists));
          const maxMinutes = Math.max(1, ...group.map((g) => g!.minutes));

          return (
            <View key={p.id} style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.ink08 }]}>
              <Pressable onPress={() => setOpenId(isOpen ? null : p.id)} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, { color: palette.tx }]}>{p.nome} {p.cognome}</Text>
                  <Text style={[styles.age, { color: palette.ink50 }]}>{age != null ? `${age} anni` : '—'}</Text>
                </View>
                <View style={[styles.tag, { backgroundColor: palette[tag.bgKey] }]}>
                  <Text style={[styles.tagText, { color: palette[tag.colorKey] }]}>{p.pos}</Text>
                </View>
                {isOpen ? <CaretUp size={15} color={palette.ink35} /> : <CaretDown size={15} color={palette.ink35} />}
              </Pressable>

              {isOpen && (
                <View style={[styles.detail, { borderTopColor: palette.ink06 }]}>
                  <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: palette.tx }]}>{p.goals}</Text>
                      <Text style={[styles.statLabel, { color: palette.ink50 }]}>Gol</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: palette.tx }]}>{p.assists}</Text>
                      <Text style={[styles.statLabel, { color: palette.ink50 }]}>Assist</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: palette.tx }]}>{p.minutes}</Text>
                      <Text style={[styles.statLabel, { color: palette.ink50 }]}>Minuti</Text>
                    </View>
                  </View>

                  <Text style={[styles.sectionLabel, { color: palette.ink45 }]}>Confronto con il reparto</Text>
                  <View style={{ gap: 10, marginBottom: 4 }}>
                    {[
                      { label: 'Gol', value: p.goals, max: maxGoals },
                      { label: 'Assist', value: p.assists, max: maxAssists },
                      { label: 'Minuti', value: p.minutes, max: maxMinutes },
                    ].map((c) => (
                      <View key={c.label}>
                        <View style={styles.compareLabelRow}>
                          <Text style={{ fontSize: 11, color: palette.ink55 }}>{c.label}</Text>
                          <Text style={{ fontSize: 11, fontFamily: 'Manrope_700Bold', color: palette.tx }}>{c.value}</Text>
                        </View>
                        <View style={[styles.barTrack, { backgroundColor: palette.bg2 }]}>
                          <View style={[styles.barFill, { width: `${Math.min(100, (c.value / c.max) * 100)}%`, backgroundColor: palette.accent }]} />
                        </View>
                      </View>
                    ))}
                  </View>

                  {def?.canManagePlayers && (
                    <Pressable
                      onPress={() => setDeleteTarget({ id: p.id, name: `${p.nome} ${p.cognome}` })}
                      style={[styles.deleteButton, { backgroundColor: palette.dangerSoft }]}
                    >
                      <Trash size={15} color={palette.danger} />
                      <Text style={[styles.deleteButtonText, { color: palette.danger }]}>Elimina giocatore</Text>
                    </Pressable>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </View>

      {def?.canManagePlayers && (
        <>
          <XmlImportPanel
            title="Importa da file XML"
            description="Un giocatore per riga, con nome, cognome, data di nascita e ruolo. L'età si aggiorna da sola dalla data di nascita."
            templateFilename="modello_giocatori.xml"
            templateXml={TEMPLATE_XML}
            onParse={parsePlayersXml}
          />

          {formOpen && (
            <View style={[styles.formCard, { backgroundColor: palette.surface, borderColor: palette.ink08 }]}>
              <TextInput
                value={nome}
                onChangeText={setNome}
                placeholder="Nome"
                placeholderTextColor={palette.ink40}
                style={[styles.input, { borderColor: palette.ink15, color: palette.tx }]}
              />
              <TextInput
                value={cognome}
                onChangeText={setCognome}
                placeholder="Cognome"
                placeholderTextColor={palette.ink40}
                style={[styles.input, { borderColor: palette.ink15, color: palette.tx }]}
              />
              <TextInput
                value={birthdate}
                onChangeText={setBirthdate}
                placeholder="Data di nascita (AAAA-MM-GG, opzionale)"
                placeholderTextColor={palette.ink40}
                style={[styles.input, { borderColor: palette.ink15, color: palette.tx }]}
              />
              <PillTabs
                options={(['POR', 'DIF', 'CEN', 'ATT'] as Position[]).map((v) => ({ value: v, label: POSITION_LABEL[v] }))}
                value={pos}
                onChange={setPos}
              />
              <Pressable onPress={submitAdd} style={[styles.submitButton, { backgroundColor: palette.accent }]}>
                <Text style={styles.submitButtonText}>Aggiungi giocatore</Text>
              </Pressable>
            </View>
          )}
          <Pressable
            onPress={() => setFormOpen((o) => !o)}
            style={[styles.dashedButton, { borderColor: palette.accent40 }]}
          >
            <Text style={[styles.dashedButtonText, { color: palette.accent }]}>
              {formOpen ? 'Annulla' : '+ Aggiungi giocatore'}
            </Text>
          </Pressable>
        </>
      )}

      <TwoStageDeleteModal
        visible={!!deleteTarget}
        targetName={deleteTarget?.name ?? ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deletePlayer.mutate(deleteTarget.id);
          setDeleteTarget(null);
          setOpenId(null);
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  row: { padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontSize: 14, fontFamily: 'Manrope_700Bold' },
  age: { fontSize: 11, marginTop: 2, fontFamily: 'Manrope_500Medium' },
  tag: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 7 },
  tagText: { fontSize: 10.5, fontFamily: 'Manrope_700Bold' },
  detail: { padding: 14, paddingTop: 4, borderTopWidth: 1, gap: 4 },
  statsGrid: { flexDirection: 'row', marginVertical: 10 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 17, fontFamily: 'Manrope_800ExtraBold' },
  statLabel: { fontSize: 9.5, marginTop: 2, fontFamily: 'Manrope_500Medium' },
  sectionLabel: { fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'Manrope_700Bold', marginBottom: 8 },
  compareLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  barTrack: { height: 6, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  deleteButton: { flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', borderRadius: 8, paddingVertical: 9, marginTop: 14 },
  deleteButtonText: { fontSize: 12.5, fontFamily: 'Manrope_700Bold' },
  formCard: { borderWidth: 1, borderRadius: 14, padding: 16, gap: 10, marginBottom: 14 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 11, paddingVertical: 9, fontSize: 13, fontFamily: 'Manrope_400Regular' },
  submitButton: { borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  submitButtonText: { color: '#fff', fontSize: 13, fontFamily: 'Manrope_700Bold' },
  dashedButton: { borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 12, padding: 12, alignItems: 'center' },
  dashedButtonText: { fontSize: 13, fontFamily: 'Manrope_700Bold' },
});
