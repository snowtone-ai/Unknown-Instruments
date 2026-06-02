import type { VisualParams } from '../../types';
import { textureFilter } from '../textureFilter';

export function WindTemplate({ visual }: { visual: VisualParams }) {
  const tubes = Math.max(2, Math.min(9, visual.elementCount));
  return (
    <g filter={textureFilter(visual.texture)}>
      {Array.from({ length: tubes }, (_, index) => {
        const x = 42 + index * (116 / Math.max(1, tubes - 1));
        const height = 70 + ((index * 19) % 58);
        return (
          <g key={index}>
            <path d={`M${x} ${154 - height} C${x + 12} ${142 - height} ${x + 16} 150 ${x + 8} 166 L${x - 8} 166 C${x - 16} 150 ${x - 12} ${142 - height} ${x} ${154 - height} Z`} fill={visual.primaryColor} />
            <circle cx={x} cy={126} r="4" fill={visual.accentColor} />
            <circle cx={x} cy={145} r="3" fill="#171512" opacity="0.55" />
          </g>
        );
      })}
      <path d="M34 168 C72 154 128 154 170 168" fill="none" stroke={visual.accentColor} strokeWidth="8" strokeLinecap="round" />
    </g>
  );
}
