import type { Instrument, VisualParams } from '../types';
import { calculateDecayFactor } from '../utils/decay';
import { DecayOverlay } from './DecayOverlay';
import { CrystallineTemplate } from './templates/CrystallineTemplate';
import { OrganicTemplate } from './templates/OrganicTemplate';
import { PercussionTemplate } from './templates/PercussionTemplate';
import { SpiralTemplate } from './templates/SpiralTemplate';
import { StringedTemplate } from './templates/StringedTemplate';
import { WindTemplate } from './templates/WindTemplate';
import { colorSeed, makeId, withAlpha } from './visualUtils';

interface InstrumentRendererProps {
  instrument?: Instrument;
  visual?: VisualParams;
  compact?: boolean;
}

export function InstrumentRenderer({ instrument, visual, compact = false }: InstrumentRendererProps) {
  const v = visual ?? instrument?.visual;
  if (!v) return null;
  const decay = instrument ? calculateDecayFactor(instrument.decay.playCount, instrument.decay.lifespan) : 0;
  const isDead = instrument?.decay.isDead ?? false;
  const opacity = isDead ? 0.42 : 1;
  const seed = colorSeed(v.primaryColor, v.accentColor);
  const bgId = makeId(seed, 'bg');

  return (
    <svg
      className={`instrument-svg${compact ? ' compact' : ''}${isDead ? ' dead' : ''}`}
      viewBox="0 0 200 210"
      role="img"
      aria-label={instrument?.name ?? v.formDescription}
    >
      <defs>
        <radialGradient id={bgId} cx="50%" cy="46%" r="50%">
          <stop offset="0%" stopColor={withAlpha(v.primaryColor, 0.07)} />
          <stop offset="50%" stopColor={withAlpha(v.accentColor, 0.025)} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      {/* Background with instrument-specific ambient color */}
      <rect x="4" y="4" width="192" height="202" rx="10" fill="#100f0d" />
      <rect x="4" y="4" width="192" height="202" rx="10" fill={`url(#${bgId})`} />
      <rect x="4" y="4" width="192" height="202" rx="10" fill="none" stroke="rgba(242,237,228,0.09)" strokeWidth="0.5" />
      {/* Instrument visual */}
      <g opacity={opacity}>
        {renderTemplate(v)}
      </g>
      {/* Decay overlay */}
      {instrument ? <DecayOverlay progress={decay} character={instrument.decay.decayCharacter} /> : null}
    </svg>
  );
}

function renderTemplate(visual: VisualParams) {
  switch (visual.template) {
    case 'stringed': return <StringedTemplate visual={visual} />;
    case 'wind': return <WindTemplate visual={visual} />;
    case 'percussion': return <PercussionTemplate visual={visual} />;
    case 'organic': return <OrganicTemplate visual={visual} />;
    case 'spiral': return <SpiralTemplate visual={visual} />;
    case 'crystalline':
    default: return <CrystallineTemplate visual={visual} />;
  }
}
