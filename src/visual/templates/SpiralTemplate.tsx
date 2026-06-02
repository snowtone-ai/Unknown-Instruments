import type { VisualParams } from '../../types';
import { textureFilter } from '../textureFilter';

export function SpiralTemplate({ visual }: { visual: VisualParams }) {
  const rings = Math.max(3, Math.min(10, visual.elementCount));
  return (
    <g filter={textureFilter(visual.texture)}>
      <path d="M104 36 C166 42 180 112 132 144 C92 170 42 144 48 100 C52 70 88 66 102 88 C116 110 92 124 78 112" fill="none" stroke={visual.primaryColor} strokeWidth="16" strokeLinecap="round" />
      <path d="M112 44 C156 52 166 108 128 132 C96 152 60 132 66 102" fill="none" stroke={visual.accentColor} strokeWidth="7" strokeLinecap="round" />
      {Array.from({ length: rings }, (_, index) => (
        <circle key={index} cx={70 + index * 13} cy={156 - index * 9} r={5 + index % 3} fill={index % 2 ? visual.primaryColor : visual.accentColor} />
      ))}
    </g>
  );
}
