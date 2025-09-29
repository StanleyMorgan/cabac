// FIX: The previous module-based global type declaration was not being applied correctly
// by the TypeScript compiler. This version is a global script file (no imports/exports)
// which ensures the JSX namespace is augmented automatically.
// UPDATE: The non-module approach was not working. Switching to a module-based global augmentation.
export {};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      /**
       * The AppKit button web component. Registered globally by AppKit.
       */
      'appkit-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}
