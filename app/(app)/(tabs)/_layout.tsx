import { Tabs } from 'expo-router';
import { CalendarBlank, ChartBar, House, SquaresFour, UsersThree } from 'phosphor-react-native';
import React from 'react';
import { useAuth } from '../../../lib/AuthContext';
import { tabsForRole } from '../../../lib/permissions';
import { useTheme } from '../../../lib/ThemeContext';

export default function TabsLayout() {
  const { palette } = useTheme();
  const { profile } = useAuth();
  const tabs = tabsForRole(profile?.role);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.accent,
        tabBarInactiveTintColor: palette.ink45,
        tabBarStyle: { backgroundColor: palette.bg, borderTopColor: palette.ink08 },
        tabBarLabelStyle: { fontFamily: 'Manrope_600SemiBold', fontSize: 10.5 },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          href: tabs.includes('dashboard') ? undefined : null,
          tabBarIcon: ({ color, size }) => <House color={color as string} size={size} weight="duotone" />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Statistiche',
          href: tabs.includes('stats') ? undefined : null,
          tabBarIcon: ({ color, size }) => <ChartBar color={color as string} size={size} weight="duotone" />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Altro',
          href: tabs.includes('more') ? undefined : null,
          tabBarIcon: ({ color, size }) => <SquaresFour color={color as string} size={size} weight="duotone" />,
        }}
      />
      <Tabs.Screen
        name="players"
        options={{
          title: 'Giocatori',
          href: tabs.includes('players') ? undefined : null,
          tabBarIcon: ({ color, size }) => <UsersThree color={color as string} size={size} weight="duotone" />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendario',
          href: tabs.includes('calendar') ? undefined : null,
          tabBarIcon: ({ color, size }) => <CalendarBlank color={color as string} size={size} weight="duotone" />,
        }}
      />
    </Tabs>
  );
}
