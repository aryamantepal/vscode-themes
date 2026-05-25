import * as vscode from 'vscode';
import { ExtensionState } from '../storage/state';
import { getStageInfo } from '../progression/xp';

/**
 * Shows progress details in a dialog box with shortcut options to other commands.
 */
export async function showProgress(state: ExtensionState): Promise<void> {
  const starter = state.getStarter();
  if (!starter) {
    const action = 'Choose Starter';
    const choice = await vscode.window.showInformationMessage(
      'Starter.dev: You have not chosen a starter Pokémon yet. Click below to begin!',
      action
    );

    if (choice === action) {
      await vscode.commands.executeCommand('starter-dev.chooseStarter');
    }
    return;
  }

  const xp = state.getXp();
  const stage = state.getStage();
  const info = getStageInfo(stage);
  const level = stage + 1;
  const activeMinutes = Math.floor(state.getActiveSeconds() / 60);

  let nextEvolutionText = '';
  if (info.nextThreshold !== null) {
    const xpNeeded = info.nextThreshold - xp;
    nextEvolutionText = `\n🌟 Next evolution in: ${xpNeeded} XP`;
  } else {
    nextEvolutionText = '\n🌟 Max Evolution Reached!';
  }

  const progressDetail =
    `🐾 Pokémon: ${info.emoji} ${info.name}\n` +
    `📈 Current Level: ${level}\n` +
    `⚡ Total XP: ${xp}${nextEvolutionText}\n` +
    `⏱️ Active coding: ${activeMinutes} / 30 minutes (towards next +10 XP)`;

  const resetBtn = 'Reset Progress';
  const forceBtn = 'Force Evolution (Dev)';

  const selection = await vscode.window.showInformationMessage(
    progressDetail,
    { modal: true },
    resetBtn,
    forceBtn
  );

  if (selection === resetBtn) {
    await vscode.commands.executeCommand('starter-dev.resetProgress');
  } else if (selection === forceBtn) {
    await vscode.commands.executeCommand('starter-dev.forceEvolution');
  }
}
