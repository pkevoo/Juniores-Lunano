import { router } from 'expo-router';
import { HourglassMedium } from 'phosphor-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../lib/AuthContext';
import { useTheme } from '../../lib/ThemeContext';

export default function PendingScreen() {
  const { palette } = useTheme();
  const { signOut } = useAuth();

  const backToLogin = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <View style={[styles.wrap, { backgroundColor: palette.accent }]}>
      <HourglassMedium size={36} color="#fff" weight="duotone" />
      <Text style={styles.title}>Richiesta in attesa di approvazione</Text>
      <Text style={styles.body}>
        Il tuo account è stato creato. L'amministratore ti assegnerà un ruolo e potrai accedere.
      </Text>
      <Pressable onPress={backToLogin} style={styles.button}>
        <Text style={styles.buttonText}>Torna al login</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 14 },
  title: { color: '#fff', fontFamily: 'Manrope_700Bold', fontSize: 15, textAlign: 'center' },
  body: {
    color: '#fff',
    opacity: 0.85,
    fontSize: 12.5,
    lineHeight: 19,
    textAlign: 'center',
    maxWidth: 260,
    fontFamily: 'Manrope_400Regular',
  },
  button: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginTop: 4,
  },
  buttonText: { color: '#fff', fontFamily: 'Manrope_700Bold', fontSize: 13 },
});
