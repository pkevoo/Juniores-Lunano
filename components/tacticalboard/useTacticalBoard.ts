import { useRef, useState } from 'react';
import {
  BoardLine,
  BoardToken,
  EquipmentKind,
  LineTool,
  PlayerToken,
} from '../../lib/tacticalBoardTypes';

interface Snapshot {
  tokens: BoardToken[];
  lines: BoardLine[];
  counts: Record<string, number>;
}

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `t${Date.now()}_${idCounter}`;
}

export function useTacticalBoard() {
  const [tokens, setTokens] = useState<BoardToken[]>([]);
  const [lines, setLines] = useState<BoardLine[]>([]);
  const [paletteCounts, setPaletteCounts] = useState<Record<string, number>>({});
  const [lineTool, setLineTool] = useState<LineTool | null>(null);
  const [drawColor, setDrawColor] = useState('#ffffff');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [playerSize, setPlayerSize] = useState(22);
  const historyRef = useRef<Snapshot[]>([]);
  const [canUndo, setCanUndo] = useState(false);

  const pushHistory = () => {
    historyRef.current = [...historyRef.current.slice(-29), { tokens, lines, counts: paletteCounts }];
    setCanUndo(true);
  };

  const undo = () => {
    const prev = historyRef.current.pop();
    setCanUndo(historyRef.current.length > 0);
    if (!prev) return;
    setTokens(prev.tokens);
    setLines(prev.lines);
    setPaletteCounts(prev.counts);
    setSelectedId(null);
  };

  const addPlayerToken = (color: string, x: number, y: number) => {
    pushHistory();
    const count = (paletteCounts[color] ?? 0) + 1;
    setPaletteCounts((c) => ({ ...c, [color]: count }));
    const token: PlayerToken = { id: nextId(), kind: 'player', color, num: count, x, y };
    setTokens((t) => [...t, token]);
  };

  const addEquipmentToken = (equipment: EquipmentKind, x: number, y: number) => {
    pushHistory();
    setTokens((t) => [...t, { id: nextId(), kind: 'equipment', equipment, x, y }]);
  };

  const moveToken = (id: string, x: number, y: number) => {
    setTokens((t) => t.map((tok) => (tok.id === id ? { ...tok, x: clamp(x), y: clamp(y) } : tok)));
  };

  const beginDragToken = () => pushHistory();

  const startLine = (x: number, y: number): string => {
    pushHistory();
    const id = nextId();
    const newLine: BoardLine = { id, tool: lineTool ?? 'straight', color: drawColor, x1: x, y1: y, x2: x, y2: y };
    setLines((l) => [...l, newLine]);
    return id;
  };

  const updateLineEnd = (id: string, x2: number, y2: number) => {
    setLines((l) => l.map((ln) => (ln.id === id ? { ...ln, x2: clamp(x2), y2: clamp(y2) } : ln)));
  };

  const beginDragLine = () => pushHistory();

  const moveLine = (id: string, dx: number, dy: number) => {
    setLines((l) =>
      l.map((ln) =>
        ln.id === id
          ? { ...ln, x1: clamp(ln.x1 + dx), y1: clamp(ln.y1 + dy), x2: clamp(ln.x2 + dx), y2: clamp(ln.y2 + dy) }
          : ln
      )
    );
  };

  const removeSelected = () => {
    if (!selectedId) return;
    pushHistory();
    if (tokens.some((t) => t.id === selectedId)) {
      setTokens((t) => t.filter((tok) => tok.id !== selectedId));
    } else {
      setLines((l) => l.filter((ln) => ln.id !== selectedId));
    }
    setSelectedId(null);
  };

  const clearLines = () => {
    pushHistory();
    setLines([]);
    setSelectedId(null);
  };

  const clearBoard = () => {
    pushHistory();
    setTokens([]);
    setLines([]);
    setPaletteCounts({});
    setSelectedId(null);
  };

  const mirror = () => {
    if (tokens.length === 0 && lines.length === 0) return;
    pushHistory();
    const usedColors = new Set(tokens.filter((t): t is PlayerToken => t.kind === 'player').map((t) => t.color));
    const fallbackColor = '#2c3e66';
    let nextColor = fallbackColor;
    for (const c of ['#2c3e66', '#c98a1c', '#b3412f', '#1f6e3f', '#16201a', '#ffffff']) {
      if (!usedColors.has(c)) {
        nextColor = c;
        break;
      }
    }
    let counter = paletteCounts[nextColor] ?? 0;
    const mirroredTokens: BoardToken[] = tokens.map((t) => {
      if (t.kind === 'player') {
        counter += 1;
        return { id: nextId(), kind: 'player', color: nextColor, num: counter, x: clamp(100 - t.x), y: clamp(100 - t.y) };
      }
      return { id: nextId(), kind: 'equipment', equipment: t.equipment, x: clamp(100 - t.x), y: clamp(100 - t.y) };
    });
    const mirroredLines: BoardLine[] = lines.map((ln) => ({
      id: nextId(),
      tool: ln.tool,
      color: ln.color,
      x1: clamp(100 - ln.x1),
      y1: clamp(100 - ln.y1),
      x2: clamp(100 - ln.x2),
      y2: clamp(100 - ln.y2),
    }));
    setTokens((t) => [...t, ...mirroredTokens]);
    setLines((l) => [...l, ...mirroredLines]);
    setPaletteCounts((c) => ({ ...c, [nextColor]: counter }));
  };

  const loadScheme = (scheme: { tokens: BoardToken[]; lines: BoardLine[]; player_size?: number | null }) => {
    pushHistory();
    setTokens(scheme.tokens);
    setLines(scheme.lines);
    setPlayerSize(scheme.player_size ?? 22);
    const counts: Record<string, number> = {};
    scheme.tokens.forEach((t) => {
      if (t.kind === 'player') counts[t.color] = Math.max(counts[t.color] ?? 0, t.num);
    });
    setPaletteCounts(counts);
    setSelectedId(null);
  };

  const bumpPlayerSize = (delta: number) => setPlayerSize((s) => Math.min(36, Math.max(14, s + delta)));

  return {
    tokens,
    lines,
    paletteCounts,
    lineTool,
    setLineTool,
    drawColor,
    setDrawColor,
    selectedId,
    setSelectedId,
    playerSize,
    bumpPlayerSize,
    canUndo,
    undo,
    addPlayerToken,
    addEquipmentToken,
    moveToken,
    beginDragToken,
    startLine,
    updateLineEnd,
    beginDragLine,
    moveLine,
    removeSelected,
    clearLines,
    clearBoard,
    mirror,
    loadScheme,
  };
}

function clamp(v: number) {
  return Math.min(98, Math.max(2, v));
}

export type TacticalBoardState = ReturnType<typeof useTacticalBoard>;
