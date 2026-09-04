import { router, useNavigation } from 'expo-router';
import { List } from 'phosphor-react-native';
import React from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/AuthContext';
import { roleDef } from '../../lib/permissions';
import { useTheme } from '../../lib/ThemeContext';

export function AppHeader() {
  const { palette } = useTheme();
  const { profile } = useAuth();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const def = roleDef(profile?.role);

  const openMenu = () => (navigation as { toggleDrawer?: () => void }).toggleDrawer?.();
  const goHome = () => {
    const target = profile?.role === 'tifoso' ? '/(app)/(tabs)/players' : '/(app)/(tabs)/dashboard';
    router.navigate(target as never);
  };

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: palette.bg,
          borderBottomColor: palette.ink08,
          paddingTop: (Platform.OS === 'ios' ? insets.top : insets.top + 6) + 6,
        },
      ]}
    >
      <Pressable onPress={openMenu} hitSlop={10} style={styles.iconButton}>
        <List size={24} color={palette.tx} weight="regular" />
      </Pressable>
      <Pressable onPress={goHome} style={styles.brand}>
        <Image source={require('../../assets/logo-juniores.png')} style={styles.logo} resizeMode="contain" />
        <Text style={[styles.title, { color: palette.tx }]}>
          Juniores <Text style={{ color: palette.accent }}>Manager</Text>
        </Text>
      </Pressable>
      {!!def && (
        <View style={[styles.pill, { backgroundColor: palette.accentSoft }]}>
          <Text style={[styles.pillText, { color: palette.accent }]}>{def.label}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  iconButton: { padding: 2 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  logo: { width: 28, height: 32 },
  title: { fontFamily: 'Manrope_800ExtraBold', fontSize: 16 },
  pill: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999 },
  pillText: { fontFamily: 'Manrope_700Bold', fontSize: 10 },
});
