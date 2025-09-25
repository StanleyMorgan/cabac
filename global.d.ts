import type React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      /**
       * The AppKit button web component. Registered globally by AppKit.
       */
      // FIX: Use a more specific type for appkit-button to resolve complex type conflicts
      // with AppKit's own types and avoid cascading errors on standard HTML elements.
      'appkit-button': {
        label?: string;
        balance?: string;
        disabled?: boolean;
        size?: string;
        loadingLabel?: string;
        namespace?: string;
      } & React.HTMLAttributes<HTMLElement>;
    }
  }
}

// Ensures file is treated as a module
export {};
