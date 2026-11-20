import { destinations } from '../domain/recipes';
import { decodeSession } from '../domain/session';
import type { SessionState } from '../domain/session';
import { activateTarget, explorationComplete, isPilot, pilotTargetCounts, validSteps } from '../domain/pilotExploration';
import type { PilotId, PilotSteps } from '../domain/pilotExploration';
import { decodeSanctuaryPuzzle, initialSanctuaryPuzzle, sanctuaryAligned, turnSanctuary } from '../domain/sanctuaryPuzzle';
import type { SanctuaryPuzzle } from '../domain/sanctuaryPuzzle';

export const PROGRESS_KEY = 'suitcase-game.progress.v1';
export type Language = 'fr' | 'en';
export const tutorialSteps = ['departure', 'needles', 'energy', 'arrival', 'exploration', 'souvenir', 'exhausted'] as const;
export type TutorialStep = typeof tutorialSteps[number];
export type Progress = {
  schemaVersion: 1;
  discoveredDestinationIds: string[];
  language: Language;
  introSeen?: boolean;
  muted?: boolean;
  expedition?: SessionState;
  pendingSouvenirIds?: string[];
  awakenedMycelia?: boolean;
  welcomedForestVisitor?: boolean;
  welcomedCityVisitor?: boolean;
  welcomedSeaVisitor?: boolean;
  welcomedObservatoryVisitor?: boolean;
  welcomedEmpireVisitor?: boolean;
  welcomedReefVisitor?: boolean;
  welcomedMarshVisitor?: boolean;
  welcomedPalaceVisitor?: boolean;
  welcomedVestigesVisitor?: boolean;
  welcomedKingdomVisitor?: boolean;
  pilotSteps?: PilotSteps;
  tutorialSeen?: TutorialStep[];
  sanctuaryPuzzle?: SanctuaryPuzzle;
  vestigesLayout?: 2;
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
        const raw = Reflect.get(value.pilotSteps, id);
        const legacyVestiges = id === 'vestiges_celestes' && !('vestigesLayout' in value && value.vestigesLayout === 2)
          && Array.isArray(raw) ? [...new Set(raw.filter((step: unknown): step is number =>
            typeof step === 'number' && Number.isInteger(step) && step >= 0 && step < 4))] : undefined;
        // Three new stones replace four old slabs: retain the number already placed.
        const steps = legacyVestiges ? Array.from({ length: Math.min(3, legacyVestiges.length) }, (_, i) => i)
          : validSteps(id, raw);
        if (steps.length) pilotSteps[id] = steps;
        if (explorationComplete(id, steps)) {
          const index = pending.indexOf(id);
          if (index >= 0) pending.splice(index, 1);
        }
      }
    }
    const tutorialSeen = 'tutorialSeen' in value && Array.isArray(value.tutorialSeen)
      ? tutorialSteps.filter(step => value.tutorialSeen instanceof Array && value.tutorialSeen.includes(step)) : [];
    const sanctuaryPuzzle = discoveredDestinationIds.includes('sanctuaire_des_spores') && 'sanctuaryPuzzle' in value
      ? decodeSanctuaryPuzzle(value.sanctuaryPuzzle) : undefined;
    return { schemaVersion: 1, language,
      ...('introSeen' in value && value.introSeen === true ? { introSeen: true } : {}),
      ...('muted' in value && value.muted === true ? { muted: true } : {}),
      ...(discoveredDestinationIds.includes('vestiges_celestes') ? { vestigesLayout: 2 as const } : {}),
      ...(sanctuaryPuzzle ? { sanctuaryPuzzle } : {}),
      ...(tutorialSeen.length ? { tutorialSeen } : {}),
      ...(Object.keys(pilotSteps).length ? { pilotSteps } : {}),
      ...(pending.length ? { pendingSouvenirIds: pending } : {}),
      ...('welcomedReefVisitor' in value && value.welcomedReefVisitor === true
        && discoveredDestinationIds.includes('recif_de_verre') && discoveredDestinationIds.includes('grottes_sporiferes')
        && !pending.includes('grottes_sporiferes') ? { welcomedReefVisitor: true } : {}),
      ...('welcomedMarshVisitor' in value && value.welcomedMarshVisitor === true
        && discoveredDestinationIds.includes('marais_des_lucioles') && discoveredDestinationIds.includes('jardins_de_gemmes')
        && !pending.includes('jardins_de_gemmes') ? { welcomedMarshVisitor: true } : {}),
      ...('welcomedPalaceVisitor' in value && value.welcomedPalaceVisitor === true
        && discoveredDestinationIds.includes('palais_de_givre') && discoveredDestinationIds.includes('atoll_boreal')
        && !pending.includes('atoll_boreal') ? { welcomedPalaceVisitor: true } : {}),
      ...('welcomedVestigesVisitor' in value && value.welcomedVestigesVisitor === true
        && discoveredDestinationIds.includes('vestiges_celestes') && discoveredDestinationIds.includes('tempete_ecarlate')
        && !pending.includes('tempete_ecarlate') ? { welcomedVestigesVisitor: true } : {}),
      ...('welcomedKingdomVisitor' in value && value.welcomedKingdomVisitor === true
        && discoveredDestinationIds.includes('royaume_des_spores_celestes') && discoveredDestinationIds.includes('jungle_incandescente')
        && !pending.includes('jungle_incandescente') ? { welcomedKingdomVisitor: true } : {}),
      ...('welcomedEmpireVisitor' in value && value.welcomedEmpireVisitor === true
        && discoveredDestinationIds.includes('empire_des_sables') && discoveredDestinationIds.includes('temple_oublie')
        && !pending.includes('temple_oublie') ? { welcomedEmpireVisitor: true } : {}),
      ...('welcomedObservatoryVisitor' in value && value.welcomedObservatoryVisitor === true
        && discoveredDestinationIds.includes('observatoire_des_etoiles') && discoveredDestinationIds.includes('iles_suspendues')
        && !pending.includes('iles_suspendues') ? { welcomedObservatoryVisitor: true } : {}),
      ...('welcomedSeaVisitor' in value && value.welcomedSeaVisitor === true
        && discoveredDestinationIds.includes('mer_figee') && discoveredDestinationIds.includes('archipel_azur')
        && !pending.includes('archipel_azur') ? { welcomedSeaVisitor: true } : {}),
      ...('welcomedCityVisitor' in value && value.welcomedCityVisitor === true
        && discoveredDestinationIds.includes('cite_immobile') && discoveredDestinationIds.includes('coeur_de_braise')
        && !pending.includes('coeur_de_braise') ? { welcomedCityVisitor: true } : {}),
      ...('welcomedForestVisitor' in value && value.welcomedForestVisitor === true
        && discoveredDestinationIds.includes('foret_du_silence') && discoveredDestinationIds.includes('mycelia')
        && !pending.includes('mycelia') ? { welcomedForestVisitor: true } : {}),
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
      ...(this.progress.sanctuaryPuzzle ? { sanctuaryPuzzle: decodeSanctuaryPuzzle(this.progress.sanctuaryPuzzle)! } : {}),
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

  acknowledgeIntro(): void { this.save({ ...this.read(), introSeen: true }); }

  setMuted(muted: boolean): void { this.save({ ...this.read(), muted }); }

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
    // Older desert and Vestiges activities used different targets; keep earned souvenirs.
    if ((id === 'desert_de_cristal' || id === 'vestiges_celestes' || id === 'mer_figee') && this.unlockedSouvenirIds().includes(id)
      && stored?.length !== pilotTargetCounts[id]) {
      return Array.from({ length: pilotTargetCounts[id] }, (_, index) => index);
    }
    if (stored) return [...stored];
    // Older, already-earned souvenirs retain their completed landscapes.
    return this.unlockedSouvenirIds().includes(id)
      ? Array.from({ length: pilotTargetCounts[id] }, (_, index) => index) : [];
  }

  touchExploration(id: PilotId, index: number): { activated: boolean; complete: boolean; collected: boolean } {
    const progress = this.read();
    const before = this.explorationSteps(id);
    if (!progress.discoveredDestinationIds.includes(id)) return { activated: false, complete: false, collected: false };
    if (id === 'sanctuaire_des_spores' && !sanctuaryAligned(this.sanctuaryPuzzle()))
      return { activated: false, complete: false, collected: false };
    const steps = activateTarget(id, before, index);
    const activated = steps.length !== before.length;
    const complete = explorationComplete(id, steps);
    const collected = complete && (progress.pendingSouvenirIds?.includes(id) ?? false);
    if (activated || collected) {
      const pending = (progress.pendingSouvenirIds ?? []).filter(entry => entry !== id || !collected);
      delete progress.pendingSouvenirIds;
      this.save({ ...progress, pilotSteps: { ...progress.pilotSteps, [id]: steps },
        ...(id === 'vestiges_celestes' ? { vestigesLayout: 2 as const } : {}),
        ...(pending.length ? { pendingSouvenirIds: pending } : {}) });
    }
    return { activated, complete, collected };
  }

  sanctuaryPuzzle(): SanctuaryPuzzle {
    return this.read().sanctuaryPuzzle
      ?? initialSanctuaryPuzzle(this.unlockedSouvenirIds().includes('sanctuaire_des_spores'));
  }

  showSanctuaryClue(): boolean {
    const progress = this.read();
    if (!progress.discoveredDestinationIds.includes('sanctuaire_des_spores')) return false;
    this.save({ ...progress, sanctuaryPuzzle: { ...this.sanctuaryPuzzle(), clueSeen: true } });
    return true;
  }

  rotateSanctuary(index: number): { changed: boolean; collected: boolean } {
    const progress = this.read(), id = 'sanctuaire_des_spores';
    if (!progress.discoveredDestinationIds.includes(id) || !Number.isInteger(index) || index < 0 || index > 2)
      return { changed: false, collected: false };
    const puzzle = turnSanctuary(this.sanctuaryPuzzle(), index), solved = sanctuaryAligned(puzzle);
    const collected = solved && (progress.pendingSouvenirIds?.includes(id) ?? false);
    const pending = (progress.pendingSouvenirIds ?? []).filter(entry => entry !== id || !collected);
    delete progress.pendingSouvenirIds;
    // Positions and collection are saved atomically, independently of the reveal animation.
    this.save({ ...progress, sanctuaryPuzzle: puzzle,
      ...(solved ? { pilotSteps: { ...progress.pilotSteps, sanctuaire_des_spores: [0] } } : {}),
      ...(pending.length ? { pendingSouvenirIds: pending } : {}) });
    return { changed: true, collected };
  }

  offerBell(): boolean {
    const progress = this.read();
    if (progress.awakenedMycelia || !this.unlockedSouvenirIds().includes('cimes_eternelles')
      || !progress.discoveredDestinationIds.includes('mycelia')) return false;
    this.save({ ...progress, awakenedMycelia: true });
    return true;
  }

  offerSporeLantern(): boolean {
    const progress = this.read();
    if (progress.welcomedForestVisitor || !this.unlockedSouvenirIds().includes('mycelia')
      || !progress.discoveredDestinationIds.includes('foret_du_silence')) return false;
    this.save({ ...progress, welcomedForestVisitor: true });
    return true;
  }

  offerEmber(): boolean {
    const progress = this.read();
    if (progress.welcomedCityVisitor || !this.unlockedSouvenirIds().includes('coeur_de_braise')
      || !progress.discoveredDestinationIds.includes('cite_immobile')) return false;
    this.save({ ...progress, welcomedCityVisitor: true });
    return true;
  }

  offerSeashell(): boolean {
    const progress = this.read();
    if (progress.welcomedSeaVisitor || !this.unlockedSouvenirIds().includes('archipel_azur')
      || !progress.discoveredDestinationIds.includes('mer_figee')) return false;
    this.save({ ...progress, welcomedSeaVisitor: true });
    return true;
  }

  offerWeightlessPebble(): boolean {
    const progress = this.read();
    if (progress.welcomedObservatoryVisitor || !this.unlockedSouvenirIds().includes('iles_suspendues')
      || !progress.discoveredDestinationIds.includes('observatoire_des_etoiles')) return false;
    this.save({ ...progress, welcomedObservatoryVisitor: true });
    return true;
  }

  offerRootAmulet(): boolean {
    const progress = this.read();
    if (progress.welcomedEmpireVisitor || !this.unlockedSouvenirIds().includes('temple_oublie')
      || !progress.discoveredDestinationIds.includes('empire_des_sables')) return false;
    this.save({ ...progress, welcomedEmpireVisitor: true });
    return true;
  }

  offerGemFlower(): boolean {
    const progress = this.read();
    if (progress.welcomedMarshVisitor || !this.unlockedSouvenirIds().includes('jardins_de_gemmes')
      || !progress.discoveredDestinationIds.includes('marais_des_lucioles')) return false;
    this.save({ ...progress, welcomedMarshVisitor: true });
    return true;
  }

  offerAuroraBracelet(): boolean {
    const progress = this.read();
    if (progress.welcomedPalaceVisitor || !this.unlockedSouvenirIds().includes('atoll_boreal')
      || !progress.discoveredDestinationIds.includes('palais_de_givre')) return false;
    this.save({ ...progress, welcomedPalaceVisitor: true });
    return true;
  }

  offerBottledLightning(): boolean {
    const progress = this.read();
    if (progress.welcomedVestigesVisitor || !this.unlockedSouvenirIds().includes('tempete_ecarlate')
      || !progress.discoveredDestinationIds.includes('vestiges_celestes')) return false;
    this.save({ ...progress, welcomedVestigesVisitor: true });
    return true;
  }

  offerLanternFruit(): boolean {
    const progress = this.read();
    if (progress.welcomedKingdomVisitor || !this.unlockedSouvenirIds().includes('jungle_incandescente')
      || !progress.discoveredDestinationIds.includes('royaume_des_spores_celestes')) return false;
    this.save({ ...progress, welcomedKingdomVisitor: true });
    return true;
  }

  offerLuminousGeode(): boolean {
    const progress = this.read();
    if (progress.welcomedReefVisitor || !this.unlockedSouvenirIds().includes('grottes_sporiferes')
      || !progress.discoveredDestinationIds.includes('recif_de_verre')) return false;
    this.save({ ...progress, welcomedReefVisitor: true });
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
