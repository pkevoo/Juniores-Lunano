import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/ThemeContext';

interface Props {
  visible: boolean;
  targetName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function TwoStageDeleteModal({ visible, targetName, onCancel, onConfirm }: Props) {
  const { palette } = useTheme();
  const [stage, setStage] = useState<1 | 2>(1);

  const handleCancel = () => {
    setStage(1);
    onCancel();
  };

  const handleConfirm = () => {
    setStage(1);
    onConfirm();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          {stage === 1 ? (
            <>
              <Text style={[styles.title, { color: palette.danger }]}>Pericolo</Text>
              <Text style={[styles.body, { color: palette.tx }]}>
                Sei sicuro di voler eliminare il profilo giocatore di <Text style={{ fontFamily: 'Manrope_800ExtraBold' }}>{targetName}</Text>? Tutti i dati andranno persi.
              </Text>
              <View style={styles.row}>
                <Pressable onPress={handleCancel} style={[styles.button, { backgroundColor: palette.bg2 }]}>
                  <Text style={[styles.buttonText, { color: palette.tx }]}>No</Text>
                </Pressable>
                <Pressable onPress={() => setStage(2)} style={[styles.button, { backgroundColor: palette.danger }]}>
                  <Text style={[styles.buttonText, { color: '#fff' }]}>Sì</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <Text style={[styles.title, { color: palette.danger }]}>Ultima conferma</Text>
              <Text style={[styles.body, { color: palette.tx }]}>
                Confermi definitivamente l'eliminazione di <Text style={{ fontFamily: 'Manrope_800ExtraBold' }}>{targetName}</Text>? L'azione non si può annullare.
              </Text>
              <View style={styles.row}>
                <Pressable onPress={handleCancel} style={[styles.button, { backgroundColor: palette.bg2 }]}>
                  <Text style={[styles.buttonText, { color: palette.tx }]}>Annulla</Text>
                </Pressable>
                <Pressable onPress={handleConfirm} style={[styles.button, { backgroundColor: palette.danger }]}>
                  <Text style={[styles.buttonText, { color: '#fff' }]}>Elimina definitivamente</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', borderRadius: 16, padding: 20, gap: 14 },
  title: { fontSize: 15, fontFamily: 'Manrope_800ExtraBold' },
  body: { fontSize: 13, lineHeight: 19, fontFamily: 'Manrope_500Medium' },
  row: { flexDirection: 'row', gap: 10 },
  button: { flex: 1, borderRadius: 8, paddingVertical: 11, alignItems: 'center' },
  buttonText: { fontSize: 12.5, fontFamily: 'Manrope_700Bold' },
});
