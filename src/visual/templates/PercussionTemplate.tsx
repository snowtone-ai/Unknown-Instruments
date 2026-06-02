import type { VisualParams } from '../../types';
import { textureFilter } from '../textureFilter';

export function PercussionTemplate({ visual }: { visual: VisualParams }) {
  const plates = Math.max(3, visual.elementCount);
  return (
    <g filter={textureFilter(visual.texture)}>
      <ellipse cx="100" cy="94" rx="64" ry="34" fill={visual.primaryColor} />
      <ellipse cx="100" cy="88" rx="62" ry="26" fill={visual.accentColor} opacity="0.78" />
      <path d="M44 94 L58 156 C78 174 124 174 146 156 L158 94" fill={visual.primaryColor} opacity="0.78" />
      {Array.from({ length: plates }, (_, index) => {
        const angle = (Math.PI * 2 * index) / plates;
        const x = 100 + Math.cos(angle) * 48;
        const y = 92 + Math.sin(angle) * 20;
        return <circle key={index} cx={x} cy={y} r={4 + (index % 3)} fill="#171512" opacity="0.45" />;
      })}
      <line x1="70" y1="172" x2="54" y2="194" stroke={visual.accentColor} strokeWidth="5" />
      <line x1="130" y1="172" x2="146" y2="194" stroke={visual.accentColor} strokeWidth="5" />
    </g>
  );
}
