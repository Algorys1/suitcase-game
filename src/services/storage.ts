import { destinations } from '../domain/recipes';
import { decodeSession } from '../domain/session';
import type { SessionState } from '../domain/session';

export const PROGRESS_KEY = 'suitcase-game.progress.v1';
export type Language = 'fr' | 'en';
export type Progress = {
  schemaVersion: 1;
  discoveredDestinationIds: string[];
  language: Language;
  expedition?: SessionState;
};
type StorageAccess = () => Pick<Storage, 'getItem' | 'setItem'>;
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
    return { schemaVersion: 1, language,
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

  /** Session and discoveries share one write, before the departure animation. */
  saveSession(session: SessionState): void {
    const expedition = decodeSession(session);
    if (!expedition) return;
    const progress = this.read();
    this.save({ ...progress, expedition, discoveredDestinationIds: [...new Set([
      ...progress.discoveredDestinationIds, ...expedition.visitedDestinationIds,
    ])] });
  }

  finishSession(): void {
    const progress = this.read();
    if (progress.expedition?.phase !== 'ended') return;
    delete progress.expedition;
    this.save(progress);
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
