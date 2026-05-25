import * as vscode from 'vscode';
import { ExtensionState } from '../storage/state';

let decorationType: vscode.TextEditorDecorationType | undefined;
let currentStage = -1;
let animationInterval: NodeJS.Timeout | undefined;
let isActive = false;

function getSvgDataUri(stage: number, frame: number): string {
  const frameAngle = frame === 0 ? 0 : frame === 1 ? -8 : frame === 2 ? 8 : frame === 3 ? -4 : 4;
  const yOffset = frame === 1 || frame === 3 ? -3 : frame === 2 || frame === 4 ? 3 : 0;

  let bodyColor: string;
  let accentColor: string;
  let eyeColor: string;

  if (stage === 0) {
    bodyColor = '#38bdf8';
    accentColor = '#0284c7';
    eyeColor = '#eab308';
  } else if (stage === 1) {
    bodyColor = '#3b82f6';
    accentColor = '#1e3a8a';
    eyeColor = '#f59e0b';
  } else {
    bodyColor = '#0a0014';
    accentColor = '#ff007f';
    eyeColor = '#00e5ff';
  }

  const svg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(12,${12 + yOffset}) rotate(${frameAngle}) translate(-12,-12)">
      ${stage === 0 ? `
        <circle cx="12" cy="13" r="7" fill="${bodyColor}"/>
        <circle cx="9" cy="10" r="3" fill="white"/>
        <circle cx="15" cy="10" r="3" fill="white"/>
        <circle cx="9" cy="10" r="2" fill="${eyeColor}"/>
        <circle cx="15" cy="10" r="2" fill="${eyeColor}"/>
        <circle cx="9" cy="10" r="1" fill="#000"/>
        <circle cx="15" cy="10" r="1" fill="#000"/>
        <circle cx="7" cy="18" r="3" fill="${bodyColor}" opacity="0.7"/>
        <circle cx="17" cy="18" r="3" fill="${bodyColor}" opacity="0.7"/>
      ` : stage === 1 ? `
        <ellipse cx="12" cy="13" rx="7" ry="6" fill="${bodyColor}"/>
        <rect x="6" y="8" width="12" height="6" rx="3" fill="${accentColor}"/>
        <circle cx="9" cy="10" r="3" fill="white"/>
        <circle cx="15" cy="10" r="3" fill="white"/>
        <circle cx="9" cy="10" r="2" fill="${eyeColor}"/>
        <circle cx="15" cy="10" r="2" fill="${eyeColor}"/>
        <rect x="8.5" y="9" width="1" height="2" rx="0.5" fill="#000"/>
        <rect x="14.5" y="9" width="1" height="2" rx="0.5" fill="#000"/>
        <circle cx="7" cy="17" r="3.5" fill="white" opacity="0.6"/>
        <circle cx="17" cy="17" r="3.5" fill="white" opacity="0.6"/>
      ` : `
        <ellipse cx="12" cy="13" rx="6" ry="7" fill="${bodyColor}"/>
        <polygon points="8,6 12,2 16,6 14,8 10,8" fill="${bodyColor}"/>
        <circle cx="9" cy="10" r="2.5" fill="white"/>
        <circle cx="15" cy="10" r="2.5" fill="white"/>
        <circle cx="9" cy="10" r="1.8" fill="${eyeColor}"/>
        <circle cx="15" cy="10" r="1.8" fill="${eyeColor}"/>
        <rect x="8.5" y="9" width="1" height="2" rx="0.5" fill="#000"/>
        <rect x="14.5" y="9" width="1" height="2" rx="0.5" fill="#000"/>
        <path d="M 6 14 Q 12 17 18 14" fill="${accentColor}" stroke="none"/>
      `}
    </g>
  </svg>`;

  const encoded = encodeURIComponent(svg);
  return `data:image/svg+xml,${encoded}`;
}

export function initOverlaySprite(state: ExtensionState, context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(() => updateGutterDecoration(state)),
    vscode.window.onDidChangeTextEditorVisibleRanges(() => updateGutterDecoration(state))
  );
}

export function updateGutterDecoration(state: ExtensionState): void {
  const starter = state.getStarter();
  const stage = state.getStage();
  const editor = vscode.window.activeTextEditor;

  if (!starter || !editor) {
    clearDecoration();
    return;
  }

  if (stage !== currentStage) {
    clearDecoration();
    currentStage = stage;
    startDanceAnimation(state, editor, stage);
  } else if (!isActive) {
    startDanceAnimation(state, editor, stage);
  }
}

function startDanceAnimation(_state: ExtensionState, editor: vscode.TextEditor, stage: number): void {
  if (animationInterval) clearInterval(animationInterval);

  isActive = true;
  let frame = 0;
  const totalFrames = 5;

  function renderFrame() {
    const currentEditor = vscode.window.activeTextEditor;
    if (!currentEditor || currentEditor !== editor) {
      clearDecoration();
      return;
    }

    if (decorationType) {
      decorationType.dispose();
    }

    const svgUri = getSvgDataUri(stage, frame);
    decorationType = vscode.window.createTextEditorDecorationType({
      gutterIconPath: vscode.Uri.parse(svgUri),
      gutterIconSize: '70%',
    });

    // Place sprite at a visible line near the middle of the viewport
    const visibleRanges = currentEditor.visibleRanges;
    if (visibleRanges.length === 0) return;

    const topLine = visibleRanges[0].start.line;
    const bottomLine = visibleRanges[0].end.line;
    const midLine = Math.floor((topLine + bottomLine) / 2);

    // Bounce between midLine and midLine+1 for a dancing effect
    const danceLine = midLine + (frame % 2 === 0 ? 0 : 1);
    const targetLine = Math.min(danceLine, currentEditor.document.lineCount - 1);

    const range = new vscode.Range(targetLine, 0, targetLine, 0);
    currentEditor.setDecorations(decorationType, [range]);

    frame = (frame + 1) % totalFrames;
  }

  renderFrame();
  animationInterval = setInterval(renderFrame, 600);
}

export function clearDecoration(): void {
  if (animationInterval) {
    clearInterval(animationInterval);
    animationInterval = undefined;
  }
  if (decorationType) {
    decorationType.dispose();
    decorationType = undefined;
  }
  isActive = false;
}

export function disposeOverlaySprite(): void {
  clearDecoration();
  currentStage = -1;
}

export function triggerDancePopup(_state: ExtensionState): void {
  const stage = currentStage >= 0 ? currentStage : 0;
  const labels = ['🐸 Froakie', '🌊 Frogadier', '🥷 Greninja'];
  const label = labels[stage] ?? labels[0];
  const dance = ['💃', '🕺', '✨', '⚡', '🎵'];
  const pick = dance[Math.floor(Math.random() * dance.length)];

  vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: `${label} is dancing! ${pick}` },
    () => new Promise<void>((resolve) => setTimeout(resolve, 1800))
  );
}
