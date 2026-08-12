declare module 'react-dom/client' {
  import * as React from 'react';
  interface Root {
    render(children: React.ReactNode): void;
    unmount(): void;
  }
  export function createRoot(
    container: Element | DocumentFragment,
    options?: { hydrate?: boolean },
  ): Root;
  export function hydrateRoot(
    container: Element | Document,
    initialChildren: React.ReactNode,
  ): Root;
}
