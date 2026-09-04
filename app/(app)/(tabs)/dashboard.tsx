import { router } from 'expo-router';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import {
  Barbell,
  CalendarBlank,
  FileArrowDown,
  NotePencil,
  Notebook,
  UsersThree,
} from 'phosphor-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { KpiCard } from '../../../components/shared/KpiCard';
import { ScreenContainer } from '../../../components/shared/ScreenContainer';
import { StopwatchWidget } from '../../../components/shared/StopwatchWidget';
import { useAuth } from '../../../lib/AuthContext';
import { useAllAttendance, presencePct } from '../../../lib/queries/attendance';
import { useMatches, useNextMatch } from '../../../lib/queries/matches';
import { usePlayers } from '../../../lib/queries/players';
import { useNextTraining, useTrainings } from '../../../lib/queries/trainings';
import { SectionId, roleDef } from '../../../lib/permissions';
import { useTheme } from '../../../lib/ThemeContext';

const SHORTCUTS: { id: SectionId; label: string; icon: React.ComponentType<{ size: number; color: string; weight?: 'duotone' }>; route: string }[] = [
  { id: 'players', label: 'Giocatori', icon: UsersThree, route: '/(app)/(tabs)/players' },
  { id: 'calendar', label: 'Calendario', icon: CalendarBlank, route: '/(app)/(tabs)/calendar' },
  { id: 'trainings', label: 'Allenamenti', icon: Barbell, route: '/(app)/trainings' },
  { id: 'opponents', label: 'Avversarie', icon: Notebook, route: '/(app)/opponents' },
  { id: 'reports', label: 'Report', icon: FileArrowDown, route: '/(app)/reports' },
  { id: 'notes', label: 'Note', icon: NotePencil, route: '/(app)/notes' },
];

export default function DashboardScreen() {
  const { palette } = useTheme();
  const { profile } = useAuth();
  const { data: players } = usePlayers();
  const { data: matches } = useMatches();
  const { data: trainings } = useTrainings();
  const { data: attendance } = useAllAttendance();
  const { nextMatch } = useNextMatch();
  const { nextTraining } = useNextTraining();
  const def = roleDef(profile?.role);
  const shortcuts = SHORTCUTS.filter((s) => def?.sections.includes(s.id));

  const totalPlayers = players?.length ?? 0;
  const avgPresence = totalPlayers > 0 ? presencePct(attendance ?? []) : null;

  const playedMatches = (matches ?? []).filter((m) => m.played);
  const trainingsHeld = (trainings ?? []).filter((t) => new Date(t.training_date) <= new Date()).length;
  const goalsConceded = playedMatches.reduce((sum, m) => sum + (m.score_against ?? 0), 0);
  const cleanSheets = playedMatches.filter((m) => m.score_against === 0).length;
  const topScorers = [...(players ?? [])].sort((a, b) => b.goals - a.goals).slice(0, 5);
  const upcomingMatches = (matches ?? []).filter((m) => !m.played).slice(0, 3);

  return (
    <ScreenContainer>
      <Text style={[styles.eyebrow, { color: palette.accent }]}>Dashboard</Text>
      <Text style={[styles.greeting, { color: palette.tx }]}>Ciao {profile?.nome ?? ''} 👋</Text>

      <View style={styles.kpiRow}>
        <KpiCard value={totalPlayers} label="Giocatori in rosa" />
        <KpiCard value={avgPresence != null ? `${avgPresence}%` : '—'} label="Presenza media" color={palette.accent} />
      </View>

      <View style={[styles.accentCard, { backgroundColor: palette.accent }]}>
        <Text style={styles.accentEyebrow}>Prossima partita</Text>
        {nextMatch ? (
          <>
            <Text style={styles.accentTitle}>
              Juniores Ponente <Text style={{ opacity: 0.7, fontFamily: 'Manrope_500Medium' }}>vs</Text> {nextMatch.opponent}
            </Text>
            <Text style={styles.accentSubtitle}>
              {format(new Date(nextMatch.match_date), 'd MMM', { locale: it })}
              {nextMatch.match_time ? ` · ${nextMatch.match_time.slice(0, 5)}` : ''} ·{' '}
              {nextMatch.is_home ? 'Casa' : 'Trasferta'}
            </Text>
          </>
        ) : (
          <Text style={styles.accentSubtitle}>Nessuna partita in programma.</Text>
        )}
      </View>

      <View style={[styles.warnCard, { backgroundColor: palette.surface, borderColor: palette.ink08 }]}>
        <Text style={[styles.warnEyebrow, { color: palette.warn }]}>Prossimo allenamento</Text>
        {nextTraining ? (
          <>
            <Text style={[styles.warnTitle, { color: palette.tx }]}>{nextTraining.focus ?? 'Allenamento'}</Text>
            <Text style={[styles.warnSubtitle, { color: palette.ink55 }]}>
              {format(new Date(nextTraining.training_date), 'd MMM', { locale: it })} ·{' '}
              {nextTraining.training_time.slice(0, 5)} · {nextTraining.place}
            </Text>
          </>
        ) : (
          <Text style={[styles.warnSubtitle, { color: palette.ink55 }]}>Nessun allenamento in programma.</Text>
        )}
      </View>

      {shortcuts.length > 0 && (
        <>
          <Text style={[styles.sectionLabel, { color: palette.ink50 }]}>Accesso rapido</Text>
          <View style={styles.shortcutGrid}>
            {shortcuts.map((s) => {
              const Icon = s.icon;
              return (
                <Pressable
                  key={s.id}
                  onPress={() => router.navigate(s.route as never)}
                  style={[styles.shortcut, { backgroundColor: palette.surface, borderColor: palette.ink08 }]}
                >
                  <Icon size={22} color={palette.accent} weight="duotone" />
                  <Text style={[styles.shortcutLabel, { color: palette.tx }]}>{s.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      <Text style={[styles.sectionLabel, { color: palette.ink50 }]}>Numeri stagione</Text>
      <View style={styles.seasonGrid}>
        <View style={[styles.seasonCard, { backgroundColor: palette.surface, borderColor: palette.ink08 }]}>
          <Text style={[styles.seasonValue, { color: palette.tx }]}>{trainingsHeld}</Text>
          <Text style={[styles.seasonLabel, { color: palette.ink55 }]}>Allenamenti svolti</Text>
        </View>
        <View style={[styles.seasonCard, { backgroundColor: palette.surface, borderColor: palette.ink08 }]}>
          <Text style={[styles.seasonValue, { color: palette.tx }]}>{playedMatches.length}</Text>
          <Text style={[styles.seasonLabel, { color: palette.ink55 }]}>Partite disputate</Text>
        </View>
        <View style={[styles.seasonCard, { backgroundColor: palette.surface, borderColor: palette.ink08 }]}>
          <Text style={[styles.seasonValue, { color: palette.danger }]}>{goalsConceded}</Text>
          <Text style={[styles.seasonLabel, { color: palette.ink55 }]}>Gol subiti</Text>
        </View>
        <View style={[styles.seasonCard, { backgroundColor: palette.surface, borderColor: palette.ink08 }]}>
          <Text style={[styles.seasonValue, { color: palette.accent }]}>{cleanSheets}</Text>
          <Text style={[styles.seasonLabel, { color: palette.ink55 }]}>Clean sheet</Text>
        </View>
      </View>

      <StopwatchWidget />

      {topScorers.length > 0 && (
        <>
          <Text style={[styles.sectionLabel, { color: palette.ink50 }]}>Classifica marcatori · Top 5</Text>
          <View style={{ marginBottom: 28 }}>
            {topScorers.map((p, i) => (
              <View key={p.id} style={styles.scorerRow}>
                <Text style={[styles.scorerRank, { color: palette.ink40 }]}>{i + 1}</Text>
                <Text style={[styles.scorerName, { color: palette.tx }]}>{p.nome} {p.cognome}</Text>
                <Text style={[styles.scorerGoals, { color: palette.accent }]}>{p.goals}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {upcomingMatches.length > 0 && (
        <>
          <Text style={[styles.sectionLabel, { color: palette.ink50 }]}>Prossime partite</Text>
          <View style={{ gap: 8, marginBottom: 8 }}>
            {upcomingMatches.map((m) => (
              <View key={m.id} style={[styles.matchRow, { backgroundColor: palette.surface, borderColor: palette.ink08 }]}>
                <View style={[styles.venuePill, { backgroundColor: palette.accentSoft }]}>
                  <Text style={{ fontSize: 9.5, fontFamily: 'Manrope_700Bold', color: palette.accent }}>{m.is_home ? 'Casa' : 'Trasferta'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontFamily: 'Manrope_700Bold', color: palette.tx }}>{m.opponent}</Text>
                  <Text style={{ fontSize: 11, color: palette.ink50 }}>{format(new Date(m.match_date), 'd MMM', { locale: it })}</Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  eyebrow: { fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', fontFamily: 'Manrope_700Bold', marginBottom: 6 },
  greeting: { fontSize: 23, fontFamily: 'Manrope_800ExtraBold', marginBottom: 24 },
  kpiRow: { flexDirection: 'row', gap: 14, marginBottom: 26 },
  accentCard: { borderRadius: 16, padding: 16, marginBottom: 14 },
  accentEyebrow: { fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: '#fff', opacity: 0.8, fontFamily: 'Manrope_700Bold', marginBottom: 6 },
  accentTitle: { color: '#fff', fontSize: 16, fontFamily: 'Manrope_800ExtraBold', marginBottom: 4 },
  accentSubtitle: { color: '#fff', opacity: 0.85, fontSize: 12, fontFamily: 'Manrope_500Medium' },
  warnCard: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 28 },
  warnEyebrow: { fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', fontFamily: 'Manrope_700Bold', marginBottom: 6 },
  warnTitle: { fontSize: 15, fontFamily: 'Manrope_700Bold', marginBottom: 4 },
  warnSubtitle: { fontSize: 12, fontFamily: 'Manrope_500Medium' },
  sectionLabel: { fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', fontFamily: 'Manrope_700Bold', marginBottom: 12 },
  shortcutGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  shortcut: { width: '31%', borderWidth: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center', gap: 6 },
  shortcutLabel: { fontSize: 10.5, fontFamily: 'Manrope_600SemiBold', textAlign: 'center' },
  seasonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  seasonCard: { width: '47%', borderWidth: 1, borderRadius: 12, padding: 12 },
  seasonValue: { fontSize: 20, fontFamily: 'Manrope_800ExtraBold' },
  seasonLabel: { fontSize: 10.5, marginTop: 3, fontFamily: 'Manrope_500Medium' },
  scorerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9 },
  scorerRank: { fontSize: 16, fontFamily: 'Manrope_800ExtraBold', width: 20 },
  scorerName: { flex: 1, fontSize: 13, fontFamily: 'Manrope_700Bold' },
  scorerGoals: { fontSize: 15, fontFamily: 'Manrope_800ExtraBold' },
  matchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 12, padding: 12 },
  venuePill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
});
