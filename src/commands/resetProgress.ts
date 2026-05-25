import * as vscode from 'vscode';
import { ExtensionState } from '../storage/state';
import { switchTheme } from './switchTheme';
import { updateStatusBar } from '../ui/statusBar';

/**
 * Resets progress, clears state, and restores the original theme.
 */
export async function resetProgress(state: ExtensionState): Promise<void> {
  const confirm = await vscode.window.showWarningMessage(
    'Are you sure you want to reset your Starter.dev progress? This will wipe all XP and restore your original theme.',
    'Yes, Reset Everything',
    'Cancel'
  );

  if (confirm !== 'Yes, Reset Everything') {
    return;
  }

  // Restore original theme if it exists
  const originalTheme = state.getOriginalTheme();
  if (originalTheme) {
    await switchTheme(originalTheme);
  }

  // Clear state
  await state.clear();

  // Hide status bar
  updateStatusBar(state);

  // Update companion view
  const { getCompanionProvider } = require('../ui/companionView');
  getCompanionProvider()?.update();

  vscode.window.showInformationMessage(
    '🔄 Starter.dev: Progress has been reset. Your original theme has been restored.'
  );
}
