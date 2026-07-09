import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    // Resolves @/* path aliases from tsconfig.json automatically
    tsconfigPaths(),
    // React JSX transform for component tests
    react(),
  ],
  test: {
    // Enable global APIs like describe, it, expect
    globals: true,

    // Use jsdom so React components and browser APIs work in tests
    environment: 'jsdom',

    // Auto-import @testing-library/jest-dom matchers (toBeInTheDocument, etc.)
    setupFiles: ['./tests/setup.ts'],

    // Glob patterns for test files
    include: ['tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx'],

    // Clear mocks between every test automatically
    clearMocks: true,

    // Show each test name in output (vs. just pass/fail counts)
    reporters: ['verbose'],

    // Coverage configuration (run with: npm run test:coverage)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['lib/**/*.ts', 'app/**/*.ts', 'app/**/*.tsx'],
      exclude: ['lib/supabase/database.types.ts', '**/*.test.*'],
    },
  },
})
