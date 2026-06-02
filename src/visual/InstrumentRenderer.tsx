import type { Instrument, VisualParams } from '../types';
import { calculateDecayFactor } from '../utils/decay';
import { DecayOverlay } from './DecayOverlay';
import { CrystallineTemplate } from './templates/CrystallineTemplate';
import { OrganicTemplate } from './templates/OrganicTemplate';
import { PercussionTemplate } from './templates/PercussionTemplate';
import { SpiralTemplate } from './templates/SpiralTemplate';
import { StringedTemplate } from './templates/StringedTemplate';
import { WindTemplate } from './templates/WindTemplate';
import { TextureFilters } from './textureFilters';

interface InstrumentRendererProps {
  instrument?: Instrument;
  visual?: VisualParams;
  compact?: boolean;
}

export function InstrumentRenderer({ instrument, visual, compact = false }: InstrumentRendererProps) {
  const visualParams = visual ?? instrument?.visual;
  if (!visualParams) return null;
  const decay = instrument ? calculateDecayFactor(instrument.decay.playCount, instrument.decay.lifespan) : 0;
  const opacity = instrument?.decay.isDead ? 0.46 : 1;

  return (
    <svg className={compact ? 'instrument-svg compact' : 'instrument-svg'} viewBox="0 0 200 210" role="img" aria-label={instrument?.name ?? visualParams.formDescription}>
      <TextureFilters />
      <rect x="8" y="8" width="184" height="194" rx="8" fill="#171612" stroke="rgba(242,237,228,0.16)" />
      <g opacity={opacity}>
        {renderTemplate(visualParams)}
      </g>
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
