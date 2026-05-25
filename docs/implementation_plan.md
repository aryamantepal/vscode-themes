# Implementation Plan — Starter.dev VS Code Extension

Create a gamified VS Code extension called **Starter.dev** that switches themes automatically as the user codes and gains XP, evolving their starter Pokémon from Froakie to Frogadier and Greninja.

## User Review Required

> [!IMPORTANT]
> The extension programmatically overrides the user's `workbench.colorTheme` setting. To ensure a smooth user experience, we will:
> 1. Store the user's original theme configuration *before* applying the Pokémon theme, allowing them to restore it when resetting or disabling the extension.
> 2. Implement a quick pick command `Starter.dev: Choose Starter` to opt-in, rather than forcing a theme switch upon installation.

> [!NOTE]
> The theme names registered in `package.json` must exactly match the theme IDs used programmatically for automatic switching.

## Open Questions

> [!NOTE]
> 1. **Default Theme Action**: When the user first installs the extension, should we keep their existing theme and only switch when they run `Choose Starter`? (Proposed: Yes, only switch after explicit choice).
> 2. **Theme UI Styles**: Should Froakie be a VS Code Light Theme, and Frogadier / Greninja be VS Code Dark Themes? (Proposed: Yes, as Froakie is light/soft blue, Frogadier is medium-dark, and Greninja is deep dark).
> 3. **Git Commit Fallback**: Should git tracking use the official `vscode.git` extension API? (Proposed: Yes, with a graceful try-catch fallback if git is disabled/unavailable).


## Proposed Changes

### Configuration and Workspace Files

#### [NEW] [package.json](file:///Users/aryamantepal/Desktop/vscode-theme/package.json)
- Define extension metadata, entry point (`dist/extension.js` or `out/src/extension.js`), activation events, configuration settings, and contributed themes.
- Contribute the following themes:
  - **Froakie Theme** (`Froakie`)
  - **Frogadier Theme** (`Frogadier`)
  - **Greninja Theme** (`Greninja`)
- Register commands:
  - `starter-dev.chooseStarter` -> `Starter.dev: Choose Starter`
  - `starter-dev.showProgress` -> `Starter.dev: Show Progress`
  - `starter-dev.forceEvolution` -> `Starter.dev: Force Evolution (Dev/Test)`
  - `starter-dev.resetProgress` -> `Starter.dev: Reset Progress`
- Set up scripts for compiling, testing, and watch mode using standard TypeScript compilation.
- Minimal dependency list: `typescript`, `@types/vscode`, `@types/node`.

#### [NEW] [tsconfig.json](file:///Users/aryamantepal/Desktop/vscode-theme/tsconfig.json)
- Strict TypeScript configuration targeting Node/VS Code environment. Set `outDir` to `"out"`.

---

### Storage Layer

#### [NEW] [state.ts](file:///Users/aryamantepal/Desktop/vscode-theme/src/storage/state.ts)
- Wrapper utilities around `vscode.ExtensionContext.globalState` to read/write:
  - Current starter (e.g. `'froakie' | null`)
  - Current XP (number)
  - Current evolution stage (0 = Froakie, 1 = Frogadier, 2 = Greninja)
  - Accumulated active coding seconds (number, to track progress toward the 30-minute +10 XP threshold)
  - Original theme (string, to revert back on reset)

---

### Themes Layer

#### [NEW] [froakie-color-theme.json](file:///Users/aryamantepal/Desktop/vscode-theme/themes/froakie-color-theme.json)
- Light, soft aquatic theme.
- Palette: pale blue, cyan, white backgrounds, clean syntax highlighting.

#### [NEW] [frogadier-color-theme.json](file:///Users/aryamantepal/Desktop/vscode-theme/themes/frogadier-color-theme.json)
- Dark, tactical, deep blue/cool gray theme.
- Palette: deep blue, indigo, slate gray, sharp syntax contrast.

#### [NEW] [greninja-color-theme.json](file:///Users/aryamantepal/Desktop/vscode-theme/themes/greninja-color-theme.json)
- Elite ninja dark theme.
- Palette: dark navy/almost black, neon blue/magenta accents, cyberpunk-inspired high contrast syntax.

---

### Core Logic & Commands

#### [NEW] [xp.ts](file:///Users/aryamantepal/Desktop/vscode-theme/src/progression/xp.ts)
- Utilities to add XP, check thresholds, and return evolution state.
- Thresholds:
  - Level 1 (Froakie): 0 XP
  - Level 2 (Frogadier): 100 XP
  - Level 3 (Greninja): 300 XP

#### [NEW] [evolution.ts](file:///Users/aryamantepal/Desktop/vscode-theme/src/progression/evolution.ts)
- Evolution logic to check if XP triggers evolution.
- Updates the stored stage and fires notifications/theme changes.

#### [NEW] [tracker.ts](file:///Users/aryamantepal/Desktop/vscode-theme/src/progression/tracker.ts)
- Set up event listeners:
  - `workspace.onDidSaveTextDocument`: Adds +1 XP.
  - Active time tracker: A 1-minute interval checking for user activity (typing, scrolling, selection changes). Accumulates active seconds. Adds +10 XP for every 30 minutes of active coding.
  - Git integration: Hooks into the `vscode.git` API. Listens to `repository.state.onDidChange` and detects HEAD commit hash changes. Adds +25 XP. Handles failures gracefully.

#### [NEW] [chooseStarter.ts](file:///Users/aryamantepal/Desktop/vscode-theme/src/commands/chooseStarter.ts)
- QuickPick selection interface for choosing a Pokémon starter (MVP features Froakie).
- Backs up original theme configuration and sets starter to Froakie, triggering initial theme application.

#### [NEW] [switchTheme.ts](file:///Users/aryamantepal/Desktop/vscode-theme/src/commands/switchTheme.ts)
- Programmatic application of the VS Code theme based on current evolution stage.

#### [NEW] [evolve.ts](file:///Users/aryamantepal/Desktop/vscode-theme/src/commands/evolve.ts)
- Dev helper to force evolution / add XP for testing purposes.

#### [NEW] [resetProgress.ts](file:///Users/aryamantepal/Desktop/vscode-theme/src/commands/resetProgress.ts)
- Resets XP, stage, active time, and restores the user's original theme.

#### [NEW] [showProgress.ts](file:///Users/aryamantepal/Desktop/vscode-theme/src/commands/showProgress.ts)
- Command to display detailed progress in a message dialog or a custom webview (simple modal dialog for MVP).

---

### UI Layer

#### [NEW] [statusBar.ts](file:///Users/aryamantepal/Desktop/vscode-theme/src/ui/statusBar.ts)
- Manage a live VS Code Status Bar Item:
  - E.g. `🐸 Froakie Lv.1 — 42/100 XP`
  - Updates in real-time when XP changes.

#### [NEW] [notifications.ts](file:///Users/aryamantepal/Desktop/vscode-theme/src/ui/notifications.ts)
- High-polish evolution notifications with action buttons.

#### [NEW] [extension.ts](file:///Users/aryamantepal/Desktop/vscode-theme/src/extension.ts)
- Main entry point: activates tracker, registers commands, initializes status bar, and checks if starter is already chosen.

---

### Documentation & Assets

#### [NEW] [README.md](file:///Users/aryamantepal/Desktop/vscode-theme/README.md)
- Complete user manual, installation, compilation, packaging, and publishing guide.

#### [NEW] [assets/icons/logo.svg](file:///Users/aryamantepal/Desktop/vscode-theme/assets/icons/logo.svg)
- Clean SVG extension icon.

---

## Verification Plan

### Automated Tests
- Since it's a VS Code Extension, we can verify that the extension compiles successfully:
  ```bash
  npm run compile
  ```
- Make sure typescript compilation completes with zero errors.

### Manual Verification
1. Launch the VS Code Extension Development Host (`F5`).
2. Run command `Starter.dev: Choose Starter` -> Select `Froakie`. Verify that the Froakie theme (light, soft blue) is applied immediately and status bar shows `🐸 Froakie Lv.1 — 0/100 XP`.
3. Save a document. Verify that status bar updates to `1/100 XP`.
4. Trigger `Starter.dev: Force Evolution (Dev/Test)` to add 100 XP. Verify:
   - Notification appears: `Your Froakie evolved into Frogadier!`
   - Theme changes to Frogadier (dark, deep blue/cool gray).
   - Status bar updates to `🌊 Frogadier Lv.2 — 100/300 XP`.
5. Trigger `Starter.dev: Force Evolution (Dev/Test)` again to reach 300 XP. Verify:
   - Notification: `Your Frogadier evolved into Greninja!`
   - Theme changes to Greninja (neon dark navy).
   - Status bar updates to `🥷 Greninja Lv.3 — 300 XP (MAX)`.
6. Run `Starter.dev: Reset Progress`. Verify:
   - The user's original theme is restored.
   - Status bar item is hidden or reset.
   - All state is wiped.
