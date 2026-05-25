import { ExtensionState } from '../storage/state';
import { getStageFromXp, getStageInfo } from './xp';
import { switchTheme } from '../commands/switchTheme';
import { updateStatusBar } from '../ui/statusBar';
import { showEvolutionNotification } from '../ui/notifications';

/**
 * Adds XP to the user's progress and handles evolution if thresholds are crossed.
 */
export async function addXp(amount: number, state: ExtensionState): Promise<void> {
  const starter = state.getStarter();
  // Do not track XP if no starter is chosen
  if (!starter) {
    return;
  }

  const currentXp = state.getXp();
  const nextXp = currentXp + amount;
  await state.setXp(nextXp);

  const currentStage = state.getStage();
  const nextStage = getStageFromXp(nextXp);

  // If evolution threshold is crossed
  if (nextStage > currentStage) {
    await state.setStage(nextStage);
    const oldInfo = getStageInfo(currentStage);
    const newInfo = getStageInfo(nextStage);

    // Apply the new theme automatically
    await switchTheme(newInfo.themeName);

    // Show high-polish evolution notification
    showEvolutionNotification(oldInfo.name, newInfo.name);
  }

  // Update Status Bar
  updateStatusBar(state);

  // Update Companion View
  const { getCompanionProvider } = require('../ui/companionView');
  getCompanionProvider()?.update();
}
