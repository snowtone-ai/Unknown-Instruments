import type { DecayCharacter } from '../types';

interface DecayOverlayProps {
  progress: number;
  character: DecayCharacter;
}

export function DecayOverlay({ progress, character }: DecayOverlayProps) {
  if (progress <= 0) return null;
  const opacity = Math.min(0.78, 0.18 + progress * 0.72);
  const crackCount = Math.max(2, Math.round(progress * 9));
  const color = characterColor(character);

  return (
    <g opacity={opacity} aria-hidden="true">
      {Array.from({ length: crackCount }, (_, index) => {
        const x = 22 + ((index * 31) % 140);
        const y = 26 + ((index * 47) % 110);
        return (
          <path
            key={index}
            d={`M${x} ${y} l${8 + index % 4} ${10 + index % 7} l${-5 - index % 3} ${13 + index % 5}`}
            fill="none"
            stroke={color}
            strokeWidth={1 + progress * 2}
            strokeLinecap="round"
          />
        );
      })}
      {character === 'dissolution' ? <circle cx="100" cy="88" r={progress * 82} fill="#0f0f12" opacity={progress * 0.26} /> : null}
      {character === 'crystallization' ? <path d="M62 146 L84 118 L103 154 L132 98 L156 146 Z" fill={color} opacity={0.24 + progress * 0.26} /> : null}
      {character === 'withering' ? <path d="M34 152 C70 126 118 134 168 114" fill="none" stroke={color} strokeWidth="7" opacity={0.36} /> : null}
    </g>
  );
}

function characterColor(character: DecayCharacter): string {
  switch (character) {
    case 'oxidation': return '#7e9f8b';
    case 'crystallization': return '#b8f2ff';
    case 'withering': return '#8f6d42';
    case 'dissolution': return '#4d4f58';
    case 'erosion':
    default: return '#c6a05f';
  }
}
