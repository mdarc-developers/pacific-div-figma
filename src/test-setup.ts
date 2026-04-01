import "@testing-library/jest-dom";

// jsdom does not implement ResizeObserver — provide a no-op stub
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// ── Portable localStorage mock ────────────────────────────────────────────────
// jsdom's built-in localStorage implementation is absent or incomplete in some
// environments (Windows/WSL, certain Node.js versions, or when the Node.js
// process receives a `--localstorage-file` flag with an invalid path). This
// Proxy-backed replacement guarantees that:
//   • getItem / setItem / removeItem / clear are always callable
//   • Object.keys(localStorage) returns only stored-data keys (not method names)
//   • localStorage[key] bracket-access returns stored values
// Individual test files may still override this via Object.defineProperty
// (the descriptor is configurable).
(function installLocalStorageMock() {
  const store: Record<string, string> = Object.create(null);
  const METHODS = new Set([
    "getItem",
    "setItem",
    "removeItem",
    "clear",
    "key",
    "length",
  ]);

  const mock = new Proxy(Object.create(null) as Storage, {
    get(_t, prop: string | symbol) {
      if (prop === "getItem")
        return (k: string) =>
          Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null;
      if (prop === "setItem")
        return (k: string, v: string) => {
          store[String(k)] = String(v);
        };
      if (prop === "removeItem")
        return (k: string) => {
          delete store[String(k)];
        };
      if (prop === "clear")
        return () => {
          for (const k of Object.keys(store)) delete store[k];
        };
      if (prop === "key") return (i: number) => Object.keys(store)[i] ?? null;
      if (prop === "length") return Object.keys(store).length;
      if (typeof prop === "string" && !METHODS.has(prop))
        return Object.prototype.hasOwnProperty.call(store, prop)
          ? store[prop]
          : undefined;
      return undefined;
    },
    set(_t, prop: string | symbol, value: unknown) {
      if (typeof prop === "string" && !METHODS.has(prop))
        store[prop] = String(value);
      return true;
    },
    ownKeys() {
      return Object.keys(store);
    },
    getOwnPropertyDescriptor(_t, prop: string | symbol) {
      if (
        typeof prop === "string" &&
        Object.prototype.hasOwnProperty.call(store, prop)
      )
        return {
          value: store[prop],
          writable: true,
          enumerable: true,
          configurable: true,
        };
      return undefined;
    },
    has(_t, prop: string | symbol) {
      return (
        typeof prop === "string" &&
        (METHODS.has(prop) || Object.prototype.hasOwnProperty.call(store, prop))
      );
    },
  });

  Object.defineProperty(window, "localStorage", {
    value: mock,
    configurable: true,
    writable: true,
  });
})();
