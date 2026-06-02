import type { TextureType } from '../types';

export function textureFilter(texture: TextureType): string | undefined {
  if (texture === 'smooth') return undefined;
  return `url(#${texture}-texture)`;
}
