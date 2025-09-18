
import React from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface WalletModalProps {
  onClose: () => void;
  onConnect: () => void;
}

const WalletOption: React.FC<{ name: string; iconUrl: string; onClick: () => void }> = ({ name, iconUrl, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center p-4 bg-brand-surface-2 hover:bg-brand-secondary rounded-lg transition-colors text-left">
    <img src={iconUrl} alt={name} className="w-8 h-8 rounded-full mr-4" />
    <span className="font-bold text-lg">{name}</span>
  </button>
);

const WalletModal: React.FC<WalletModalProps> = ({ onClose, onConnect }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-brand-surface w-full max-w-sm rounded-2xl shadow-lg border border-brand-secondary">
        <div className="flex justify-between items-center p-4 border-b border-brand-secondary">
          <h3 className="text-lg font-bold">Connect Wallet</h3>
          <button onClick={onClose} className="text-brand-text-secondary hover:text-brand-text-primary">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <WalletOption name="MetaMask" iconUrl="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" onClick={onConnect} />
          <WalletOption name="WalletConnect" iconUrl="https://walletconnect.com/meta/walletconnect-logo.png" onClick={onConnect} />
          <WalletOption name="Coinbase Wallet" iconUrl="https://avatars.githubusercontent.com/u/18060234?s=280&v=4" onClick={onConnect} />
        </div>
        <div className="p-4 text-xs text-brand-text-secondary text-center">
          By connecting a wallet, you agree to our Terms of Service. (This is a simulation)
        </div>
      </div>
    </div>
  );
};

export default WalletModal;
