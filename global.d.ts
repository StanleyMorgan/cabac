import 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      /**
       * The AppKit button web component. Registered globally by AppKit.
       * FIX: Using `any` to avoid complex type resolution errors and conflicts.
       */
      'appkit-button': any;
    }
  }
}

// Ensures file is treated as a module
export {};
