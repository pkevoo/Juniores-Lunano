import { Drawer } from 'expo-router/drawer';
import { Redirect } from 'expo-router';
import React from 'react';
import { AppDrawerContent } from '../../components/chrome/AppDrawerContent';
import { AppHeader } from '../../components/chrome/AppHeader';
import { LoadingScreen } from '../../components/shared/LoadingScreen';
import { useAuth } from '../../lib/AuthContext';

export default function AppLayout() {
  const { session, profile, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!session) return <Redirect href="/(auth)/login" />;
  if (!profile || profile.status === 'pending') return <Redirect href="/(auth)/pending" />;

  return (
    <Drawer
      screenOptions={{ header: () => <AppHeader />, drawerStyle: { width: '76%' } }}
      drawerContent={(props) => <AppDrawerContent {...props} />}
    >
      <Drawer.Screen name="(tabs)" options={{ title: 'Home' }} />
      <Drawer.Screen name="opponents" options={{ title: 'Appunti squadre avversarie' }} />
      <Drawer.Screen name="reports" options={{ title: 'Report' }} />
      <Drawer.Screen name="trainings" options={{ title: 'Allenamenti' }} />
      <Drawer.Screen name="attendance" options={{ title: 'Presenze & assenze' }} />
      <Drawer.Screen name="notes" options={{ title: 'Note' }} />
      <Drawer.Screen name="tacticalboard" options={{ title: 'Lavagna tattica' }} />
      <Drawer.Screen name="trainingarchive" options={{ title: 'Archivio allenamenti' }} />
      <Drawer.Screen name="users" options={{ title: 'Utenti' }} />
    </Drawer>
  );
}
