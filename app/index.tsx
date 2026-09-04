import { Redirect } from 'expo-router';
import React from 'react';
import { LoadingScreen } from '../components/shared/LoadingScreen';
import { useAuth } from '../lib/AuthContext';

export default function Index() {
  const { session, profile, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!session) return <Redirect href="/(auth)/login" />;

  if (!profile || profile.status === 'pending') {
    return <Redirect href="/(auth)/pending" />;
  }

  return <Redirect href="/(app)/(tabs)/dashboard" />;
}
