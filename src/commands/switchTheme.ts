import * as vscode from 'vscode';

/**
 * Updates the global VS Code color theme setting to the target theme ID.
 */
export async function switchTheme(themeId: string): Promise<void> {
  try {
    const config = vscode.workspace.getConfiguration();
    await config.update(
      'workbench.colorTheme',
      themeId,
      vscode.ConfigurationTarget.Global
    );
  } catch (err) {
    console.error(`Starter.dev: Failed to apply theme '${themeId}':`, err);
  }
}
