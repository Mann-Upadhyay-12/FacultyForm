/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the API gateway, e.g. https://api.example.edu (no trailing slash). */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
