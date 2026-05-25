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

    // Handle messages from the webview
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

    // Calculate progress percentage
    let progressPercent = 100;
    let progressText = 'MAX';
    if (info.nextThreshold !== null) {
      const prev = info.prevThreshold;
      const next = info.nextThreshold;
      progressPercent = Math.min(Math.max(((xp - prev) / (next - prev)) * 100, 0), 100);
      progressText = `${xp}/${next} XP`;
    }

    // Embed SVGs for each evolution stage
    const pokemonSvg = this._getPokemonSvg(stage);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pokémon Companion</title>
  <style>
    :root {
      --primary-color: var(--vscode-button-background, #0ea5e9);
      --text-color: var(--vscode-editor-foreground, #cbd5e1);
      --bg-color: var(--vscode-editor-background, #0f172a);
      --card-bg: var(--vscode-sideBar-background, #0b0f19);
      --border-color: var(--vscode-widget-border, #1e293b);
    }

    body {
      font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif);
      color: var(--text-color);
      background-color: var(--bg-color);
      padding: 16px;
      margin: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      overflow-x: hidden;
    }

    .companion-container {
      width: 100%;
      max-width: 280px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .header {
      font-size: 1.2rem;
      font-weight: bold;
      text-align: center;
      margin-bottom: 20px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      opacity: 0.9;
    }

    /* Pokémon Avatar Box */
    .avatar-box {
      width: 160px;
      height: 160px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, rgba(0,0,0,0) 70%);
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 20px;
      cursor: pointer;
      position: relative;
    }

    .pokemon-svg-container {
      width: 120px;
      height: 120px;
      animation: bobbing 3s ease-in-out infinite;
      transition: transform 0.1s ease-out;
    }

    .avatar-box:hover .pokemon-svg-container {
      transform: scale(1.05);
    }

    /* Bobbing & Dance Animations */
    @keyframes bobbing {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }

    .dance {
      animation: dance-anim 0.8s ease-in-out !important;
    }

    @keyframes dance-anim {
      0%, 100% { transform: scale(1) rotate(0deg); }
      20% { transform: translateY(-15px) rotate(-10deg); }
      40% { transform: translateY(0px) rotate(10deg); }
      60% { transform: translateY(-10px) rotate(-5deg); }
      80% { transform: translateY(0px) rotate(5deg); }
    }

    /* Stats Card */
    .stats-card {
      width: 100%;
      background-color: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 16px;
      box-sizing: border-box;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    .pkmn-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .pkmn-name {
      font-size: 1.1rem;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .pkmn-lvl {
      font-size: 0.9rem;
      background-color: var(--primary-color);
      color: var(--vscode-button-foreground, #ffffff);
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: bold;
    }

    /* Progress Bar */
    .progress-container {
      margin-bottom: 16px;
    }

    .progress-bar-bg {
      width: 100%;
      height: 10px;
      background-color: var(--border-color);
      border-radius: 5px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background-color: var(--primary-color);
      width: ${progressPercent}%;
      transition: width 0.5s ease-in-out;
    }

    .progress-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      margin-top: 4px;
      opacity: 0.7;
    }

    /* Activity Details */
    .activity-section {
      border-top: 1px solid var(--border-color);
      padding-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .activity-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      opacity: 0.8;
    }

    .btn {
      background-color: var(--primary-color);
      color: var(--vscode-button-foreground, #ffffff);
      border: none;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: bold;
      width: 100%;
      margin-top: 16px;
      transition: opacity 0.2s;
    }

    .btn:hover {
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="companion-container">
    <div class="header">Starter.dev Companion</div>
    
    <div class="avatar-box" id="avatarBox" title="Click to make your Pokémon dance!">
      <div class="pokemon-svg-container" id="pokemonSvg">
        ${pokemonSvg}
      </div>
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
          <span>XP Progress</span>
          <span>${progressText}</span>
        </div>
      </div>

      <div class="activity-section">
        <div class="activity-row">
          <span>Active coding timer</span>
          <span>${activeMinutes} / 30m</span>
        </div>
        <div class="activity-row">
          <span>Global State</span>
          <span>Stable</span>
        </div>
      </div>
    </div>
    
    <button class="btn" id="evolveBtn">Dev: Force XP</button>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    
    // Animation click triggers
    const avatarBox = document.getElementById('avatarBox');
    const pokemonSvg = document.getElementById('pokemonSvg');
    
    avatarBox.addEventListener('click', () => {
      pokemonSvg.classList.add('dance');
      // Remove the class after animation completes to allow re-triggering
      setTimeout(() => {
        pokemonSvg.classList.remove('dance');
      }, 800);
    });

    const evolveBtn = document.getElementById('evolveBtn');
    evolveBtn.addEventListener('click', () => {
      vscode.postMessage({ command: 'forceEvolution' });
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
    }
    .btn {
      background-color: var(--vscode-button-background, #0ea5e9);
      color: var(--vscode-button-foreground, #ffffff);
      border: none;
      padding: 10px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: bold;
      margin-top: 20px;
    }
    .icon {
      font-size: 3rem;
      margin-bottom: 12px;
    }
  </style>
</head>
<body>
  <div class="icon">🥚</div>
  <h3>Your companion is waiting to hatch!</h3>
  <p>Run Choose Starter to pick your Pokémon companion and start gaining XP.</p>
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
      // Froakie: Rounded light blue body, white fluffy bubble frill, big yellow eyes
      return `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <!-- White Bubbles Background (Fluff) -->
        <circle cx="50" cy="70" r="16" fill="#f8fafc" />
        <circle cx="34" cy="74" r="12" fill="#f8fafc" />
        <circle cx="66" cy="74" r="12" fill="#f8fafc" />
        <circle cx="50" cy="82" r="10" fill="#f8fafc" />
        
        <!-- Main Blue Body -->
        <circle cx="50" cy="52" r="26" fill="#38bdf8" stroke="#0284c7" stroke-width="2" />
        
        <!-- Feet/Hands (Little dots) -->
        <circle cx="34" cy="76" r="6" fill="#f0f9ff" stroke="#0284c7" stroke-width="2" />
        <circle cx="66" cy="76" r="6" fill="#f0f9ff" stroke="#0284c7" stroke-width="2" />
        
        <!-- White Chest/Mouth Detail -->
        <path d="M 40 50 Q 50 60 60 50 Q 50 46 40 50" fill="#ffffff" />
        
        <!-- Eyes Background (Large White Circles) -->
        <circle cx="38" cy="36" r="13" fill="#ffffff" stroke="#0284c7" stroke-width="2" />
        <circle cx="62" cy="36" r="13" fill="#ffffff" stroke="#0284c7" stroke-width="2" />
        
        <!-- Iris (Yellow) -->
        <circle cx="38" cy="36" r="9" fill="#eab308" />
        <circle cx="62" cy="36" r="9" fill="#eab308" />
        
        <!-- Pupils (Black vertical pill) -->
        <rect x="36" y="31" width="4" height="10" rx="2" fill="#0f172a" />
        <rect x="60" y="31" width="4" height="10" rx="2" fill="#0f172a" />
        
        <!-- Cheeks/Stripe -->
        <path d="M 48 44 L 52 44 L 50 48 Z" fill="#0f172a" />
      </svg>`;
    } else if (stage === 1) {
      // Frogadier: Slim dark-blue body, white neck bubble wrap, indigo mask
      return `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <!-- Neck Frill Bubbles -->
        <circle cx="50" cy="66" r="20" fill="#e2e8f0" />
        <circle cx="32" cy="62" r="12" fill="#e2e8f0" />
        <circle cx="68" cy="62" r="12" fill="#e2e8f0" />

        <!-- Main Body -->
        <ellipse cx="50" cy="54" rx="24" ry="22" fill="#0284c7" stroke="#1e3a8a" stroke-width="2" />
        
        <!-- Dark Mask -->
        <path d="M 28 32 C 34 26 66 26 72 32 C 76 38 72 48 50 48 C 28 48 24 38 28 32 Z" fill="#1e3a8a" />
        
        <!-- Eyes -->
        <circle cx="38" cy="34" r="10" fill="#ffffff" />
        <circle cx="62" cy="34" r="10" fill="#ffffff" />
        <circle cx="38" cy="34" r="7" fill="#eab308" />
        <circle cx="62" cy="34" r="7" fill="#eab308" />
        <!-- Sharp Pupils -->
        <polygon points="37,30 39,30 39,38 37,38" fill="#0f172a" />
        <polygon points="61,30 63,30 63,38 61,38" fill="#0f172a" />

        <!-- Bubble Scarf Details -->
        <circle cx="50" cy="74" r="12" fill="#ffffff" />
        <circle cx="40" cy="72" r="8" fill="#ffffff" />
        <circle cx="60" cy="72" r="8" fill="#ffffff" />
      </svg>`;
    } else {
      // Greninja: Sleek dark navy ninja body, long pink tongue-scarf wrapping neck, ninja head protrusions
      return `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <!-- Head Protrusions / Ninja Ears -->
        <polygon points="20,24 40,32 30,12" fill="#05070f" stroke="#00f0ff" stroke-width="1.5" />
        <polygon points="80,24 60,32 70,12" fill="#05070f" stroke="#00f0ff" stroke-width="1.5" />
        <polygon points="50,22 44,32 56,32" fill="#ff007f" />

        <!-- Pink Tongue-Scarf wrapping around body -->
        <path d="M 28 58 C 16 54 12 70 24 76 C 36 82 64 82 76 76 C 88 70 84 54 72 58 Z" fill="#ff007f" opacity="0.9" />
        
        <!-- Main Ninja Body -->
        <ellipse cx="50" cy="50" rx="22" ry="20" fill="#05070f" stroke="#ff007f" stroke-width="2" />
        
        <!-- Sleek Eyes -->
        <polygon points="32,32 46,38 40,42" fill="#ffffff" />
        <polygon points="68,32 54,38 60,42" fill="#ffffff" />
        <polygon points="34,34 42,38 38,40" fill="#eab308" />
        <polygon points="66,34 58,38 62,40" fill="#eab308" />

        <!-- Joint Bubbles (White dots on shoulders) -->
        <circle cx="32" cy="52" r="5" fill="#f8fafc" />
        <circle cx="68" cy="52" r="5" fill="#f8fafc" />

        <!-- Chest detailing (Yellow star-like) -->
        <polygon points="50,44 54,50 50,56 46,50" fill="#eab308" />
      </svg>`;
    }
  }
}
