import type { VisualParams } from '../../types';
import { textureFilter } from '../textureFilter';

export function OrganicTemplate({ visual }: { visual: VisualParams }) {
  const vents = Math.max(3, visual.elementCount);
  return (
    <g filter={textureFilter(visual.texture)}>
      <path d="M42 126 C22 82 58 36 104 44 C154 52 180 96 158 138 C136 182 66 178 42 126 Z" fill={visual.primaryColor} />
      <path d="M62 118 C76 80 122 72 144 108 C126 92 88 94 62 118 Z" fill={visual.accentColor} opacity="0.66" />
      {Array.from({ length: vents }, (_, index) => {
        const x = 58 + ((index * 23) % 86);
        const y = 72 + ((index * 19) % 70);
        return <ellipse key={index} cx={x} cy={y} rx="8" ry="18" fill="#171512" opacity="0.38" transform={`rotate(${index * 21} ${x} ${y})`} />;
      })}
      <path d="M132 64 C166 48 178 70 164 92" fill="none" stroke={visual.accentColor} strokeWidth="8" strokeLinecap="round" />
    </g>
  );
}
