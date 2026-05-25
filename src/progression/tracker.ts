import * as vscode from 'vscode';
import { ExtensionState } from '../storage/state';
import { addXp } from './evolution';

let activeTimer: NodeJS.Timeout | undefined;
let lastActiveTime = Date.now();
const lastHeads = new Map<string, string>();
const disposables: vscode.Disposable[] = [];

/**
 * Initializes and starts all activity tracking.
 */
export function initTracker(state: ExtensionState): void {
  // 1. File Save Tracking (+1 XP)
  disposables.push(
    vscode.workspace.onDidSaveTextDocument(async () => {
      await addXp(1, state);
    })
  );

  // 2. Activity Detection (typing, cursor movement, switching files)
  const updateActivity = () => {
    lastActiveTime = Date.now();
  };

  disposables.push(
    vscode.workspace.onDidChangeTextDocument(updateActivity),
    vscode.window.onDidChangeTextEditorSelection(updateActivity),
    vscode.window.onDidChangeActiveTextEditor(updateActivity)
  );

  // 3. Active Coding Timer (checks every 60s, adds +10 XP for 30 mins)
  activeTimer = setInterval(async () => {
    // Check if starter chosen before recording time
    if (!state.getStarter()) {
      return;
    }

    const now = Date.now();
    const timeSinceLastActive = now - lastActiveTime;

    // If active in the last 60 seconds
    if (timeSinceLastActive < 60 * 1000) {
      let activeSeconds = state.getActiveSeconds();
      activeSeconds += 60;

      if (activeSeconds >= 1800) {
        // 30 minutes reached
        activeSeconds = 0;
        await addXp(10, state);
        vscode.window.showInformationMessage(
          '⚡ Nice work! You gained 10 XP for 30 minutes of active coding.'
        );
      }

      await state.setActiveSeconds(activeSeconds);
    }
  }, 60 * 1000);

  // 4. Git Commit Tracking (+25 XP)
  try {
    const gitExtension = vscode.extensions.getExtension<any>('vscode.git');
    if (gitExtension) {
      // Activate the Git extension if not already active
      if (!gitExtension.isActive) {
        gitExtension.activate().then(() => setupGitTracking(gitExtension.exports, state));
      } else {
        setupGitTracking(gitExtension.exports, state);
      }
    }
  } catch (err) {
    console.error('Starter.dev: Gracefully failed to initialize Git tracking:', err);
  }
}

/**
 * Sets up tracking listeners for VS Code's official Git extension.
 */
function setupGitTracking(gitApiExports: any, state: ExtensionState): void {
  try {
    if (!gitApiExports || typeof gitApiExports.getAPI !== 'function') {
      return;
    }
    const git = gitApiExports.getAPI(1);
    if (!git) {
      return;
    }

    // Monitor existing repositories
    git.repositories.forEach((repo: any) => {
      trackRepository(repo, state);
    });

    // Monitor new repositories as they open
    git.onDidOpenRepository((repo: any) => {
      trackRepository(repo, state);
    });
  } catch (err) {
    console.error('Starter.dev: Git API subscription error:', err);
  }
}

/**
 * Subscribes to changes in a repository state to detect new commits.
 */
function trackRepository(repo: any, state: ExtensionState): void {
  const repoPath = repo.rootUri.toString();

  // Cache the initial commit hash
  if (repo.state.HEAD?.commit) {
    lastHeads.set(repoPath, repo.state.HEAD.commit);
  }

  // Subscribe to changes
  repo.state.onDidChange(async () => {
    const currentCommit = repo.state.HEAD?.commit;
    const previousCommit = lastHeads.get(repoPath);

    if (currentCommit && currentCommit !== previousCommit) {
      lastHeads.set(repoPath, currentCommit);

      // Only reward XP if we already had a cached head (i.e. it's a new commit, not initial load)
      if (previousCommit !== undefined) {
        await addXp(25, state);
      }
    }
  });
}

/**
 * Clears timers and disposes of subscriptions.
 */
export function deactivateTracker(): void {
  if (activeTimer) {
    clearInterval(activeTimer);
    activeTimer = undefined;
  }
  disposables.forEach((d) => d.dispose());
  disposables.length = 0;
  lastHeads.clear();
}
