/**
 * This file must be imported BEFORE any module that accesses the global `document` instance.
 * @angular/platform-server/init sets up DOM constructor classes (Document, Window, etc.)
 * but does not create the global `document` instance that third-party libs may need.
 */
import "@angular/platform-server/init";

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
const g = globalThis as any;

if (typeof g.document === "undefined" && typeof g.Document !== "undefined") {
  g.document = new g.Document("text/html", "about:blank");
}

if (typeof g.window === "undefined") {
  g.window = g;
}

if (typeof g.navigator === "undefined") {
  g.navigator = { userAgent: "Node.js" };
}

if (typeof g.localStorage === "undefined") {
  const store: Record<string, string> = {};
  g.localStorage = {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v;
    },
    removeItem: (k: string) => {
      delete store[k];
    },
    clear: () => Object.keys(store).forEach(k => delete store[k]),
    key: (i: number) => Object.keys(store)[i] ?? null,
    get length() {
      return Object.keys(store).length;
    },
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
