declare global {
  interface Window {
    dekoratorenAnalytics?: (params?: {
      origin: unknown | string;
      eventName: unknown | string;
      eventData?: unknown;
    }) => Promise<unknown>;
  }
}

interface ViteTypeOptions {
  // By adding this line, you can make the type of ImportMetaEnv strict
  // to disallow unknown keys.
  strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
  readonly VITE_SENTRY_RELEASE: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// eslint-disable-next-line unicorn/require-module-specifiers
export {};
