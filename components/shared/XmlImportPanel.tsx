import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/ThemeContext';

interface Props {
  title: string;
  description: string;
  templateFilename: string;
  templateXml: string;
  onParse: (xmlText: string) => Promise<{ count: number } | { error: string }>;
}

export function XmlImportPanel({ title, description, templateFilename, templateXml, onParse }: Props) {
  const { palette } = useTheme();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  const downloadTemplate = async () => {
    try {
      const uri = FileSystem.cacheDirectory + templateFilename;
      await FileSystem.writeAsStringAsync(uri, templateXml, { encoding: FileSystem.EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'text/xml', dialogTitle: templateFilename });
      }
    } catch {
      setMessage({ text: 'Impossibile generare il modello.', isError: true });
    }
  };

  const pickFile = async () => {
    setMessage(null);
    const result = await DocumentPicker.getDocumentAsync({ type: ['text/xml', 'application/xml', '*/*'] });
    if (result.canceled || !result.assets?.[0]) return;
    setBusy(true);
    try {
      const xmlText = await FileSystem.readAsStringAsync(result.assets[0].uri, { encoding: FileSystem.EncodingType.UTF8 });
      const outcome = await onParse(xmlText);
      if ('error' in outcome) {
        setMessage({ text: outcome.error, isError: true });
      } else {
        setMessage({ text: `Importati ${outcome.count} elementi.`, isError: false });
      }
    } catch {
      setMessage({ text: 'File non valido.', isError: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ marginBottom: 8 }}>
      {open && (
        <View style={[styles.panel, { backgroundColor: palette.surface, borderColor: palette.ink08 }]}>
          <Text style={[styles.title, { color: palette.tx }]}>{title}</Text>
          <Text style={[styles.description, { color: palette.ink55 }]}>{description}</Text>
          <Pressable onPress={downloadTemplate} style={[styles.secondaryButton, { backgroundColor: palette.bg2 }]}>
            <Text style={[styles.secondaryButtonText, { color: palette.tx }]}>Scarica modello XML</Text>
          </Pressable>
          <Pressable
            onPress={pickFile}
            disabled={busy}
            style={[styles.dashedButton, { borderColor: palette.accent40 }]}
          >
            <Text style={[styles.dashedButtonText, { color: palette.accent }]}>
              {busy ? 'Importazione…' : 'Scegli file .xml'}
            </Text>
          </Pressable>
          {message && (
            <Text style={{ fontSize: 11.5, color: message.isError ? palette.danger : palette.accent }}>
              {message.text}
            </Text>
          )}
        </View>
      )}
      <Pressable
        onPress={() => setOpen((o) => !o)}
        style={[styles.dashedButton, { borderColor: palette.accent40, marginBottom: 0 }]}
      >
        <Text style={[styles.dashedButtonText, { color: palette.accent }]}>
          {open ? 'Chiudi importazione XML' : '+ Importa da file XML'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 14, gap: 10 },
  title: { fontSize: 13, fontFamily: 'Manrope_700Bold' },
  description: { fontSize: 11.5, lineHeight: 17, fontFamily: 'Manrope_400Regular' },
  secondaryButton: { borderRadius: 8, padding: 9, alignItems: 'center' },
  secondaryButtonText: { fontSize: 12.5, fontFamily: 'Manrope_700Bold' },
  dashedButton: { borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 12, padding: 12, alignItems: 'center' },
  dashedButtonText: { fontSize: 13, fontFamily: 'Manrope_700Bold' },
});
