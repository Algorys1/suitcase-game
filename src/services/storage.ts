import { destinations } from '../domain/recipes';
import { decodeSession } from '../domain/session';
import type { SessionState } from '../domain/session';
import { activateTarget, explorationComplete, isPilot, pilotTargetCounts, validSteps } from '../domain/pilotExploration';
import type { PilotId, PilotSteps } from '../domain/pilotExploration';

export const PROGRESS_KEY = 'suitcase-game.progress.v1';
export type Language = 'fr' | 'en';
export const tutorialSteps = ['departure', 'exploration', 'souvenir'] as const;
export type TutorialStep = typeof tutorialSteps[number];
export type Progress = {
  schemaVersion: 1;
  discoveredDestinationIds: string[];
  language: Language;
  expedition?: SessionState;
  pendingSouvenirIds?: string[];
  awakenedMycelia?: boolean;
  pilotSteps?: PilotSteps;
  tutorialSeen?: TutorialStep[];
};
type StorageAccess = () => Pick<Storage, 'getItem' | 'setItem'> & Partial<Pick<Storage, 'removeItem'>>;
const knownIds = new Set(destinations.map(({ id }) => id));

function emptyProgress(): Progress {
  return { schemaVersion: 1, discoveredDestinationIds: [], language: 'fr' };
}

export function decodeProgress(serialized: string | null): Progress {
  if (serialized === null) return emptyProgress();
  try {
    const value: unknown = JSON.parse(serialized);
    if (typeof value !== 'object' || value === null || !('schemaVersion' in value)
      || value.schemaVersion !== 1 || !('discoveredDestinationIds' in value)
      || !Array.isArray(value.discoveredDestinationIds)) return emptyProgress();
    const discoveredDestinationIds = [...new Set(value.discoveredDestinationIds
      .filter((id: unknown): id is string => typeof id === 'string' && knownIds.has(id)))];
    const language = 'language' in value && value.language === 'en' ? 'en' : 'fr';
    const expedition = decodeSession('expedition' in value ? value.expedition : null);
    const pending = 'pendingSouvenirIds' in value && Array.isArray(value.pendingSouvenirIds)
      ? [...new Set(value.pendingSouvenirIds.filter((id: unknown): id is string =>
        typeof id === 'string' && discoveredDestinationIds.includes(id)))] : [];
    const pilotSteps: PilotSteps = {};
    if ('pilotSteps' in value && typeof value.pilotSteps === 'object' && value.pilotSteps !== null) {
      for (const id of Object.keys(pilotTargetCounts) as PilotId[]) {
        if (!discoveredDestinationIds.includes(id)) continue;
        const steps = validSteps(id, Reflect.get(value.pilotSteps, id));
        if (steps.length) pilotSteps[id] = steps;
        if (explorationComplete(id, steps)) {
          const index = pending.indexOf(id);
          if (index >= 0) pending.splice(index, 1);
        }
      }
    }
    const tutorialSeen = 'tutorialSeen' in value && Array.isArray(value.tutorialSeen)
      ? tutorialSteps.filter(step => value.tutorialSeen instanceof Array && value.tutorialSeen.includes(step)) : [];
    return { schemaVersion: 1, language,
      ...(tutorialSeen.length ? { tutorialSeen } : {}),
      ...(Object.keys(pilotSteps).length ? { pilotSteps } : {}),
      ...(pending.length ? { pendingSouvenirIds: pending } : {}),
      ...('awakenedMycelia' in value && value.awakenedMycelia === true
        && discoveredDestinationIds.includes('mycelia') && discoveredDestinationIds.includes('cimes_eternelles')
        && !pending.includes('cimes_eternelles') ? { awakenedMycelia: true } : {}),
      discoveredDestinationIds: [...new Set([...discoveredDestinationIds, ...(expedition?.visitedDestinationIds ?? [])])],
      ...(expedition ? { expedition } : {}) };
  } catch {
    return emptyProgress();
  }
}

/** In-memory fallback keeps play possible when browser storage is unavailable. */
export class ProgressStore {
  private progress: Progress | null = null;
  private canPersist = true;

  constructor(private readonly storage: StorageAccess) {}

  read(): Progress {
    if (this.progress === null) {
      try { this.progress = decodeProgress(this.storage().getItem(PROGRESS_KEY)); }
      catch { this.progress = emptyProgress(); this.canPersist = false; }
    }
    return { ...this.progress, discoveredDestinationIds: [...this.progress.discoveredDestinationIds],
      ...(this.progress.tutorialSeen ? { tutorialSeen: [...this.progress.tutorialSeen] } : {}),
      ...(this.progress.pilotSteps ? { pilotSteps: Object.fromEntries(Object.entries(this.progress.pilotSteps)
        .map(([id, steps]) => [id, [...steps]])) } : {}),
      ...(this.progress.pendingSouvenirIds ? { pendingSouvenirIds: [...this.progress.pendingSouvenirIds] } : {}),
      ...(this.progress.expedition ? { expedition: decodeSession(this.progress.expedition)! } : {}) };
  }

  get persistent(): boolean {
    this.read();
    return this.canPersist;
  }

  discover(id: string): boolean {
    const progress = this.read();
    if (!knownIds.has(id) || progress.discoveredDestinationIds.includes(id)) return false;
    this.save({ ...progress, discoveredDestinationIds: [...progress.discoveredDestinationIds, id] });
    return true;
  }

  setLanguage(language: Language): void {
    this.save({ ...this.read(), language });
  }

  acknowledgeTutorial(step?: TutorialStep): void {
    const progress = this.read();
    this.save({ ...progress, tutorialSeen: step
      ? [...new Set([...(progress.tutorialSeen ?? []), step])] : [...tutorialSteps] });
  }

  /** Session and discoveries share one write, before the departure animation. */
  saveSession(session: SessionState): void {
    const expedition = decodeSession(session);
    if (!expedition) return;
    const progress = this.read();
    const pending = [...new Set([...(progress.pendingSouvenirIds ?? []),
      ...expedition.visitedDestinationIds.filter(id => !progress.discoveredDestinationIds.includes(id))])];
    this.save({ ...progress, expedition, ...(pending.length ? { pendingSouvenirIds: pending } : {}), discoveredDestinationIds: [...new Set([
      ...progress.discoveredDestinationIds, ...expedition.visitedDestinationIds,
    ])] });
  }

  unlockedSouvenirIds(): string[] {
    const progress = this.read();
    return progress.discoveredDestinationIds.filter(id => !progress.pendingSouvenirIds?.includes(id));
  }

  explore(id: string): boolean {
    const progress = this.read();
    if (!progress.discoveredDestinationIds.includes(id) || !progress.pendingSouvenirIds?.includes(id)) return false;
    if (isPilot(id) && !explorationComplete(id, this.explorationSteps(id))) return false;
    const remaining = progress.pendingSouvenirIds.filter(entry => entry !== id);
    delete progress.pendingSouvenirIds;
    this.save({ ...progress, ...(remaining.length ? { pendingSouvenirIds: remaining } : {}) });
    return true;
  }

  explorationSteps(id: PilotId): number[] {
    const progress = this.read();
    const stored = progress.pilotSteps?.[id];
    if (stored) return [...stored];
    // Older, already-earned souvenirs retain their completed landscapes.
    return this.unlockedSouvenirIds().includes(id)
      ? Array.from({ length: pilotTargetCounts[id] }, (_, index) => index) : [];
  }

  touchExploration(id: PilotId, index: number): { activated: boolean; complete: boolean; collected: boolean } {
    const progress = this.read();
    const before = this.explorationSteps(id);
    if (!progress.discoveredDestinationIds.includes(id)) return { activated: false, complete: false, collected: false };
    const steps = activateTarget(id, before, index);
    const activated = steps.length !== before.length;
    const complete = explorationComplete(id, steps);
    const collected = complete && (progress.pendingSouvenirIds?.includes(id) ?? false);
    if (activated || collected) {
      const pending = (progress.pendingSouvenirIds ?? []).filter(entry => entry !== id || !collected);
      delete progress.pendingSouvenirIds;
      this.save({ ...progress, pilotSteps: { ...progress.pilotSteps, [id]: steps },
        ...(pending.length ? { pendingSouvenirIds: pending } : {}) });
    }
    return { activated, complete, collected };
  }

  offerBell(): boolean {
    const progress = this.read();
    if (progress.awakenedMycelia || !this.unlockedSouvenirIds().includes('cimes_eternelles')
      || !progress.expedition?.visitedDestinationIds.includes('mycelia')) return false;
    this.save({ ...progress, awakenedMycelia: true });
    return true;
  }

  finishSession(): void {
    const progress = this.read();
    if (progress.expedition?.phase !== 'ended') return;
    delete progress.expedition;
    this.save(progress);
  }

  /** Clear this game's save and its in-memory cache, without touching other site data. */
  reset(): boolean {
    this.progress = emptyProgress();
    try {
      const storage = this.storage();
      if (storage.removeItem) storage.removeItem(PROGRESS_KEY);
      else storage.setItem(PROGRESS_KEY, JSON.stringify(this.progress));
      this.canPersist = true;
    } catch { this.canPersist = false; }
    return this.canPersist;
  }

  private save(progress: Progress): void {
    this.progress = progress;
    try {
      this.storage().setItem(PROGRESS_KEY, JSON.stringify(progress));
      this.canPersist = true;
    } catch { this.canPersist = false; }
  }
}

// Lazy access also catches browsers that throw when localStorage itself is read.
export const progressStore = new ProgressStore(() => window.localStorage);
