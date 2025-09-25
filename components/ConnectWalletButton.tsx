import React from 'react';

const ConnectWalletButton: React.FC = () => {
  // This component wraps the custom web component provided by Reown AppKit.
  // The custom element is typed in `global.d.ts`.
  return <appkit-button />;
};

export default ConnectWalletButton;
