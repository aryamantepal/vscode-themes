# Starter.dev — Pokémon VS Code Theme Extension 🐸🌊🥷

**Starter.dev** is a gamified VS Code theme extension that lets you choose a starter Pokémon and evolve your editor's aesthetic over time as you write code and gain XP!

---

## 🎮 Core Features

*   **Starter Selection**: Run `Starter.dev: Choose Starter` to select **Froakie** as your starter!
*   **XP System**: Gain XP automatically through your normal coding workflow:
    *   **File Save**: `+1 XP`
    *   **30 Minutes of Active Coding**: `+10 XP`
    *   **Git Commit**: `+25 XP` (Integrated with VS Code Git extension, automatically detects CLI or UI commits!)
*   **Dynamic Theme Evolution**:
    *   **Froakie Theme** (Level 1, 0 XP): Light, clean, energetic blue/cyan theme.
    *   **Frogadier Theme** (Level 2, 100 XP): Focus-oriented, medium-dark, tactical blue/indigo theme.
    *   **Greninja Theme** (Level 3, 300 XP): Sleek cyberpunk-inspired neon-magenta and dark-navy dark theme.
*   **Status Bar UI**: A live status bar item displaying your current evolution stage, level, and XP progress.
*   **Progress Dashboard**: Click the status bar item or run `Starter.dev: Show Progress` to view a detailed breakdown of your Pokémon's stats!

---

## 🛠️ Setup & Running Locally

Follow these instructions to run the extension in development mode.

### 1. Install Dependencies

Open the project directory in your terminal and install npm dependencies:

```bash
npm install
```

### 2. Compile the Extension

Compile the TypeScript source files to JavaScript:

```bash
npm run compile
```

Alternatively, you can run the compiler in watch mode to rebuild automatically on changes:

```bash
npm run watch
```

### 3. Launch Development Host

1. Open this project folder in VS Code.
2. Press `F5` (or click `Run and Debug` in the sidebar and click the play button).
3. This opens a new window: **[Extension Development Host]**.

### 4. Choose Your Starter

In the **[Extension Development Host]** window:
1. Open the Command Palette (`Cmd+Shift+P` on Mac, `Ctrl+Shift+P` on Windows/Linux).
2. Type and run:
   ```text
   Starter.dev: Choose Starter
   ```
3. Select **Froakie**. Your theme will immediately change to the Froakie Theme, and your status bar will show:
   `🐸 Froakie Lv.1 — 0/100 XP`

---

## 📦 Packaging & Publishing

To distribute your extension or publish it to the VS Code Marketplace, follow these steps.

### Prerequisites

Install the `vsce` (Visual Studio Code Extensions) CLI utility globally:

```bash
npm install -g @vscode/vsce
```

### 1. Compile the Extension
Always ensure the extension is fully compiled before packaging:

```bash
npm run compile
```

### 2. Package as VSIX
Package the extension into a installable `.vsix` file:

```bash
vsce package
```

This will generate a file named `starter-dev-0.1.0.vsix` in your root directory. Anyone can install this locally in their VS Code by running:

```bash
code --install-extension starter-dev-0.1.0.vsix
```

### 3. Publish to VS Code Marketplace

1. Create a publisher account on the [Visual Studio Marketplace](https://marketplace.visualstudio.com/).
2. Obtain a Personal Access Token (PAT) from Azure DevOps with `All accessible organizations` and `Marketplace (Publish)` scopes.
3. Login using the CLI:
   ```bash
   vsce login <publisher-id>
   ```
4. Publish the extension:
   ```bash
   vsce publish
   ```

---

## 🧪 Manual Testing & Commands

*   **`Starter.dev: Choose Starter`**: Begins your journey or lets you reset/restart.
*   **`Starter.dev: Show Progress`**: Shows modal dialogue containing current level, XP, and active coding stats.
*   **`Starter.dev: Reset Progress`**: Resets all XP and active timers, and restores your VS Code theme back to what it was originally.
*   **`Starter.dev: Force Evolution (Dev/Test)`**: Manually add any amount of XP (e.g., +100 XP) to quickly preview evolutions and theme changes.
