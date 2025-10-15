/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

import "@excalidraw/excalidraw/global";
import "@excalidraw/excalidraw/css";

declare global {
  interface Window {
    __EXCALIDRAW_SHA__: string | undefined;
  }

  interface ImportMetaEnv {
    readonly VITE_APP_GIT_SHA: string;
    readonly VITE_APP_PORT: string;
    readonly VITE_APP_ENABLE_ESLINT: string;
    readonly VITE_APP_COLLAPSE_OVERLAY: string;
    readonly VITE_APP_ENABLE_PWA: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

declare module "virtual:pwa-register" {
  export function registerSW(options?: {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (registration: ServiceWorkerRegistration) => void;
    onRegisterError?: (error: Error) => void;
  }): void;
}

export {};
