import React, { useState, useRef } from 'react';
import { BoardState, Move, Piece, PieceColor, PieceType, Position } from '../../engine/types';
import { MoveGenerator } from '../../engine/MoveGenerator';
import { soundManager } from '../../audio/SoundManager';
import { BoardOverlay, OverlayArrow, OverlayHighlight, OverlayTrail } from './BoardOverlay';
import { PromotionModal } from './PromotionModal';

interface ChessBoardProps {
  boardState: BoardState;
  onMakeMove: (move: Move) => void;
  playerColor?: PieceColor; // If set, only this color can be moved
  flipped?: boolean;
  interactive?: boolean;
  teacherMode?: boolean;
  teacherTool?: 'MOVE' | 'ARROW' | 'HIGHLIGHT';
  onTeacherArrow?: (from: Position, to: Position) => void;
  onTeacherHighlight?: (pos: Position) => void;
  externalArrows?: OverlayArrow[];
  externalHighlights?: OverlayHighlight[];
  hintMove?: Move | null;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  boardState,
  onMakeMove,
  playerColor,
  flipped = false,
  interactive = true,
  teacherMode = false,
  teacherTool = 'MOVE',
  onTeacherArrow,
  onTeacherHighlight,
  externalArrows = [],
  externalHighlights = [],
  hintMove = null,
}) => {
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [legalMovesForSelected, setLegalMovesForSelected] = useState<Move[]>([]);
  const [pendingPromotionMove, setPendingPromotionMove] = useState<Move | null>(null);
  const [teacherArrowStart, setTeacherArrowStart] = useState<Position | null>(null);

  const isPlayerTurn = !playerColor || boardState.currentTurn === playerColor;

  // File and rank coordinates display
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const displayedFiles = flipped ? [...files].reverse() : files;
  const displayedRanks = flipped ? [...ranks].reverse() : ranks;

  const getPieceImage = (piece: Piece) => {
    const prefix = piece.color === 'WHITE' ? 'w' : 'b';
    const typeName = piece.type.toLowerCase();
    return `${import.meta.env.BASE_URL}assets/pieces/${prefix}_${typeName}.webp`;
  };

  const handleSquareClick = (row: number, col: number) => {
    // 1. Teacher mode interactions
    if (teacherMode && teacherTool !== 'MOVE') {
      if (teacherTool === 'HIGHLIGHT') {
        onTeacherHighlight?.({ row, col });
        return;
      }
      if (teacherTool === 'ARROW') {
        if (!teacherArrowStart) {
          setTeacherArrowStart({ row, col });
        } else {
          onTeacherArrow?.(teacherArrowStart, { row, col });
          setTeacherArrowStart(null);
        }
        return;
      }
    }

    if (!interactive || !isPlayerTurn) return;

    const clickedPiece = boardState.board[row][col];

    // If already selected a piece, check if clicking a destination square
    if (selectedPos) {
      const destinationMove = legalMovesForSelected.find(m => m.toRow === row && m.toCol === col);

      if (destinationMove) {
        // Check if pawn promotion
        const movingPiece = boardState.board[selectedPos.row][selectedPos.col];
        const isPromotion =
          movingPiece?.type === 'PAWN' &&
          ((movingPiece.color === 'WHITE' && row === 0) || (movingPiece.color === 'BLACK' && row === 7));

        if (isPromotion) {
          setPendingPromotionMove(destinationMove);
          return;
        }

        // Execute regular move
        executeMove(destinationMove);
        setSelectedPos(null);
        setLegalMovesForSelected([]);
        return;
      }

      // If clicking own piece of same turn, change selection
      if (clickedPiece && clickedPiece.color === boardState.currentTurn) {
        selectPiece(row, col);
        return;
      }

      // Deselect
      setSelectedPos(null);
      setLegalMovesForSelected([]);
      return;
    }

    // No selection yet: select if piece belongs to current player
    if (clickedPiece && clickedPiece.color === boardState.currentTurn) {
      selectPiece(row, col);
    }
  };

  const selectPiece = (row: number, col: number) => {
    setSelectedPos({ row, col });
    const allLegalMoves = MoveGenerator.generateLegalMoves(boardState);
    const pieceLegalMoves = allLegalMoves.filter(m => m.fromRow === row && m.fromCol === col);
    setLegalMovesForSelected(pieceLegalMoves);
  };

  const executeMove = (move: Move, promoType?: PieceType) => {
    const finalMove: Move = {
      ...move,
      promotionType: promoType || move.promotionType,
    };

    // Sound effect
    const isCapture = !!boardState.board[move.toRow][move.toCol] || !!move.isEnPassant;
    if (isCapture) {
      soundManager.playCapture();
    } else {
      soundManager.playMove();
    }

    onMakeMove(finalMove);
  };

  const handlePromotionSelect = (type: PieceType) => {
    if (pendingPromotionMove) {
      executeMove(pendingPromotionMove, type);
      setPendingPromotionMove(null);
      setSelectedPos(null);
      setLegalMovesForSelected([]);
    }
  };

  // Mobile Touch Sliding / Dragging
  const touchStartPosRef = useRef<{ row: number; col: number } | null>(null);

  const handleTouchStartSquare = (row: number, col: number) => {
    if (!interactive || !isPlayerTurn) return;
    touchStartPosRef.current = { row, col };
    const piece = boardState.board[row][col];
    if (piece && piece.color === boardState.currentTurn) {
      selectPiece(row, col);
    }
  };

  const handleTouchEndSquare = (e: React.TouchEvent) => {
    if (!interactive || !isPlayerTurn || !touchStartPosRef.current) return;
    const startPos = touchStartPosRef.current;
    touchStartPosRef.current = null;

    if (e.changedTouches.length === 0) return;
    const touch = e.changedTouches[0];
    const targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
    const sqEl = targetEl?.closest('[data-square]');
    if (!sqEl) return;

    const toRowStr = sqEl.getAttribute('data-row');
    const toColStr = sqEl.getAttribute('data-col');
    if (toRowStr === null || toColStr === null) return;

    const toRow = parseInt(toRowStr, 10);
    const toCol = parseInt(toColStr, 10);

    // If dragged to a DIFFERENT square
    if (toRow !== startPos.row || toCol !== startPos.col) {
      const allLegalMoves = MoveGenerator.generateLegalMoves(boardState);
      const pieceMoves = allLegalMoves.filter(m => m.fromRow === startPos.row && m.fromCol === startPos.col);
      const destinationMove = pieceMoves.find(m => m.toRow === toRow && m.toCol === toCol);

      if (destinationMove) {
        const movingPiece = boardState.board[startPos.row][startPos.col];
        const isPromotion =
          movingPiece?.type === 'PAWN' &&
          ((movingPiece.color === 'WHITE' && toRow === 0) || (movingPiece.color === 'BLACK' && toRow === 7));

        if (isPromotion) {
          setPendingPromotionMove(destinationMove);
          return;
        }

        executeMove(destinationMove);
        setSelectedPos(null);
        setLegalMovesForSelected([]);
      }
    }
  };

  // Build combined arrows (external + hint)
  const combinedArrows: OverlayArrow[] = [...externalArrows];
  if (hintMove) {
    combinedArrows.push({
      fromRow: hintMove.fromRow,
      fromCol: hintMove.fromCol,
      toRow: hintMove.toRow,
      toCol: hintMove.toCol,
      color: 'HINT',
    });
  }

  // Visual Movement Trails for beginners
  const selectedPiece = selectedPos ? boardState.board[selectedPos.row][selectedPos.col] : null;
  const visualTrails: OverlayTrail[] = [];
  if (selectedPos && selectedPiece) {
    for (const move of legalMovesForSelected) {
      visualTrails.push({
        fromRow: selectedPos.row,
        fromCol: selectedPos.col,
        toRow: move.toRow,
        toCol: move.toCol,
        pieceType: selectedPiece.type,
      });
    }
  }

  // Find King in check position for check aura
  const inCheckKingPos = boardState.isInCheck ? MoveGenerator.findKing(boardState.board, boardState.currentTurn) : null;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '520px',
        margin: '0 auto',
        aspectRatio: '1 / 1',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6), 0 0 0 3px var(--border-gold)',
        overflow: 'hidden',
        background: 'var(--velvet-dark)',
        touchAction: 'none',
      }}
    >
      {/* 8x8 Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          gridTemplateRows: 'repeat(8, 1fr)',
          width: '100%',
          height: '100%',
        }}
      >
        {Array.from({ length: 8 }).map((_, displayRow) =>
          Array.from({ length: 8 }).map((_, displayCol) => {
            const row = flipped ? 7 - displayRow : displayRow;
            const col = flipped ? 7 - displayCol : displayCol;
            const isLight = (row + col) % 2 === 0;

            const piece = boardState.board[row][col];
            const isSelected = selectedPos?.row === row && selectedPos?.col === col;

            const isLastMoveFrom = boardState.lastMove?.fromRow === row && boardState.lastMove?.fromCol === col;
            const isLastMoveTo = boardState.lastMove?.toRow === row && boardState.lastMove?.toCol === col;
            const isLastMove = isLastMoveFrom || isLastMoveTo;

            const isKingInCheckSquare = inCheckKingPos?.row === row && inCheckKingPos?.col === col;

            const legalMoveHere = legalMovesForSelected.find(m => m.toRow === row && m.toCol === col);
            const isCaptureTarget = legalMoveHere && (!!piece || legalMoveHere.isEnPassant);

            // Square background color determination
            let bgColor = isLight ? 'var(--board-light-square)' : 'var(--board-dark-square)';
            if (isSelected) {
              bgColor = 'var(--board-selected-square)';
            } else if (isKingInCheckSquare) {
              bgColor = 'var(--board-check-alert)';
            } else if (isLastMove) {
              bgColor = isLight ? 'rgba(212, 163, 115, 0.6)' : 'rgba(163, 112, 68, 0.7)';
            }

            return (
              <div
                key={`sq-${row}-${col}`}
                data-row={row}
                data-col={col}
                data-square={`sq-${row}-${col}`}
                onClick={() => handleSquareClick(row, col)}
                onTouchStart={() => handleTouchStartSquare(row, col)}
                onTouchEnd={handleTouchEndSquare}
                style={{
                  position: 'relative',
                  backgroundColor: bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: interactive ? 'pointer' : 'default',
                  transition: 'background-color 0.15s ease',
                  userSelect: 'none',
                }}
              >
                {/* Coordinate labels (on outer borders) */}
                {displayCol === 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '2px',
                      left: '4px',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: isLight ? '#7F5539' : '#EDE0D4',
                      opacity: 0.85,
                      pointerEvents: 'none',
                    }}
                  >
                    {displayedRanks[displayRow]}
                  </span>
                )}
                {displayRow === 7 && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '4px',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: isLight ? '#7F5539' : '#EDE0D4',
                      opacity: 0.85,
                      pointerEvents: 'none',
                    }}
                  >
                    {displayedFiles[displayCol]}
                  </span>
                )}

                {/* 3D Piece Image */}
                {piece && (
                  <img
                    src={getPieceImage(piece)}
                    alt={`${piece.color} ${piece.type}`}
                    draggable={false}
                    style={{
                      width: '88%',
                      height: '88%',
                      objectFit: 'contain',
                      zIndex: 10,
                      transform: isSelected ? 'scale(1.15) translateY(-6px)' : 'none',
                      filter: isSelected
                        ? 'drop-shadow(0 10px 14px rgba(229, 115, 136, 0.7))'
                        : 'drop-shadow(0 4px 7px rgba(0, 0, 0, 0.45))',
                      transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), filter 0.18s ease',
                    }}
                  />
                )}

                {/* Legal Move Dot or Capture Ring */}
                {legalMoveHere && (
                  <div
                    style={{
                      position: 'absolute',
                      zIndex: 15,
                      pointerEvents: 'none',
                      ...(isCaptureTarget
                        ? {
                            inset: '6px',
                            borderRadius: '50%',
                            border: '4px solid rgba(229, 115, 136, 0.85)',
                            backgroundColor: 'rgba(229, 115, 136, 0.2)',
                          }
                        : {
                            width: '26%',
                            height: '26%',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(74, 62, 61, 0.55)',
                            boxShadow: '0 0 6px rgba(0,0,0,0.3)',
                          }),
                    }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* SVG Vector Layer for Teacher Arrows and Highlights */}
      <BoardOverlay
        arrows={combinedArrows}
        highlights={externalHighlights}
        trails={visualTrails}
        flipped={flipped}
      />

      {/* Pawn Promotion Dialog */}
      {pendingPromotionMove && (
        <PromotionModal
          color={boardState.currentTurn}
          onSelect={handlePromotionSelect}
          onCancel={() => setPendingPromotionMove(null)}
        />
      )}
    </div>
  );
};
