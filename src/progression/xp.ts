import { EvolutionStage } from '../storage/state';

export interface StageInfo {
  stage: EvolutionStage;
  name: string;
  emoji: string;
  themeName: string;
  nextThreshold: number | null;
  prevThreshold: number;
}

export const STAGES: Record<EvolutionStage, StageInfo> = {
  0: {
    stage: 0,
    name: 'Froakie',
    emoji: '🐸',
    themeName: 'Froakie Theme',
    nextThreshold: 100,
    prevThreshold: 0
  },
  1: {
    stage: 1,
    name: 'Frogadier',
    emoji: '🌊',
    themeName: 'Frogadier Theme',
    nextThreshold: 300,
    prevThreshold: 100
  },
  2: {
    stage: 2,
    name: 'Greninja',
    emoji: '🥷',
    themeName: 'Greninja Theme',
    nextThreshold: null,
    prevThreshold: 300
  }
};

/**
 * Returns the correct evolution stage based on the given XP.
 */
export function getStageFromXp(xp: number): EvolutionStage {
  if (xp >= 300) {
    return 2;
  } else if (xp >= 100) {
    return 1;
  } else {
    return 0;
  }
}

/**
 * Helper to get the StageInfo for a given stage.
 */
export function getStageInfo(stage: EvolutionStage): StageInfo {
  return STAGES[stage];
}

/**
 * Helper to get the StageInfo for a given XP.
 */
export function getStageInfoFromXp(xp: number): StageInfo {
  return getStageInfo(getStageFromXp(xp));
}
