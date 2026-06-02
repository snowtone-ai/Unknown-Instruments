import type { VisualParams } from '../../types';
import { colorSeed, darken, lighten, makeId, seededRandom, withAlpha } from '../visualUtils';

export function WindTemplate({ visual }: { visual: VisualParams }) {
  const seed = colorSeed(visual.primaryColor, visual.accentColor);
  const id = (n: string) => makeId(seed, n);
  const rand = seededRandom(seed);
  const tubes = Math.max(3, Math.min(9, visual.elementCount));
  const dk = darken(visual.primaryColor, 0.3);
  const lt = lighten(visual.primaryColor, 0.18);

  return (
    <g>
      <defs>
        <linearGradient id={id('tb')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={dk} />
          <stop offset="35%" stopColor={lt} />
          <stop offset="65%" stopColor={visual.primaryColor} />
          <stop offset="100%" stopColor={dk} />
        </linearGradient>
        <radialGradient id={id('bl')} cx="50%" cy="20%" r="50%">
          <stop offset="0%" stopColor={lighten(visual.accentColor, 0.3)} />
          <stop offset="100%" stopColor={visual.accentColor} />
        </radialGradient>
        <linearGradient id={id('bs')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={visual.accentColor} />
          <stop offset="100%" stopColor={darken(visual.accentColor, 0.4)} />
        </linearGradient>
      </defs>
      {/* Ambient */}
      <ellipse cx="100" cy="100" rx="70" ry="55" fill={withAlpha(visual.accentColor, 0.05)} />
      {/* Tubes */}
      {Array.from({ length: tubes }, (_, i) => {
        const t = tubes === 1 ? 0.5 : i / (tubes - 1);
        const x = 36 + t * 128;
        const h = 56 + ((i * 23 + seed) % 54);
        const w = 10 + rand() * 4;
        const top = 168 - h;
        const bellW = w + 3;
        return (
          <g key={i}>
            <rect x={x - w / 2} y={top + 8} width={w} height={h - 8} rx={w / 2} fill={`url(#${id('tb')})`} />
            <ellipse cx={x} cy={top + 6} rx={bellW / 2} ry={4} fill={`url(#${id('bl')})`} />
            <ellipse cx={x} cy={top + 7} rx={w / 2 - 1.5} ry={2.5} fill="#0a0908" opacity="0.5" />
            {visual.complexity >= 2 && (
              <circle cx={x} cy={top + h * 0.4} r="2" fill={withAlpha(visual.accentColor, 0.3)} />
            )}
            {visual.complexity >= 3 && (
              <circle cx={x} cy={top + h * 0.6} r="1.8" fill={withAlpha(visual.accentColor, 0.2)} />
            )}
            <ellipse cx={x} cy={top + 6} rx={bellW / 2} ry={4} fill="none"
              stroke={withAlpha(lighten(visual.accentColor, 0.3), 0.3)} strokeWidth="0.6" />
          </g>
        );
      })}
      {/* Base connector */}
      <path d="M30 170 C50 162 150 162 170 170 L168 180 C148 174 52 174 32 180 Z" fill={`url(#${id('bs')})`} />
      <path d="M36 170 C56 163 144 163 164 170" fill="none"
        stroke={withAlpha(lighten(visual.accentColor, 0.4), 0.2)} strokeWidth="0.8" />
      {/* Connecting bars */}
      {visual.complexity >= 3 && (
        <>
          <line x1="44" y1="145" x2="156" y2="145" stroke={withAlpha(visual.accentColor, 0.12)} strokeWidth="1.2" />
          {visual.complexity >= 4 && (
            <line x1="48" y1="125" x2="152" y2="125" stroke={withAlpha(visual.accentColor, 0.08)} strokeWidth="0.8" />
          )}
        </>
      )}
    </g>
  );
}
