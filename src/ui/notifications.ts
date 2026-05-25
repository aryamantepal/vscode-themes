import * as vscode from 'vscode';

/**
 * Shows a high-polish, celebratory notification when a Pokémon evolves.
 */
export function showEvolutionNotification(oldName: string, newName: string): void {
  const message = `🎉 What? Your ${oldName} is evolving! ... Congratulations! Your ${oldName} evolved into ${newName}! 🌟`;
  const actionButton = 'View Progress';

  vscode.window.showInformationMessage(message, actionButton).then((selection) => {
    if (selection === actionButton) {
      vscode.commands.executeCommand('starter-dev.showProgress');
    }
  });
}
