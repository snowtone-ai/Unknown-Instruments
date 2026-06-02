import type { VisualParams } from '../../types';
import { textureFilter } from '../textureFilter';

export function StringedTemplate({ visual }: { visual: VisualParams }) {
  const strings = Math.max(3, visual.elementCount);
  return (
    <g filter={textureFilter(visual.texture)}>
      <path d="M42 118 C48 50 90 24 132 46 C168 64 178 124 140 154 C104 182 56 166 42 118 Z" fill={visual.primaryColor} />
      <path d="M112 42 C128 30 150 24 166 32 C156 58 140 72 118 76 Z" fill={visual.accentColor} opacity="0.84" />
      {Array.from({ length: strings }, (_, index) => {
        const x = 62 + index * (76 / Math.max(1, strings - 1));
        return <line key={index} x1={x} y1="48" x2={x + 10} y2="158" stroke="#f6e7bd" strokeWidth="1.4" />;
      })}
      <ellipse cx="92" cy="118" rx="22" ry="15" fill="#171512" opacity="0.5" />
      <path d="M55 154 C82 140 118 140 150 154" fill="none" stroke={visual.accentColor} strokeWidth="5" strokeLinecap="round" />
    </g>
  );
}
