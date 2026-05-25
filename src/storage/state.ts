import * as vscode from 'vscode';

export type EvolutionStage = 0 | 1 | 2; // 0: Froakie, 1: Frogadier, 2: Greninja

const KEYS = {
  STARTER: 'starter_dev_starter',
  XP: 'starter_dev_xp',
  STAGE: 'starter_dev_stage',
  ACTIVE_SECONDS: 'starter_dev_active_seconds',
  ORIGINAL_THEME: 'starter_dev_original_theme'
};

export class ExtensionState {
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  getStarter(): string | undefined {
    return this.context.globalState.get<string>(KEYS.STARTER);
  }

  async setStarter(starter: string | null): Promise<void> {
    await this.context.globalState.update(KEYS.STARTER, starter || undefined);
  }

  getXp(): number {
    return this.context.globalState.get<number>(KEYS.XP) ?? 0;
  }

  async setXp(xp: number): Promise<void> {
    await this.context.globalState.update(KEYS.XP, xp);
  }

  getStage(): EvolutionStage {
    return this.context.globalState.get<EvolutionStage>(KEYS.STAGE) ?? 0;
  }

  async setStage(stage: EvolutionStage): Promise<void> {
    await this.context.globalState.update(KEYS.STAGE, stage);
  }

  getActiveSeconds(): number {
    return this.context.globalState.get<number>(KEYS.ACTIVE_SECONDS) ?? 0;
  }

  async setActiveSeconds(seconds: number): Promise<void> {
    await this.context.globalState.update(KEYS.ACTIVE_SECONDS, seconds);
  }

  getOriginalTheme(): string | undefined {
    return this.context.globalState.get<string>(KEYS.ORIGINAL_THEME);
  }

  async setOriginalTheme(theme: string | undefined): Promise<void> {
    await this.context.globalState.update(KEYS.ORIGINAL_THEME, theme);
  }

  async clear(): Promise<void> {
    await this.context.globalState.update(KEYS.STARTER, undefined);
    await this.context.globalState.update(KEYS.XP, undefined);
    await this.context.globalState.update(KEYS.STAGE, undefined);
    await this.context.globalState.update(KEYS.ACTIVE_SECONDS, undefined);
    await this.context.globalState.update(KEYS.ORIGINAL_THEME, undefined);
  }
}
