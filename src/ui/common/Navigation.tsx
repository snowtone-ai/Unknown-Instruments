export type PageKey = 'gallery' | 'workshop' | 'studio' | 'settings';

interface NavigationProps {
  current: PageKey;
  onChange: (page: PageKey) => void;
}

const labels: Record<PageKey, string> = {
  gallery: 'Gallery',
  workshop: 'Workshop',
  studio: 'Studio',
  settings: 'Settings',
};

export function Navigation({ current, onChange }: NavigationProps) {
  return (
    <nav className="navigation" aria-label="Main navigation">
      {(Object.keys(labels) as PageKey[]).map((page) => (
        <button
          key={page}
          className="nav-button"
          type="button"
          aria-current={current === page ? 'page' : undefined}
          onClick={() => onChange(page)}
        >
          {labels[page]}
        </button>
      ))}
    </nav>
  );
}
