// Ported 1:1 from the prototype's CSS custom properties
// (project/Juniores Manager.dc.html, :root/[data-theme] blocks).

export type ThemeMode = 'light' | 'dark';

export interface Palette {
  bg: string;
  bg2: string;
  surface: string;
  tx: string;
  tx2: string;
  ink06: string;
  ink08: string;
  ink15: string;
  ink35: string;
  ink40: string;
  ink45: string;
  ink50: string;
  ink55: string;
  ink65: string;
  accent: string;
  accent40: string;
  accentSoft: string;
  danger: string;
  danger70: string;
  dangerSoft: string;
  warnSoft: string;
  warn: string; // amber #c98a1c used ad hoc in the prototype (assist stat, MVP badge, CEN tag)
  pitch: string;
}

export const lightPalette: Palette = {
  bg: '#f7f8f6',
  bg2: '#eef0ee',
  surface: '#ffffff',
  tx: '#16201a',
  tx2: '#3a4540',
  ink06: 'rgba(22,32,26,.06)',
  ink08: 'rgba(22,32,26,.08)',
  ink15: 'rgba(22,32,26,.15)',
  ink35: 'rgba(22,32,26,.35)',
  ink40: 'rgba(22,32,26,.4)',
  ink45: 'rgba(22,32,26,.45)',
  ink50: 'rgba(22,32,26,.5)',
  ink55: 'rgba(22,32,26,.55)',
  ink65: 'rgba(22,32,26,.65)',
  accent: '#1f6e3f',
  accent40: 'rgba(31,110,63,.4)',
  accentSoft: '#e7f3ec',
  danger: '#b3412f',
  danger70: 'rgba(179,65,47,.7)',
  dangerSoft: '#fbe9e9',
  warnSoft: '#fdf3e3',
  warn: '#c98a1c',
  pitch: '#1f6e3f',
};

export const darkPalette: Palette = {
  bg: '#111a26',
  bg2: '#18222f',
  surface: '#1b2532',
  tx: '#e9eef3',
  tx2: '#c2ccd6',
  ink06: 'rgba(233,238,243,.06)',
  ink08: 'rgba(233,238,243,.1)',
  ink15: 'rgba(233,238,243,.17)',
  ink35: 'rgba(233,238,243,.38)',
  ink40: 'rgba(233,238,243,.44)',
  ink45: 'rgba(233,238,243,.5)',
  ink50: 'rgba(233,238,243,.55)',
  ink55: 'rgba(233,238,243,.6)',
  ink65: 'rgba(233,238,243,.7)',
  accent: '#3aab68',
  accent40: 'rgba(58,171,104,.45)',
  accentSoft: '#1c3527',
  danger: '#ef8b76',
  danger70: 'rgba(239,139,118,.75)',
  dangerSoft: '#3a2320',
  warnSoft: '#33291a',
  warn: '#c98a1c',
  pitch: '#1d5f39',
};

export function paletteFor(mode: ThemeMode): Palette {
  return mode === 'dark' ? darkPalette : lightPalette;
}

export const POS_TAG: Record<'POR' | 'DIF' | 'CEN' | 'ATT', { bgKey: 'accentSoft' | 'warnSoft'; colorKey: 'accent' | 'warn' | 'tx' }> = {
  POR: { bgKey: 'accentSoft', colorKey: 'accent' },
  DIF: { bgKey: 'accentSoft', colorKey: 'accent' },
  CEN: { bgKey: 'warnSoft', colorKey: 'warn' },
  ATT: { bgKey: 'accentSoft', colorKey: 'accent' },
};
