import type { Instrument } from '../types';
import { validateAndClampInstrument } from './validator';

export function generateLocalCrossbreed(parentA: Instrument, parentB: Instrument): Instrument {
  const child = validateAndClampInstrument({
    instrument: {
      name: `${parentA.name.split('（')[0]}-${parentB.name.split('（')[0]} 子響体`,
      name_etymology: '二つの親楽器の音色名を継いだ交配名',
      description: `${parentA.description} ${parentB.description} 二つの共鳴構造が絡み合い、親とは異なる発音点を持つ。`,
      materials: [...new Set([...parentA.materials, ...parentB.materials])].slice(0, 5),
      shape: `${parentA.shape} と ${parentB.shape} が合流した形状`,
      playing_method: parentA.playingMethod,
    },
    synth: {
      ...parentA.synth,
      harmonicity: average(parentA.synth.harmonicity, parentB.synth.harmonicity),
      modulation_index: average(parentA.synth.modulationIndex, parentB.synth.modulationIndex),
      attack: average(parentA.synth.attack, parentB.synth.attack),
      decay: average(parentA.synth.decay, parentB.synth.decay),
      sustain: average(parentA.synth.sustain, parentB.synth.sustain),
      release: average(parentA.synth.release, parentB.synth.release),
      base_frequency: average(parentA.synth.baseFrequency, parentB.synth.baseFrequency),
    },
    filter: {
      type: parentB.filter.type,
      frequency: average(parentA.filter.frequency, parentB.filter.frequency),
      q: average(parentA.filter.q, parentB.filter.q),
    },
    effects: [...parentA.effects, ...parentB.effects].slice(0, 4),
    visual: {
      template: parentB.visual.template,
      primary_color: parentA.visual.primaryColor,
      accent_color: parentB.visual.accentColor,
      texture: parentA.visual.texture,
      complexity: Math.max(parentA.visual.complexity, parentB.visual.complexity),
      element_count: Math.round(average(parentA.visual.elementCount, parentB.visual.elementCount)),
      form_description: '交配によって生まれた合成標本',
    },
    interaction: parentA.interaction,
    decay_profile: {
      lifespan: Math.round(average(parentA.decay.lifespan, parentB.decay.lifespan)),
      decay_character: parentB.decay.decayCharacter,
      primary_decay_target: parentA.decay.decayVectors[0]?.paramPath ?? 'filter.frequency',
    },
  }, `${parentA.originText} / ${parentB.originText}`);

  return {
    ...child,
    lineage: {
      parentId: null,
      generation: Math.max(parentA.lineage.generation, parentB.lineage.generation) + 1,
      childIds: [],
      crossbreedParentIds: [parentA.id, parentB.id],
    },
  };
}

function average(a: number | undefined, b: number | undefined): number {
  const av = Number.isFinite(a) ? a! : 0;
  const bv = Number.isFinite(b) ? b! : av;
  return (av + bv) / 2;
}
