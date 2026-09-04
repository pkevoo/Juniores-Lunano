import { Trash } from 'phosphor-react-native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { ScreenHeader } from '../../components/shared/ScreenHeader';
import { useAuth } from '../../lib/AuthContext';
import {
  useAddOpponentNote,
  useDeleteOpponentNote,
  useOpponentNotes,
  useUpdateOpponentNote,
} from '../../lib/queries/opponents';
import { useTheme } from '../../lib/ThemeContext';

function OpponentCard({ id, teamName, note, canEdit }: { id: number; teamName: string; note: string | null; canEdit: boolean }) {
  const { palette } = useTheme();
  const updateNote = useUpdateOpponentNote();
  const deleteNote = useDeleteOpponentNote();
  const { profile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note ?? '');

  const save = () => {
    updateNote.mutate({ id, note: draft, updated_by: profile?.id ?? null });
    setEditing(false);
  };

  return (
    <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.ink08 }]}>
      <View style={styles.rowBetween}>
        <Text style={[styles.teamName, { color: palette.tx }]}>{teamName}</Text>
        {canEdit && (
          <Pressable onPress={() => deleteNote.mutate(id)} hitSlop={8}>
            <Trash size={16} color={palette.danger70} />
          </Pressable>
        )}
      </View>
      {editing ? (
        <View style={{ gap: 8 }}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            multiline
            style={[styles.textarea, { borderColor: palette.ink15, color: palette.tx }]}
          />
          <Pressable onPress={save} style={[styles.saveButton, { backgroundColor: palette.accent }]}>
            <Text style={styles.saveButtonText}>Salva</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={() => canEdit && setEditing(true)}>
          <Text style={[styles.noteText, { color: palette.ink65 }]}>{note || (canEdit ? 'Tocca per aggiungere note…' : 'Nessuna nota.')}</Text>
        </Pressable>
      )}
    </View>
  );
}

export default function OpponentsScreen() {
  const { palette } = useTheme();
  const { profile } = useAuth();
  const { data: opponents } = useOpponentNotes();
  const addOpponent = useAddOpponentNote();

  const [formOpen, setFormOpen] = useState(false);
  const [teamName, setTeamName] = useState('');

  const submitAdd = () => {
    if (!teamName.trim()) return;
    addOpponent.mutate(
      { team_name: teamName.trim(), updated_by: profile?.id ?? null },
      { onSuccess: () => { setTeamName(''); setFormOpen(false); } }
    );
  };

  return (
    <ScreenContainer>
      <ScreenHeader eyebrow="Appunti squadre avversarie" title="Scouting avversarie" />

      <View style={{ gap: 10, marginBottom: 16 }}>
        {(opponents ?? []).map((o) => (
          <OpponentCard key={o.id} id={o.id} teamName={o.team_name} note={o.note} canEdit />
        ))}
        {(opponents ?? []).length === 0 && (
          <Text style={{ color: palette.ink50, fontSize: 12.5, fontFamily: 'Manrope_500Medium' }}>Nessuna squadra avversaria censita.</Text>
        )}
      </View>

      {formOpen && (
        <View style={[styles.formCard, { backgroundColor: palette.surface, borderColor: palette.ink08 }]}>
          <TextInput
            value={teamName}
            onChangeText={setTeamName}
            placeholder="Nome squadra"
            placeholderTextColor={palette.ink40}
            style={[styles.input, { borderColor: palette.ink15, color: palette.tx }]}
          />
          <Pressable onPress={submitAdd} style={[styles.submitButton, { backgroundColor: palette.accent }]}>
            <Text style={styles.submitButtonText}>Aggiungi squadra</Text>
          </Pressable>
        </View>
      )}
      <Pressable onPress={() => setFormOpen((o) => !o)} style={[styles.dashedButton, { borderColor: palette.accent40 }]}>
        <Text style={[styles.dashedButtonText, { color: palette.accent }]}>{formOpen ? 'Annulla' : '+ Aggiungi squadra'}</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, padding: 14 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  teamName: { fontSize: 14, fontFamily: 'Manrope_700Bold' },
  noteText: { fontSize: 12.5, lineHeight: 19, fontFamily: 'Manrope_400Regular' },
  textarea: { borderWidth: 1, borderRadius: 8, padding: 10, minHeight: 70, textAlignVertical: 'top', fontSize: 12.5, fontFamily: 'Manrope_400Regular' },
  saveButton: { borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontSize: 12, fontFamily: 'Manrope_700Bold' },
  formCard: { borderWidth: 1, borderRadius: 14, padding: 16, gap: 10, marginBottom: 14 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 11, paddingVertical: 9, fontSize: 13, fontFamily: 'Manrope_400Regular' },
  submitButton: { borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  submitButtonText: { color: '#fff', fontSize: 13, fontFamily: 'Manrope_700Bold' },
  dashedButton: { borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 12, padding: 12, alignItems: 'center' },
  dashedButtonText: { fontSize: 13, fontFamily: 'Manrope_700Bold' },
});
