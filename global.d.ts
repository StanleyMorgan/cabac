// FIX: The previous global type declaration was not being applied correctly,
// likely due to modern TypeScript/Vite configurations where global script
// files can be unreliable for type augmentation.
// This converts the file to a standard TypeScript module and uses `declare global`
// to robustly augment the JSX namespace. This is the recommended approach.
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      /**
       * The AppKit button web component. Registered globally by AppKit.
       */
      'appkit-button': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}
