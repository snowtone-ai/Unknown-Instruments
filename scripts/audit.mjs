import { existsSync, readFileSync } from 'node:fs';

const requiredFiles = [
  'AGENTS.md',
  'CLAUDE.md',
  'HANDOFF-JA.md',
  'README.md',
  'tasks.md',
  'docs/vision.md',
  'docs/state.md',
  'docs/decisions.md',
  'docs/issues.md',
  'docs/repo-map.md',
  'docs/product-spec.md',
  'docs/implementation-audit.md',
  'scripts/setup.mjs',
  'scripts/verify.mjs',
  '.env.example',
  '.gitignore',
  'package.json',
  'vite.config.ts',
  'src/main.tsx',
  'src/App.tsx',
  'src/types/index.ts',
  'src/ai/validator.ts',
  'src/engine/AudioEngine.ts',
];

const missing = requiredFiles.filter((file) => !existsSync(file));
if (missing.length > 0) {
  console.error('Missing required files:');
  for (const file of missing) console.error(`- ${file}`);
  process.exit(1);
}

const tasks = readFileSync('tasks.md', 'utf8');
for (const token of ['T001', 'T050', 'T064', 'T081', 'T100']) {
  if (!tasks.includes(token)) {
    console.error(`tasks.md is missing ${token}`);
    process.exit(1);
  }
}

const envExample = readFileSync('.env.example', 'utf8');
if (!envExample.includes('VITE_GEMINI_API_KEY')) {
  console.error('.env.example is missing VITE_GEMINI_API_KEY');
  process.exit(1);
}

console.log('Project audit passed.');
