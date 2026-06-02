import type { DecayCharacter } from '../types';

interface DecayOverlayProps {
  progress: number;
  character: DecayCharacter;
}

export function DecayOverlay({ progress, character }: DecayOverlayProps) {
  if (progress <= 0) return null;
  const opacity = Math.min(0.75, 0.14 + progress * 0.68);
  const crackCount = Math.max(2, Math.round(progress * 8));
  const color = characterColor(character);

  return (
    <g opacity={opacity} aria-hidden="true">
      {/* Organic crack lines */}
      {Array.from({ length: crackCount }, (_, i) => {
        const x = 22 + ((i * 29 + 7) % 140);
        const y = 26 + ((i * 41 + 13) % 110);
        return (
          <path key={i}
            d={`M${x} ${y} c${7 + i % 5} ${9 + i % 4} ${-(4 + i % 3)} ${11 + i % 5} ${3 + i % 4} ${18 + i % 7}`}
            fill="none" stroke={color}
            strokeWidth={0.7 + progress * 1.4}
            strokeLinecap="round"
            opacity={0.35 + progress * 0.4}
          />
        );
      })}
      {/* Character-specific decay effects */}
      {character === 'dissolution' && (
        <circle cx="100" cy="90" r={progress * 75} fill="#0f0f12" opacity={progress * 0.22} />
      )}
      {character === 'crystallization' && (
        <path d="M62 146 L82 116 L100 150 L130 98 L155 146 Z"
          fill={color} opacity={0.2 + progress * 0.28} />
      )}
      {character === 'withering' && (
        <>
          <path d="M32 152 C68 126 116 134 168 114" fill="none"
            stroke={color} strokeWidth={5 + progress * 3} opacity="0.32" />
          {progress > 0.5 && (
            <path d="M38 132 C72 110 128 118 162 100" fill="none"
              stroke={color} strokeWidth={2 + progress * 2} opacity="0.18" />
          )}
        </>
      )}
      {character === 'oxidation' && Array.from({ length: Math.max(1, Math.round(progress * 4)) }, (_, i) => (
        <circle key={`ox${i}`} cx={38 + ((i * 37) % 124)} cy={46 + ((i * 31) % 108)}
          r={6 + progress * 10} fill={color} opacity={0.05 + progress * 0.05} />
      ))}
      {/* Late-stage dust veil */}
      {progress > 0.65 && (
        <rect x="6" y="6" width="188" height="198" rx="9"
          fill={`rgba(16,15,13,${(progress - 0.65) * 0.45})`} />
      )}
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
