import { describe, expect, it } from 'vitest';
import { souvenirs, souvenirForDestination } from '../domain/souvenirs';
import { destinations } from '../domain/recipes';
import { decodeProgress, ProgressStore } from '../services/storage';
import { translate } from '../services/i18n';

const assets = import.meta.glob('../../public/assets/stickers/*.webp', {
  eager: true, query: '?url', import: 'default',
});

describe('souvenirs des 30 destinations', () => {
  it('associe chaque souvenir à une destination unique, une image et des noms FR/EN', () => {
    expect(souvenirs).toHaveLength(30);
    expect(new Set(souvenirs.map(s => s.destinationId)).size).toBe(30);
    expect(souvenirs.map(s => s.destinationId).sort()).toEqual(destinations.map(d => d.id).sort());
    for (const souvenir of souvenirs) {
      expect(destinations.some(d => d.id === souvenir.destinationId)).toBe(true);
      expect(assets).toHaveProperty(`../../public/${souvenir.image}`);
      for (const language of ['fr', 'en'] as const) {
        expect(translate(souvenir.nameKey, language)).not.toBe('Texte indisponible');
      }
    }
  });

  it('reste masqué avant découverte et ne donne rien pour le Néant ou un ID inconnu', () => {
    expect(souvenirForDestination('archipel_azur', [])).toBeUndefined();
    expect(souvenirForDestination(null, ['archipel_azur'])).toBeUndefined();
    expect(souvenirForDestination('unknown', ['unknown'])).toBeUndefined();
    for (const destination of destinations) {
      expect(souvenirForDestination(destination.id, [])).toBeUndefined();
      expect(souvenirForDestination(destination.id, [destination.id])?.destinationId).toBe(destination.id);
    }
  });

  it('récupère les souvenirs depuis une ancienne sauvegarde sans nouveau champ', () => {
    const progress = decodeProgress(JSON.stringify({ schemaVersion: 1, language: 'en',
      discoveredDestinationIds: destinations.map(d => d.id) }));
    for (const souvenir of souvenirs) {
      expect(souvenirForDestination(souvenir.destinationId, progress.discoveredDestinationIds)).toEqual(souvenir);
    }
  });

  it('conserve un seul souvenir après revisite, rechargement et changement de langue', () => {
    let saved: string | null = null;
    const storage = () => ({ getItem: () => saved, setItem: (_key: string, value: string) => { saved = value; } });
    const store = new ProgressStore(storage);
    expect(store.discover('mycelia')).toBe(true);
    const original = souvenirForDestination('mycelia', store.read().discoveredDestinationIds);
    expect(store.discover('mycelia')).toBe(false);
    store.setLanguage('en');
    const reloaded = new ProgressStore(storage).read();
    expect(reloaded.discoveredDestinationIds).toEqual(['mycelia']);
    expect(souvenirForDestination('mycelia', reloaded.discoveredDestinationIds)).toEqual(original);
    expect(Object.keys(JSON.parse(saved ?? '{}')).sort()).toEqual(['discoveredDestinationIds', 'language', 'schemaVersion']);
  });

  it('reste consultable en mémoire si le stockage est bloqué', () => {
    const store = new ProgressStore(() => { throw new Error('blocked'); });
    store.discover('coeur_de_braise');
    expect(store.persistent).toBe(false);
    expect(souvenirForDestination('coeur_de_braise', store.read().discoveredDestinationIds)?.destinationId).toBe('coeur_de_braise');
  });
});
