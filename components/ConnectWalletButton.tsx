
import React from 'react';
import { WalletIcon } from './icons/WalletIcon';

interface ConnectWalletButtonProps {
  isConnected: boolean;
  address: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({ isConnected, address, onConnect, onDisconnect }) => {
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-3 bg-brand-surface-2 p-2 rounded-full">
        <span className="text-sm font-mono px-2">{formatAddress(address)}</span>
        <button onClick={onDisconnect} className="bg-brand-accent text-white font-bold py-1 px-3 rounded-full hover:opacity-90 transition-opacity">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onConnect}
      className="flex items-center space-x-2 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-2 px-4 rounded-full transition-colors"
    >
      <WalletIcon className="w-5 h-5" />
      <span>Connect Wallet</span>
    </button>
  );
};

export default ConnectWalletButton;
