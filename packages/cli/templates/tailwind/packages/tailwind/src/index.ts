import { findUpSync } from 'find-up';
import pathe from 'pathe';
import type { Config } from 'tailwindcss';

const workspaceMeta = findUpSync('pnpm-workspace.yaml');
const workspaceRoot = workspaceMeta ? pathe.dirname(workspaceMeta) : '../../';
const packagesDir = pathe.resolve(workspaceRoot, 'packages');

export const tailwindConfig = {
  content: ['./src/**/*.{ts,tsx}', `${packagesDir}/*/src/**/*.{ts,tsx}`],
} satisfies Config;
