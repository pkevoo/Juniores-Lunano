import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Medal } from 'phosphor-react-native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PillTabs } from '../../../components/shared/PillTabs';
import { ScreenContainer } from '../../../components/shared/ScreenContainer';
import { ScreenHeader } from '../../../components/shared/ScreenHeader';
import { useAuth } from '../../../lib/AuthContext';
import { roleDef } from '../../../lib/permissions';
import { useAllAttendance, presencePct } from '../../../lib/queries/attendance';
import { useMatches } from '../../../lib/queries/matches';
import { useAssignMvp, useMvpAwards } from '../../../lib/queries/mvp';
import { usePlayers } from '../../../lib/queries/players';
import { useTheme } from '../../../lib/ThemeContext';

export default function StatsScreen() {
  const { palette } = useTheme();
  const { profile } = useAuth();
  const def = roleDef(profile?.role);
  const { data: players } = usePlayers();
  const { data: matches } = useMatches();
  const { data: attendance } = useAllAttendance();
  const { data: mvpAwards } = useMvpAwards();
  const assignMvp = useAssignMvp();

  const [tab, setTab] = useState<'presence' | 'performance' | 'mvp'>('presence');
  const [mvpMatchId, setMvpMatchId] = useState<number | null>(null);
  const [mvpPlayerId, setMvpPlayerId] = useState<number | null>(null);
  const [mvpError, setMvpError] = useState('');

  const playedMatches = (matches ?? []).filter((m) => m.played);

  const submitMvp = () => {
    setMvpError('');
    if (!mvpMatchId || !mvpPlayerId) return;
    assignMvp.mutate(
      { matchId: mvpMatchId, playerId: mvpPlayerId },
      {
        onError: (err: unknown) => {
          const message = (err as { code?: string })?.code === '23505'
            ? 'Questa partita ha già un MVP assegnato.'
            : 'Impossibile assegnare il MVP.';
          setMvpError(message);
        },
        onSuccess: () => { setMvpMatchId(null); setMvpPlayerId(null); },
      }
    );
  };

  return (
    <ScreenContainer>
      <ScreenHeader eyebrow="Statistiche" title="Numeri della squadra" showBack={false} />

      <View style={{ marginBottom: 20 }}>
        <PillTabs
          variant="segmented"
          options={[
            { value: 'presence', label: 'Presenze' },
            { value: 'performance', label: 'Performance' },
            { value: 'mvp', label: 'MVP' },
          ]}
          value={tab}
          onChange={setTab}
        />
      </View>

      {tab === 'presence' && (
        <View style={{ gap: 14 }}>
          {(players ?? []).map((p) => {
            const records = (attendance ?? []).filter((a) => a.player_id === p.id);
            const pct = presencePct(records);
            return (
              <View key={p.id}>
                <View style={styles.presenceLabelRow}>
                  <Text style={{ fontSize: 13, fontFamily: 'Manrope_600SemiBold', color: palette.tx }}>{p.nome} {p.cognome}</Text>
                  <Text style={{ fontSize: 12, color: palette.ink50 }}>{pct != null ? `${pct}%` : '—'}</Text>
                </View>
                <View style={[styles.barTrack, { backgroundColor: palette.bg2 }]}>
                  <View style={[styles.barFill, { width: `${pct ?? 0}%`, backgroundColor: palette.accent }]} />
                </View>
              </View>
            );
          })}
          {(players ?? []).length === 0 && (
            <Text style={{ color: palette.ink50, fontSize: 12.5, fontFamily: 'Manrope_500Medium' }}>Nessun giocatore in rosa.</Text>
          )}
        </View>
      )}

      {tab === 'performance' && (
        <View style={{ gap: 8 }}>
          {(players ?? []).map((p) => (
            <View key={p.id} style={[styles.perfCard, { backgroundColor: palette.surface, borderColor: palette.ink08 }]}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13.5, fontFamily: 'Manrope_700Bold', color: palette.tx }}>{p.nome} {p.cognome}</Text>
                <Text style={{ fontSize: 11, color: palette.ink50, marginTop: 2 }}>{p.pos} · {p.minutes} min</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 15, fontFamily: 'Manrope_800ExtraBold', color: palette.accent }}>{p.goals}</Text>
                <Text style={{ fontSize: 9.5, color: palette.ink50 }}>Gol</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 15, fontFamily: 'Manrope_800ExtraBold', color: palette.warn }}>{p.assists}</Text>
                <Text style={{ fontSize: 9.5, color: palette.ink50 }}>Assist</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {tab === 'mvp' && (
        <View>
          {def?.canAssignMvp && (
            <View style={[styles.mvpForm, { backgroundColor: palette.surface, borderColor: palette.ink08 }]}>
              <Text style={{ fontSize: 13, fontFamily: 'Manrope_700Bold', color: palette.tx, marginBottom: 2 }}>Assegna MVP</Text>
              <View style={styles.chipWrap}>
                {playedMatches.map((m) => (
                  <Pressable
                    key={m.id}
                    onPress={() => setMvpMatchId(m.id)}
                    style={[styles.chip, { borderColor: palette.ink15, backgroundColor: mvpMatchId === m.id ? palette.accent : 'transparent' }]}
                  >
                    <Text style={{ fontSize: 11, fontFamily: 'Manrope_600SemiBold', color: mvpMatchId === m.id ? '#fff' : palette.tx2 }}>
                      {m.opponent} ({format(new Date(m.match_date), 'd MMM', { locale: it })})
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.chipWrap}>
                {(players ?? []).map((p) => (
                  <Pressable
                    key={p.id}
                    onPress={() => setMvpPlayerId(p.id)}
                    style={[styles.chip, { borderColor: palette.ink15, backgroundColor: mvpPlayerId === p.id ? palette.warn : 'transparent' }]}
                  >
                    <Text style={{ fontSize: 11, fontFamily: 'Manrope_600SemiBold', color: mvpPlayerId === p.id ? '#fff' : palette.tx2 }}>
                      {p.nome} {p.cognome}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {!!mvpError && <Text style={{ color: palette.danger, fontSize: 11.5 }}>{mvpError}</Text>}
              <Pressable onPress={submitMvp} style={[styles.mvpButton, { backgroundColor: palette.warn }]}>
                <Text style={styles.mvpButtonText}>Assegna MVP</Text>
              </Pressable>
            </View>
          )}

          <Text style={[styles.sectionLabel, { color: palette.ink50 }]}>Storico MVP</Text>
          <View style={{ gap: 8 }}>
            {(mvpAwards ?? []).map((a) => {
              const player = players?.find((p) => p.id === a.player_id);
              const match = matches?.find((m) => m.id === a.match_id);
              return (
                <View key={a.id} style={[styles.historyRow, { backgroundColor: palette.surface, borderColor: palette.ink08 }]}>
                  <Medal size={19} color={palette.warn} weight="duotone" />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontFamily: 'Manrope_700Bold', color: palette.tx }}>{player ? `${player.nome} ${player.cognome}` : '—'}</Text>
                    <Text style={{ fontSize: 11, color: palette.ink50 }}>{match ? match.opponent : '—'}</Text>
                  </View>
                </View>
              );
            })}
            {(mvpAwards ?? []).length === 0 && (
              <Text style={{ color: palette.ink50, fontSize: 12.5, fontFamily: 'Manrope_500Medium' }}>Nessun MVP assegnato finora.</Text>
            )}
          </View>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  presenceLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  barTrack: { height: 7, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  perfCard: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 12, padding: 12 },
  mvpForm: { borderWidth: 1, borderRadius: 14, padding: 16, gap: 10, marginBottom: 20 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  mvpButton: { borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  mvpButtonText: { color: '#fff', fontSize: 13, fontFamily: 'Manrope_700Bold' },
  sectionLabel: { fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'Manrope_700Bold', marginBottom: 10 },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 12, padding: 12 },
});
