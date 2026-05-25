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

    const pokemonSvg = this._getPokemonSvg(stage);
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
          ${pokemonSvg}
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

  private _getPokemonSvg(stage: number): string {
    if (stage === 0) {
      // Froakie — bubbly, cute, sky-blue
      return `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bodyGrad0" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stop-color="#7dd3fc"/>
            <stop offset="100%" stop-color="#0284c7"/>
          </radialGradient>
          <radialGradient id="eyeGrad0" cx="35%" cy="30%" r="60%">
            <stop offset="0%" stop-color="#fde68a"/>
            <stop offset="100%" stop-color="#d97706"/>
          </radialGradient>
        </defs>

        <!-- Shadow -->
        <ellipse cx="50" cy="94" rx="20" ry="4" fill="#000" opacity="0.15"/>

        <!-- Bubble frill back layer -->
        <circle cx="28" cy="72" r="13" fill="#e0f2fe" opacity="0.9"/>
        <circle cx="72" cy="72" r="13" fill="#e0f2fe" opacity="0.9"/>
        <circle cx="50" cy="80" r="15" fill="#e0f2fe" opacity="0.9"/>
        <circle cx="38" cy="78" r="10" fill="#f0f9ff"/>
        <circle cx="62" cy="78" r="10" fill="#f0f9ff"/>

        <!-- Main body -->
        <ellipse cx="50" cy="55" rx="26" ry="24" fill="url(#bodyGrad0)" stroke="#0369a1" stroke-width="1.5"/>

        <!-- Belly -->
        <ellipse cx="50" cy="60" rx="14" ry="11" fill="#bfdbfe" opacity="0.6"/>

        <!-- Arms -->
        <ellipse cx="25" cy="62" rx="7" ry="5" fill="#38bdf8" stroke="#0369a1" stroke-width="1" transform="rotate(-20 25 62)"/>
        <ellipse cx="75" cy="62" rx="7" ry="5" fill="#38bdf8" stroke="#0369a1" stroke-width="1" transform="rotate(20 75 62)"/>

        <!-- Eyes whites -->
        <circle cx="37" cy="40" r="12" fill="#fff" stroke="#0369a1" stroke-width="1.5"/>
        <circle cx="63" cy="40" r="12" fill="#fff" stroke="#0369a1" stroke-width="1.5"/>
        <!-- Irises -->
        <circle cx="37" cy="40" r="8" fill="url(#eyeGrad0)"/>
        <circle cx="63" cy="40" r="8" fill="url(#eyeGrad0)"/>
        <!-- Pupils -->
        <rect x="35" y="36" width="4" height="8" rx="2" fill="#0f172a"/>
        <rect x="61" y="36" width="4" height="8" rx="2" fill="#0f172a"/>
        <!-- Eye shine -->
        <circle cx="33" cy="37" r="2" fill="#fff" opacity="0.8"/>
        <circle cx="59" cy="37" r="2" fill="#fff" opacity="0.8"/>

        <!-- Nose dots -->
        <circle cx="47" cy="50" r="2" fill="#0369a1" opacity="0.5"/>
        <circle cx="53" cy="50" r="2" fill="#0369a1" opacity="0.5"/>

        <!-- Smile -->
        <path d="M 43 54 Q 50 60 57 54" fill="none" stroke="#0369a1" stroke-width="1.5" stroke-linecap="round"/>

        <!-- Bubble frill front details -->
        <circle cx="28" cy="72" r="6" fill="#fff" opacity="0.5"/>
        <circle cx="72" cy="72" r="6" fill="#fff" opacity="0.5"/>
        <circle cx="50" cy="82" r="7" fill="#fff" opacity="0.4"/>
      </svg>`;
    } else if (stage === 1) {
      // Frogadier — sleeker, darker blue, bubble scarf
      return `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bodyGrad1" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stop-color="#3b82f6"/>
            <stop offset="100%" stop-color="#1e3a8a"/>
          </radialGradient>
          <radialGradient id="eyeGrad1" cx="35%" cy="30%" r="60%">
            <stop offset="0%" stop-color="#fde68a"/>
            <stop offset="100%" stop-color="#b45309"/>
          </radialGradient>
        </defs>

        <!-- Shadow -->
        <ellipse cx="50" cy="94" rx="18" ry="3.5" fill="#000" opacity="0.18"/>

        <!-- Bubble scarf back -->
        <circle cx="30" cy="67" r="13" fill="#dbeafe" opacity="0.85"/>
        <circle cx="70" cy="67" r="13" fill="#dbeafe" opacity="0.85"/>
        <circle cx="50" cy="75" r="14" fill="#eff6ff" opacity="0.9"/>

        <!-- Dark mask / head -->
        <ellipse cx="50" cy="40" rx="24" ry="20" fill="#1e3a8a"/>

        <!-- Body -->
        <ellipse cx="50" cy="58" rx="21" ry="19" fill="url(#bodyGrad1)" stroke="#1e40af" stroke-width="1.5"/>

        <!-- Slim belly -->
        <ellipse cx="50" cy="63" rx="11" ry="9" fill="#93c5fd" opacity="0.35"/>

        <!-- Legs -->
        <ellipse cx="37" cy="76" rx="8" ry="5" fill="#1d4ed8" stroke="#1e3a8a" stroke-width="1" transform="rotate(10 37 76)"/>
        <ellipse cx="63" cy="76" rx="8" ry="5" fill="#1d4ed8" stroke="#1e3a8a" stroke-width="1" transform="rotate(-10 63 76)"/>

        <!-- Arms -->
        <ellipse cx="27" cy="57" rx="7" ry="4.5" fill="#2563eb" stroke="#1e3a8a" stroke-width="1" transform="rotate(-25 27 57)"/>
        <ellipse cx="73" cy="57" rx="7" ry="4.5" fill="#2563eb" stroke="#1e3a8a" stroke-width="1" transform="rotate(25 73 57)"/>

        <!-- Eyes whites -->
        <circle cx="37" cy="36" r="11" fill="#fff" stroke="#1e3a8a" stroke-width="1.5"/>
        <circle cx="63" cy="36" r="11" fill="#fff" stroke="#1e3a8a" stroke-width="1.5"/>
        <!-- Irises -->
        <circle cx="37" cy="36" r="7.5" fill="url(#eyeGrad1)"/>
        <circle cx="63" cy="36" r="7.5" fill="url(#eyeGrad1)"/>
        <!-- Slit pupils -->
        <rect x="35.5" y="32" width="3" height="8" rx="1.5" fill="#0f172a"/>
        <rect x="61.5" y="32" width="3" height="8" rx="1.5" fill="#0f172a"/>
        <!-- Eye shine -->
        <circle cx="34" cy="33" r="1.8" fill="#fff" opacity="0.8"/>
        <circle cx="60" cy="33" r="1.8" fill="#fff" opacity="0.8"/>

        <!-- Frogadier smirk -->
        <path d="M 44 48 Q 50 52 56 48" fill="none" stroke="#60a5fa" stroke-width="1.5" stroke-linecap="round"/>

        <!-- Bubble scarf front highlights -->
        <circle cx="30" cy="67" r="5.5" fill="#fff" opacity="0.45"/>
        <circle cx="70" cy="67" r="5.5" fill="#fff" opacity="0.45"/>
        <circle cx="50" cy="77" r="6" fill="#fff" opacity="0.4"/>
        <circle cx="40" cy="73" r="4" fill="#fff" opacity="0.35"/>
        <circle cx="60" cy="73" r="4" fill="#fff" opacity="0.35"/>
      </svg>`;
    } else {
      // Greninja — dark ninja, pink tongue scarf, cyan accents
      return `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bodyGrad2" cx="30%" cy="25%" r="65%">
            <stop offset="0%" stop-color="#1e1b4b"/>
            <stop offset="100%" stop-color="#05070f"/>
          </radialGradient>
          <radialGradient id="scarfGrad" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#fb7185"/>
            <stop offset="100%" stop-color="#be123c"/>
          </radialGradient>
          <filter id="neonGlow">
            <feGaussianBlur stdDeviation="1.5" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>

        <!-- Shadow -->
        <ellipse cx="50" cy="94" rx="16" ry="3" fill="#000" opacity="0.25"/>

        <!-- Tongue/scarf wrap — goes behind body -->
        <path d="M 22 62 C 10 55 8 78 22 84 C 36 90 64 90 78 84 C 92 78 90 55 78 62 C 72 52 64 48 50 50 C 36 48 28 52 22 62 Z"
              fill="url(#scarfGrad)" opacity="0.92"/>

        <!-- Ninja ear protrusions -->
        <polygon points="24,20 42,34 32,10" fill="#0a0014" stroke="#00e5ff" stroke-width="1.2"/>
        <polygon points="76,20 58,34 68,10" fill="#0a0014" stroke="#00e5ff" stroke-width="1.2"/>

        <!-- Main ninja body -->
        <ellipse cx="50" cy="52" rx="22" ry="21" fill="url(#bodyGrad2)" stroke="#3b0764" stroke-width="1.5"/>

        <!-- Cyan body stripe -->
        <ellipse cx="50" cy="58" rx="10" ry="8" fill="#00e5ff" opacity="0.07"/>

        <!-- Shoulder bubbles (white dots) -->
        <circle cx="30" cy="55" r="5.5" fill="#f8fafc" stroke="#0a0014" stroke-width="1"/>
        <circle cx="70" cy="55" r="5.5" fill="#f8fafc" stroke="#0a0014" stroke-width="1"/>

        <!-- Legs -->
        <ellipse cx="38" cy="73" rx="8" ry="5.5" fill="#0a0014" stroke="#3b0764" stroke-width="1" transform="rotate(15 38 73)"/>
        <ellipse cx="62" cy="73" rx="8" ry="5.5" fill="#0a0014" stroke="#3b0764" stroke-width="1" transform="rotate(-15 62 73)"/>

        <!-- Head dark -->
        <ellipse cx="50" cy="34" rx="21" ry="18" fill="#0a0014"/>

        <!-- Top head spike (pink) -->
        <polygon points="50,16 44,30 56,30" fill="#fb7185"/>

        <!-- Cyan headband -->
        <rect x="29" y="28" width="42" height="5" rx="2.5" fill="#00e5ff" opacity="0.15"/>

        <!-- Eyes whites -->
        <ellipse cx="37" cy="32" rx="9" ry="7" fill="#fff"/>
        <ellipse cx="63" cy="32" rx="9" ry="7" fill="#fff"/>
        <!-- Irises — sharp ninja -->
        <ellipse cx="37" cy="32" rx="6" ry="5.5" fill="#fbbf24"/>
        <ellipse cx="63" cy="32" rx="6" ry="5.5" fill="#fbbf24"/>
        <!-- Vertical slit pupils -->
        <rect x="35.5" y="28" width="3" height="8" rx="1.5" fill="#0a0014"/>
        <rect x="61.5" y="28" width="3" height="8" rx="1.5" fill="#0a0014"/>
        <!-- Cyan eye glow -->
        <ellipse cx="37" cy="32" rx="9" ry="7" fill="none" stroke="#00e5ff" stroke-width="1" opacity="0.5" filter="url(#neonGlow)"/>
        <ellipse cx="63" cy="32" rx="9" ry="7" fill="none" stroke="#00e5ff" stroke-width="1" opacity="0.5" filter="url(#neonGlow)"/>
        <!-- Eye shine -->
        <circle cx="34" cy="30" r="1.8" fill="#fff" opacity="0.9"/>
        <circle cx="60" cy="30" r="1.8" fill="#fff" opacity="0.9"/>

        <!-- Ninja face mask line -->
        <path d="M 29 40 Q 50 44 71 40" fill="none" stroke="#fb7185" stroke-width="1.5" stroke-linecap="round"/>

        <!-- Chest star -->
        <polygon points="50,46 52,51 57,51 53,54 55,59 50,56 45,59 47,54 43,51 48,51"
                 fill="#fbbf24" opacity="0.8"/>

        <!-- Scarf highlights -->
        <path d="M 28 68 Q 50 72 72 68" fill="none" stroke="#fda4af" stroke-width="2" opacity="0.5" stroke-linecap="round"/>
      </svg>`;
    }
  }
}
