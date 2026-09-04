import { Link, Redirect } from 'expo-router';
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

export default function RegisterScreen() {
  const { palette } = useTheme();
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false);

  const submit = async () => {
    setError('');
    if (!nome || !cognome || !username || !email || !password) {
      setError('Compila tutti i campi obbligatori.');
      return;
    }
    if (password.length < 6) {
      setError('La password deve avere almeno 6 caratteri.');
      return;
    }
    setSubmitting(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nome, cognome, username, telefono } },
    });
    setSubmitting(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    if (data.session) {
      // Email confirmation disabled on this Supabase project: signUp already
      // created a session, so AuthContext will pick it up and we can go
      // straight to the pending-approval screen.
      setDone(true);
    } else {
      // Email confirmation is required before a session exists — the user
      // needs to confirm first, then log in, before they can see "pending".
      setNeedsEmailConfirm(true);
    }
  };

  if (done) {
    return <Redirect href="/(auth)/pending" />;
  }

  if (needsEmailConfirm) {
    return (
      <View style={[styles.confirmWrap, { backgroundColor: palette.accent }]}>
        <Image source={require('../../assets/logo-juniores.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Juniores Manager</Text>
        <Text style={styles.confirmText}>
          Controlla la tua email per confermare l'account, poi torna qui per accedere.
        </Text>
        <Link href="/(auth)/login" replace style={styles.linkButton}>
          Torna al login
        </Link>
      </View>
    );
  }

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

        <Text style={styles.heading}>Richiedi accesso</Text>
        <View style={styles.form}>
          <TextInput value={nome} onChangeText={setNome} placeholder="Nome" placeholderTextColor="rgba(255,255,255,0.6)" style={styles.input} />
          <TextInput value={cognome} onChangeText={setCognome} placeholder="Cognome" placeholderTextColor="rgba(255,255,255,0.6)" style={styles.input} />
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            placeholderTextColor="rgba(255,255,255,0.6)"
            autoCapitalize="none"
            style={styles.input}
          />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="rgba(255,255,255,0.6)"
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
          <TextInput
            value={telefono}
            onChangeText={setTelefono}
            placeholder="Numero di telefono"
            placeholderTextColor="rgba(255,255,255,0.6)"
            keyboardType="phone-pad"
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
              {submitting ? 'Invio in corso…' : 'Invia richiesta'}
            </Text>
          </Pressable>
        </View>

        <Link href="/(auth)/login" replace style={styles.linkButton}>
          Hai già un account? Accedi
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  confirmWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 14 },
  confirmText: {
    color: '#fff',
    opacity: 0.9,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Manrope_500Medium',
  },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 60, alignItems: 'stretch' },
  header: { alignItems: 'center', marginBottom: 24 },
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
