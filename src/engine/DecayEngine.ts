import type { FilterParams, Instrument, SynthParams } from '../types';
import { clamp } from '../utils/clamp';
import { calculateDecayFactor } from '../utils/decay';

const SAFE_DECAY_PATHS = new Set([
  'synth.attack',
  'synth.decay',
  'synth.sustain',
  'synth.release',
  'synth.baseFrequency',
  'filter.frequency',
  'filter.q',
]);

export function markPlayed(instrument: Instrument, decayEnabled: boolean): Instrument {
  if (!decayEnabled || instrument.decay.isDead) return { ...instrument, lastPlayedAt: Date.now() };
  const playCount = instrument.decay.playCount + 1;
  return {
    ...instrument,
    lastPlayedAt: Date.now(),
    decay: {
      ...instrument.decay,
      playCount,
      isDead: playCount >= instrument.decay.lifespan,
    },
  };
}

export { calculateDecayFactor };

export function applyDecayToParams(
  synth: SynthParams,
  filter: FilterParams,
  instrument: Instrument,
): { synth: SynthParams; filter: FilterParams } {
  const factor = calculateDecayFactor(instrument.decay.playCount, instrument.decay.lifespan);
  const mutable = { synth: { ...synth }, filter: { ...filter } };
  let seed = instrument.decay.seed || 1;
  for (const vector of instrument.decay.decayVectors) {
    const current = readPath(mutable, vector.paramPath);
    if (typeof current !== 'number') continue;
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    const noise = (seed / 4294967296 - 0.5) * 0.2;
    writePath(mutable, vector.paramPath, current + current * vector.direction * vector.weight * factor * (1 + noise));
  }
  mutable.synth.attack = clamp(mutable.synth.attack, 0.001, 3);
  mutable.synth.decay = clamp(mutable.synth.decay, 0.01, 2);
  mutable.synth.sustain = clamp(mutable.synth.sustain, 0, 1);
  mutable.synth.release = clamp(mutable.synth.release, 0.01, 5);
  mutable.synth.baseFrequency = clamp(mutable.synth.baseFrequency, 55, 880);
  mutable.filter.frequency = clamp(mutable.filter.frequency, 80, 12000);
  mutable.filter.q = clamp(mutable.filter.q, 0.5, 15);
  return mutable;
}

function readPath(target: { synth: SynthParams; filter: FilterParams }, path: string): unknown {
  if (!SAFE_DECAY_PATHS.has(path)) return undefined;
  const [root, key] = path.split('.') as ['synth' | 'filter', keyof SynthParams & keyof FilterParams];
  return root in target ? target[root][key] : undefined;
}

function writePath(target: { synth: SynthParams; filter: FilterParams }, path: string, value: number): void {
  if (!SAFE_DECAY_PATHS.has(path)) return;
  const [root, key] = path.split('.') as ['synth' | 'filter', keyof SynthParams & keyof FilterParams];
  if (root === 'synth' && key in target.synth) {
    (target.synth as unknown as Record<string, unknown>)[key] = value;
  }
  if (root === 'filter' && key in target.filter) {
    (target.filter as unknown as Record<string, unknown>)[key] = value;
  }
}
