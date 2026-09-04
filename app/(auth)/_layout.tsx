import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { LoadingScreen } from '../../components/shared/LoadingScreen';
import { useAuth } from '../../lib/AuthContext';

export default function AuthLayout() {
  const { session, profile, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (session && profile?.status === 'approved') {
    return <Redirect href="/(app)/(tabs)/dashboard" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
