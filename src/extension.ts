import * as vscode from 'vscode';
import { ExtensionState } from './storage/state';
import { chooseStarter } from './commands/chooseStarter';
import { showProgress } from './commands/showProgress';
import { forceEvolution } from './commands/evolve';
import { resetProgress } from './commands/resetProgress';
import { initStatusBar, disposeStatusBar } from './ui/statusBar';
import { initTracker, deactivateTracker } from './progression/tracker';
import { CompanionViewProvider } from './ui/companionView';
import { initOverlaySprite, disposeOverlaySprite } from './ui/overlaySprite';

export function activate(context: vscode.ExtensionContext) {
  console.log('Starter.dev: Pokémon Theme extension is now active!');

  const state = new ExtensionState(context);

  initStatusBar(state);
  initTracker(state);
  initOverlaySprite(state, context);

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

  const companionProvider = new CompanionViewProvider(state, context.extensionUri);
  const companionViewReg = vscode.window.registerWebviewViewProvider(
    CompanionViewProvider.viewType,
    companionProvider
  );

  context.subscriptions.push(
    chooseStarterCmd,
    showProgressCmd,
    forceEvolutionCmd,
    resetProgressCmd,
    companionViewReg
  );
}

export function deactivate() {
  console.log('Starter.dev: Deactivating extension...');
  deactivateTracker();
  disposeStatusBar();
  disposeOverlaySprite();
}
