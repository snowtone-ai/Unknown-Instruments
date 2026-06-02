import type { VisualParams } from '../../types';
import { colorSeed, darken, lighten, makeId, seededRandom, withAlpha } from '../visualUtils';

export function CrystallineTemplate({ visual }: { visual: VisualParams }) {
  const seed = colorSeed(visual.primaryColor, visual.accentColor);
  const id = (n: string) => makeId(seed, n);
  const rand = seededRandom(seed);
  const crystals = Math.max(4, Math.min(10, visual.elementCount));
  const dk = darken(visual.primaryColor, 0.4);
  const aLt = lighten(visual.accentColor, 0.35);

  return (
    <g>
      <defs>
        <linearGradient id={id('cr')} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={dk} />
          <stop offset="40%" stopColor={visual.primaryColor} />
          <stop offset="85%" stopColor={lighten(visual.primaryColor, 0.2)} />
          <stop offset="100%" stopColor={aLt} />
        </linearGradient>
        <linearGradient id={id('ca')} x1="0" y1="1" x2="0.2" y2="0">
          <stop offset="0%" stopColor={darken(visual.accentColor, 0.3)} />
          <stop offset="50%" stopColor={visual.accentColor} />
          <stop offset="100%" stopColor={lighten(visual.accentColor, 0.3)} />
        </linearGradient>
        <radialGradient id={id('gl')} cx="50%" cy="60%" r="40%">
          <stop offset="0%" stopColor={withAlpha(visual.accentColor, 0.2)} />
          <stop offset="100%" stopColor={withAlpha(visual.accentColor, 0)} />
        </radialGradient>
        <radialGradient id={id('bs')} cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor={darken(visual.primaryColor, 0.15)} />
          <stop offset="100%" stopColor={darken(visual.primaryColor, 0.5)} />
        </radialGradient>
      </defs>
      {/* Core glow */}
      <ellipse cx="100" cy="120" rx="50" ry="40" fill={`url(#${id('gl')})`} />
      {/* Base geode */}
      <path d="M30 170 C42 155 70 148 100 150 C130 148 158 155 170 170 L165 184 C140 178 60 178 35 184 Z"
        fill={`url(#${id('bs')})`} />
      <path d="M34 170 C46 157 72 150 100 152 C128 150 154 157 166 170"
        fill="none" stroke={withAlpha(visual.accentColor, 0.15)} strokeWidth="0.8" />
      {/* Crystal shards */}
      {Array.from({ length: crystals }, (_, i) => {
        const t = crystals === 1 ? 0.5 : i / (crystals - 1);
        const x = 40 + t * 120;
        const w = 8 + rand() * 8;
        const h = 50 + rand() * 60;
        const top = 165 - h;
        const lean = (rand() - 0.5) * 10;
        const isPrimary = i % 2 === 0;
        return (
          <g key={i}>
            <path
              d={`M${x} ${top} L${x + w + lean} ${165 - h * 0.3} L${x + w * 0.6 + lean * 0.5} 165 L${x - w * 0.6 + lean * 0.5} 165 L${x - w + lean} ${165 - h * 0.4} Z`}
              fill={isPrimary ? `url(#${id('cr')})` : `url(#${id('ca')})`}
              opacity={0.72 + rand() * 0.2}
            />
            {/* Facet highlight */}
            <path
              d={`M${x} ${top} L${x + w * 0.3 + lean * 0.7} ${165 - h * 0.35} L${x + lean * 0.3} ${165 - h * 0.15} Z`}
              fill={withAlpha(aLt, 0.12 + rand() * 0.08)}
            />
            {/* Tip glow */}
            <circle cx={x} cy={top + 2} r="2" fill={withAlpha(aLt, 0.35)} />
          </g>
        );
      })}
      {/* Internal refraction */}
      {visual.complexity >= 3 && Array.from({ length: 3 }, (_, i) => (
        <line key={i} x1={60 + i * 25} y1={130 - i * 10} x2={80 + i * 20} y2={160}
          stroke={withAlpha(visual.accentColor, 0.06)} strokeWidth="0.5" />
      ))}
    </g>
  );
}
