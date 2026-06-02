import type { Instrument } from '../types';

export function createSuccessionText(instrument: Instrument): string {
  const remaining = Math.max(0, instrument.decay.lifespan - instrument.decay.playCount);
  return `${instrument.name}が残す、${instrument.materials.slice(0, 2).join('と')}の${remaining}回ぶん薄れた残響`;
}
