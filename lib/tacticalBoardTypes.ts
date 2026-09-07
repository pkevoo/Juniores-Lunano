export type EquipmentKind = 'cone' | 'ladder' | 'hurdle' | 'marker' | 'ring' | 'minigoal';
export type LineTool = 'straight' | 'arrow' | 'wave';

export interface PlayerToken {
  id: string;
  kind: 'player';
  color: string;
  num: number;
  x: number; // 0-100 (% of pitch width)
  y: number; // 0-100 (% of pitch height)
}

export interface EquipmentToken {
  id: string;
  kind: 'equipment';
  equipment: EquipmentKind;
  x: number;
  y: number;
}

export type BoardToken = PlayerToken | EquipmentToken;

export interface BoardLine {
  id: string;
  tool: LineTool;
  color: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export const TOKEN_COLORS = ['#ffffff', '#1f6e3f', '#c98a1c', '#b3412f', '#2c3e66', '#16201a'];

export const EQUIPMENT_DEFS: { kind: EquipmentKind; label: string }[] = [
  { kind: 'cone', label: 'Cono' },
  { kind: 'ladder', label: 'Scaletta' },
  { kind: 'hurdle', label: 'Ostacolo' },
  { kind: 'marker', label: 'Cinesino' },
  { kind: 'ring', label: 'Cerchio' },
  { kind: 'minigoal', label: 'Porticina' },
];

export const LINE_TOOL_DEFS: { tool: LineTool; label: string }[] = [
  { tool: 'straight', label: 'Linea' },
  { tool: 'arrow', label: 'Freccia' },
  { tool: 'wave', label: 'Transizione' },
];

export const LINE_COLORS = ['#ffffff', '#1f6e3f', '#c98a1c', '#b3412f'];

export type DragGhost =
  | { kind: 'player'; color: string; pageX: number; pageY: number }
  | { kind: 'equipment'; equipment: EquipmentKind; pageX: number; pageY: number };

export interface PitchMeasurements {
  pageX: number;
  pageY: number;
  width: number;
  height: number;
}
