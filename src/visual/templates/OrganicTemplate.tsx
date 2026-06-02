import type { VisualParams } from '../../types';
import { colorSeed, darken, lighten, makeId, seededRandom, withAlpha } from '../visualUtils';

export function OrganicTemplate({ visual }: { visual: VisualParams }) {
  const seed = colorSeed(visual.primaryColor, visual.accentColor);
  const id = (n: string) => makeId(seed, n);
  const rand = seededRandom(seed);
  const nodes = Math.max(3, Math.min(10, visual.elementCount));
  const dk = darken(visual.primaryColor, 0.3);
  const lt = lighten(visual.primaryColor, 0.15);
  const aLt = lighten(visual.accentColor, 0.3);

  return (
    <g>
      <defs>
        <radialGradient id={id('bd')} cx="44%" cy="42%" r="52%">
          <stop offset="0%" stopColor={lt} />
          <stop offset="60%" stopColor={visual.primaryColor} />
          <stop offset="100%" stopColor={dk} />
        </radialGradient>
        <radialGradient id={id('nd')} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={lighten(visual.accentColor, 0.5)} />
          <stop offset="40%" stopColor={visual.accentColor} />
          <stop offset="100%" stopColor={withAlpha(visual.accentColor, 0)} />
        </radialGradient>
        <radialGradient id={id('mm')} cx="45%" cy="44%" r="50%">
          <stop offset="0%" stopColor={withAlpha(visual.accentColor, 0.2)} />
          <stop offset="100%" stopColor={withAlpha(visual.primaryColor, 0.05)} />
        </radialGradient>
      </defs>
      {/* Ambient */}
      <ellipse cx="100" cy="105" rx="65" ry="58" fill={withAlpha(visual.accentColor, 0.04)} />
      {/* Main body */}
      <path d="M38 118 C18 72 56 30 104 38 C156 46 186 92 162 136 C140 178 64 176 38 118 Z"
        fill={`url(#${id('bd')})`} />
      {/* Inner membrane */}
      <path d="M56 112 C46 80 74 50 106 56 C140 62 158 96 144 126 C130 156 72 148 56 112 Z"
        fill={`url(#${id('mm')})`} />
      {/* Vein network */}
      {visual.complexity >= 2 && (
        <g stroke={withAlpha(visual.accentColor, 0.12)} strokeWidth="0.7" fill="none">
          <path d="M80 60 Q90 85 100 105 Q108 125 98 148" />
          <path d="M60 90 Q80 100 100 105 Q125 108 145 100" />
          {visual.complexity >= 4 && <path d="M70 70 Q85 90 95 95 Q110 100 130 90" />}
        </g>
      )}
      {/* Bioluminescent nodes */}
      {Array.from({ length: nodes }, (_, i) => {
        const angle = (Math.PI * 2 * i) / nodes + rand() * 0.4;
        const dist = 25 + rand() * 30;
        const x = 100 + Math.cos(angle) * dist;
        const y = 105 + Math.sin(angle) * dist * 0.85;
        const r = 3 + rand() * 4;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={r + 3} fill={withAlpha(visual.accentColor, 0.08)} />
            <circle cx={x} cy={y} r={r} fill={`url(#${id('nd')})`} opacity={0.6 + rand() * 0.3} />
          </g>
        );
      })}
      {/* Tendrils */}
      <path d="M52 136 C36 152 28 168 36 180"
        fill="none" stroke={withAlpha(visual.primaryColor, 0.4)} strokeWidth="3" strokeLinecap="round" />
      <path d="M148 130 C164 148 170 164 164 178"
        fill="none" stroke={withAlpha(visual.primaryColor, 0.35)} strokeWidth="2.5" strokeLinecap="round" />
      {visual.complexity >= 3 && (
        <path d="M100 166 C96 178 92 188 96 194"
          fill="none" stroke={withAlpha(visual.primaryColor, 0.3)} strokeWidth="2" strokeLinecap="round" />
      )}
      {/* Surface texture dots */}
      {Array.from({ length: 6 }, (_, i) => {
        const x = 65 + ((i * 17 + seed) % 60);
        const y = 55 + ((i * 23 + seed) % 80);
        return <circle key={i} cx={x} cy={y} r="1.2" fill={withAlpha(aLt, 0.15)} />;
      })}
    </g>
  );
}
