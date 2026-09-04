import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { ScreenHeader } from '../../components/shared/ScreenHeader';
import { ROLE_DEFS } from '../../lib/permissions';
import { useAllProfiles, useApproveUser, useRevokeUser, useSetUserRole } from '../../lib/queries/users';
import { useTheme } from '../../lib/ThemeContext';
import type { Role } from '../../types/database';

const ASSIGNABLE_ROLES: Role[] = ['allenatore', 'preparatore', 'dirigente', 'tifoso'];

function RolePicker({ value, onChange }: { value: Role; onChange: (r: Role) => void }) {
  const { palette } = useTheme();
  return (
    <View style={styles.roleRow}>
      {ASSIGNABLE_ROLES.map((r) => {
        const active = r === value;
        return (
          <Pressable
            key={r}
            onPress={() => onChange(r)}
            style={[
              styles.roleChip,
              { borderColor: palette.ink15, backgroundColor: active ? palette.accent : 'transparent' },
            ]}
          >
            <Text style={[styles.roleChipText, { color: active ? '#fff' : palette.tx2 }]}>{ROLE_DEFS[r].label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function UsersScreen() {
  const { palette } = useTheme();
  const { data: profiles } = useAllProfiles();
  const approveUser = useApproveUser();
  const setUserRole = useSetUserRole();
  const revokeUser = useRevokeUser();
  const [pendingRoleChoice, setPendingRoleChoice] = useState<Record<string, Role>>({});

  const pending = profiles?.filter((p) => p.status === 'pending') ?? [];
  const approved = profiles?.filter((p) => p.status === 'approved') ?? [];

  return (
    <ScreenContainer>
      <ScreenHeader eyebrow="Utenti" title="Gestione accessi" />

      <Text style={[styles.sectionLabel, { color: palette.ink50 }]}>In attesa di approvazione</Text>
      {pending.length === 0 && (
        <Text style={[styles.empty, { color: palette.ink50 }]}>Nessuna richiesta in attesa.</Text>
      )}
      <View style={{ gap: 10, marginBottom: 28 }}>
        {pending.map((u) => {
          const choice = pendingRoleChoice[u.id] ?? 'allenatore';
          return (
            <View key={u.id} style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.ink08 }]}>
              <Text style={[styles.name, { color: palette.tx }]}>{u.nome} {u.cognome}</Text>
              <Text style={[styles.meta, { color: palette.ink50 }]}>{u.email}</Text>
              <RolePicker value={choice} onChange={(r) => setPendingRoleChoice((prev) => ({ ...prev, [u.id]: r }))} />
              <Pressable
                onPress={() => approveUser.mutate({ id: u.id, role: choice })}
                style={[styles.approveButton, { backgroundColor: palette.accent }]}
              >
                <Text style={styles.approveButtonText}>Approva</Text>
              </Pressable>
            </View>
          );
        })}
      </View>

      <Text style={[styles.sectionLabel, { color: palette.ink50 }]}>Utenti approvati</Text>
      <View style={{ gap: 10 }}>
        {approved.map((u) => (
          <View key={u.id} style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.ink08 }]}>
            <Text style={[styles.name, { color: palette.tx }]}>{u.nome} {u.cognome}</Text>
            <Text style={[styles.meta, { color: palette.ink50 }]}>{u.email}</Text>
            {u.role === 'admin' ? (
              <Text style={[styles.adminBadge, { color: palette.accent }]}>Admin</Text>
            ) : (
              <>
                <RolePicker value={u.role as Role} onChange={(r) => setUserRole.mutate({ id: u.id, role: r })} />
                <Pressable onPress={() => revokeUser.mutate(u.id)} style={styles.revokeButton}>
                  <Text style={[styles.revokeButtonText, { color: palette.danger }]}>Revoca accesso</Text>
                </Pressable>
              </>
            )}
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionLabel: { fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', fontFamily: 'Manrope_700Bold', marginBottom: 10 },
  empty: { fontSize: 12.5, fontFamily: 'Manrope_500Medium', marginBottom: 12 },
  card: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 8 },
  name: { fontSize: 13.5, fontFamily: 'Manrope_700Bold' },
  meta: { fontSize: 11.5, fontFamily: 'Manrope_500Medium' },
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  roleChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  roleChipText: { fontSize: 11, fontFamily: 'Manrope_700Bold' },
  approveButton: { borderRadius: 8, paddingVertical: 9, alignItems: 'center' },
  approveButtonText: { color: '#fff', fontSize: 12.5, fontFamily: 'Manrope_700Bold' },
  adminBadge: { fontSize: 11, fontFamily: 'Manrope_700Bold' },
  revokeButton: { alignSelf: 'flex-start' },
  revokeButtonText: { fontSize: 11.5, fontFamily: 'Manrope_600SemiBold' },
});
