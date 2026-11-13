import { beginSceneLoading, finishSceneLoading, queueWorldAssets, sceneWorldIds } from '../ui/assetLoading';
import { addObservatoryLens } from '../ui/observatoryLens';
import { addRiftBasalt } from '../ui/riftBasalt';
import { addEmpireLamp } from '../ui/empireLamp';
import { addGemGarden } from '../ui/gemGarden';
import { addJungleHeat } from '../ui/jungleHeat';
import { addFrozenGlobe } from '../ui/frozenGlobe';
import Phaser from 'phaser';
import type { SessionState } from '../../domain/session';
import { destinationById } from '../../domain/recipes';
import { activateTarget, explorationComplete, isPilot, pilotTargets } from '../../domain/pilotExploration';
import type { PilotId } from '../../domain/pilotExploration';
import { progressStore } from '../../services/storage';
import { getTexts } from '../../services/i18n';
import { souvenirs } from '../../domain/souvenirs';
import { AdventureControls, mapText, reducedMotion } from '../ui/adventureMap';
import { drawDestinationStage } from '../ui/destinationStage';
import { drawSouvenir } from '../ui/souvenir';
import { drawCimesSunrise, drawMyceliaLife } from '../ui/pilotWorlds';
import { destinationTravelTip } from '../ui/travelTutorial';
import { addArchipelagoReflections, gatherArchipelagoLight } from '../ui/archipelagoReflections';
import { addRuinsFish } from '../ui/ruinsFish';
import { addBraiseColumns } from '../ui/braiseColumns';
import { addIslesBridge } from '../ui/islesBridge';
import { addMarshFireflies } from '../ui/marshFireflies';
import { addDesertCrystals } from '../ui/desertCrystals';
import { addFrostBranches } from '../ui/frostBranches';
import { addTempleGuardians } from '../ui/templeGuardians';
import { addAshVolcano } from '../ui/ashVolcano';
import { addGrottoSpores } from '../ui/grottoSpores';
import { addAtollReflections } from '../ui/atollAurora';
import { addStormLightning } from '../ui/stormLightning';
import { addKingdomClouds } from '../ui/kingdomWaterfalls';
import { addSanctuaryPuzzle } from '../ui/sanctuarySpores';
import { addForestDrawing } from '../ui/forestSnow';
import { addNecropoleLamps } from '../ui/necropoleLamps';
import { addSylvePath } from '../ui/sylvePath';
import { addCityWindows } from '../ui/cityWindows';
import { addZenithWatering } from '../ui/zenithWatering';
import { addReefCorals } from '../ui/reefCorals';
import { addCanopyDew } from '../ui/canopyDew';
import { addVestigesStairs } from '../ui/vestigesStairs';

export class ExplorationScene extends Phaser.Scene {
  private id = '';
  private session: SessionState | undefined;
  private fromJournal = false;
  private journalPage = 0;
  private returnTo: 'adventure' | undefined;
  private controls!: AdventureControls;
  private offering = false;
  private justFound = false;
  private enter = true;
  private waking = false;
  private celebrate = false;
  private lastTouched: number | undefined;
  private lastActivated = false;
  private greet = () => {};
  private reflectionReplay: number[] | undefined;
  private souvenirArrival = false;
  private souvenirInFlight = false;
  private stopBridge = () => {};
  constructor() { super('exploration'); }

  preload(): void {
    beginSceneLoading(this);
    queueWorldAssets(this, sceneWorldIds(this, true), true);
  }

  create({ id, session, fromResult = false, journalPage = 0, returnTo }: {
    id?: string; session?: SessionState; fromResult?: boolean; journalPage?: number; returnTo?: 'adventure';
  } = {}): void {
    if (!finishSceneLoading(this)) return;
    if (!id || !destinationById(id) || !progressStore.read().discoveredDestinationIds.includes(id)) {
      this.scene.start('home'); return;
    }
    this.id = id;
    this.session = session ?? progressStore.read().expedition;
    this.fromJournal = session === undefined;
    this.journalPage = journalPage;
    this.returnTo = returnTo;
    this.offering = false;
    this.justFound = false;
    this.reflectionReplay = undefined;
    this.souvenirArrival = false;
    this.souvenirInFlight = false;
    this.enter = !fromResult;
    this.waking = false;
    this.celebrate = false;
    this.lastTouched = undefined;
    this.lastActivated = false;
    this.controls = new AdventureControls(this);
    this.render();
    this.scale.on('resize', this.render, this);
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.render, this);
      this.stopBridge(); this.stopBridge = () => {};
    });
  }

  private back(): void {
    this.scene.start(!this.fromJournal && this.session ? 'adventure' : 'journal-entry',
      !this.fromJournal && this.session ? { session: this.session }
        : { id: this.id, page: this.journalPage, returnTo: this.returnTo });
  }

  private touch(id: PilotId, index: number, x: number, y: number): void {
    if (this.souvenirInFlight) return;
    if ((id === 'archipel_azur' || id === 'desert_de_cristal') && this.reflectionReplay !== undefined) {
      const before = this.reflectionReplay.length;
      this.reflectionReplay = activateTarget(id, this.reflectionReplay, index);
      if (this.reflectionReplay.length === before) return;
      this.souvenirArrival = explorationComplete(id, this.reflectionReplay);
      if (id === 'desert_de_cristal' && !this.souvenirArrival) return;
      this.lastActivated = true; this.render(); return;
    }
    const result = progressStore.touchExploration(id, index);
    if ((id === 'archipel_azur' || id === 'ruines_englouties' || id === 'coeur_de_braise'
      || id === 'iles_suspendues' || id === 'marais_des_lucioles' || id === 'desert_de_cristal' || id === 'palais_de_givre' || id === 'temple_oublie' || id === 'ile_des_cendres' || id === 'grottes_sporiferes' || id === 'canopee_des_brumes' || id === 'recif_de_verre' || id === 'jardins_du_zenith' || id === 'cite_immobile' || id === 'sylve_prismatique' || id === 'necropole_ardente' || id === 'foret_du_silence') && !result.activated) return;
    // Keep the other school's in-progress swim alive after the first arrival.
    if ((id === 'ruines_englouties' || id === 'coeur_de_braise' || id === 'iles_suspendues'
      || id === 'marais_des_lucioles' || id === 'desert_de_cristal' || id === 'palais_de_givre' || id === 'temple_oublie' || id === 'ile_des_cendres' || id === 'grottes_sporiferes' || id === 'canopee_des_brumes' || id === 'recif_de_verre' || id === 'jardins_du_zenith' || id === 'cite_immobile' || id === 'sylve_prismatique' || id === 'necropole_ardente' || id === 'foret_du_silence') && !result.collected) return;
    this.lastTouched = index;
    this.lastActivated = result.activated;
    this.celebrate = result.collected;
    this.justFound ||= result.collected;
    this.souvenirArrival = (id === 'archipel_azur' || id === 'cimes_eternelles'
      || id === 'ruines_englouties' || id === 'coeur_de_braise' || id === 'iles_suspendues'
      || id === 'marais_des_lucioles' || id === 'desert_de_cristal' || id === 'palais_de_givre' || id === 'temple_oublie' || id === 'ile_des_cendres' || id === 'grottes_sporiferes' || id === 'canopee_des_brumes' || id === 'recif_de_verre' || id === 'jardins_du_zenith' || id === 'cite_immobile' || id === 'sylve_prismatique' || id === 'necropole_ardente' || id === 'foret_du_silence') && result.collected;
    if (result.collected && id === 'mycelia') this.justFound = false;
    this.render();
    if (result.collected && id === 'mycelia') this.collectSouvenir(x, y, () => {
      this.justFound = true;
      this.render();
    });
    if (id === 'mycelia' && !result.activated && !reducedMotion()) {
      const window = this.children.getByName(`mycelia-window-${index}`) as Phaser.GameObjects.Image | null;
      if (window) this.tweens.add({ targets: window, alpha: { from: 0.45, to: 1 }, duration: 240 });
    }
  }

  private render(): void {
    this.stopBridge(); this.stopBridge = () => {};
    this.tweens.killAll();
    this.children.getAll().forEach(child => child.destroy());
    this.controls.clear();
    const souvenirArrival = this.souvenirArrival;
    this.souvenirArrival = false;
    this.souvenirInFlight = souvenirArrival && !reducedMotion();
    const copy = getTexts().adventure;
    const progress = progressStore.read();
    const earned = progressStore.unlockedSouvenirIds().includes(this.id);
    const awake = this.id === 'mycelia' && !!progress.awakenedMycelia;
    const steps = (this.id === 'archipel_azur' || this.id === 'desert_de_cristal' || this.id === 'vestiges_celestes' || this.id === 'mer_figee' || this.id === 'jungle_incandescente' || this.id === 'jardins_de_gemmes' || this.id === 'empire_des_sables' || this.id === 'faille_des_contraires' || this.id === 'observatoire_des_etoiles')
      && this.reflectionReplay !== undefined ? this.reflectionReplay
      : isPilot(this.id) ? progressStore.explorationSteps(this.id) : [];
    const complete = isPilot(this.id) ? explorationComplete(this.id, steps) : earned;
    const found = earned && (this.reflectionReplay === undefined || complete);
    const souvenir = souvenirs.find(entry => entry.destinationId === this.id);
    const stage = drawDestinationStage(this, this.id, this.session,
      this.enter && !isPilot(this.id) && this.id !== 'archipel_azur' && this.id !== 'ruines_englouties',
      !found ? 'exploration' : this.justFound && !souvenirArrival ? 'souvenir' : undefined);
    this.enter = false;
    const { left, top, width: artW, height: artH } = stage.art;
    const { sideX, sideW, stickerY: tagY, portrait, short } = stage;
    if (this.id === 'cimes_eternelles') drawCimesSunrise(this, stage.art, complete, this.celebrate,
      this.lastTouched, steps, this.lastActivated);
    this.greet = this.id === 'mycelia' ? drawMyceliaLife(this, stage.art, awake, this.waking, steps,
      this.lastActivated ? this.lastTouched : undefined) : () => {};
    const marshWaking = this.id === 'marais_des_lucioles' && this.lastActivated ? this.lastTouched : undefined;
    this.waking = false;
    this.celebrate = false;
    this.lastTouched = undefined;
    this.lastActivated = false;
    const instruction = this.souvenirInFlight ? this.id === 'observatoire_des_etoiles' ? copy.observatoryComplete : this.id === 'faille_des_contraires' ? copy.riftComplete : this.id === 'empire_des_sables' ? copy.empireComplete : this.id === 'jardins_de_gemmes' ? copy.gemComplete : this.id === 'jungle_incandescente' ? copy.jungleComplete : this.id === 'mer_figee' ? copy.globeComplete : this.id === 'vestiges_celestes' ? copy.stairsAwakening
      : this.id === 'atoll_boreal' ? copy.atollAwakening
      : this.id === 'tempete_ecarlate' ? copy.stormAwakening
      : this.id === 'royaume_des_spores_celestes' ? copy.kingdomAwakening
      : this.id === 'sanctuaire_des_spores' ? copy.sanctuaryAwakening
      : this.id === 'foret_du_silence' ? copy.forestAwakening : this.id === 'necropole_ardente' ? copy.necropoleAwakening : this.id === 'sylve_prismatique' ? copy.sylveAwakening : this.id === 'cite_immobile' ? copy.cityAwakening : this.id === 'jardins_du_zenith' ? copy.zenithAwakening : this.id === 'cimes_eternelles' ? copy.cloudsParting
      : this.id === 'ruines_englouties' ? copy.fishGathering
      : this.id === 'coeur_de_braise' ? copy.basaltAwakening
      : this.id === 'iles_suspendues' ? copy.islesAwakening
      : this.id === 'marais_des_lucioles' ? copy.marshAwakening
      : this.id === 'recif_de_verre' ? copy.reefAwakening
      : this.id === 'canopee_des_brumes' ? copy.canopyAwakening
      : this.id === 'grottes_sporiferes' ? copy.grottoAwakening
      : this.id === 'ile_des_cendres' ? copy.ashAwakening
      : this.id === 'temple_oublie' ? copy.templeAwakening
      : this.id === 'palais_de_givre' ? copy.frostAwakening
      : this.id === 'desert_de_cristal' ? copy.desertAwakening : copy.souvenirForming
      : this.id === 'observatoire_des_etoiles' ? complete ? copy.observatoryComplete : copy.observatoryMood
      : this.id === 'faille_des_contraires' ? complete ? copy.riftComplete : copy.riftMood
      : this.id === 'empire_des_sables' ? complete ? copy.empireComplete : copy.empireMood
      : this.id === 'jardins_de_gemmes' ? complete ? copy.gemComplete : copy.gemMood
      : this.id === 'jungle_incandescente' ? complete ? copy.jungleComplete : copy.jungleMood
      : this.id === 'mer_figee' ? complete ? copy.globeComplete : copy.globeMood
      : this.id === 'vestiges_celestes' ? complete ? copy.stairsComplete : copy.stairsMood
      : this.id === 'atoll_boreal' ? complete ? copy.atollWoven : copy.atollMood
      : this.id === 'tempete_ecarlate' ? complete ? copy.stormCalm : steps.includes(0) ? copy.stormReturn : copy.stormMood
      : this.id === 'royaume_des_spores_celestes' ? complete ? copy.kingdomFlowing : copy.kingdomMood
      : this.id === 'sanctuaire_des_spores' ? complete ? copy.sanctuaryAwake : progress.sanctuaryPuzzle?.clueSeen ? copy.sanctuaryTune : copy.sanctuaryMood
      : this.id === 'foret_du_silence' ? complete ? copy.forestDrawAgain : copy.forestMood : this.id === 'necropole_ardente' && !complete ? copy.necropoleMood : this.id === 'sylve_prismatique' && !complete ? copy.sylveMood : this.id === 'cite_immobile' && !complete ? copy.cityMood : this.id === 'jardins_du_zenith' && !complete ? copy.zenithMood : this.offering ? copy.placeBell : !complete
      ? this.id === 'cimes_eternelles' ? copy.peaksMood : this.id === 'mycelia' ? copy.windowsMood : ''
      : awake ? copy.awakened : this.id === 'cimes_eternelles' ? copy.sunrise : copy.explored;
    mapText(this, sideX, stage.bodyY + 12, instruction, portrait || short ? 12 : 15, sideW - 15)
      .setFontFamily('Georgia, serif').setName('exploration-instruction');

    if (this.id === 'mycelia' || this.id === 'cimes_eternelles') {
      const pilot = this.id;
      pilotTargets[pilot].forEach((target, index) => {
        const x = left + artW * target.x, y = top + artH * target.y;
        this.controls.add(`${pilot === 'mycelia' ? 'window' : 'peak'}-${index}`, x, y, 44, 44,
          () => this.touch(pilot, index, x, y), false);
      });
    } else if (!found && !isPilot(this.id)) {
      // Other destinations retain their provisional interaction without sparkle markers.
      const seed = [...this.id].reduce((n, char) => n + char.charCodeAt(0), 0);
      const x = left + artW * (0.32 + seed % 4 * 0.1), y = top + artH * 0.58;
      this.controls.add('find-souvenir', x, y, 58, 58, () => {
        if (progressStore.explore(this.id)) { this.justFound = true; this.render(); this.collectSouvenir(x, y); }
      }, false);
    }

    if (this.id === 'archipel_azur') addArchipelagoReflections(this, this.controls, stage.art,
      (index, x, y) => this.touch('archipel_azur', index, x, y), steps);
    if (this.id === 'ruines_englouties') addRuinsFish(this, this.controls, stage.art, steps,
      (index, x, y) => this.touch('ruines_englouties', index, x, y), this.souvenirInFlight);
    if (this.id === 'coeur_de_braise') addBraiseColumns(this, this.controls, stage.art, steps,
      (index, x, y) => this.touch('coeur_de_braise', index, x, y), this.souvenirInFlight);
    if (this.id === 'iles_suspendues') this.stopBridge = addIslesBridge(this, this.controls, stage.art, steps,
      (index, x, y) => this.touch('iles_suspendues', index, x, y), this.souvenirInFlight);
    if (this.id === 'marais_des_lucioles') addMarshFireflies(this, this.controls, stage.art, steps,
      (index, x, y) => this.touch('marais_des_lucioles', index, x, y), this.souvenirInFlight, marshWaking);
    if (this.id === 'desert_de_cristal') addDesertCrystals(this, this.controls, stage.art, steps,
      (index, x, y) => this.touch('desert_de_cristal', index, x, y), this.souvenirInFlight);

    if (this.id === 'palais_de_givre') addFrostBranches(this, this.controls, stage.art, steps,
      (index, x, y) => this.touch('palais_de_givre', index, x, y), this.souvenirInFlight);

    if (this.id === 'temple_oublie') addTempleGuardians(this, this.controls, stage.art, steps,
      (index, x, y) => this.touch('temple_oublie', index, x, y), this.souvenirInFlight);

    if (this.id === 'ile_des_cendres') addAshVolcano(this, this.controls, stage.art, steps,
      (index, x, y) => this.touch('ile_des_cendres', index, x, y), this.souvenirInFlight);

    if (this.id === 'grottes_sporiferes') addGrottoSpores(this, this.controls, stage.art, steps,
      (index, x, y) => this.touch('grottes_sporiferes', index, x, y), this.souvenirInFlight);

    if (this.id === 'canopee_des_brumes') addCanopyDew(this, this.controls, stage.art, steps,
      (index, x, y) => this.touch('canopee_des_brumes', index, x, y), this.souvenirInFlight);

    if (this.id === 'recif_de_verre') addReefCorals(this, this.controls, stage.art, steps,
      (index, x, y) => this.touch('recif_de_verre', index, x, y), this.souvenirInFlight);

    if (this.id === 'jardins_du_zenith') this.stopBridge = addZenithWatering(this, stage.art, steps,
      (index, x, y) => this.touch('jardins_du_zenith', index, x, y), this.souvenirInFlight);

    if (this.id === 'cite_immobile') addCityWindows(this, stage.art, steps, this.controls,
      (index, x, y) => this.touch('cite_immobile', index, x, y), this.souvenirInFlight);

    if (this.id === 'sylve_prismatique') addSylvePath(this, stage.art, steps, this.controls,
      (index, x, y) => this.touch('sylve_prismatique', index, x, y), this.souvenirInFlight);

    if (this.id === 'necropole_ardente') addNecropoleLamps(this, stage.art, steps, this.controls,
      (index, x, y) => this.touch('necropole_ardente', index, x, y), this.souvenirInFlight);

    if (this.id === 'foret_du_silence') this.stopBridge = addForestDrawing(this, stage.art, steps,
      (index, x, y) => this.touch('foret_du_silence', index, x, y), this.souvenirInFlight);

    if (this.id === 'sanctuaire_des_spores') addSanctuaryPuzzle(this, this.controls, stage.art,
      progressStore.sanctuaryPuzzle(), earned, index => {
        const result = progressStore.rotateSanctuary(index);
        return { puzzle: progressStore.sanctuaryPuzzle(), collected: result.collected };
      }, () => {
        progressStore.showSanctuaryClue();
        if (!earned) (this.children.getByName('exploration-instruction') as Phaser.GameObjects.Text | null)
          ?.setText(copy.sanctuaryTune);
        return progressStore.sanctuaryPuzzle();
      }, () => { this.justFound = true; this.souvenirArrival = true; this.render(); }, this.souvenirInFlight);

    if (this.id === 'royaume_des_spores_celestes') this.stopBridge = addKingdomClouds(this, stage.art, steps,
      index => progressStore.touchExploration('royaume_des_spores_celestes', index),
      () => { this.justFound = true; this.souvenirArrival = true; this.render(); }, this.souvenirInFlight);

    if (this.id === 'tempete_ecarlate') this.stopBridge = addStormLightning(this, this.controls, stage.art, steps,
      index => progressStore.touchExploration('tempete_ecarlate', index),
      () => { this.justFound = true; this.souvenirArrival = true; this.render(); }, this.souvenirInFlight);

    if (this.id === 'atoll_boreal') this.stopBridge = addAtollReflections(this, this.controls, stage.art, steps,
      index => progressStore.touchExploration('atoll_boreal', index),
      () => { this.justFound = true; this.souvenirArrival = true; this.render(); }, this.souvenirInFlight);

    if (this.id === 'empire_des_sables') this.stopBridge = addEmpireLamp(this, this.controls, stage.art,
      steps, () => {
        const index = 0;
        if (this.reflectionReplay !== undefined) {
          const before = this.reflectionReplay.length;
          this.reflectionReplay = activateTarget('empire_des_sables', this.reflectionReplay, index);
          return { activated: before !== this.reflectionReplay.length,
            collected: explorationComplete('empire_des_sables', this.reflectionReplay) };
        }
        return progressStore.touchExploration('empire_des_sables', index);
      }, collected => {
        this.justFound ||= collected && this.reflectionReplay === undefined;
        this.souvenirArrival = collected; this.render();
      }, this.souvenirInFlight);

    if (this.id === 'observatoire_des_etoiles') this.stopBridge = addObservatoryLens(this, this.controls, stage.art,
      steps, index => {
        if (this.reflectionReplay !== undefined) {
          const before = this.reflectionReplay.length;
          this.reflectionReplay = activateTarget('observatoire_des_etoiles', this.reflectionReplay, index);
          return { activated: before !== this.reflectionReplay.length,
            collected: explorationComplete('observatoire_des_etoiles', this.reflectionReplay) };
        }
        return progressStore.touchExploration('observatoire_des_etoiles', index);
      }, collected => {
        this.justFound ||= collected && this.reflectionReplay === undefined;
        this.souvenirArrival = collected; this.render();
      }, this.souvenirInFlight);

    if (this.id === 'faille_des_contraires') this.stopBridge = addRiftBasalt(this, this.controls, stage.art,
      steps, index => {
        if (this.reflectionReplay !== undefined) {
          const before = this.reflectionReplay.length;
          this.reflectionReplay = activateTarget('faille_des_contraires', this.reflectionReplay, index);
          return { activated: before !== this.reflectionReplay.length,
            collected: explorationComplete('faille_des_contraires', this.reflectionReplay) };
        }
        return progressStore.touchExploration('faille_des_contraires', index);
      }, collected => {
        this.justFound ||= collected && this.reflectionReplay === undefined;
        this.souvenirArrival = collected; this.render();
      }, this.souvenirInFlight);

    if (this.id === 'jardins_de_gemmes') this.stopBridge = addGemGarden(this, this.controls, stage.art,
      steps, index => {
        if (this.reflectionReplay !== undefined) {
          const before = this.reflectionReplay.length;
          this.reflectionReplay = activateTarget('jardins_de_gemmes', this.reflectionReplay, index);
          return { activated: before !== this.reflectionReplay.length,
            collected: explorationComplete('jardins_de_gemmes', this.reflectionReplay) };
        }
        return progressStore.touchExploration('jardins_de_gemmes', index);
      }, collected => {
        this.justFound ||= collected && this.reflectionReplay === undefined;
        this.souvenirArrival = collected; this.render();
      }, this.souvenirInFlight);

    if (this.id === 'jungle_incandescente') this.stopBridge = addJungleHeat(this, this.controls, stage.art,
      steps, index => {
        if (this.reflectionReplay !== undefined) {
          const before = this.reflectionReplay.length;
          this.reflectionReplay = activateTarget('jungle_incandescente', this.reflectionReplay, index);
          return { activated: before !== this.reflectionReplay.length,
            collected: explorationComplete('jungle_incandescente', this.reflectionReplay) };
        }
        return progressStore.touchExploration('jungle_incandescente', index);
      }, collected => {
        this.justFound ||= collected && this.reflectionReplay === undefined;
        this.souvenirArrival = collected; this.render();
      }, this.souvenirInFlight);

    if (this.id === 'mer_figee') this.stopBridge = addFrozenGlobe(this, this.controls, stage.art,
      steps, index => {
        if (this.reflectionReplay !== undefined) {
          const before = this.reflectionReplay.length;
          this.reflectionReplay = activateTarget('mer_figee', this.reflectionReplay, index);
          return { activated: before !== this.reflectionReplay.length,
            collected: explorationComplete('mer_figee', this.reflectionReplay) };
        }
        return progressStore.touchExploration('mer_figee', index);
      }, collected => {
        this.justFound ||= collected && this.reflectionReplay === undefined;
        this.souvenirArrival = collected; this.render();
      }, this.souvenirInFlight);

    if (this.id === 'vestiges_celestes') this.stopBridge = addVestigesStairs(this, this.controls, stage.art,
      steps, index => {
        if (this.reflectionReplay !== undefined) {
          const before = this.reflectionReplay.length;
          this.reflectionReplay = activateTarget('vestiges_celestes', this.reflectionReplay, index);
          return { activated: before !== this.reflectionReplay.length,
            collected: explorationComplete('vestiges_celestes', this.reflectionReplay) };
        }
        return progressStore.touchExploration('vestiges_celestes', index);
      }, collected => {
        this.justFound ||= collected && this.reflectionReplay === undefined;
        this.souvenirArrival = collected; this.render();
      }, this.souvenirInFlight);

    const canOffer = this.id === 'mycelia' && progressStore.unlockedSouvenirIds().includes('cimes_eternelles')
      && !awake && this.session?.visitedDestinationIds.includes('mycelia');
    if ((canOffer && this.offering) || awake) {
      const bx = left + artW * 0.68, hook = top + artH * 0.53;
      const cord = this.add.graphics().setName('bell-cord').lineStyle(Math.max(1, artW * 0.0025), 0x735136);
      cord.beginPath().moveTo(left + artW * 0.705, top + artH * 0.505)
        .lineTo(left + artW * 0.697, top + artH * 0.518).lineTo(bx, hook).strokePath();
      cord.fillStyle(0xb9955f).fillCircle(bx, hook, Math.max(1, artW * 0.003));
      const bell = this.add.image(bx, hook, 'souvenir-cimes_eternelles').setOrigin(0.5, 0.07).setName('bell-in-world');
      bell.setScale(artH * 0.11 / bell.height).setAlpha(awake ? 1 : 0.45);
      if (this.offering || complete) this.controls.add('place-bell', bx, hook + artH * 0.05, 48, 44, () => {
        if (!awake && !progressStore.offerBell()) return;
        this.offering = false;
        this.waking = !awake;
        this.render();
        if (awake) this.greet();
      });
    }
    if (awake) this.controls.add('greet-mycelia', left + artW * 0.603, top + artH * 0.68, 48, 44, () => this.greet());

    if (souvenir) {
      const tagHeight = portrait ? 92 : short ? 84 : 104;
      const parts = drawSouvenir(this, souvenir, sideX, tagY - tagHeight / 2, sideW, tagHeight,
        this.justFound, !found || this.souvenirInFlight);
      parts.find(object => object.name === `souvenir-${this.id}`)?.setName('exploration-sticker');
      parts.forEach(part => part.setData('souvenir-part', true));
      parts.find(object => object.name === 'souvenir-name')?.setName('exploration-souvenir-name');
    }
    if (canOffer) {
      const panelW = Math.min(220, artW - 24), panelX = left + 12, panelY = top + artH - 50;
      this.add.graphics().setName('offering-panel').fillStyle(0x4d3828, 0.15)
        .fillRoundedRect(panelX + 2, panelY + 3, panelW, 46, 4)
        .fillStyle(0xf6e4bf, 0.97).lineStyle(1, 0xad8e5b)
        .fillRoundedRect(panelX, panelY, panelW, 46, 4).strokeRoundedRect(panelX, panelY, panelW, 46, 4);
      const token = this.add.image(panelX + 24, panelY + 24, 'souvenir-cimes_eternelles');
      token.setScale(Math.min(33 / token.width, 33 / token.height));
      mapText(this, panelX + panelW / 2 + 14, panelY + 11, copy.travellingSouvenir, 9, panelW - 55, '#9b7948');
      mapText(this, panelX + panelW / 2 + 14, panelY + 30,
        this.offering ? copy.cancelOffer : copy.offerBell, 12, panelW - 55).setFontStyle('bold');
      this.controls.add('offer-bell', panelX + panelW / 2, panelY + 23, panelW, 46,
        () => { this.offering = !this.offering; this.render(); });
    }
    if (earned && (this.id === 'archipel_azur' || this.id === 'desert_de_cristal' || this.id === 'vestiges_celestes' || this.id === 'mer_figee' || this.id === 'jungle_incandescente' || this.id === 'jardins_de_gemmes' || this.id === 'empire_des_sables' || this.id === 'faille_des_contraires' || this.id === 'observatoire_des_etoiles') && !this.souvenirInFlight) {
      this.controls.button(this.id === 'observatoire_des_etoiles' ? 'replay-observatory' : this.id === 'faille_des_contraires' ? 'replay-rift' : this.id === 'empire_des_sables' ? 'replay-lamp' : this.id === 'jardins_de_gemmes' ? 'replay-garden' : this.id === 'jungle_incandescente' ? 'replay-jungle' : this.id === 'mer_figee' ? 'replay-globe' : this.id === 'vestiges_celestes' ? 'replay-stairs' : this.id === 'desert_de_cristal' ? 'replay-crystals' : 'replay-reflections',
        this.id === 'observatoire_des_etoiles' ? copy.replayObservatory : this.id === 'faille_des_contraires' ? copy.replayRift : this.id === 'empire_des_sables' ? copy.replayLamp : this.id === 'jardins_de_gemmes' ? copy.replayGarden : this.id === 'jungle_incandescente' ? copy.replayJungle : this.id === 'mer_figee' ? copy.replayGlobe : this.id === 'vestiges_celestes' ? copy.replayStairs : this.id === 'desert_de_cristal' ? copy.replayCrystals : copy.replayReflections, sideX,
        tagY - (portrait ? 58 : 66), sideW - 12, () => {
          if (this.souvenirInFlight) return;
          this.reflectionReplay = []; this.justFound = false; this.render();
        });
    } else if (!canOffer) {
      const hint = found && this.id === 'cimes_eternelles' && !progress.awakenedMycelia ? copy.bellWish
        : this.justFound ? copy.found : copy.takeTime;
      mapText(this, sideX, tagY - (portrait ? 58 : 66), hint, portrait || short ? 11 : 12, sideW - 12, '#a07f4b')
        .setFontFamily('Georgia, serif').setFontStyle('italic').setName('exploration-hint');
    }
    this.controls.button('back-to-map', !this.fromJournal ? (short ? copy.mapShort : copy.backToMap) : getTexts().notebook.back,
      sideX, stage.secondaryY, Math.min(220, sideW - 15), () => this.back());
    if (this.souvenirInFlight) {
      if (this.id === 'archipel_azur') {
        gatherArchipelagoLight(this, stage.art, (x, y) => this.collectSouvenir(x, y, () => this.render(), true));
      } else if (this.id === 'observatoire_des_etoiles') {
        this.collectSouvenir(left + artW * 0.204, top + artH * 0.69, () => this.render(), true);
      } else if (this.id === 'faille_des_contraires') {
        this.collectSouvenir(left + artW * 0.485, top + artH * 0.46, () => this.render(), true);
      } else if (this.id === 'empire_des_sables') {
        this.collectSouvenir(left + artW * 0.84, top + artH * 0.75, () => this.render(), true);
      } else if (this.id === 'jardins_de_gemmes') {
        this.collectSouvenir(left + artW * 0.79, top + artH * 0.725, () => this.render(), true);
      } else if (this.id === 'jungle_incandescente') {
        this.collectSouvenir(left + artW * 0.214, top + artH * 0.566, () => this.render(), true);
      } else if (this.id === 'mer_figee') {
        this.collectSouvenir(left + artW * 0.242, top + artH * 0.661, () => this.render(), true);
      } else if (this.id === 'vestiges_celestes') {
        this.tweens.addCounter({ from: 0, to: 1, duration: 750, onComplete: () =>
          this.collectSouvenir(left + artW * 0.770, top + artH * 0.380, () => this.render(), true) });
      } else if (this.id === 'atoll_boreal') {
        this.tweens.addCounter({ from: 0, to: 1, duration: 1100, onComplete: () =>
          this.collectSouvenir(left + artW * 0.658, top + artH * 0.744, () => this.render(), true) });
      } else if (this.id === 'tempete_ecarlate') {
        this.tweens.addCounter({ from: 0, to: 1, duration: 1450, onComplete: () =>
          this.collectSouvenir(left + artW * 0.724, top + artH * 0.705, () => this.render(), true) });
      } else if (this.id === 'royaume_des_spores_celestes') {
        this.tweens.addCounter({ from: 0, to: 1, duration: 1600, onComplete: () =>
          this.collectSouvenir(left + artW * 0.777, top + artH * 0.661, () => this.render(), true) });
      } else if (this.id === 'sanctuaire_des_spores') {
        this.tweens.addCounter({ from: 0, to: 1, duration: 1700, onComplete: () =>
          this.collectSouvenir(left + artW * 0.519, top + artH * 0.565, () => this.render(), true) });
      } else if (this.id === 'foret_du_silence') {
        this.tweens.addCounter({ from: 0, to: 1, duration: 2050, onComplete: () =>
          this.collectSouvenir(left + artW * 0.62, top + artH * 0.78, () => this.render(), true) });
      } else if (this.id === 'necropole_ardente') {
        this.tweens.addCounter({ from: 0, to: 1, duration: 950, onComplete: () =>
          this.collectSouvenir(left + artW * 0.53, top + artH * 0.48, () => this.render(), true) });
      } else if (this.id === 'sylve_prismatique') {
        this.tweens.addCounter({ from: 0, to: 1, duration: 1900, onComplete: () =>
          this.collectSouvenir(left + artW * 0.53, top + artH * 0.86, () => this.render(), true) });
      } else if (this.id === 'cite_immobile') {
        this.tweens.addCounter({ from: 0, to: 1, duration: 1200, onComplete: () =>
          this.collectSouvenir(left + artW * 0.557, top + artH * 0.535, () => this.render(), true) });
      } else if (this.id === 'jardins_du_zenith') {
        this.tweens.addCounter({ from: 0, to: 1, duration: 1000, onComplete: () =>
          this.collectSouvenir(left + artW * 0.417, top + artH * 0.23, () => this.render(), true) });
      } else if (this.id === 'recif_de_verre') {
        this.tweens.addCounter({ from: 0, to: 1, duration: 1600, onComplete: () =>
          this.collectSouvenir(left + artW * 0.282, top + artH * 0.69, () => this.render(), true) });
      } else if (this.id === 'canopee_des_brumes') {
        this.tweens.addCounter({ from: 0, to: 1, duration: 1400, onComplete: () =>
          this.collectSouvenir(left + artW * 0.362, top + artH * 0.69, () => this.render(), true) });
      } else if (this.id === 'grottes_sporiferes') {
        this.tweens.addCounter({ from: 0, to: 1, duration: 1700, onComplete: () =>
          this.collectSouvenir(left + artW * 0.24, top + artH * 0.69, () => this.render(), true) });
      } else if (this.id === 'ile_des_cendres') {
        this.tweens.addCounter({ from: 0, to: 1, duration: 1400, onComplete: () =>
          this.collectSouvenir(left + artW * 0.645, top + artH * 0.73, () => this.render(), true) });
      } else if (this.id === 'temple_oublie') {
        this.tweens.addCounter({ from: 0, to: 1, duration: 650, onComplete: () =>
          this.collectSouvenir(left + artW * 0.65, top + artH * 0.70, () => this.render(), true) });
      } else if (this.id === 'palais_de_givre') {
        this.tweens.addCounter({ from: 0, to: 1, duration: 800, onComplete: () =>
          this.collectSouvenir(left + artW * 0.82, top + artH * 0.53, () => this.render(), true) });
      } else if (this.id === 'desert_de_cristal') {
        this.tweens.addCounter({ from: 0, to: 1, duration: 1500, onComplete: () =>
          this.collectSouvenir(left + artW * 0.70, top + artH * 0.61, () => this.render(), true) });
      } else if (this.id === 'marais_des_lucioles') {
        this.tweens.addCounter({ from: 0, to: 1, duration: 1500, onComplete: () =>
          this.collectSouvenir(left + artW * 0.65, top + artH * 0.54, () => this.render(), true) });
      } else if (this.id === 'iles_suspendues') {
        this.tweens.addCounter({ from: 0, to: 1, duration: 1300, onComplete: () =>
          this.collectSouvenir(left + artW * 0.56, top + artH * 0.62, () => this.render(), true) });
      } else if (this.id === 'coeur_de_braise') {
        this.tweens.addCounter({ from: 0, to: 1, duration: 1400, onComplete: () =>
          this.collectSouvenir(left + artW * 0.50, top + artH * 0.51, () => this.render(), true) });
      } else if (this.id === 'ruines_englouties') {
        this.tweens.addCounter({ from: 0, to: 1, duration: 1300, onComplete: () =>
          this.collectSouvenir(left + artW * 0.42, top + artH * 0.40, () => this.render(), true) });
      } else {
        this.tweens.addCounter({ from: 0, to: 1, duration: 1400, onComplete: () =>
          this.collectSouvenir(left + artW * 0.13, top + artH * 0.25, () => this.render()) });
      }
    } else if (this.reflectionReplay === undefined) {
      if (!found) destinationTravelTip(this, this.controls, 'exploration', stage, () => this.render());
      else if (this.justFound) destinationTravelTip(this, this.controls, 'souvenir', stage, () => this.render());
    }
  }

  private collectSouvenir(x: number, y: number, complete?: () => void, forming = false): void {
    if (reducedMotion() || this.children.getByName('tutorial-paper')) { complete?.(); return; }
    const target = this.children.getByName('exploration-sticker') as Phaser.GameObjects.Image | null;
    const slot = this.children.getByName('souvenir-tag')?.getData('souvenir-slot') as
      { x: number; y: number; size: number } | undefined;
    if (!target && !slot) { complete?.(); return; }
    const flying = this.add.image(x, y, `souvenir-${this.id}`).setName('souvenir-flying');
    const goal = target ?? slot!;
    const scale = target?.scaleX ?? Math.min(slot!.size / flying.width, slot!.size / flying.height);
    const curve = new Phaser.Curves.CubicBezier(new Phaser.Math.Vector2(x, y),
      new Phaser.Math.Vector2(x + 35, y - 65), new Phaser.Math.Vector2(goal.x - 55, goal.y - 95),
      new Phaser.Math.Vector2(goal.x, goal.y));
    target?.setAlpha(0);
    flying.setScale(scale * 0.55);
    if (forming) {
      flying.setAlpha(0);
      this.tweens.add({ targets: flying, alpha: 1, duration: 220 });
    }
    const state = { p: 0 };
    this.tweens.add({ targets: state, p: 1, delay: forming ? 220 : 0, duration: 800, ease: 'Sine.InOut', onUpdate: () => {
      const point = curve.getPoint(state.p);
      flying.setPosition(point.x, point.y).setScale(scale * (0.55 + Math.sin(state.p * Math.PI) * 0.8 + state.p * 0.45))
        .setAngle(-14 + Math.sin(state.p * Math.PI) * 20);
    }, onComplete: () => { flying.destroy(); target?.setAlpha(1); complete?.(); } });
  }
}
