import { Link } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTheme } from '../../lib/ThemeContext';
import { supabase } from '../../lib/supabase';

export default function LoginScreen() {
  const { palette } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setError('');
    if (!email || !password) {
      setError('Inserisci email e password.');
      return;
    }
    setSubmitting(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (signInError) {
      setError('Email o password non corretti.');
    }
    // Successful sign-in updates the session in AuthContext, which redirects via app/index.tsx.
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: palette.accent }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Image source={require('../../assets/logo-juniores.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Juniores Manager</Text>
        </View>

        <Text style={styles.heading}>Accedi</Text>
        <View style={styles.form}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="rgba(255,255,255,0.6)"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            style={styles.input}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="rgba(255,255,255,0.6)"
            secureTextEntry
            style={styles.input}
          />
          {!!error && <Text style={styles.error}>{error}</Text>}
          <Pressable
            onPress={submit}
            disabled={submitting}
            style={[styles.submitButton, { backgroundColor: palette.surface }]}
          >
            <Text style={[styles.submitButtonText, { color: palette.accent }]}>
              {submitting ? 'Accesso in corso…' : 'Accedi'}
            </Text>
          </Pressable>
        </View>

        <Link href="/(auth)/register" replace style={styles.linkButton}>
          Non hai un account? Registrati
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, padding: 24, paddingTop: 70, alignItems: 'stretch' },
  header: { alignItems: 'center', marginBottom: 28 },
  logo: { width: 48, height: 55, marginBottom: 14 },
  title: { color: '#fff', fontFamily: 'Manrope_800ExtraBold', fontSize: 19 },
  heading: { color: '#fff', fontFamily: 'Manrope_700Bold', fontSize: 15, marginBottom: 14 },
  form: { gap: 10 },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 13,
    fontFamily: 'Manrope_400Regular',
  },
  error: { color: '#ffb3a3', fontSize: 12, fontFamily: 'Manrope_500Medium' },
  submitButton: { borderRadius: 8, paddingVertical: 11, alignItems: 'center' },
  submitButtonText: { fontFamily: 'Manrope_700Bold', fontSize: 13.5 },
  linkButton: {
    color: '#fff',
    opacity: 0.85,
    fontSize: 12.5,
    marginTop: 18,
    textAlign: 'center',
    fontFamily: 'Manrope_500Medium',
  },
});
