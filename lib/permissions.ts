import type { Role } from '../types/database';

export type SectionId =
  | 'dashboard'
  | 'players'
  | 'stats'
  | 'calendar'
  | 'opponents'
  | 'reports'
  | 'trainings'
  | 'attendance'
  | 'notes'
  | 'tacticalboard'
  | 'trainingarchive'
  | 'users';

export interface RoleDef {
  id: Role;
  label: string;
  sections: SectionId[];
  canManagePlayers: boolean;
  canManageMatches: boolean;
  canManageTrainings: boolean;
  canAssignMvp: boolean;
  canManageUsers: boolean;
  canManageAttendance: boolean;
}

const ALL_SECTIONS_EXCEPT_USERS: SectionId[] = [
  'dashboard',
  'players',
  'stats',
  'calendar',
  'opponents',
  'reports',
  'trainings',
  'attendance',
  'notes',
  'tacticalboard',
  'trainingarchive',
];

export const ROLE_DEFS: Record<Role, RoleDef> = {
  admin: {
    id: 'admin',
    label: 'Admin',
    sections: [...ALL_SECTIONS_EXCEPT_USERS, 'users'],
    canManagePlayers: true,
    canManageMatches: true,
    canManageTrainings: true,
    canAssignMvp: true,
    canManageUsers: true,
    canManageAttendance: true,
  },
  allenatore: {
    id: 'allenatore',
    label: 'Allenatore',
    sections: ALL_SECTIONS_EXCEPT_USERS,
    canManagePlayers: true,
    canManageMatches: true,
    canManageTrainings: true,
    canAssignMvp: true,
    canManageUsers: false,
    canManageAttendance: true,
  },
  preparatore: {
    id: 'preparatore',
    label: 'Preparatore atletico',
    sections: ALL_SECTIONS_EXCEPT_USERS,
    canManagePlayers: false,
    canManageMatches: false,
    canManageTrainings: true,
    canAssignMvp: false,
    canManageUsers: false,
    canManageAttendance: true,
  },
  dirigente: {
    id: 'dirigente',
    label: 'Dirigente',
    sections: ALL_SECTIONS_EXCEPT_USERS,
    canManagePlayers: false,
    canManageMatches: false,
    canManageTrainings: false,
    canAssignMvp: false,
    canManageUsers: false,
    canManageAttendance: true,
  },
  tifoso: {
    id: 'tifoso',
    label: 'Tifoso',
    sections: ['players', 'calendar'],
    canManagePlayers: false,
    canManageMatches: false,
    canManageTrainings: false,
    canAssignMvp: false,
    canManageUsers: false,
    canManageAttendance: false,
  },
};

export function roleDef(role: Role | null | undefined): RoleDef | null {
  if (!role) return null;
  return ROLE_DEFS[role] ?? null;
}

/** Bottom tab bar contents: tifoso gets a restricted 2-tab experience. */
export function tabsForRole(role: Role | null | undefined): ('dashboard' | 'stats' | 'more' | 'players' | 'calendar')[] {
  if (role === 'tifoso') return ['players', 'calendar'];
  return ['dashboard', 'stats', 'more'];
}

/** Sections shown in the "Altro" hub: everything the role can see minus what's already on the tab bar. */
export function altroSections(role: Role | null | undefined): SectionId[] {
  const def = roleDef(role);
  if (!def) return [];
  const onTabBar = new Set<SectionId>(role === 'tifoso' ? ['players', 'calendar'] : ['dashboard', 'stats']);
  return def.sections.filter((s) => !onTabBar.has(s));
}
