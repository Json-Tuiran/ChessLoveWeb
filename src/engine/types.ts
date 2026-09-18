// Core Chess Engine Types for ChessLove

export type PieceType = 'PAWN' | 'KNIGHT' | 'BISHOP' | 'ROOK' | 'QUEEN' | 'KING';

export type PieceColor = 'WHITE' | 'BLACK';

export interface Piece {
  type: PieceType;
  color: PieceColor;
}

export interface Position {
  row: number; // 0 to 7 (0 is row 8 for White, 7 is row 1)
  col: number; // 0 to 7 (a to h)
}

export interface Move {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  promotionType?: PieceType | null;
  isEnPassant?: boolean;
  isCastling?: boolean;
  capturedPiece?: Piece | null;
}

export interface CastlingRights {
  whiteKingSide: boolean;
  whiteQueenSide: boolean;
  blackKingSide: boolean;
  blackQueenSide: boolean;
}

export type GameStatus =
  | 'ACTIVE'
  | 'CHECK'
  | 'CHECKMATE'
  | 'STALEMATE'
  | 'DRAW_50_MOVES'
  | 'DRAW_INSUFFICIENT'
  | 'RESIGNED';

export interface GameResult {
  status: GameStatus;
  winner?: PieceColor | 'DRAW';
  reason?: string;
}

export interface BoardState {
  board: (Piece | null)[][]; // 8 rows x 8 cols
  currentTurn: PieceColor;
  castlingRights: CastlingRights;
  enPassantTarget: Position | null; // target square a pawn can move to when capturing en passant
  halfMoveClock: number; // for 50-move rule
  fullMoveNumber: number;
  lastMove: Move | null;
  isInCheck: boolean;
}
