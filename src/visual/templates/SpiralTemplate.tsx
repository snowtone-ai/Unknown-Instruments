import type { VisualParams } from '../../types';
import { colorSeed, darken, lighten, makeId, seededRandom, withAlpha } from '../visualUtils';

export function SpiralTemplate({ visual }: { visual: VisualParams }) {
  const seed = colorSeed(visual.primaryColor, visual.accentColor);
  const id = (n: string) => makeId(seed, n);
  const rand = seededRandom(seed);
  const rings = Math.max(3, Math.min(10, visual.elementCount));
  const dk = darken(visual.primaryColor, 0.3);
  const lt = lighten(visual.primaryColor, 0.18);
  const aLt = lighten(visual.accentColor, 0.3);

  return (
    <g>
      <defs>
        <linearGradient id={id('sp')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={lt} />
          <stop offset="50%" stopColor={visual.primaryColor} />
          <stop offset="100%" stopColor={dk} />
        </linearGradient>
        <linearGradient id={id('sa')} x1="0" y1="0" x2="1" y2="0.8">
          <stop offset="0%" stopColor={lighten(visual.accentColor, 0.2)} />
          <stop offset="100%" stopColor={darken(visual.accentColor, 0.2)} />
        </linearGradient>
        <radialGradient id={id('gl')} cx="40%" cy="40%" r="50%">
          <stop offset="0%" stopColor={withAlpha(visual.accentColor, 0.12)} />
          <stop offset="100%" stopColor={withAlpha(visual.accentColor, 0)} />
        </radialGradient>
      </defs>
      {/* Ambient glow */}
      <ellipse cx="95" cy="100" rx="68" ry="60" fill={`url(#${id('gl')})`} />
      {/* Primary spiral shell */}
      <path d="M108 30 C172 36 188 108 140 148 C98 182 42 158 42 110 C42 72 74 60 96 76 C118 92 108 116 90 116"
        fill="none" stroke={`url(#${id('sp')})`} strokeWidth="18" strokeLinecap="round" />
      {/* Inner spiral accent */}
      <path d="M114 40 C164 48 174 110 136 142 C102 168 56 148 56 110 C56 82 80 72 96 84"
        fill="none" stroke={`url(#${id('sa')})`} strokeWidth="6" strokeLinecap="round" opacity="0.7" />
      {/* Chamber dividers */}
      {visual.complexity >= 2 && (
        <g stroke={withAlpha(visual.primaryColor, 0.15)} strokeWidth="1" fill="none">
          <path d="M134 56 Q120 72 118 90" />
          <path d="M160 96 Q140 108 126 118" />
          <path d="M128 154 Q108 148 92 134" />
          {visual.complexity >= 4 && <path d="M58 136 Q68 122 78 114" />}
        </g>
      )}
      {/* Shell edge highlight */}
      <path d="M106 32 C168 38 184 106 138 146"
        fill="none" stroke={withAlpha(aLt, 0.2)} strokeWidth="1" />
      {/* Decorative dots along spiral */}
      {Array.from({ length: rings }, (_, i) => {
        const t = i / rings;
        const angle = t * Math.PI * 2.5 + 0.5;
        const r = 20 + t * 50;
        const x = 90 + Math.cos(angle) * r * 0.8;
        const y = 100 - Math.sin(angle) * r * 0.7;
        return (
          <circle key={i} cx={x} cy={y} r={2 + rand() * 2.5}
            fill={i % 2 ? visual.primaryColor : visual.accentColor}
            opacity={0.45 + rand() * 0.3} />
        );
      })}
      {/* Opening glow */}
      <circle cx="90" cy="116" r="6" fill={withAlpha(visual.accentColor, 0.15)} />
      <circle cx="90" cy="116" r="3" fill={withAlpha(aLt, 0.25)} />
    </g>
  );
}
