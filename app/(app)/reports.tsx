import { format } from 'date-fns';
import { FileXls } from 'phosphor-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { ScreenHeader } from '../../components/shared/ScreenHeader';
import { ageFromBirthdate } from '../../lib/dateUtils';
import { shareCsv, toCsv } from '../../lib/csv';
import { useAllAttendance } from '../../lib/queries/attendance';
import { useMatches } from '../../lib/queries/matches';
import { usePlayers } from '../../lib/queries/players';
import { useTrainings } from '../../lib/queries/trainings';
import { useTheme } from '../../lib/ThemeContext';

export default function ReportsScreen() {
  const { palette } = useTheme();
  const { data: players } = usePlayers();
  const { data: matches } = useMatches();
  const { data: trainings } = useTrainings();
  const { data: attendance } = useAllAttendance();

  const exportTeamStats = async () => {
    const played = (matches ?? []).filter((m) => m.played);
    const wins = played.filter((m) => (m.score_for ?? 0) > (m.score_against ?? 0)).length;
    const draws = played.filter((m) => (m.score_for ?? 0) === (m.score_against ?? 0)).length;
    const losses = played.filter((m) => (m.score_for ?? 0) < (m.score_against ?? 0)).length;
    const goalsFor = played.reduce((s, m) => s + (m.score_for ?? 0), 0);
    const goalsAgainst = played.reduce((s, m) => s + (m.score_against ?? 0), 0);
    const csv = toCsv(
      ['Metrica', 'Valore'],
      [
        ['Giocatori in rosa', players?.length ?? 0],
        ['Vittorie', wins],
        ['Pareggi', draws],
        ['Sconfitte', losses],
        ['Gol fatti', goalsFor],
        ['Gol subiti', goalsAgainst],
      ]
    );
    await shareCsv('statistiche_squadra.csv', csv);
  };

  const exportPlayerStats = async () => {
    const rows = (players ?? []).map((p) => {
      const records = (attendance ?? []).filter((a) => a.player_id === p.id);
      const present = records.filter((r) => r.status === 'present').length;
      const presenze = records.length > 0 ? `${present}/${records.length}` : '—';
      const age = ageFromBirthdate(p.birthdate);
      return [`${p.nome} ${p.cognome}`, p.pos, age != null ? age : '—', presenze, p.goals, p.assists, p.minutes];
    });
    const csv = toCsv(['Nome', 'Ruolo', 'Età', 'Presenze', 'Gol', 'Assist', 'Minuti'], rows);
    await shareCsv('statistiche_giocatori.csv', csv);
  };

  const exportTrainingReport = async () => {
    const rows = (trainings ?? []).map((t) => {
      const records = (attendance ?? []).filter((a) => a.training_id === t.id);
      const present = records.filter((r) => r.status === 'present').length;
      const presenze = records.length > 0 ? `${present}/${records.length}` : '—';
      return [format(new Date(t.training_date), 'dd/MM/yyyy'), t.training_time.slice(0, 5), t.focus ?? '', presenze];
    });
    const csv = toCsv(['Data', 'Ora', 'Focus', 'Presenze'], rows);
    await shareCsv('report_allenamenti.csv', csv);
  };

  const exportSeasonReport = async () => {
    const rows = (matches ?? []).map((m) => [
      format(new Date(m.match_date), 'dd/MM/yyyy'),
      m.opponent,
      m.is_home ? 'Casa' : 'Trasferta',
      m.played ? `${m.score_for ?? 0}-${m.score_against ?? 0}` : 'Da giocare',
    ]);
    const csv = toCsv(['Data', 'Avversario', 'Casa/Trasferta', 'Risultato'], rows);
    await shareCsv('report_stagione.csv', csv);
  };

  const reports = [
    { title: 'Statistiche aggregate squadra', subtitle: 'Vittorie, pareggi, sconfitte, gol', onPress: exportTeamStats },
    { title: 'Statistiche giocatore singolo', subtitle: 'Presenze, gol, assist, minuti per giocatore', onPress: exportPlayerStats },
    { title: 'Report allenamenti', subtitle: 'Data, focus e presenze per allenamento', onPress: exportTrainingReport },
    { title: 'Report stagione conclusa', subtitle: 'Calendario e risultati di tutte le partite', onPress: exportSeasonReport },
  ];

  return (
    <ScreenContainer>
      <ScreenHeader eyebrow="Report" title="Esporta dati" />
      <View style={{ gap: 10 }}>
        {reports.map((r) => (
          <View key={r.title} style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.ink08 }]}>
            <FileXls size={24} color={palette.accent} weight="duotone" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: palette.tx }]}>{r.title}</Text>
              <Text style={[styles.subtitle, { color: palette.ink50 }]}>{r.subtitle}</Text>
            </View>
            <Pressable onPress={r.onPress} style={[styles.button, { backgroundColor: palette.accent }]}>
              <Text style={styles.buttonText}>Scarica CSV</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 12, padding: 14 },
  title: { fontSize: 13.5, fontFamily: 'Manrope_700Bold' },
  subtitle: { fontSize: 11, marginTop: 2, fontFamily: 'Manrope_500Medium' },
  button: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  buttonText: { color: '#fff', fontSize: 11.5, fontFamily: 'Manrope_700Bold' },
});
