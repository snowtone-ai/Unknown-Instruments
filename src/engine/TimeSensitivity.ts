import type { FilterParams, SynthParams } from '../types';
import { clamp } from '../utils/clamp';

export function applyTimeSensitivity(
  synth: SynthParams,
  filter: FilterParams,
  enabled: boolean,
  date = new Date(),
): { synth: SynthParams; filter: FilterParams } {
  if (!enabled) return { synth, filter };
  const nextSynth = { ...synth };
  const nextFilter = { ...filter };
  const hour = date.getHours();
  if (hour < 5) {
    nextSynth.harmonicity = clamp((nextSynth.harmonicity ?? 3) * 1.3, 0.5, 10);
    nextFilter.frequency = clamp(nextFilter.frequency * 0.7, 80, 12000);
  } else if (hour < 8) {
    nextFilter.frequency = clamp(nextFilter.frequency * 1.4, 80, 12000);
    nextSynth.attack = clamp(nextSynth.attack * 0.6, 0.001, 3);
  } else if (hour < 17 && hour >= 12) {
    nextSynth.sustain = clamp(nextSynth.sustain * 1.2, 0, 1);
  } else if (hour < 21 && hour >= 17) {
    nextFilter.frequency = clamp(nextFilter.frequency * 0.85, 80, 12000);
    nextFilter.q = clamp(nextFilter.q * 1.3, 0.5, 15);
  } else if (hour >= 21) {
    nextSynth.release = clamp(nextSynth.release * 1.5, 0.01, 5);
  }
  return { synth: nextSynth, filter: nextFilter };
}
