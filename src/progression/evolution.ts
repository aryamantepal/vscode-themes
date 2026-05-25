import { ExtensionState } from '../storage/state';
import { getStageFromXp, getStageInfo } from './xp';
import { switchTheme } from '../commands/switchTheme';
import { updateStatusBar } from '../ui/statusBar';
import { showEvolutionNotification } from '../ui/notifications';
import { triggerDancePopup, updateGutterDecoration } from '../ui/overlaySprite';

const XP_DANCE_MILESTONES = new Set([10, 25, 50, 75]);

export async function addXp(amount: number, state: ExtensionState): Promise<void> {
  const starter = state.getStarter();
  if (!starter) return;

  const currentXp = state.getXp();
  const nextXp = currentXp + amount;
  await state.setXp(nextXp);

  const currentStage = state.getStage();
  const nextStage = getStageFromXp(nextXp);

  if (nextStage > currentStage) {
    await state.setStage(nextStage);
    const oldInfo = getStageInfo(currentStage);
    const newInfo = getStageInfo(nextStage);

    await switchTheme(newInfo.themeName);
    showEvolutionNotification(oldInfo.name, newInfo.name);

    // Trigger evolution flash animation in companion
    const { getCompanionProvider } = require('../ui/companionView');
    getCompanionProvider()?.triggerEvolution?.();
  }

  updateStatusBar(state);

  const { getCompanionProvider } = require('../ui/companionView');
  getCompanionProvider()?.update();

  // Update gutter sprite for new stage
  updateGutterDecoration(state);

  // Dance on milestone XP amounts (e.g. first commit, 30-min session)
  if (XP_DANCE_MILESTONES.has(nextXp) || amount >= 25) {
    triggerDancePopup(state);
    getCompanionProvider()?.triggerDance?.();
  }
}
