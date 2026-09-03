/**
 * Global test setup — runs before every test file.
 *
 * Imports @testing-library/jest-dom so matchers like
 * toBeInTheDocument(), toHaveValue(), etc. are available in all tests
 * without needing per-file imports.
 */
import '@testing-library/jest-dom'

// In-memory localStorage mock for environments where jsdom/Node doesn't initialize it
const storage: Record<string, string> = {}
const localStorageMock = {
  getItem: (key: string) => (key in storage ? storage[key] : null),
  setItem: (key: string, value: string) => {
    storage[key] = String(value)
  },
  removeItem: (key: string) => {
    delete storage[key]
  },
  clear: () => {
    for (const key of Object.keys(storage)) {
      delete storage[key]
    }
  },
  key: (i: number) => Object.keys(storage)[i] || null,
  get length() {
    return Object.keys(storage).length
  },
}

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true })
}
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true })
