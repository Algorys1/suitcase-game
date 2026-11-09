import { describe, expect, it } from 'vitest';
import { decodeSanctuaryPuzzle, initialSanctuaryPuzzle, sanctuaryAligned, turnSanctuary } from '../domain/sanctuaryPuzzle';
import { ProgressStore, decodeProgress } from '../services/storage';
import { beginTravel, createSession, revealResult } from '../domain/session';

describe('serrure à spores', () => {
  it('donne quatre positions indépendantes et une seule solution parmi les 64 motifs', () => {
    const original = initialSanctuaryPuzzle();
    let puzzle = original;
    for (let i = 0; i < 4; i++) puzzle = turnSanctuary(puzzle, 1);
    expect(puzzle).toEqual(original); expect(puzzle).not.toBe(original);
    expect(turnSanctuary(original, 0).positions).toEqual([3, 0, 3]);
    expect(original.positions).toEqual([2, 0, 3]);
    expect(turnSanctuary(original, -1)).toEqual(original);
    let solutions = 0;
    for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) for (let c = 0; c < 4; c++)
      if (sanctuaryAligned({ positions: [a, b, c], clueSeen: true })) solutions++;
    expect(solutions).toBe(1);
  });

  it('reprend les réglages, n’efface rien sur une erreur et ne collecte qu’une fois', () => {
    let saved: string | null = null, writes = 0;
    const storage = { getItem: () => saved, setItem: (_: string, value: string) => { saved = value; writes++; } };
    const first = new ProgressStore(() => storage);
    expect(first.rotateSanctuary(0).changed).toBe(false);
    first.setLanguage('en');
    first.saveSession(revealResult(beginTravel(createSession(), ['mushroom', 'ruins'])));
    expect(first.explore('sanctuaire_des_spores')).toBe(false);
    expect(first.touchExploration('sanctuaire_des_spores', 0).collected).toBe(false);
    first.showSanctuaryClue();
    expect(first.rotateSanctuary(2).collected).toBe(false);
    const next = new ProgressStore(() => storage);
    expect(next.sanctuaryPuzzle()).toEqual({ positions: [2, 0, 0], clueSeen: true });
    for (const index of [0, 1, 2, 0]) expect(next.rotateSanctuary(index).collected).toBe(false);
    expect(next.sanctuaryPuzzle().positions).toEqual([0, 1, 1]);
    const before = writes;
    expect(next.rotateSanctuary(1).collected).toBe(true);
    expect(writes - before).toBe(1);
    const restored = new ProgressStore(() => storage);
    expect(restored.unlockedSouvenirIds()).toEqual(['sanctuaire_des_spores']);
    expect(restored.explorationSteps('sanctuaire_des_spores')).toEqual([0]);
    expect(restored.rotateSanctuary(1).collected).toBe(false);
    expect(restored.sanctuaryPuzzle().positions).toEqual([0, 3, 1]);
    expect(restored.unlockedSouvenirIds()).toEqual(['sanctuaire_des_spores']);
    expect(restored.read().expedition?.charges).toBe(9);
    expect(restored.read().language).toBe('en');
    const copy = restored.read(); copy.sanctuaryPuzzle!.positions[0] = 3;
    expect(restored.sanctuaryPuzzle().positions[0]).toBe(0);
  });

  it('récupère un puzzle invalide sans perdre carnet, langue ni anciennes récompenses', () => {
    for (const positions of [[0, 1], [0, 1, 4], [0, '2', 1], [0, -1, 1], [0, 1.5, 1]])
      expect(decodeSanctuaryPuzzle({ positions, clueSeen: true })).toBeUndefined();
    const decoded = decodeProgress(JSON.stringify({ schemaVersion: 1, language: 'en',
      discoveredDestinationIds: ['sanctuaire_des_spores'], sanctuaryPuzzle: { positions: [9], clueSeen: true } }));
    expect(decoded.language).toBe('en'); expect(decoded.discoveredDestinationIds).toEqual(['sanctuaire_des_spores']);
    expect(decoded.sanctuaryPuzzle).toBeUndefined();
    const legacy = new ProgressStore(() => ({ getItem: () => JSON.stringify(decoded), setItem: () => {} }));
    expect(sanctuaryAligned(legacy.sanctuaryPuzzle())).toBe(true);
    expect(legacy.rotateSanctuary(0).collected).toBe(false);
    expect(legacy.unlockedSouvenirIds()).toEqual(['sanctuaire_des_spores']);
    legacy.reset(); expect(legacy.read().sanctuaryPuzzle).toBeUndefined();
  });
});
