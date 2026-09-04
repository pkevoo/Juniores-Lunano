import { router } from 'expo-router';
import {
  Archive,
  Barbell,
  CaretRight,
  ChalkboardSimple,
  NotePencil,
  Notebook,
  UserCheck,
  Users,
} from 'phosphor-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../../components/shared/ScreenContainer';
import { useAuth } from '../../../lib/AuthContext';
import { SectionId, altroSections } from '../../../lib/permissions';
import { useTheme } from '../../../lib/ThemeContext';

const ITEMS: { id: SectionId; label: string; icon: React.ComponentType<{ size: number; color: string; weight?: 'duotone' }>; route: string }[] = [
  { id: 'opponents', label: 'Appunti squadre avversarie', icon: Notebook, route: '/(app)/opponents' },
  { id: 'reports', label: 'Report', icon: Archive, route: '/(app)/reports' },
  { id: 'trainings', label: 'Allenamenti', icon: Barbell, route: '/(app)/trainings' },
  { id: 'attendance', label: 'Presenze & assenze', icon: UserCheck, route: '/(app)/attendance' },
  { id: 'notes', label: 'Note', icon: NotePencil, route: '/(app)/notes' },
  { id: 'tacticalboard', label: 'Lavagna tattica', icon: ChalkboardSimple, route: '/(app)/tacticalboard' },
  { id: 'trainingarchive', label: 'Archivio allenamenti', icon: Archive, route: '/(app)/trainingarchive' },
  { id: 'users', label: 'Utenti', icon: Users, route: '/(app)/users' },
];

export default function MoreScreen() {
  const { palette } = useTheme();
  const { profile } = useAuth();
  const sections = altroSections(profile?.role);
  const items = ITEMS.filter((i) => sections.includes(i.id));

  return (
    <ScreenContainer>
      <Text style={[styles.eyebrow, { color: palette.accent }]}>Altro</Text>
      <Text style={[styles.title, { color: palette.tx }]}>Tutte le funzioni</Text>
      <View style={{ gap: 8 }}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Pressable
              key={item.id}
              onPress={() => router.navigate(item.route as never)}
              style={[styles.row, { backgroundColor: palette.surface, borderColor: palette.ink08 }]}
            >
              <Icon size={19} color={palette.accent} weight="duotone" />
              <Text style={[styles.rowLabel, { color: palette.tx }]}>{item.label}</Text>
              <CaretRight size={15} color={palette.ink35} />
            </Pressable>
          );
        })}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  eyebrow: { fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', fontFamily: 'Manrope_700Bold', marginBottom: 6 },
  title: { fontSize: 22, fontFamily: 'Manrope_800ExtraBold', marginBottom: 18 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 12, padding: 14 },
  rowLabel: { flex: 1, fontSize: 13.5, fontFamily: 'Manrope_600SemiBold' },
});
