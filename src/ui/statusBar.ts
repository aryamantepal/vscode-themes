import * as vscode from 'vscode';
import { ExtensionState } from '../storage/state';
import { getStageInfo } from '../progression/xp';

let statusBarItem: vscode.StatusBarItem | undefined;

/**
 * Initializes the Status Bar Item and shows it if a starter is selected.
 */
export function initStatusBar(state: ExtensionState): void {
  if (!statusBarItem) {
    statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    statusBarItem.command = 'starter-dev.showProgress';
  }

  updateStatusBar(state);
}

/**
 * Updates the contents and visibility of the Status Bar Item.
 */
export function updateStatusBar(state: ExtensionState): void {
  if (!statusBarItem) {
    return;
  }

  const starter = state.getStarter();
  if (!starter) {
    statusBarItem.hide();
    return;
  }

  const xp = state.getXp();
  const stage = state.getStage();
  const info = getStageInfo(stage);
  const level = stage + 1;

  let xpText = '';
  if (info.nextThreshold !== null) {
    xpText = `${xp}/${info.nextThreshold} XP`;
  } else {
    xpText = `${xp} XP (MAX)`;
  }

  statusBarItem.text = `${info.emoji} ${info.name} Lv.${level} — ${xpText}`;
  statusBarItem.tooltip = `Starter.dev Pokémon Extension - Click to show full progress\nXP accumulated: ${xp}`;
  statusBarItem.show();
}

/**
 * Hides the Status Bar Item.
 */
export function hideStatusBar(): void {
  if (statusBarItem) {
    statusBarItem.hide();
  }
}

/**
 * Disposes the Status Bar Item.
 */
export function disposeStatusBar(): void {
  if (statusBarItem) {
    statusBarItem.dispose();
    statusBarItem = undefined;
  }
}
