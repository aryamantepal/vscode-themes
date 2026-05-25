````md
# Starter.dev — Pokémon VS Code Theme Extension

## Overview

You are building a gamified VS Code extension called **Starter.dev**.

The extension allows users to choose a Pokémon starter theme and evolve their IDE aesthetic over time as they code.

This MVP focuses ONLY on:

- Froakie → Frogadier → Greninja
- Dynamic theme switching
- Local progression tracking
- XP + evolution system
- VS Code extension architecture

The extension should feel polished, modular, and expandable.

---

# Core User Experience

## Flow

1. User installs extension
2. User opens Command Palette
3. User runs:

```text
Starter.dev: Choose Starter
````

4. User selects:

   * Froakie

5. Extension:

   * activates Froakie theme
   * begins tracking activity
   * displays XP in status bar

6. User gains XP from coding activity

7. Pokémon evolves automatically:

   * Froakie → Frogadier
   * Frogadier → Greninja

8. Theme updates automatically upon evolution

---

# Technical Stack

* TypeScript
* VS Code Extension API
* Node.js
* JSON theme files
* Local extension storage
* No backend
* No authentication
* No database

---

# Engineering Principles

## IMPORTANT

* Keep architecture modular
* Use strict TypeScript
* Add comments
* Avoid unnecessary dependencies
* Prioritize readability
* Build working MVP first
* Make extension easy to expand later

Future expansions may include:

* Charmander line
* Bulbasaur line
* achievements
* cloud sync
* multiplayer
* profile system
* dashboard UI

---

# Project Structure

Generate this structure:

```text
starter-dev/
├── package.json
├── tsconfig.json
├── README.md
│
├── src/
│   ├── extension.ts
│   │
│   ├── commands/
│   │   ├── chooseStarter.ts
│   │   ├── evolve.ts
│   │   ├── switchTheme.ts
│   │   ├── resetProgress.ts
│   │   └── showProgress.ts
│   │
│   ├── progression/
│   │   ├── tracker.ts
│   │   ├── xp.ts
│   │   └── evolution.ts
│   │
│   ├── storage/
│   │   └── state.ts
│   │
│   └── ui/
│       ├── statusBar.ts
│       └── notifications.ts
│
├── themes/
│   ├── froakie-color-theme.json
│   ├── frogadier-color-theme.json
│   └── greninja-color-theme.json
│
└── assets/
    ├── icons/
    └── pokemon/
```

---

# Required Features

## 1. Starter Selection

Implement command:

```text
starter-dev.chooseStarter
```

Behavior:

* Opens quick pick menu
* User selects Froakie
* Stores starter selection locally
* Applies Froakie theme immediately

Use:

```ts
vscode.window.showQuickPick()
```

Persist using:

```ts
context.globalState
```

---

# 2. Theme Switching

Implement automatic theme switching.

Use:

```ts
workbench.colorTheme
```

Themes:

* Froakie Theme
* Frogadier Theme
* Greninja Theme

Evolution should automatically switch themes.

Also create:

```text
starter-dev.forceEvolution
```

for manual testing.

---

# 3. XP System

Implement local XP progression.

## XP Sources

| Action                   | XP  |
| ------------------------ | --- |
| File Save                | +1  |
| 30 Minutes Active Coding | +10 |
| Git Commit               | +25 |

Persist XP locally.

---

# 4. Evolution System

## Evolution Thresholds

| Evolution            | XP     |
| -------------------- | ------ |
| Froakie → Frogadier  | 100 XP |
| Frogadier → Greninja | 300 XP |

Behavior:

* Detect threshold crossing
* Trigger notification
* Switch theme automatically

Example notification:

```text
Your Froakie evolved into Frogadier!
```

---

# 5. Status Bar

Add live status bar item.

Example:

```text
🐸 Froakie Lv. 3 — 42 XP
```

Requirements:

* updates live
* visible at all times
* reflects current evolution + XP

Use:

```ts
vscode.window.createStatusBarItem()
```

---

# 6. Activity Tracking

Implement:

* file save tracking
* active editor time tracking
* optional git commit tracking

Track file saves via:

```ts
workspace.onDidSaveTextDocument
```

Track active coding time via timers.

Git integration should:

* fail gracefully if git unavailable
* not crash extension

---

# Theme Design Guidelines

## Froakie Theme

Aesthetic:

* playful
* light
* soft blue
* aquatic

Palette:

* cyan
* pale blue
* white accents

Mood:

* beginner
* energetic
* clean

---

## Frogadier Theme

Aesthetic:

* darker
* sharper
* stealthier

Palette:

* deep blue
* indigo
* cool gray

Mood:

* improving
* tactical
* focused

---

## Greninja Theme

Aesthetic:

* elite ninja hacker
* sleek
* cyberpunk-inspired

Palette:

* dark navy
* neon blue
* black backgrounds

Mood:

* mastery
* high-skill
* futuristic

---

# Commands

Implement all commands:

```text
starter-dev.chooseStarter
starter-dev.showProgress
starter-dev.forceEvolution
starter-dev.resetProgress
```

---

# Storage

Persist:

* XP
* evolution stage
* starter selection

Use:

```ts
context.globalState
```

Create wrapper utilities in:

```text
src/storage/state.ts
```

---

# README Requirements

Generate:

* setup instructions
* install steps
* run instructions
* packaging instructions
* publishing instructions
* screenshots/mock descriptions

---

# Packaging + Publishing

Document:

* how to run extension locally
* how to compile
* how to package VSIX
* how to publish to VS Code marketplace

Include commands.

---

# Setup Instructions

The final README must include:

## Install dependencies

```bash
npm install
```

## Compile extension

```bash
npm run compile
```

## Run extension

Press:

```text
F5
```

This launches:

```text
Extension Development Host
```

Then run:

```text
Starter.dev: Choose Starter
```

from the Command Palette.

---

# Development Notes

## IMPORTANT

When implementing:

* explain decisions
* proceed step-by-step
* do not skip setup
* assume user is new to VS Code extensions
* verify imports
* ensure package.json is correct
* ensure extension compiles successfully

---

# Deliverables

The completed output should include:

1. Runnable VS Code extension
2. Full source code
3. package.json
4. tsconfig.json
5. Theme JSON files
6. README.md
7. Commands registration
8. XP system
9. Evolution logic
10. Status bar UI
11. Setup instructions
12. Packaging instructions
13. Publishing instructions

---

# Goal

Build a polished MVP that feels fun immediately while establishing a strong architecture for future expansion into a larger gamified coding platform.

```
```
