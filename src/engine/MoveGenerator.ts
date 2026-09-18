import { BoardState, Move, Piece, PieceColor, PieceType, Position } from './types';

export class MoveGenerator {
  // Check if coordinates are within the 8x8 chessboard
  public static isValidCoord(row: number, col: number): boolean {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }

  // Find the king of a given color
  public static findKing(board: (Piece | null)[][], color: PieceColor): Position | null {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'KING' && piece.color === color) {
          return { row: r, col: c };
        }
      }
    }
    return null;
  }

  // Check if a square is attacked by any piece of the given attacking color
  public static isSquareAttacked(
    board: (Piece | null)[][],
    row: number,
    col: number,
    byColor: PieceColor
  ): boolean {
    // 1. Attacked by Pawns
    const pawnRowDelta = byColor === 'WHITE' ? 1 : -1; // White pawn attacks up (from r+1 to r)
    const attackerPawnRow = row + pawnRowDelta;
    if (attackerPawnRow >= 0 && attackerPawnRow < 8) {
      for (const dc of [-1, 1]) {
        const c = col + dc;
        if (c >= 0 && c < 8) {
          const piece = board[attackerPawnRow][c];
          if (piece && piece.color === byColor && piece.type === 'PAWN') {
            return true;
          }
        }
      }
    }

    // 2. Attacked by Knights
    const knightOffsets = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    for (const [dr, dc] of knightOffsets) {
      const nr = row + dr;
      const nc = col + dc;
      if (this.isValidCoord(nr, nc)) {
        const piece = board[nr][nc];
        if (piece && piece.color === byColor && piece.type === 'KNIGHT') {
          return true;
        }
      }
    }

    // 3. Attacked by King
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = row + dr;
        const nc = col + dc;
        if (this.isValidCoord(nr, nc)) {
          const piece = board[nr][nc];
          if (piece && piece.color === byColor && piece.type === 'KING') {
            return true;
          }
        }
      }
    }

    // 4. Straight lines (Rook, Queen)
    const straightDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of straightDirs) {
      let r = row + dr;
      let c = col + dc;
      while (this.isValidCoord(r, c)) {
        const piece = board[r][c];
        if (piece) {
          if (piece.color === byColor && (piece.type === 'ROOK' || piece.type === 'QUEEN')) {
            return true;
          }
          break; // Line blocked
        }
        r += dr;
        c += dc;
      }
    }

    // 5. Diagonals (Bishop, Queen)
    const diagonalDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (const [dr, dc] of diagonalDirs) {
      let r = row + dr;
      let c = col + dc;
      while (this.isValidCoord(r, c)) {
        const piece = board[r][c];
        if (piece) {
          if (piece.color === byColor && (piece.type === 'BISHOP' || piece.type === 'QUEEN')) {
            return true;
          }
          break; // Line blocked
        }
        r += dr;
        c += dc;
      }
    }

    return false;
  }

  // Is King currently in check?
  public static isKingInCheck(board: (Piece | null)[][], color: PieceColor): boolean {
    const kingPos = this.findKing(board, color);
    if (!kingPos) return false;
    const opponentColor = color === 'WHITE' ? 'BLACK' : 'WHITE';
    return this.isSquareAttacked(board, kingPos.row, kingPos.col, opponentColor);
  }

  // Generate pseudo-legal moves (not checking if King is left in check)
  public static generatePseudoLegalMoves(state: BoardState): Move[] {
    const moves: Move[] = [];
    const color = state.currentTurn;
    const opponentColor = color === 'WHITE' ? 'BLACK' : 'WHITE';
    const board = state.board;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (!piece || piece.color !== color) continue;

        switch (piece.type) {
          case 'PAWN': {
            const forward = color === 'WHITE' ? -1 : 1;
            const startRow = color === 'WHITE' ? 6 : 1;
            const promoRow = color === 'WHITE' ? 0 : 7;

            // Single forward step
            const nextR = r + forward;
            if (this.isValidCoord(nextR, c) && !board[nextR][c]) {
              if (nextR === promoRow) {
                for (const promo of ['QUEEN', 'ROOK', 'BISHOP', 'KNIGHT'] as PieceType[]) {
                  moves.push({ fromRow: r, fromCol: c, toRow: nextR, toCol: c, promotionType: promo });
                }
              } else {
                moves.push({ fromRow: r, fromCol: c, toRow: nextR, toCol: c });
              }

              // Double step from start row
              const doubleR = r + forward * 2;
              if (r === startRow && !board[doubleR][c]) {
                moves.push({ fromRow: r, fromCol: c, toRow: doubleR, toCol: c });
              }
            }

            // Diagonal captures & En Passant
            for (const dc of [-1, 1]) {
              const diagC = c + dc;
              if (this.isValidCoord(nextR, diagC)) {
                const target = board[nextR][diagC];
                if (target && target.color === opponentColor) {
                  if (nextR === promoRow) {
                    for (const promo of ['QUEEN', 'ROOK', 'BISHOP', 'KNIGHT'] as PieceType[]) {
                      moves.push({ fromRow: r, fromCol: c, toRow: nextR, toCol: diagC, promotionType: promo, capturedPiece: target });
                    }
                  } else {
                    moves.push({ fromRow: r, fromCol: c, toRow: nextR, toCol: diagC, capturedPiece: target });
                  }
                } else if (
                  state.enPassantTarget &&
                  state.enPassantTarget.row === nextR &&
                  state.enPassantTarget.col === diagC
                ) {
                  // En passant capture
                  const capturedPawn = board[r][diagC];
                  moves.push({
                    fromRow: r,
                    fromCol: c,
                    toRow: nextR,
                    toCol: diagC,
                    isEnPassant: true,
                    capturedPiece: capturedPawn,
                  });
                }
              }
            }
            break;
          }

          case 'KNIGHT': {
            const knightOffsets = [
              [-2, -1], [-2, 1], [-1, -2], [-1, 2],
              [1, -2], [1, 2], [2, -1], [2, 1]
            ];
            for (const [dr, dc] of knightOffsets) {
              const nr = r + dr;
              const nc = c + dc;
              if (this.isValidCoord(nr, nc)) {
                const target = board[nr][nc];
                if (!target || target.color === opponentColor) {
                  moves.push({ fromRow: r, fromCol: c, toRow: nr, toCol: nc, capturedPiece: target });
                }
              }
            }
            break;
          }

          case 'BISHOP': {
            const dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
            for (const [dr, dc] of dirs) {
              let nr = r + dr;
              let nc = c + dc;
              while (this.isValidCoord(nr, nc)) {
                const target = board[nr][nc];
                if (!target) {
                  moves.push({ fromRow: r, fromCol: c, toRow: nr, toCol: nc });
                } else {
                  if (target.color === opponentColor) {
                    moves.push({ fromRow: r, fromCol: c, toRow: nr, toCol: nc, capturedPiece: target });
                  }
                  break;
                }
                nr += dr;
                nc += dc;
              }
            }
            break;
          }

          case 'ROOK': {
            const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            for (const [dr, dc] of dirs) {
              let nr = r + dr;
              let nc = c + dc;
              while (this.isValidCoord(nr, nc)) {
                const target = board[nr][nc];
                if (!target) {
                  moves.push({ fromRow: r, fromCol: c, toRow: nr, toCol: nc });
                } else {
                  if (target.color === opponentColor) {
                    moves.push({ fromRow: r, fromCol: c, toRow: nr, toCol: nc, capturedPiece: target });
                  }
                  break;
                }
                nr += dr;
                nc += dc;
              }
            }
            break;
          }

          case 'QUEEN': {
            const dirs = [
              [-1, 0], [1, 0], [0, -1], [0, 1],
              [-1, -1], [-1, 1], [1, -1], [1, 1]
            ];
            for (const [dr, dc] of dirs) {
              let nr = r + dr;
              let nc = c + dc;
              while (this.isValidCoord(nr, nc)) {
                const target = board[nr][nc];
                if (!target) {
                  moves.push({ fromRow: r, fromCol: c, toRow: nr, toCol: nc });
                } else {
                  if (target.color === opponentColor) {
                    moves.push({ fromRow: r, fromCol: c, toRow: nr, toCol: nc, capturedPiece: target });
                  }
                  break;
                }
                nr += dr;
                nc += dc;
              }
            }
            break;
          }

          case 'KING': {
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = r + dr;
                const nc = c + dc;
                if (this.isValidCoord(nr, nc)) {
                  const target = board[nr][nc];
                  if (!target || target.color === opponentColor) {
                    moves.push({ fromRow: r, fromCol: c, toRow: nr, toCol: nc, capturedPiece: target });
                  }
                }
              }
            }

            // Castling checks
            const isWhite = color === 'WHITE';
            const kingRow = isWhite ? 7 : 0;
            if (r === kingRow && c === 4) {
              const inCheck = this.isSquareAttacked(board, kingRow, 4, opponentColor);
              if (!inCheck) {
                // Kingside Castling
                const canCastleKing = isWhite ? state.castlingRights.whiteKingSide : state.castlingRights.blackKingSide;
                if (
                  canCastleKing &&
                  !board[kingRow][5] &&
                  !board[kingRow][6] &&
                  board[kingRow][7]?.type === 'ROOK' &&
                  board[kingRow][7]?.color === color &&
                  !this.isSquareAttacked(board, kingRow, 5, opponentColor) &&
                  !this.isSquareAttacked(board, kingRow, 6, opponentColor)
                ) {
                  moves.push({ fromRow: kingRow, fromCol: 4, toRow: kingRow, toCol: 6, isCastling: true });
                }

                // Queenside Castling
                const canCastleQueen = isWhite ? state.castlingRights.whiteQueenSide : state.castlingRights.blackQueenSide;
                if (
                  canCastleQueen &&
                  !board[kingRow][3] &&
                  !board[kingRow][2] &&
                  !board[kingRow][1] &&
                  board[kingRow][0]?.type === 'ROOK' &&
                  board[kingRow][0]?.color === color &&
                  !this.isSquareAttacked(board, kingRow, 3, opponentColor) &&
                  !this.isSquareAttacked(board, kingRow, 2, opponentColor)
                ) {
                  moves.push({ fromRow: kingRow, fromCol: 4, toRow: kingRow, toCol: 2, isCastling: true });
                }
              }
            }
            break;
          }
        }
      }
    }

    return moves;
  }

  // Simulate a move on a shallow clone board and verify king safety
  public static testMoveSafety(state: BoardState, move: Move): boolean {
    const boardClone = state.board.map(row => [...row]);
    const movingPiece = boardClone[move.fromRow][move.fromCol];
    if (!movingPiece) return false;

    // Apply move
    boardClone[move.toRow][move.toCol] = move.promotionType
      ? { type: move.promotionType, color: movingPiece.color }
      : movingPiece;
    boardClone[move.fromRow][move.fromCol] = null;

    // Handle En Passant capture removal
    if (move.isEnPassant) {
      boardClone[move.fromRow][move.toCol] = null;
    }

    // Handle Castling rook move
    if (move.isCastling) {
      if (move.toCol === 6) {
        // Kingside
        const rook = boardClone[move.fromRow][7];
        boardClone[move.fromRow][5] = rook;
        boardClone[move.fromRow][7] = null;
      } else if (move.toCol === 2) {
        // Queenside
        const rook = boardClone[move.fromRow][0];
        boardClone[move.fromRow][3] = rook;
        boardClone[move.fromRow][0] = null;
      }
    }

    return !this.isKingInCheck(boardClone, state.currentTurn);
  }

  // Generate strictly legal moves
  public static generateLegalMoves(state: BoardState): Move[] {
    const pseudoMoves = this.generatePseudoLegalMoves(state);
    return pseudoMoves.filter(move => this.testMoveSafety(state, move));
  }
}
