import { Move } from '../engine/types';

export interface Lesson {
  id: number;
  level: number;
  levelTitle: string;
  title: string;
  subtitle: string;
  storyIntro: string;
  initialFen: string;
  targetMove: {
    fromRow: number;
    fromCol: number;
    toRow: number;
    toCol: number;
    promotionType?: string;
  };
  explanationOnSuccess: string;
  hint: string;
}

export interface LevelCategory {
  level: number;
  title: string;
  description: string;
  icon: string;
  lessons: Lesson[];
}
