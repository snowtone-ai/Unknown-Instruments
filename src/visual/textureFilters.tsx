export function TextureFilters() {
  return (
    <defs>
      <filter id="rough-texture">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
        <feDisplacementMap in="SourceGraphic" scale="2" />
      </filter>
      <filter id="metallic-texture">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="shadow" />
        <feOffset in="shadow" dx="2" dy="2" result="offset" />
        <feMerge>
          <feMergeNode in="offset" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="organic-texture">
        <feTurbulence type="turbulence" baseFrequency="0.035" numOctaves="3" seed="11" />
        <feColorMatrix type="saturate" values="0.35" />
        <feBlend in="SourceGraphic" mode="multiply" />
      </filter>
      <filter id="crystalline-texture">
        <feSpecularLighting surfaceScale="5" specularConstant="0.7" specularExponent="20" lightingColor="#ffffff">
          <fePointLight x="80" y="40" z="80" />
        </feSpecularLighting>
        <feComposite in2="SourceGraphic" operator="in" />
        <feBlend in="SourceGraphic" mode="screen" />
      </filter>
    </defs>
  );
}
