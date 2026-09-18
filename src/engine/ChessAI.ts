import { BoardState, Move, Piece, PieceColor, PieceType } from './types';
import { ChessEngine } from './ChessEngine';
import { MoveGenerator } from './MoveGenerator';
import {
  BISHOP_TABLE,
  KING_MIDDLE_GAME_TABLE,
  KNIGHT_TABLE,
  PAWN_TABLE,
  PIECE_VALUES,
  QUEEN_TABLE,
  ROOK_TABLE,
} from './PieceSquareTables';

export type AIDifficulty = 'BEGINNER' | 'EASY' | 'MEDIUM';

export class ChessAI {
  // Positional evaluation of a piece on a given square
  private static getPiecePSTValue(piece: Piece, row: number, col: number): number {
    // If Black, flip row
    const r = piece.color === 'WHITE' ? row : 7 - row;
    const c = col;

    switch (piece.type) {
      case 'PAWN':
        return PAWN_TABLE[r][c];
      case 'KNIGHT':
        return KNIGHT_TABLE[r][c];
      case 'BISHOP':
        return BISHOP_TABLE[r][c];
      case 'ROOK':
        return ROOK_TABLE[r][c];
      case 'QUEEN':
        return QUEEN_TABLE[r][c];
      case 'KING':
        return KING_MIDDLE_GAME_TABLE[r][c];
      default:
        return 0;
    }
  }

  // Static board evaluation: positive is good for White, negative for Black
  public static evaluateBoard(board: (Piece | null)[][]): number {
    let score = 0;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece) {
          const materialVal = PIECE_VALUES[piece.type] || 0;
          const positionalVal = this.getPiecePSTValue(piece, r, c);
          const totalVal = materialVal + positionalVal;

          if (piece.color === 'WHITE') {
            score += totalVal;
          } else {
            score -= totalVal;
          }
        }
      }
    }

    return score;
  }

  // Move ordering: MVV-LVA (Most Valuable Victim - Least Valuable Attacker)
  private static orderMoves(moves: Move[], board: (Piece | null)[][]): Move[] {
    return [...moves].sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      const pieceA = board[a.fromRow][a.fromCol];
      const targetA = a.capturedPiece || board[a.toRow][a.toCol];
      if (targetA && pieceA) {
        scoreA = (PIECE_VALUES[targetA.type] || 0) * 10 - (PIECE_VALUES[pieceA.type] || 0);
      }
      if (a.promotionType) scoreA += 800;

      const pieceB = board[b.fromRow][b.fromCol];
      const targetB = b.capturedPiece || board[b.toRow][b.toCol];
      if (targetB && pieceB) {
        scoreB = (PIECE_VALUES[targetB.type] || 0) * 10 - (PIECE_VALUES[pieceB.type] || 0);
      }
      if (b.promotionType) scoreB += 800;

      return scoreB - scoreA;
    });
  }

  // Minimax with Alpha-Beta pruning
  private static alphaBeta(
    state: BoardState,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean
  ): number {
    if (depth === 0) {
      return this.evaluateBoard(state.board);
    }

    const legalMoves = MoveGenerator.generateLegalMoves(state);

    if (legalMoves.length === 0) {
      // Game over state
      if (state.isInCheck) {
        // If maximizing player (White) has no moves and is in check -> Black won
        return isMaximizing ? -100000 + (3 - depth) : 100000 - (3 - depth);
      }
      return 0; // Stalemate
    }

    const orderedMoves = this.orderMoves(legalMoves, state.board);

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of orderedMoves) {
        const { newState } = ChessEngine.makeMove(state, move);
        const evalScore = this.alphaBeta(newState, depth - 1, alpha, beta, false);
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of orderedMoves) {
        const { newState } = ChessEngine.makeMove(state, move);
        const evalScore = this.alphaBeta(newState, depth - 1, alpha, beta, true);
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  // Find best move for AI
  public static getBestMove(state: BoardState, difficulty: AIDifficulty = 'MEDIUM'): Move | null {
    const legalMoves = MoveGenerator.generateLegalMoves(state);
    if (legalMoves.length === 0) return null;

    const isMaximizing = state.currentTurn === 'WHITE';

    // 1. Beginner: 60% optimal move at depth 1, 40% casual move
    if (difficulty === 'BEGINNER') {
      if (Math.random() < 0.4) {
        // Choose non-suicidal random move
        const randomIndex = Math.floor(Math.random() * legalMoves.length);
        return legalMoves[randomIndex];
      }
      // Otherwise depth 1
      return this.searchBestMove(state, 1, isMaximizing);
    }

    // 2. Easy: Depth 1 with full tactful captures
    if (difficulty === 'EASY') {
      return this.searchBestMove(state, 1, isMaximizing);
    }

    // 3. Medium: Full Depth 3 Alpha-Beta with PST & MVV-LVA
    return this.searchBestMove(state, 3, isMaximizing);
  }

  // Search best move at given depth
  private static searchBestMove(state: BoardState, depth: number, isMaximizing: boolean): Move | null {
    const legalMoves = MoveGenerator.generateLegalMoves(state);
    if (legalMoves.length === 0) return null;

    const orderedMoves = this.orderMoves(legalMoves, state.board);
    let bestMove: Move | null = null;
    let bestScore = isMaximizing ? -Infinity : Infinity;

    let alpha = -Infinity;
    let beta = Infinity;

    for (const move of orderedMoves) {
      const { newState } = ChessEngine.makeMove(state, move);
      const score = this.alphaBeta(newState, depth - 1, alpha, beta, !isMaximizing);

      if (isMaximizing) {
        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
        alpha = Math.max(alpha, score);
      } else {
        if (score < bestScore) {
          bestScore = score;
          bestMove = move;
        }
        beta = Math.min(beta, score);
      }
    }

    return bestMove || orderedMoves[0];
  }

  // Tactical Hint Generator for the player
  public static getHint(state: BoardState): { move: Move; message: string } | null {
    const isMaximizing = state.currentTurn === 'WHITE';
    const bestMove = this.searchBestMove(state, 3, isMaximizing);
    if (!bestMove) return null;

    const piece = state.board[bestMove.fromRow][bestMove.fromCol];
    const targetPiece = state.board[bestMove.toRow][bestMove.toCol];

    let message = 'Una jugada estratégica para consolidar tu posición.';
    if (targetPiece) {
      message = `Captura con tu ${piece?.type.toLowerCase()} para ganar ventaja material.`;
    } else if (bestMove.isCastling) {
      message = '¡Enróquese! Protege a tu Rey y activa tu Torre.';
    } else if (piece?.type === 'KNIGHT') {
      message = 'Desplaza tu caballo hacia el centro para maximizar su radio táctico.';
    } else if (piece?.type === 'BISHOP') {
      message = 'Abre diagonales largas para dominar el tablero.';
    } else if (piece?.type === 'PAWN') {
      message = 'Avanza este peón para ganar espacio y presionar al rival.';
    }

    return { move: bestMove, message };
  }
}
