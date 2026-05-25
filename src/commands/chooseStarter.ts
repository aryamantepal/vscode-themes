import * as vscode from 'vscode';
import { ExtensionState } from '../storage/state';
import { getStageInfo } from '../progression/xp';
import { switchTheme } from './switchTheme';
import { initStatusBar } from '../ui/statusBar';

interface StarterQuickPickItem extends vscode.QuickPickItem {
  starterId: string;
}

/**
 * Handles selection of a starter Pokémon, backs up current theme,
 * sets initial state, and applies the first stage theme.
 */
export async function chooseStarter(state: ExtensionState): Promise<void> {
  const currentStarter = state.getStarter();

  if (currentStarter) {
    const response = await vscode.window.showWarningMessage(
      `You have already chosen ${getStageInfo(state.getStage()).name}. Do you want to switch or restart? This will reset your current progress.`,
      'Restart Progress',
      'Cancel'
    );

    if (response !== 'Restart Progress') {
      return;
    }

    // Reset progress first if they decided to restart
    await vscode.commands.executeCommand('starter-dev.resetProgress');
  }

  const items: StarterQuickPickItem[] = [
    {
      label: '🐸 Froakie',
      description: 'Water Type Starter',
      detail: 'Evolves into Frogadier (Lv.2) and Greninja (Lv.3). Soft light-blue aquatic theme.',
      starterId: 'froakie'
    }
    // Expandable in the future for Bulbasaur, Charmander, etc.
  ];

  const selection = await vscode.window.showQuickPick(items, {
    placeHolder: 'Choose your Starter Pokémon!',
    title: 'Starter.dev — Choose Starter'
  });

  if (!selection) {
    return;
  }

  // Backup current theme
  const config = vscode.workspace.getConfiguration();
  const currentTheme = config.get<string>('workbench.colorTheme');
  if (currentTheme && currentTheme !== 'Froakie Theme' && currentTheme !== 'Frogadier Theme' && currentTheme !== 'Greninja Theme') {
    await state.setOriginalTheme(currentTheme);
  }

  // Set initial state
  await state.setStarter(selection.starterId);
  await state.setStage(0);
  await state.setXp(0);
  await state.setActiveSeconds(0);

  // Apply Froakie theme
  const info = getStageInfo(0);
  await switchTheme(info.themeName);

  // Initialize status bar
  initStatusBar(state);

  // Update companion view
  const { getCompanionProvider } = require('../ui/companionView');
  getCompanionProvider()?.update();

  vscode.window.showInformationMessage(
    `💧 You chose ${selection.label}! Let the coding adventures begin. Watch your status bar and code to gain XP!`
  );
}
