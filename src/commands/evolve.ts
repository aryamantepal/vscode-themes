import * as vscode from 'vscode';
import { ExtensionState } from '../storage/state';
import { addXp } from '../progression/evolution';

/**
 * Developer helper command to manually add XP and force evolution.
 */
export async function forceEvolution(state: ExtensionState): Promise<void> {
  const starter = state.getStarter();
  if (!starter) {
    vscode.window.showErrorMessage(
      'Starter.dev: You need to choose a starter Pokémon first using the "Choose Starter" command.'
    );
    return;
  }

  const input = await vscode.window.showInputBox({
    prompt: 'Enter the amount of XP to add to your Pokémon:',
    placeHolder: 'e.g. 100',
    value: '100',
    validateInput: (value) => {
      const parsed = parseInt(value, 10);
      if (isNaN(parsed) || parsed <= 0) {
        return 'Please enter a valid positive number.';
      }
      return null;
    }
  });

  if (!input) {
    return;
  }

  const xpToAdd = parseInt(input, 10);
  await addXp(xpToAdd, state);
  vscode.window.showInformationMessage(
    `⚡ Manually added ${xpToAdd} XP to your Pokémon!`
  );
}
