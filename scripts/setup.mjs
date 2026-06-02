import { existsSync, copyFileSync } from 'node:fs';

if (!existsSync('.env.local') && existsSync('.env.example')) {
  copyFileSync('.env.example', '.env.local');
  console.log('Created .env.local from .env.example. Fill VITE_GEMINI_API_KEY locally.');
} else {
  console.log('.env.local already exists or .env.example is missing.');
}
