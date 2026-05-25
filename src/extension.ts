import * as vscode from 'vscode';
import { ExtensionState } from './storage/state';
import { chooseStarter } from './commands/chooseStarter';
import { showProgress } from './commands/showProgress';
import { forceEvolution } from './commands/evolve';
import { resetProgress } from './commands/resetProgress';
import { initStatusBar, disposeStatusBar } from './ui/statusBar';
import { initTracker, deactivateTracker } from './progression/tracker';

/**
 * Main activation function for the Starter.dev VS Code Extension.
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('Starter.dev: Pokémon Theme extension is now active!');

  const state = new ExtensionState(context);

  // 1. Initialize UI (Status Bar)
  initStatusBar(state);

  // 2. Initialize Tracker
  initTracker(state);

  // 3. Register Commands
  const chooseStarterCmd = vscode.commands.registerCommand(
    'starter-dev.chooseStarter',
    async () => {
      await chooseStarter(state);
    }
  );

  const showProgressCmd = vscode.commands.registerCommand(
    'starter-dev.showProgress',
    async () => {
      await showProgress(state);
    }
  );

  const forceEvolutionCmd = vscode.commands.registerCommand(
    'starter-dev.forceEvolution',
    async () => {
      await forceEvolution(state);
    }
  );

  const resetProgressCmd = vscode.commands.registerCommand(
    'starter-dev.resetProgress',
    async () => {
      await resetProgress(state);
    }
  );

  // Add commands to subscriptions so they clean up when deactivated
  context.subscriptions.push(
    chooseStarterCmd,
    showProgressCmd,
    forceEvolutionCmd,
    resetProgressCmd
  );
}

/**
 * Cleanup function on deactivation.
 */
export function deactivate() {
  console.log('Starter.dev: Deactivating extension...');
  deactivateTracker();
  disposeStatusBar();
}
