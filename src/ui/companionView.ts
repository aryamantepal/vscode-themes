import * as vscode from 'vscode';
import { ExtensionState } from '../storage/state';
import { getStageInfo } from '../progression/xp';

let activeProvider: CompanionViewProvider | undefined;

export function getCompanionProvider(): CompanionViewProvider | undefined {
  return activeProvider;
}

export class CompanionViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'starter-dev.companion';
  private _view?: vscode.WebviewView;

  constructor(
    private readonly _state: ExtensionState,
    private readonly _extensionUri: vscode.Uri
  ) {
    activeProvider = this;
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview();

    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case 'chooseStarter':
          await vscode.commands.executeCommand('starter-dev.chooseStarter');
          break;
        case 'forceEvolution':
          await vscode.commands.executeCommand('starter-dev.forceEvolution');
          break;
      }
    });
  }

  public update() {
    if (this._view) {
      this._view.webview.html = this._getHtmlForWebview();
    }
  }

  public triggerDance() {
    if (this._view) {
      this._view.webview.postMessage({ command: 'dance' });
    }
  }

  public triggerEvolution() {
    if (this._view) {
      this._view.webview.postMessage({ command: 'evolve' });
    }
  }

  private _getHtmlForWebview(): string {
    const starter = this._state.getStarter();

    if (!starter) {
      return this._getNoStarterHtml();
    }

    const xp = this._state.getXp();
    const stage = this._state.getStage();
    const info = getStageInfo(stage);
    const level = stage + 1;
    const activeMinutes = Math.floor(this._state.getActiveSeconds() / 60);

    let progressPercent = 100;
    let progressText = 'MAX';
    if (info.nextThreshold !== null) {
      const prev = info.prevThreshold;
      const next = info.nextThreshold;
      progressPercent = Math.min(Math.max(((xp - prev) / (next - prev)) * 100, 0), 100);
      progressText = `${xp}/${next} XP`;
    }

    const spriteNames = ['froakie', 'frogadier', 'greninja'];
    const spriteUri = this._view!.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'assets', 'sprites', `${spriteNames[stage]}.png`)
    );
    const themeAccent = stage === 0 ? '#38bdf8' : stage === 1 ? '#0284c7' : '#ff007f';
    const glowColor = stage === 0 ? '56,189,248' : stage === 1 ? '2,132,199' : '255,0,127';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pokémon Companion</title>
  <style>
    :root {
      --accent: ${themeAccent};
      --glow: ${glowColor};
      --text-color: var(--vscode-editor-foreground, #cbd5e1);
      --bg-color: var(--vscode-editor-background, #0f172a);
      --card-bg: var(--vscode-sideBar-background, #0b0f19);
      --border-color: var(--vscode-widget-border, #1e293b);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
      color: var(--text-color);
      background-color: var(--bg-color);
      padding: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      overflow-x: hidden;
      min-height: 100vh;
    }

    .companion-container {
      width: 100%;
      max-width: 280px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .header {
      font-size: 0.75rem;
      font-weight: 700;
      text-align: center;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--accent);
      opacity: 0.8;
      margin-top: 4px;
    }

    /* === STAGE PLATFORM === */
    .stage-platform {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      padding: 16px 0 8px;
    }

    /* Neon floor reflection line */
    .stage-platform::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--accent), transparent);
      border-radius: 50%;
      box-shadow: 0 0 12px rgba(var(--glow), 0.8);
    }

    /* === PARTICLE SYSTEM === */
    .particles {
      position: absolute;
      width: 200px;
      height: 200px;
      pointer-events: none;
    }

    .particle {
      position: absolute;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--accent);
      opacity: 0;
    }

    .particle:nth-child(1)  { left: 50%; top: 50%; animation: particle-burst 2s ease-out 0s infinite; }
    .particle:nth-child(2)  { left: 50%; top: 50%; animation: particle-burst 2s ease-out 0.15s infinite; }
    .particle:nth-child(3)  { left: 50%; top: 50%; animation: particle-burst 2s ease-out 0.3s infinite; }
    .particle:nth-child(4)  { left: 50%; top: 50%; animation: particle-burst 2s ease-out 0.45s infinite; }
    .particle:nth-child(5)  { left: 50%; top: 50%; animation: particle-burst 2s ease-out 0.6s infinite; }
    .particle:nth-child(6)  { left: 50%; top: 50%; animation: particle-burst 2s ease-out 0.75s infinite; }
    .particle:nth-child(7)  { left: 50%; top: 50%; animation: particle-burst 2s ease-out 0.9s infinite; }
    .particle:nth-child(8)  { left: 50%; top: 50%; animation: particle-burst 2s ease-out 1.05s infinite; }

    @keyframes particle-burst {
      0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
      100% {
        transform: translate(
          calc(-50% + var(--tx, 40px)),
          calc(-50% + var(--ty, -60px))
        ) scale(0);
        opacity: 0;
      }
    }

    .particle:nth-child(1) { --tx: 50px;  --ty: -50px; }
    .particle:nth-child(2) { --tx: -50px; --ty: -50px; }
    .particle:nth-child(3) { --tx: 70px;  --ty: 10px;  }
    .particle:nth-child(4) { --tx: -70px; --ty: 10px;  }
    .particle:nth-child(5) { --tx: 30px;  --ty: -80px; }
    .particle:nth-child(6) { --tx: -30px; --ty: -80px; }
    .particle:nth-child(7) { --tx: 60px;  --ty: -30px; }
    .particle:nth-child(8) { --tx: -60px; --ty: -30px; }

    /* === POKEMON AVATAR === */
    .avatar-ring {
      width: 160px;
      height: 160px;
      position: relative;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Rotating outer ring */
    .avatar-ring::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 2px solid transparent;
      border-top-color: var(--accent);
      border-right-color: var(--accent);
      animation: ring-spin 4s linear infinite;
      opacity: 0.4;
    }

    /* Inner glow ring */
    .avatar-ring::after {
      content: '';
      position: absolute;
      inset: 8px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(var(--glow), 0.12) 0%, transparent 70%);
      animation: glow-pulse 3s ease-in-out infinite;
    }

    @keyframes ring-spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }

    @keyframes glow-pulse {
      0%, 100% { opacity: 0.6; transform: scale(1); }
      50%       { opacity: 1;   transform: scale(1.05); }
    }

    .pokemon-wrapper {
      width: 120px;
      height: 120px;
      position: relative;
      z-index: 2;
      animation: idle-float 3s ease-in-out infinite;
      filter: drop-shadow(0 6px 12px rgba(var(--glow), 0.4));
    }

    @keyframes idle-float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      25%       { transform: translateY(-8px) rotate(-1deg); }
      75%       { transform: translateY(-4px) rotate(1deg); }
    }

    /* === DANCE STATES === */
    .pokemon-wrapper.dancing {
      animation: full-dance 1.2s cubic-bezier(0.36, 0.07, 0.19, 0.97) forwards;
      filter: drop-shadow(0 0 20px rgba(var(--glow), 0.9)) drop-shadow(0 0 40px rgba(var(--glow), 0.5));
    }

    @keyframes full-dance {
      0%   { transform: translateY(0)    rotate(0deg)   scale(1); }
      10%  { transform: translateY(-20px) rotate(-12deg) scale(1.1); }
      20%  { transform: translateY(-5px)  rotate(12deg)  scale(0.95); }
      30%  { transform: translateY(-25px) rotate(-8deg)  scale(1.15); }
      40%  { transform: translateY(0)    rotate(8deg)   scale(1); }
      50%  { transform: translateY(-18px) rotate(-6deg)  scale(1.1); }
      60%  { transform: translateY(0)    rotate(6deg)   scale(0.95); }
      70%  { transform: translateY(-12px) rotate(-4deg)  scale(1.05); }
      80%  { transform: translateY(0)    rotate(4deg)   scale(1); }
      90%  { transform: translateY(-6px)  rotate(-2deg)  scale(1.02); }
      100% { transform: translateY(0)    rotate(0deg)   scale(1); }
    }

    .pokemon-wrapper.evolving {
      animation: evolution-flash 2s ease-in-out forwards;
    }

    @keyframes evolution-flash {
      0%   { filter: drop-shadow(0 0 0px white) brightness(1); }
      20%  { filter: drop-shadow(0 0 30px white) brightness(3); }
      40%  { filter: drop-shadow(0 0 60px white) brightness(5); }
      60%  { filter: drop-shadow(0 0 30px rgba(var(--glow), 1)) brightness(2); }
      80%  { filter: drop-shadow(0 0 15px rgba(var(--glow), 0.8)) brightness(1.2); }
      100% { filter: drop-shadow(0 6px 12px rgba(var(--glow), 0.4)) brightness(1); }
    }

    .tap-hint {
      font-size: 0.65rem;
      opacity: 0.4;
      margin-top: 6px;
      letter-spacing: 0.05em;
    }

    /* === STATS CARD === */
    .stats-card {
      width: 100%;
      background-color: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 14px;
      position: relative;
      overflow: hidden;
    }

    /* Subtle accent corner glow */
    .stats-card::before {
      content: '';
      position: absolute;
      top: 0; right: 0;
      width: 80px; height: 80px;
      background: radial-gradient(circle at top right, rgba(var(--glow), 0.08), transparent 70%);
      pointer-events: none;
    }

    .pkmn-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .pkmn-name {
      font-size: 1rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .pkmn-lvl {
      font-size: 0.75rem;
      background-color: var(--accent);
      color: #000;
      padding: 2px 8px;
      border-radius: 10px;
      font-weight: 700;
      letter-spacing: 0.03em;
    }

    /* Progress Bar */
    .progress-container { margin-bottom: 12px; }

    .progress-bar-bg {
      width: 100%;
      height: 8px;
      background-color: var(--border-color);
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--accent), rgba(var(--glow), 0.6));
      width: ${progressPercent}%;
      border-radius: 4px;
      transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 0 6px rgba(var(--glow), 0.5);
      position: relative;
    }

    /* Shimmer on progress bar */
    .progress-bar-fill::after {
      content: '';
      position: absolute;
      top: 0; left: -100%;
      width: 60%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
      animation: shimmer 2.5s ease-in-out infinite;
    }

    @keyframes shimmer {
      0%   { left: -60%; }
      100% { left: 160%; }
    }

    .progress-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.7rem;
      margin-top: 4px;
      opacity: 0.6;
    }

    /* Activity Section */
    .activity-section {
      border-top: 1px solid var(--border-color);
      padding-top: 10px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .activity-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      opacity: 0.75;
    }

    .activity-row .value {
      color: var(--accent);
      font-weight: 600;
    }

    /* === BUTTONS === */
    .btn-row {
      display: flex;
      gap: 8px;
      width: 100%;
    }

    .btn {
      flex: 1;
      background: transparent;
      color: var(--accent);
      border: 1px solid var(--accent);
      padding: 7px 10px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.03em;
      transition: background 0.15s, box-shadow 0.15s;
    }

    .btn:hover {
      background: rgba(var(--glow), 0.12);
      box-shadow: 0 0 8px rgba(var(--glow), 0.3);
    }

    .btn.primary {
      background: var(--accent);
      color: #000;
    }

    .btn.primary:hover {
      box-shadow: 0 0 12px rgba(var(--glow), 0.5);
    }
  </style>
</head>
<body>
  <div class="companion-container">
    <div class="header">★ Starter.dev ★</div>

    <div class="stage-platform">
      <div class="particles">
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
      </div>

      <div class="avatar-ring" id="avatarRing" title="Tap to dance!">
        <div class="pokemon-wrapper" id="pokemonWrapper">
          <img src="${spriteUri}" alt="${info.name}" style="image-rendering: pixelated; width: 100%; height: 100%; object-fit: contain;" />
        </div>
      </div>
      <div class="tap-hint">tap to dance</div>
    </div>

    <div class="stats-card">
      <div class="pkmn-info">
        <div class="pkmn-name">
          <span>${info.emoji}</span>
          <span>${info.name}</span>
        </div>
        <div class="pkmn-lvl">Lv. ${level}</div>
      </div>

      <div class="progress-container">
        <div class="progress-bar-bg">
          <div class="progress-bar-fill"></div>
        </div>
        <div class="progress-labels">
          <span>XP</span>
          <span>${progressText}</span>
        </div>
      </div>

      <div class="activity-section">
        <div class="activity-row">
          <span>Active timer</span>
          <span class="value">${activeMinutes}m</span>
        </div>
        <div class="activity-row">
          <span>Stage</span>
          <span class="value">${info.name}</span>
        </div>
      </div>
    </div>

    <div class="btn-row">
      <button class="btn" id="danceBtn">💃 Dance</button>
      <button class="btn primary" id="evolveBtn">⚡ XP+</button>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    const wrapper = document.getElementById('pokemonWrapper');
    const avatarRing = document.getElementById('avatarRing');

    function triggerDance() {
      if (wrapper.classList.contains('dancing')) return;
      wrapper.classList.add('dancing');
      wrapper.addEventListener('animationend', () => {
        wrapper.classList.remove('dancing');
      }, { once: true });
    }

    function triggerEvolution() {
      wrapper.classList.add('evolving');
      wrapper.addEventListener('animationend', () => {
        wrapper.classList.remove('evolving');
      }, { once: true });
    }

    avatarRing.addEventListener('click', triggerDance);
    document.getElementById('danceBtn').addEventListener('click', triggerDance);

    document.getElementById('evolveBtn').addEventListener('click', () => {
      vscode.postMessage({ command: 'forceEvolution' });
    });

    // Handle messages from extension
    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (msg.command === 'dance') triggerDance();
      if (msg.command === 'evolve') triggerEvolution();
    });
  </script>
</body>
</html>`;
  }

  private _getNoStarterHtml(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pokémon Companion</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      color: var(--vscode-editor-foreground, #cbd5e1);
      background-color: var(--vscode-editor-background, #0f172a);
      padding: 24px;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 80vh;
      gap: 12px;
    }
    .egg {
      font-size: 4rem;
      animation: wobble 2s ease-in-out infinite;
    }
    @keyframes wobble {
      0%, 100% { transform: rotate(-5deg); }
      50%       { transform: rotate(5deg); }
    }
    h3 { font-size: 1rem; font-weight: 700; }
    p { font-size: 0.8rem; opacity: 0.6; max-width: 200px; }
    .btn {
      background-color: var(--vscode-button-background, #0ea5e9);
      color: var(--vscode-button-foreground, #ffffff);
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 700;
      font-size: 0.85rem;
      margin-top: 8px;
      transition: opacity 0.15s;
    }
    .btn:hover { opacity: 0.85; }
  </style>
</head>
<body>
  <div class="egg">🥚</div>
  <h3>Your companion awaits!</h3>
  <p>Choose your starter Pokémon to begin your journey.</p>
  <button class="btn" id="startBtn">Choose Starter</button>

  <script>
    const vscode = acquireVsCodeApi();
    document.getElementById('startBtn').addEventListener('click', () => {
      vscode.postMessage({ command: 'chooseStarter' });
    });
  </script>
</body>
</html>`;
  }

}
