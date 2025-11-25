declare global {
  interface Window {
    dekoratorenAnalytics?: (params?: {
      origin: unknown | string;
      eventName: unknown | string;
      eventData?: unknown;
    }) => Promise<unknown>;
  }
}

// eslint-disable-next-line unicorn/require-module-specifiers
export {};
