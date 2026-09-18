import { BoardState, CastlingRights, GameResult, Move, Piece, PieceColor, PieceType, Position } from './types';
import { MoveGenerator } from './MoveGenerator';

export class ChessEngine {
  public static createInitialBoard(): (Piece | null)[][] {
    const board: (Piece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));

    // Black pieces (row 0 and 1)
    const backRankBlack: PieceType[] = ['ROOK', 'KNIGHT', 'BISHOP', 'QUEEN', 'KING', 'BISHOP', 'KNIGHT', 'ROOK'];
    for (let c = 0; c < 8; c++) {
      board[0][c] = { type: backRankBlack[c], color: 'BLACK' };
      board[1][c] = { type: 'PAWN', color: 'BLACK' };
    }

    // White pieces (row 6 and 7)
    const backRankWhite: PieceType[] = ['ROOK', 'KNIGHT', 'BISHOP', 'QUEEN', 'KING', 'BISHOP', 'KNIGHT', 'ROOK'];
    for (let c = 0; c < 8; c++) {
      board[6][c] = { type: 'PAWN', color: 'WHITE' };
      board[7][c] = { type: backRankWhite[c], color: 'WHITE' };
    }

    return board;
  }

  public static createInitialState(): BoardState {
    return {
      board: this.createInitialBoard(),
      currentTurn: 'WHITE',
      castlingRights: {
        whiteKingSide: true,
        whiteQueenSide: true,
        blackKingSide: true,
        blackQueenSide: true,
      },
      enPassantTarget: null,
      halfMoveClock: 0,
      fullMoveNumber: 1,
      lastMove: null,
      isInCheck: false,
    };
  }

  // Clone a board matrix
  public static cloneBoard(board: (Piece | null)[][]): (Piece | null)[][] {
    return board.map(row => row.map(cell => (cell ? { ...cell } : null)));
  }

  // Clone entire board state
  public static cloneState(state: BoardState): BoardState {
    return {
      board: this.cloneBoard(state.board),
      currentTurn: state.currentTurn,
      castlingRights: { ...state.castlingRights },
      enPassantTarget: state.enPassantTarget ? { ...state.enPassantTarget } : null,
      halfMoveClock: state.halfMoveClock,
      fullMoveNumber: state.fullMoveNumber,
      lastMove: state.lastMove ? { ...state.lastMove } : null,
      isInCheck: state.isInCheck,
    };
  }

  // Check for insufficient material draw
  public static hasInsufficientMaterial(board: (Piece | null)[][]): boolean {
    const pieces: { piece: Piece; row: number; col: number }[] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p) pieces.push({ piece: p, row: r, col: c });
      }
    }

    // 1. King vs King
    if (pieces.length === 2) return true;

    // 2. King + Minor vs King
    if (pieces.length === 3) {
      return pieces.some(p => p.piece.type === 'KNIGHT' || p.piece.type === 'BISHOP');
    }

    // 3. King + Bishop vs King + Bishop on same color squares
    if (pieces.length === 4) {
      const whiteBishops = pieces.filter(p => p.piece.color === 'WHITE' && p.piece.type === 'BISHOP');
      const blackBishops = pieces.filter(p => p.piece.color === 'BLACK' && p.piece.type === 'BISHOP');
      if (whiteBishops.length === 1 && blackBishops.length === 1) {
        const whiteSquareColor = (whiteBishops[0].row + whiteBishops[0].col) % 2;
        const blackSquareColor = (blackBishops[0].row + blackBishops[0].col) % 2;
        return whiteSquareColor === blackSquareColor;
      }
    }

    return false;
  }

  // Apply a legal move and return the updated state along with any game over result
  public static makeMove(state: BoardState, move: Move): { newState: BoardState; result?: GameResult } {
    const newState = this.cloneState(state);
    const movingPiece = newState.board[move.fromRow][move.fromCol];
    if (!movingPiece) {
      return { newState };
    }

    const isWhite = movingPiece.color === 'WHITE';
    const isPawnMove = movingPiece.type === 'PAWN';
    const isCapture = !!newState.board[move.toRow][move.toCol] || !!move.isEnPassant;

    // 1. Execute move on the board
    const placedPiece: Piece = move.promotionType
      ? { type: move.promotionType, color: movingPiece.color }
      : { ...movingPiece };

    newState.board[move.toRow][move.toCol] = placedPiece;
    newState.board[move.fromRow][move.fromCol] = null;

    // Handle En Passant pawn removal
    if (move.isEnPassant) {
      newState.board[move.fromRow][move.toCol] = null;
    }

    // Handle Castling rook movement
    if (move.isCastling) {
      if (move.toCol === 6) {
        // Kingside: rook moves from col 7 to col 5
        const rook = newState.board[move.fromRow][7];
        newState.board[move.fromRow][5] = rook;
        newState.board[move.fromRow][7] = null;
      } else if (move.toCol === 2) {
        // Queenside: rook moves from col 0 to col 3
        const rook = newState.board[move.fromRow][0];
        newState.board[move.fromRow][3] = rook;
        newState.board[move.fromRow][0] = null;
      }
    }

    // 2. Update Castling Rights
    if (movingPiece.type === 'KING') {
      if (isWhite) {
        newState.castlingRights.whiteKingSide = false;
        newState.castlingRights.whiteQueenSide = false;
      } else {
        newState.castlingRights.blackKingSide = false;
        newState.castlingRights.blackQueenSide = false;
      }
    } else if (movingPiece.type === 'ROOK') {
      if (isWhite) {
        if (move.fromRow === 7 && move.fromCol === 7) newState.castlingRights.whiteKingSide = false;
        if (move.fromRow === 7 && move.fromCol === 0) newState.castlingRights.whiteQueenSide = false;
      } else {
        if (move.fromRow === 0 && move.fromCol === 7) newState.castlingRights.blackKingSide = false;
        if (move.fromRow === 0 && move.fromCol === 0) newState.castlingRights.blackQueenSide = false;
      }
    }

    // If opponent rook is captured in initial corner, forfeit castling
    if (move.toRow === 7 && move.toCol === 7) newState.castlingRights.whiteKingSide = false;
    if (move.toRow === 7 && move.toCol === 0) newState.castlingRights.whiteQueenSide = false;
    if (move.toRow === 0 && move.toCol === 7) newState.castlingRights.blackKingSide = false;
    if (move.toRow === 0 && move.toCol === 0) newState.castlingRights.blackQueenSide = false;

    // 3. Update En Passant Target
    if (isPawnMove && Math.abs(move.toRow - move.fromRow) === 2) {
      const midRow = (move.fromRow + move.toRow) / 2;
      newState.enPassantTarget = { row: midRow, col: move.fromCol };
    } else {
      newState.enPassantTarget = null;
    }

    // 4. Update Halfmove Clock (50-move rule)
    if (isPawnMove || isCapture) {
      newState.halfMoveClock = 0;
    } else {
      newState.halfMoveClock += 1;
    }

    // 5. Update Fullmove Counter
    if (!isWhite) {
      newState.fullMoveNumber += 1;
    }

    // 6. Switch Turn
    const nextTurn: PieceColor = isWhite ? 'BLACK' : 'WHITE';
    newState.currentTurn = nextTurn;
    newState.lastMove = move;

    // 7. Check if the opponent king is in check
    const inCheck = MoveGenerator.isKingInCheck(newState.board, nextTurn);
    newState.isInCheck = inCheck;

    // 8. Determine Game Status & Results
    const legalMoves = MoveGenerator.generateLegalMoves(newState);

    if (legalMoves.length === 0) {
      if (inCheck) {
        return {
          newState,
          result: {
            status: 'CHECKMATE',
            winner: movingPiece.color,
            reason: `¡Jaque Mate! Victoria para las ${movingPiece.color === 'WHITE' ? 'Blancas' : 'Negras'}.`,
          },
        };
      } else {
        return {
          newState,
          result: {
            status: 'STALEMATE',
            winner: 'DRAW',
            reason: 'Tablas por Rey Ahogado (Stalemate).',
          },
        };
      }
    }

    if (newState.halfMoveClock >= 100) {
      return {
        newState,
        result: {
          status: 'DRAW_50_MOVES',
          winner: 'DRAW',
          reason: 'Tablas por la regla de los 50 movimientos.',
        },
      };
    }

    if (this.hasInsufficientMaterial(newState.board)) {
      return {
        newState,
        result: {
          status: 'DRAW_INSUFFICIENT',
          winner: 'DRAW',
          reason: 'Tablas por material insuficiente para dar mate.',
        },
      };
    }

    if (inCheck) {
      return {
        newState,
        result: {
          status: 'CHECK',
          reason: `¡Jaque al Rey ${nextTurn === 'WHITE' ? 'Blanco' : 'Negro'}!`,
        },
      };
    }

    return { newState };
  }

  // Convert board state to FEN string
  public static boardToFen(state: BoardState): string {
    const pieceToChar: Record<PieceType, string> = {
      PAWN: 'p',
      KNIGHT: 'n',
      BISHOP: 'b',
      ROOK: 'r',
      QUEEN: 'q',
      KING: 'k',
    };

    const fenRows: string[] = [];
    for (let r = 0; r < 8; r++) {
      let emptyCount = 0;
      let rowStr = '';
      for (let c = 0; c < 8; c++) {
        const piece = state.board[r][c];
        if (!piece) {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            rowStr += emptyCount;
            emptyCount = 0;
          }
          const ch = pieceToChar[piece.type];
          rowStr += piece.color === 'WHITE' ? ch.toUpperCase() : ch.toLowerCase();
        }
      }
      if (emptyCount > 0) rowStr += emptyCount;
      fenRows.push(rowStr);
    }

    const turn = state.currentTurn === 'WHITE' ? 'w' : 'b';

    let castling = '';
    if (state.castlingRights.whiteKingSide) castling += 'K';
    if (state.castlingRights.whiteQueenSide) castling += 'Q';
    if (state.castlingRights.blackKingSide) castling += 'k';
    if (state.castlingRights.blackQueenSide) castling += 'q';
    if (!castling) castling = '-';

    let ep = '-';
    if (state.enPassantTarget) {
      const colChar = String.fromCharCode('a'.charCodeAt(0) + state.enPassantTarget.col);
      const rowNum = 8 - state.enPassantTarget.row;
      ep = `${colChar}${rowNum}`;
    }

    return `${fenRows.join('/')} ${turn} ${castling} ${ep} ${state.halfMoveClock} ${state.fullMoveNumber}`;
  }

  // Parse FEN string to BoardState
  public static fenToBoard(fen: string): BoardState {
    const parts = fen.trim().split(/\s+/);
    const boardStr = parts[0] || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
    const turnStr = parts[1] || 'w';
    const castlingStr = parts[2] || 'KQkq';
    const epStr = parts[3] || '-';
    const halfMoveStr = parts[4] || '0';
    const fullMoveStr = parts[5] || '1';

    const board: (Piece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
    const rows = boardStr.split('/');

    const charToPiece: Record<string, { type: PieceType; color: PieceColor }> = {
      p: { type: 'PAWN', color: 'BLACK' },
      n: { type: 'KNIGHT', color: 'BLACK' },
      b: { type: 'BISHOP', color: 'BLACK' },
      r: { type: 'ROOK', color: 'BLACK' },
      q: { type: 'QUEEN', color: 'BLACK' },
      k: { type: 'KING', color: 'BLACK' },
      P: { type: 'PAWN', color: 'WHITE' },
      N: { type: 'KNIGHT', color: 'WHITE' },
      B: { type: 'BISHOP', color: 'WHITE' },
      R: { type: 'ROOK', color: 'WHITE' },
      Q: { type: 'QUEEN', color: 'WHITE' },
      K: { type: 'KING', color: 'WHITE' },
    };

    for (let r = 0; r < 8; r++) {
      const row = rows[r] || '';
      let c = 0;
      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char >= '1' && char <= '8') {
          c += parseInt(char, 10);
        } else if (charToPiece[char]) {
          board[r][c] = { ...charToPiece[char] };
          c++;
        }
      }
    }

    const currentTurn: PieceColor = turnStr === 'b' ? 'BLACK' : 'WHITE';
    const castlingRights: CastlingRights = {
      whiteKingSide: castlingStr.includes('K'),
      whiteQueenSide: castlingStr.includes('Q'),
      blackKingSide: castlingStr.includes('k'),
      blackQueenSide: castlingStr.includes('q'),
    };

    let enPassantTarget: Position | null = null;
    if (epStr !== '-' && epStr.length >= 2) {
      const col = epStr.charCodeAt(0) - 'a'.charCodeAt(0);
      const row = 8 - parseInt(epStr[1], 10);
      if (MoveGenerator.isValidCoord(row, col)) {
        enPassantTarget = { row, col };
      }
    }

    return {
      board,
      currentTurn,
      castlingRights,
      enPassantTarget,
      halfMoveClock: parseInt(halfMoveStr, 10) || 0,
      fullMoveNumber: parseInt(fullMoveStr, 10) || 1,
      lastMove: null,
      isInCheck: MoveGenerator.isKingInCheck(board, currentTurn),
    };
  }
}
