/**
 * Test setup: guarantee a working in-memory Web Storage.
 * Node 25 exposes a partial experimental `localStorage` (missing methods) that
 * can shadow jsdom's; store tests need a complete, isolated implementation.
 */
class MemoryStorage implements Storage {
  private map = new Map<string, string>();
  get length(): number {
    return this.map.size;
  }
  clear(): void {
    this.map.clear();
  }
  getItem(key: string): string | null {
    return this.map.has(key) ? (this.map.get(key) as string) : null;
  }
  setItem(key: string, value: string): void {
    this.map.set(key, String(value));
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
  key(index: number): string | null {
    return Array.from(this.map.keys())[index] ?? null;
  }
  [name: string]: unknown;
}

function install(name: 'localStorage' | 'sessionStorage'): void {
  const store = new MemoryStorage();
  try {
    Object.defineProperty(globalThis, name, {
      value: store,
      configurable: true,
      writable: true,
    });
  } catch {
    try {
      (globalThis as Record<string, unknown>)[name] = store;
    } catch {
      /* leave as-is */
    }
  }
}

install('localStorage');
install('sessionStorage');
