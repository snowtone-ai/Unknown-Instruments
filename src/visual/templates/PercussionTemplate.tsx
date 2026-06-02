import type { VisualParams } from '../../types';
import { colorSeed, darken, lighten, makeId, seededRandom, withAlpha } from '../visualUtils';

export function PercussionTemplate({ visual }: { visual: VisualParams }) {
  const seed = colorSeed(visual.primaryColor, visual.accentColor);
  const id = (n: string) => makeId(seed, n);
  const rand = seededRandom(seed);
  const plates = Math.max(3, Math.min(10, visual.elementCount));
  const dk = darken(visual.primaryColor, 0.3);
  void rand;

  return (
    <g>
      <defs>
        <radialGradient id={id('hd')} cx="48%" cy="42%" r="52%">
          <stop offset="0%" stopColor={lighten(visual.accentColor, 0.25)} />
          <stop offset="45%" stopColor={visual.accentColor} />
          <stop offset="100%" stopColor={darken(visual.accentColor, 0.3)} />
        </radialGradient>
        <radialGradient id={id('by')} cx="50%" cy="30%" r="55%">
          <stop offset="0%" stopColor={lighten(visual.primaryColor, 0.12)} />
          <stop offset="100%" stopColor={dk} />
        </radialGradient>
        <linearGradient id={id('rm')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lighten(visual.accentColor, 0.4)} />
          <stop offset="50%" stopColor={visual.accentColor} />
          <stop offset="100%" stopColor={darken(visual.accentColor, 0.2)} />
        </linearGradient>
      </defs>
      {/* Ambient */}
      <ellipse cx="100" cy="100" rx="66" ry="50" fill={withAlpha(visual.accentColor, 0.05)} />
      {/* Body shell */}
      <path d="M38 90 L48 158 C64 178 136 178 152 158 L162 90" fill={`url(#${id('by')})`} opacity="0.85" />
      <path d="M42 92 L50 155 C65 172 135 172 150 155 L158 92" fill="none"
        stroke={withAlpha(visual.accentColor, 0.12)} strokeWidth="0.8" />
      {/* Drum head */}
      <ellipse cx="100" cy="90" rx="62" ry="28" fill={`url(#${id('hd')})`} />
      {/* Rim */}
      <ellipse cx="100" cy="90" rx="63" ry="29" fill="none" stroke={`url(#${id('rm')})`} strokeWidth="2.5" />
      {/* Tension lines */}
      {Array.from({ length: plates }, (_, i) => {
        const angle = (Math.PI * 2 * i) / plates;
        const x1 = 100 + Math.cos(angle) * 20;
        const y1 = 90 + Math.sin(angle) * 9;
        const x2 = 100 + Math.cos(angle) * 58;
        const y2 = 90 + Math.sin(angle) * 26;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={withAlpha(visual.primaryColor, 0.1)} strokeWidth="0.5" />;
      })}
      {/* Center */}
      <circle cx="100" cy="88" r="8" fill={withAlpha(dk, 0.3)} />
      <circle cx="100" cy="87" r="4" fill={withAlpha(lighten(visual.accentColor, 0.5), 0.2)} />
      {/* Lugs */}
      {Array.from({ length: Math.min(plates, 8) }, (_, i) => {
        const angle = (Math.PI * 2 * i) / Math.min(plates, 8);
        const x = 100 + Math.cos(angle) * 60;
        const y = 90 + Math.sin(angle) * 27 + 4;
        return <rect key={i} x={x - 2} y={y} width="4" height="8" rx="1.5"
          fill={visual.accentColor} opacity="0.55" />;
      })}
      {/* Support legs */}
      <line x1="62" y1="164" x2="52" y2="192" stroke={visual.accentColor} strokeWidth="3.5" strokeLinecap="round" />
      <line x1="138" y1="164" x2="148" y2="192" stroke={visual.accentColor} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="51" cy="193" r="3" fill={visual.accentColor} opacity="0.5" />
      <circle cx="149" cy="193" r="3" fill={visual.accentColor} opacity="0.5" />
      {/* Resonance rings */}
      {visual.complexity >= 3 && (
        <>
          <ellipse cx="100" cy="88" rx="30" ry="13" fill="none"
            stroke={withAlpha(visual.accentColor, 0.06)} strokeWidth="0.6" />
          <ellipse cx="100" cy="88" rx="45" ry="19" fill="none"
            stroke={withAlpha(visual.accentColor, 0.04)} strokeWidth="0.5" />
        </>
      )}
    </g>
  );
}
