// Couple Story, Chemistry Algorithm, and Memories Log Engine

export interface CoupleMemory {
  id: string;
  title: string;
  description: string;
  date: string;
  icon: string;
}

export interface CoupleStats {
  gamesPlayed: number;
  userWins: number;
  partnerWins: number;
  draws: number;
  userElo: number;
  partnerElo: number;
  longestGameMoves: number;
  currentStreakUser: number;
  maxStreakUser: number;
  startDate: string;
  memories: CoupleMemory[];
}

export class CoupleStoryEngine {
  private static STORAGE_KEY = 'chesslove_couple_story_v1';

  public static getStats(): CoupleStats {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }

    const initial: CoupleStats = {
      gamesPlayed: 0,
      userWins: 0,
      partnerWins: 0,
      draws: 0,
      userElo: 1000,
      partnerElo: 1000,
      longestGameMoves: 0,
      currentStreakUser: 0,
      maxStreakUser: 0,
      startDate: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
      memories: [
        {
          id: 'mem_genesis',
          title: 'El Reino Iniciado 🏰',
          description: 'El tablero de ChessLove se encendió para unir nuestras mentes y corazones en el arte del ajedrez.',
          date: new Date().toLocaleDateString('es-ES'),
          icon: '👑',
        },
      ],
    };

    this.saveStats(initial);
    return initial;
  }

  public static saveStats(stats: CoupleStats) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stats));
  }

  // Calculate Chemistry (70% - 100%)
  public static calculateChemistry(stats: CoupleStats): { percentage: number; label: string; badgeIcon: string } {
    let score = 75; // base romantic harmony

    // Activity bonus (+3% per game, max +15%)
    score += Math.min(15, stats.gamesPlayed * 3);

    // Parity bonus (+5% if competitive balance)
    const diff = Math.abs(stats.userWins - stats.partnerWins);
    if (stats.gamesPlayed >= 2 && diff <= 2) {
      score += 5;
    }

    // Harmony/Draw bonus (+5% if they shared a peaceful draw)
    if (stats.draws > 0) {
      score += 5;
    }

    // Cap between 70% and 100%
    const percentage = Math.max(70, Math.min(100, score));

    if (percentage >= 95) {
      return { percentage, label: 'Conexión Cósmica', badgeIcon: '🌟' };
    } else if (percentage >= 88) {
      return { percentage, label: 'Almas Gemelas', badgeIcon: '💖' };
    } else if (percentage >= 80) {
      return { percentage, label: 'Sintonía Táctica', badgeIcon: '⚡' };
    } else {
      return { percentage, label: 'Chispa Naciente', badgeIcon: '✨' };
    }
  }

  // Determine dynamic couple archetype
  public static getArchetype(stats: CoupleStats): { title: string; subtitle: string; icon: string } {
    if (stats.gamesPlayed === 0) {
      return {
        title: 'Almas Estratégicas',
        subtitle: 'Listos para escribir su primera crónica sobre las 64 casillas.',
        icon: '💫',
      };
    }

    const diff = Math.abs(stats.userWins - stats.partnerWins);

    if (stats.draws >= 2 || (stats.gamesPlayed >= 3 && stats.draws / stats.gamesPlayed >= 0.3)) {
      return {
        title: 'Pacto de Armonía 🕊️🤍',
        subtitle: 'Prefieren el dulce equilibrio de las tablas antes que coronar una victoria solitaria.',
        icon: '🕊️',
      };
    }

    if (diff <= 1 && stats.gamesPlayed >= 3) {
      return {
        title: 'Rivales Enamorados ⚔️❤️',
        subtitle: 'Cada partida es un duelo apasionado donde ninguno cede un solo peón por amor.',
        icon: '⚔️',
      };
    }

    if (diff >= 3) {
      return {
        title: 'Tutor y Musa Táctica 🎓✨',
        subtitle: 'Un vínculo maestro donde uno inspira combinaciones brillantes y el otro aprende con devoción.',
        icon: '🎓',
      };
    }

    return {
      title: 'Dúo Legendario 👑🌹',
      subtitle: 'Complicidad absoluta en cada movimiento y jaque.',
      icon: '🌹',
    };
  }

  // Record a completed game and unlock memories
  public static recordGame(
    winner: 'USER' | 'PARTNER' | 'DRAW',
    moveCount: number,
    newEloUser: number,
    newEloPartner: number
  ): CoupleStats {
    const stats = this.getStats();

    stats.gamesPlayed += 1;
    stats.userElo = newEloUser;
    stats.partnerElo = newEloPartner;

    if (moveCount > stats.longestGameMoves) {
      stats.longestGameMoves = moveCount;
    }

    if (winner === 'USER') {
      stats.userWins += 1;
      stats.currentStreakUser += 1;
      if (stats.currentStreakUser > stats.maxStreakUser) {
        stats.maxStreakUser = stats.currentStreakUser;
      }
    } else if (winner === 'PARTNER') {
      stats.partnerWins += 1;
      stats.currentStreakUser = 0;
    } else {
      stats.draws += 1;
      stats.currentStreakUser = 0;
    }

    // Memories Unlock Logic
    const hasMemory = (id: string) => stats.memories.some(m => m.id === id);
    const today = new Date().toLocaleDateString('es-ES');

    if (stats.gamesPlayed === 1 && !hasMemory('mem_first_game')) {
      stats.memories.push({
        id: 'mem_first_game',
        title: 'El Primer Choque de Reyes ⚔️',
        description: 'Nuestra primera batalla sobre el tablero. El inicio de una saga de partidas inolvidables.',
        date: today,
        icon: '⚔️',
      });
    }

    if (winner === 'DRAW' && !hasMemory('mem_first_draw')) {
      stats.memories.push({
        id: 'mem_first_draw',
        title: 'El Abrazo de las Tablas 🕊️',
        description: 'Ni vencedores ni vencidos; las fuerzas se igualaron en un abrazo armónico eterno.',
        date: today,
        icon: '🤍',
      });
    }

    if (moveCount >= 35 && !hasMemory('mem_epic_battle')) {
      stats.memories.push({
        id: 'mem_epic_battle',
        title: 'La Batalla Más Épica 🛡️🔥',
        description: `Un combate titánico de ${moveCount} jugadas donde el ingenio desafió al destino.`,
        date: today,
        icon: '🔥',
      });
    }

    if (stats.maxStreakUser >= 3 && !hasMemory('mem_flame_streak')) {
      stats.memories.push({
        id: 'mem_flame_streak',
        title: 'Llama Ardiente ✨',
        description: 'Una racha brillante de 3 victorias consecutivas demostrando maestría táctica.',
        date: today,
        icon: '⚡',
      });
    }

    this.saveStats(stats);
    return stats;
  }
}
