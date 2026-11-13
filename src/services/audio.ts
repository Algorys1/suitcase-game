import { progressStore } from './storage';
import { getTexts } from './i18n';

type Sound = 'tick' | 'paper' | 'travel' | 'arrival' | 'collect' | 'void';
let music: HTMLAudioElement | undefined;
let context: AudioContext | undefined;
let started = false;
let unavailable = false;
let button: HTMLButtonElement | undefined;
const lastPlayed: Partial<Record<Sound, number>> = {};

function refresh(): void {
  if (!button) return;
  const muted = progressStore.read().muted === true;
  const copy = getTexts().audio;
  button.setAttribute('aria-label', muted ? copy.off : copy.on);
  button.setAttribute('aria-pressed', String(!muted));
  button.title = `${muted ? copy.off : copy.on} · ${unavailable ? copy.unavailable : copy.credit}`;
  button.dataset.muted = String(muted);
}

function start(): void {
  if (progressStore.read().muted) return;
  started = true;
  if (!music) {
    music = new Audio(`${import.meta.env.BASE_URL}assets/audio/springly-sprigs.mp3`);
    music.loop = true; music.volume = 0.16; music.preload = 'none';
    music.addEventListener('error', () => { unavailable = true; refresh(); });
  }
  if (music.paused && !unavailable && !document.hidden) void music.play().catch(() => {});
  try { context ??= new AudioContext(); if (context.state === 'suspended') void context.resume().catch(() => {}); }
  catch { /* Unsupported audio never prevents playing the game. */ }
}

/** Brief local Foley/chimes: no remote API or extra audio dependency. */
export function playSound(kind: Sound): void {
  if (progressStore.read().muted || document.hidden) return;
  const now = performance.now();
  if (now - (lastPlayed[kind] ?? -1000) < (kind === 'tick' ? 110 : 80)) return;
  lastPlayed[kind] = now;
  if (!started || !context || context.state === 'closed') return;
  const ctx = context, time = ctx.currentTime;
  const notes: Record<Sound, number[]> = { tick: [520], paper: [], travel: [220, 330, 440],
    arrival: [523.25, 659.25, 783.99], collect: [659.25, 880, 1318.5], void: [146.83, 196] };
  notes[kind].forEach((frequency, i) => {
    const oscillator = ctx.createOscillator(), gain = ctx.createGain();
    const at = time + i * 0.075, duration = kind === 'tick' ? 0.06 : 0.32;
    oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(frequency, at);
    gain.gain.setValueAtTime(0, at); gain.gain.linearRampToValueAtTime(kind === 'tick' ? 0.018 : 0.035, at + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    oscillator.connect(gain); gain.connect(ctx.destination);
    oscillator.start(at); oscillator.stop(at + duration);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  });
  if (kind === 'paper' || kind === 'travel') {
    const duration = kind === 'paper' ? 0.12 : 0.38;
    const buffer = ctx.createBuffer(1, Math.round(ctx.sampleRate * duration), ctx.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < samples.length; i++) samples[i] = (Math.random() * 2 - 1) * (1 - i / samples.length);
    const source = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain();
    source.buffer = buffer; filter.type = 'lowpass'; filter.frequency.value = kind === 'paper' ? 1400 : 650;
    gain.gain.value = kind === 'paper' ? 0.035 : 0.06;
    source.connect(filter); filter.connect(gain); gain.connect(ctx.destination); source.start();
    source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
  }
}

/** A persistent paper tab; music is requested only after a user gesture. */
export function installAudioControls(): () => void {
  button = document.createElement('button'); button.id = 'audio-toggle'; button.type = 'button';
  button.innerHTML = '<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M4 11h5l7-6v18l-7-6H4z"/><path class="sound-waves" d="M20 9q5 5 0 10M23 5q9 9 0 18"/><path class="sound-off" d="m19 10 7 8m0-8-7 8"/></svg>';
  const toggle = () => {
    const muted = !progressStore.read().muted;
    progressStore.setMuted(muted);
    if (muted) { music?.pause(); if (context?.state === 'running') void context.suspend().catch(() => {}); }
    else start();
    refresh();
  };
  button.addEventListener('click', toggle); document.body.append(button); refresh();
  const gesture = (event: Event) => {
    if (event.target === button || button?.contains(event.target as Node)) return;
    if (event instanceof KeyboardEvent && (event.altKey || event.ctrlKey || event.metaKey || event.key === 'Tab')) return;
    start(); refresh();
  };
  const visibility = () => {
    if (document.hidden) { music?.pause(); if (context?.state === 'running') void context.suspend().catch(() => {}); }
    else if (started) start();
  };
  document.addEventListener('pointerdown', gesture, true); document.addEventListener('keydown', gesture, true);
  document.addEventListener('visibilitychange', visibility);
  // Re-localize the button when the game's language changes.
  const observer = new MutationObserver(refresh); observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  return () => {
    document.removeEventListener('pointerdown', gesture, true); document.removeEventListener('keydown', gesture, true);
    document.removeEventListener('visibilitychange', visibility); observer.disconnect();
    button?.removeEventListener('click', toggle); button?.remove(); button = undefined;
    music?.pause(); music?.removeAttribute('src'); music?.load(); music = undefined;
    if (context && context.state !== 'closed') void context.close(); context = undefined; started = false;
  };
}
