// Official Elo Rating Calculator with K=32 factor

export interface EloUpdateResult {
  newRatingA: number;
  newRatingB: number;
  deltaA: number;
  deltaB: number;
}

export class EloCalculator {
  private static readonly K_FACTOR = 32;

  /**
   * Calculates new Elo ratings after a game
   * @param ratingA Player A's current rating
   * @param ratingB Player B's current rating
   * @param scoreA 1.0 for A win, 0.5 for Draw, 0.0 for A loss
   */
  public static calculate(ratingA: number, ratingB: number, scoreA: number): EloUpdateResult {
    // Expected score for A
    const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
    // Expected score for B
    const expectedB = 1 - expectedA;

    const scoreB = 1 - scoreA;

    const deltaA = Math.round(this.K_FACTOR * (scoreA - expectedA));
    const deltaB = Math.round(this.K_FACTOR * (scoreB - expectedB));

    return {
      newRatingA: Math.max(100, ratingA + deltaA),
      newRatingB: Math.max(100, ratingB + deltaB),
      deltaA,
      deltaB,
    };
  }
}
