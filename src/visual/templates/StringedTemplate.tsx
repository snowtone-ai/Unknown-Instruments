import type { VisualParams } from '../../types';
import { colorSeed, darken, lighten, makeId, seededRandom, withAlpha } from '../visualUtils';

export function StringedTemplate({ visual }: { visual: VisualParams }) {
  const seed = colorSeed(visual.primaryColor, visual.accentColor);
  const id = (n: string) => makeId(seed, n);
  const rand = seededRandom(seed);
  const strings = Math.max(3, Math.min(10, visual.elementCount));
  const dk = darken(visual.primaryColor, 0.35);
  const lt = lighten(visual.primaryColor, 0.2);
  const aLt = lighten(visual.accentColor, 0.35);

  const bw = 52 + rand() * 14;
  const neckTop = 32 + rand() * 12;
  const holeY = 116 + rand() * 8;
  const holeR = 14 + rand() * 5;

  return (
    <g>
      <defs>
        <radialGradient id={id('bd')} cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor={lt} />
          <stop offset="70%" stopColor={visual.primaryColor} />
          <stop offset="100%" stopColor={dk} />
        </radialGradient>
        <radialGradient id={id('hl')} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={withAlpha(visual.accentColor, 0.25)} />
          <stop offset="100%" stopColor="#080706" />
        </radialGradient>
        <linearGradient id={id('nk')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lighten(visual.primaryColor, 0.12)} />
          <stop offset="100%" stopColor={darken(visual.primaryColor, 0.18)} />
        </linearGradient>
      </defs>
      {/* Ambient glow */}
      <ellipse cx="100" cy="115" rx="72" ry="62" fill={withAlpha(visual.accentColor, 0.06)} />
      {/* Body */}
      <path
        d={`M${100 - bw} 120 C${100 - bw - 4} 78 88 ${neckTop + 10} 100 ${neckTop} C112 ${neckTop + 10} ${100 + bw + 4} 78 ${100 + bw} 120 C${100 + bw + 4} 162 120 186 100 188 C80 186 ${100 - bw - 4} 162 ${100 - bw} 120 Z`}
        fill={`url(#${id('bd')})`}
      />
      {/* Edge highlight */}
      <path
        d={`M${100 - bw + 4} 116 C${100 - bw} 82 90 ${neckTop + 14} 100 ${neckTop + 6}`}
        fill="none" stroke={withAlpha(aLt, 0.25)} strokeWidth="1.2"
      />
      {/* Neck */}
      <rect x="93" y={neckTop - 14} width="14" height={92 - neckTop + 14} rx="3" fill={`url(#${id('nk')})`} />
      {/* Frets */}
      {Array.from({ length: Math.min(5, visual.complexity) }, (_, i) => (
        <line key={i} x1="94" y1={neckTop - 8 + i * 12} x2="106" y2={neckTop - 8 + i * 12}
          stroke={withAlpha(visual.accentColor, 0.18)} strokeWidth="0.8" />
      ))}
      {/* Sound hole */}
      <circle cx="100" cy={holeY} r={holeR} fill={`url(#${id('hl')})`} />
      <circle cx="100" cy={holeY} r={holeR + 1.5} fill="none" stroke={withAlpha(visual.accentColor, 0.2)} strokeWidth="1" />
      {visual.complexity >= 3 && (
        <circle cx="100" cy={holeY} r={holeR + 4} fill="none" stroke={withAlpha(visual.accentColor, 0.08)} strokeWidth="0.6" />
      )}
      {/* Bridge */}
      <path d={`M74 158 Q100 153 126 158`} fill="none" stroke={visual.accentColor} strokeWidth="2.5" strokeLinecap="round" />
      {/* Strings */}
      {Array.from({ length: strings }, (_, i) => {
        const t = strings === 1 ? 0.5 : i / (strings - 1);
        const x1 = 96 + t * 8;
        const x2 = 100 - 22 + t * 44;
        return (
          <path key={i}
            d={`M${x1} ${neckTop - 12} Q${(x1 + x2) / 2 + (rand() - 0.5) * 2} ${holeY} ${x2} 158`}
            fill="none" stroke={withAlpha(aLt, 0.5 + rand() * 0.35)} strokeWidth={1.1 - i * 0.04}
          />
        );
      })}
      {/* Tuning pegs */}
      {Array.from({ length: Math.min(strings, 6) }, (_, i) => (
        <circle key={i} cx={100 + (i % 2 ? 13 : -13)} cy={neckTop - 16 + Math.floor(i / 2) * 7}
          r="2.2" fill={visual.accentColor} opacity="0.6" />
      ))}
    </g>
  );
}
