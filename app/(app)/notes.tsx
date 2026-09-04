import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenContainer } from '../../components/shared/ScreenContainer';
import { ScreenHeader } from '../../components/shared/ScreenHeader';
import { useAuth } from '../../lib/AuthContext';
import { useAddNote, useNotes } from '../../lib/queries/notes';
import { useTheme } from '../../lib/ThemeContext';

export default function NotesScreen() {
  const { palette } = useTheme();
  const { profile } = useAuth();
  const { data: notes } = useNotes();
  const addNote = useAddNote();

  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const submitAdd = () => {
    if (!title.trim() || !body.trim()) return;
    addNote.mutate(
      { title: title.trim(), body: body.trim(), author_id: profile?.id ?? null },
      { onSuccess: () => { setTitle(''); setBody(''); setFormOpen(false); } }
    );
  };

  return (
    <ScreenContainer>
      <ScreenHeader eyebrow="Note" title="Appunti" />

      <View style={{ gap: 10, marginBottom: 16 }}>
        {(notes ?? []).map((n) => (
          <View key={n.id} style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.ink08 }]}>
            <View style={styles.rowBetween}>
              <Text style={[styles.title, { color: palette.tx }]}>{n.title}</Text>
              <Text style={[styles.date, { color: palette.ink50 }]}>{format(new Date(n.created_at), 'd MMM', { locale: it })}</Text>
            </View>
            <Text style={[styles.body, { color: palette.ink65 }]}>{n.body}</Text>
          </View>
        ))}
        {(notes ?? []).length === 0 && (
          <Text style={{ color: palette.ink50, fontSize: 12.5, fontFamily: 'Manrope_500Medium' }}>Nessun appunto salvato.</Text>
        )}
      </View>

      {formOpen && (
        <View style={[styles.formCard, { backgroundColor: palette.surface, borderColor: palette.ink08 }]}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Titolo"
            placeholderTextColor={palette.ink40}
            style={[styles.input, { borderColor: palette.ink15, color: palette.tx }]}
          />
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Testo dell'appunto"
            placeholderTextColor={palette.ink40}
            multiline
            style={[styles.input, styles.textarea, { borderColor: palette.ink15, color: palette.tx }]}
          />
          <Pressable onPress={submitAdd} style={[styles.submitButton, { backgroundColor: palette.accent }]}>
            <Text style={styles.submitButtonText}>Salva appunto</Text>
          </Pressable>
        </View>
      )}
      <Pressable onPress={() => setFormOpen((o) => !o)} style={[styles.dashedButton, { borderColor: palette.accent40 }]}>
        <Text style={[styles.dashedButtonText, { color: palette.accent }]}>{formOpen ? 'Annulla' : '+ Nuovo appunto'}</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, padding: 14 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  title: { fontSize: 14, fontFamily: 'Manrope_700Bold' },
  date: { fontSize: 11, fontFamily: 'Manrope_500Medium' },
  body: { fontSize: 12.5, lineHeight: 19, fontFamily: 'Manrope_400Regular' },
  formCard: { borderWidth: 1, borderRadius: 14, padding: 16, gap: 10, marginBottom: 14 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 11, paddingVertical: 9, fontSize: 13, fontFamily: 'Manrope_400Regular' },
  textarea: { minHeight: 90, textAlignVertical: 'top' },
  submitButton: { borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  submitButtonText: { color: '#fff', fontSize: 13, fontFamily: 'Manrope_700Bold' },
  dashedButton: { borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 12, padding: 12, alignItems: 'center' },
  dashedButtonText: { fontSize: 13, fontFamily: 'Manrope_700Bold' },
});
