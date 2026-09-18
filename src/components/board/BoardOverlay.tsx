import React from 'react';
import { PieceType } from '../../engine/types';

export interface OverlayArrow {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  color?: string;
}

export interface OverlayHighlight {
  row: number;
  col: number;
  color?: string;
}

export interface OverlayTrail {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  pieceType: PieceType;
}

interface BoardOverlayProps {
  arrows: OverlayArrow[];
  highlights: OverlayHighlight[];
  trails?: OverlayTrail[];
  flipped?: boolean;
}

export const BoardOverlay: React.FC<BoardOverlayProps> = ({ arrows, highlights, trails = [], flipped = false }) => {
  const getSquareCenter = (row: number, col: number) => {
    const r = flipped ? 7 - row : row;
    const c = flipped ? 7 - col : col;
    return {
      x: c * 100 + 50,
      y: r * 100 + 50,
    };
  };

  const getSquareTopLeft = (row: number, col: number) => {
    const r = flipped ? 7 - row : row;
    const c = flipped ? 7 - col : col;
    return {
      x: c * 100,
      y: r * 100,
    };
  };

  return (
    <svg
      viewBox="0 0 800 800"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 20,
      }}
    >
      <defs>
        {/* Custom Marker for pedagogical arrows */}
        <marker
          id="teacher-arrow-head"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="rgba(226, 149, 120, 0.9)" />
        </marker>
        <marker
          id="hint-arrow-head"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="rgba(229, 115, 136, 0.95)" />
        </marker>
      </defs>

      {/* Highlights */}
      {highlights.map((hl, index) => {
        const { x, y } = getSquareTopLeft(hl.row, hl.col);
        return (
          <rect
            key={`hl-${index}`}
            x={x}
            y={y}
            width="100"
            height="100"
            fill={hl.color || 'rgba(0, 109, 119, 0.45)'}
            rx="6"
            style={{ transition: 'fill 0.2s ease' }}
          />
        );
      })}

      {/* Movement Trails (Geometrical Paths) */}
      {trails.map((trail, index) => {
        const start = getSquareCenter(trail.fromRow, trail.fromCol);
        const end = getSquareCenter(trail.toRow, trail.toCol);

        if (trail.pieceType === 'KNIGHT') {
          // L-Shape path calculation
          const dy = Math.abs(trail.toRow - trail.fromRow);
          const cornerRow = dy === 2 ? trail.toRow : trail.fromRow;
          const cornerCol = dy === 2 ? trail.fromCol : trail.toCol;
          const corner = getSquareCenter(cornerRow, cornerCol);

          return (
            <polyline
              key={`trail-${index}`}
              points={`${start.x},${start.y} ${corner.x},${corner.y} ${end.x},${end.y}`}
              stroke="rgba(229, 115, 136, 0.78)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              strokeDasharray="8 6"
              style={{ filter: 'drop-shadow(0 0 5px rgba(229, 115, 136, 0.65))' }}
            />
          );
        }

        // Sliders & Pawns: Straight smooth trajectory
        return (
          <line
            key={`trail-${index}`}
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            stroke="rgba(226, 149, 120, 0.65)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="7 5"
            style={{ filter: 'drop-shadow(0 0 4px rgba(226, 149, 120, 0.45))' }}
          />
        );
      })}

      {/* Arrows */}
      {arrows.map((arrow, index) => {
        const start = getSquareCenter(arrow.fromRow, arrow.fromCol);
        const end = getSquareCenter(arrow.toRow, arrow.toCol);

        // Adjust end point slightly backward so marker doesn't overshoot piece center
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length === 0) return null;

        const offset = 22; // stop slightly before target center
        const targetX = end.x - (dx / length) * offset;
        const targetY = end.y - (dy / length) * offset;

        const isHint = arrow.color === 'HINT';
        const strokeColor = isHint ? 'rgba(229, 115, 136, 0.9)' : (arrow.color || 'rgba(226, 149, 120, 0.88)');
        const markerId = isHint ? 'url(#hint-arrow-head)' : 'url(#teacher-arrow-head)';

        return (
          <line
            key={`arrow-${index}`}
            x1={start.x}
            y1={start.y}
            x2={targetX}
            y2={targetY}
            stroke={strokeColor}
            strokeWidth="12"
            strokeLinecap="round"
            markerEnd={markerId}
            style={{
              filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.5))',
              transition: 'all 0.2s ease',
            }}
          />
        );
      })}
    </svg>
  );
};
