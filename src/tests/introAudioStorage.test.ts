import { describe, expect, it } from 'vitest';
import { decodeProgress, ProgressStore } from '../services/storage';
import { createSession } from '../domain/session';

describe('intro et préférence sonore', () => {
  it('ignore les mauvais types et conserve les anciennes sauvegardes', () => {
    const old = { schemaVersion: 1, language: 'en', discoveredDestinationIds: ['mycelia'] };
    expect(decodeProgress(JSON.stringify(old))).toEqual(old);
    expect(decodeProgress(JSON.stringify({ ...old, introSeen: 'true', muted: 1 }))).toEqual(old);
    expect(decodeProgress(JSON.stringify({ ...old, introSeen: true, muted: true })))
      .toEqual({ ...old, introSeen: true, muted: true });
  });
  it('mémorise intro et silence sans modifier le voyage ni les découvertes', () => {
    let value: string | null = null;
    const storage = { getItem: () => value, setItem: (_key: string, next: string) => { value = next; } };
    const store = new ProgressStore(() => storage);
    store.saveSession(createSession()); store.discover('mycelia'); store.setLanguage('en');
    const before = store.read();
    store.acknowledgeIntro(); store.setMuted(true);
    expect(new ProgressStore(() => storage).read()).toEqual({ ...before, introSeen: true, muted: true });
    store.setMuted(false);
    expect(new ProgressStore(() => storage).read().muted).not.toBe(true);
  });
  it('reste utilisable en mémoire lorsque le stockage est bloqué', () => {
    const store = new ProgressStore(() => { throw new Error('blocked'); });
    store.acknowledgeIntro(); store.setMuted(true);
    expect(store.read().introSeen).toBe(true); expect(store.read().muted).toBe(true);
    expect(store.persistent).toBe(false);
  });
  it('efface les préférences lors du reset du jeu', () => {
    let value: string | null = null;
    const store = new ProgressStore(() => ({ getItem: () => value, setItem: (_key, next) => { value = next; } }));
    store.acknowledgeIntro(); store.setMuted(true); store.reset();
    expect(store.read().introSeen).toBeUndefined(); expect(store.read().muted).toBeUndefined();
  });
});
