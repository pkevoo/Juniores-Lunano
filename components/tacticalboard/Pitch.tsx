import React, { useRef } from 'react';
import { LayoutChangeEvent, PanResponder, Text, View } from 'react-native';
import Svg, { Circle, Line as SvgLine, Path, Polygon, Rect } from 'react-native-svg';
import { useTheme } from '../../lib/ThemeContext';
import type { EquipmentKind, PitchMeasurements } from '../../lib/tacticalBoardTypes';
import type { TacticalBoardState } from './useTacticalBoard';

export const PITCH_HEIGHT = 340;

function buildWavePath(x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const segments = Math.max(4, Math.round(len / 6));
  const amplitude = 2.2;
  let d = `M ${x1} ${y1} `;
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const px = x1 + dx * t;
    const py = y1 + dy * t;
    const taper = Math.sin(Math.PI * t);
    const wave = Math.sin(t * Math.PI * 4) * amplitude * taper;
    d += `L ${px + nx * wave} ${py + ny * wave} `;
  }
  return d;
}

function LineShape({ line, selected }: { line: TacticalBoardState['lines'][number]; selected: boolean }) {
  const strokeWidth = selected ? 1.1 : 0.6;
  if (line.tool === 'wave') {
    return <Path d={buildWavePath(line.x1, line.y1, line.x2, line.y2)} stroke={line.color} strokeWidth={strokeWidth} fill="none" />;
  }
  const angle = Math.atan2(line.y2 - line.y1, line.x2 - line.x1);
  const arrowSize = 2.5;
  return (
    <>
      <SvgLine x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke={line.color} strokeWidth={strokeWidth} />
      {line.tool === 'arrow' && (
        <Polygon
          points={`${line.x2},${line.y2} ${line.x2 - arrowSize * Math.cos(angle - 0.5)},${line.y2 - arrowSize * Math.sin(angle - 0.5)} ${line.x2 - arrowSize * Math.cos(angle + 0.5)},${line.y2 - arrowSize * Math.sin(angle + 0.5)}`}
          fill={line.color}
        />
      )}
    </>
  );
}

function equipmentGlyph(kind: EquipmentKind): { shape: 'triangle' | 'circle' | 'square'; color: string; label: string } {
  switch (kind) {
    case 'cone': return { shape: 'triangle', color: '#e07a2c', label: '▲' };
    case 'ladder': return { shape: 'square', color: '#2c3e66', label: '≡' };
    case 'hurdle': return { shape: 'square', color: '#b3412f', label: '⊓' };
    case 'marker': return { shape: 'circle', color: '#e8c93c', label: '' };
    case 'ring': return { shape: 'circle', color: '#3a7bd5', label: '' };
    case 'minigoal': return { shape: 'square', color: '#ffffff', label: '⛁' };
  }
}

function DraggableToken({
  token,
  board,
  pitchSize,
  size,
}: {
  token: TacticalBoardState['tokens'][number];
  board: TacticalBoardState;
  pitchSize: { width: number; height: number };
  size: number;
}) {
  const startRef = useRef({ x: token.x, y: token.y });
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => board.lineTool == null,
      onPanResponderGrant: () => {
        startRef.current = { x: token.x, y: token.y };
        board.beginDragToken();
        board.setSelectedId(token.id);
      },
      onPanResponderMove: (_evt, gesture) => {
        if (pitchSize.width === 0) return;
        const dxPct = (gesture.dx / pitchSize.width) * 100;
        const dyPct = (gesture.dy / pitchSize.height) * 100;
        board.moveToken(token.id, startRef.current.x + dxPct, startRef.current.y + dyPct);
      },
    })
  ).current;

  const selected = board.selectedId === token.id;

  if (token.kind === 'equipment') {
    const glyph = equipmentGlyph(token.equipment);
    return (
      <View
        {...panResponder.panHandlers}
        style={{
          position: 'absolute',
          left: `${token.x}%`,
          top: `${token.y}%`,
          transform: [{ translateX: -size / 2 }, { translateY: -size / 2 }],
          width: size,
          height: size,
          borderRadius: glyph.shape === 'circle' ? size / 2 : 4,
          backgroundColor: glyph.color,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: selected ? 2 : 0,
          borderColor: '#fff',
        }}
      >
        <Text style={{ fontSize: size * 0.5, color: '#16201a' }}>{glyph.label}</Text>
      </View>
    );
  }

  const textColor = token.color === '#ffffff' ? '#16201a' : '#ffffff';
  return (
    <View
      {...panResponder.panHandlers}
      style={{
        position: 'absolute',
        left: `${token.x}%`,
        top: `${token.y}%`,
        transform: [{ translateX: -size / 2 }, { translateY: -size / 2 }],
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: token.color,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? '#3aab68' : 'rgba(0,0,0,0.2)',
      }}
    >
      <Text style={{ fontSize: size * 0.42, fontFamily: 'Manrope_800ExtraBold', color: textColor }}>{token.num}</Text>
    </View>
  );
}

function DraggableLineHandle({ line, board, pitchSize }: { line: TacticalBoardState['lines'][number]; board: TacticalBoardState; pitchSize: { width: number; height: number } }) {
  const midX = (line.x1 + line.x2) / 2;
  const midY = (line.y1 + line.y2) / 2;
  const lastDelta = useRef({ dxPct: 0, dyPct: 0 });
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => board.lineTool == null,
      onPanResponderGrant: () => {
        lastDelta.current = { dxPct: 0, dyPct: 0 };
        board.beginDragLine();
        board.setSelectedId(line.id);
      },
      onPanResponderMove: (_evt, gesture) => {
        if (pitchSize.width === 0) return;
        const dxPct = (gesture.dx / pitchSize.width) * 100;
        const dyPct = (gesture.dy / pitchSize.height) * 100;
        board.moveLine(line.id, dxPct - lastDelta.current.dxPct, dyPct - lastDelta.current.dyPct);
        lastDelta.current = { dxPct, dyPct };
      },
    })
  ).current;

  return (
    <View
      {...panResponder.panHandlers}
      style={{
        position: 'absolute',
        left: `${midX}%`,
        top: `${midY}%`,
        transform: [{ translateX: -10 }, { translateY: -10 }],
        width: 20,
        height: 20,
      }}
    />
  );
}

export function Pitch({ board, onMeasured }: { board: TacticalBoardState; onMeasured: (m: PitchMeasurements) => void }) {
  const { palette } = useTheme();
  const containerRef = useRef<View>(null);
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  const drawingIdRef = useRef<string | null>(null);

  const measure = () => {
    containerRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
      onMeasured({ pageX, pageY, width, height });
    });
  };

  const onLayout = (e: LayoutChangeEvent) => {
    setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height });
    measure();
  };

  const pitchPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => board.lineTool != null,
      onPanResponderGrant: (evt) => {
        if (size.width === 0) return;
        const xPct = (evt.nativeEvent.locationX / size.width) * 100;
        const yPct = (evt.nativeEvent.locationY / size.height) * 100;
        drawingIdRef.current = board.startLine(xPct, yPct);
      },
      onPanResponderMove: (evt) => {
        if (size.width === 0 || !drawingIdRef.current) return;
        const xPct = (evt.nativeEvent.locationX / size.width) * 100;
        const yPct = (evt.nativeEvent.locationY / size.height) * 100;
        board.updateLineEnd(drawingIdRef.current, xPct, yPct);
      },
      onPanResponderRelease: () => {
        drawingIdRef.current = null;
      },
    })
  ).current;

  return (
    <View
      ref={containerRef}
      onLayout={onLayout}
      {...pitchPanResponder.panHandlers}
      style={{ height: PITCH_HEIGHT, borderRadius: 12, overflow: 'hidden', backgroundColor: palette.pitch }}
    >
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <SvgLine x1={2} y1={50} x2={98} y2={50} stroke="rgba(255,255,255,0.5)" strokeWidth={0.4} />
        <Circle cx={50} cy={50} r={9} stroke="rgba(255,255,255,0.5)" strokeWidth={0.4} fill="none" />
        <Circle cx={50} cy={50} r={0.6} fill="rgba(255,255,255,0.6)" />
        <Rect x={22} y={2} width={56} height={13} stroke="rgba(255,255,255,0.5)" strokeWidth={0.4} fill="none" />
        <Rect x={38} y={2} width={24} height={5} stroke="rgba(255,255,255,0.5)" strokeWidth={0.4} fill="none" />
        <Rect x={22} y={85} width={56} height={13} stroke="rgba(255,255,255,0.5)" strokeWidth={0.4} fill="none" />
        <Rect x={38} y={93} width={24} height={5} stroke="rgba(255,255,255,0.5)" strokeWidth={0.4} fill="none" />
        <Rect x={42} y={0} width={16} height={1.5} fill="rgba(255,255,255,0.7)" />
        <Rect x={42} y={98.5} width={16} height={1.5} fill="rgba(255,255,255,0.7)" />
        {board.lines.map((line) => (
          <LineShape key={line.id} line={line} selected={board.selectedId === line.id} />
        ))}
      </Svg>
      {board.lines.map((line) => (
        <DraggableLineHandle key={line.id} line={line} board={board} pitchSize={size} />
      ))}
      {board.tokens.map((token) => (
        <DraggableToken key={token.id} token={token} board={board} pitchSize={size} size={board.playerSize} />
      ))}
    </View>
  );
}
