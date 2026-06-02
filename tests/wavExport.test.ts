import { describe, expect, it } from 'vitest';
import { audioBufferToWav } from '../src/engine/audioBufferToWav';

describe('audioBufferToWav', () => {
  it('writes a wav header', () => {
    const buffer = {
      length: 4,
      numberOfChannels: 1,
      sampleRate: 44100,
      getChannelData: () => new Float32Array(4),
    } as unknown as AudioBuffer;
    const blob = audioBufferToWav(buffer);
    expect(blob.type).toBe('audio/wav');
    expect(blob.size).toBe(52);
  });
});
