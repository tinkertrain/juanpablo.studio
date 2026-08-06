/// <reference types="astro/client" />

interface Window {
  /** Theme helpers defined by the inline script in Layout.astro. */
  __theme: {
    preferred(): 'dark' | 'light';
    apply(theme: string): void;
  };
}

interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
}

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}
