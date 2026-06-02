import type { VisualParams } from '../../types';
import { textureFilter } from '../textureFilter';

export function CrystallineTemplate({ visual }: { visual: VisualParams }) {
  const crystals = Math.max(4, visual.elementCount);
  return (
    <g filter={textureFilter(visual.texture)}>
      {Array.from({ length: crystals }, (_, index) => {
        const x = 38 + index * (126 / Math.max(1, crystals - 1));
        const top = 36 + ((index * 17) % 42);
        const width = 14 + (index % 4) * 5;
        return (
          <path
            key={index}
            d={`M${x} ${top} L${x + width} ${94} L${x + width / 2} ${164} L${x - width} ${100} Z`}
            fill={index % 2 ? visual.primaryColor : visual.accentColor}
            opacity={0.78}
          />
        );
      })}
      <path d="M36 164 C72 146 124 146 166 164 L152 180 L50 180 Z" fill={visual.primaryColor} />
    </g>
  );
}
