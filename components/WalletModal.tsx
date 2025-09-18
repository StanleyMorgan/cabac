import React from 'react';
// FIX: Import 'useConnect' from '@wagmi/react' to avoid module resolution issues.
import { useConnect } from '@wagmi/react';
import { CloseIcon } from './icons/CloseIcon';

interface WalletModalProps {
  onClose: () => void;
}

// A helper to map connector IDs to known icons.
const getConnectorIcon = (id: string): string => {
  switch (id) {
    case 'io.metamask':
      return "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg";
    case 'walletConnect':
      return "https://walletconnect.com/meta/walletconnect-logo.png";
    case 'coinbaseWallet':
      return "https://avatars.githubusercontent.com/u/18060234?s=280&v=4";
    default:
      // A generic icon for unknown injected wallets
      return "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXdhbGxldCI+PHBhdGggZD0iTTIxIDEyYTIuMjUgMi4yNSAwIDAgMC0yLjI1LTIuMjVIMTVhMyAzIDAgMSAxLTYgMEg1LjI1QTIuMjUgMi4yNSAwIDAgMCAzIDEybTE4IDB2NmEyLjI1IDIuMjUgMCAwIDEtMi4yNSAyLjI1SDUuMjVBMi4yNSAyLjI1IDAgMCAxIDMgMTh2LTZtMTggMFY5TTMgMTJWOW0xOCAwYTIuMjUgMi4yNSAwIDAgMC0yLjI1LTIuMjVINTIuMjVBMi4yNSAyLjI1IDAgMCAwIDMgOW0xOCAwVjZhMi4yNSAyLjI1IDAgMCAwLTIuMjUtMi4yNUg1LjI1QTIuMjUgMi4yNSAwIDAgMCAzIDZ2MyIvPjwvc3ZnPg==";
  }
};

const WalletOption: React.FC<{ name: string; iconUrl: string; onClick: () => void; }> = ({ name, iconUrl, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center p-4 bg-brand-surface-2 hover:bg-brand-secondary rounded-lg transition-colors text-left">
    <img src={iconUrl} alt={name} className="w-8 h-8 rounded-full mr-4" />
    <span className="font-bold text-lg">{name}</span>
  </button>
);

const WalletModal: React.FC<WalletModalProps> = ({ onClose }) => {
  const { connectors, connect } = useConnect();

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
          {connectors.map((connector) => (
             <WalletOption
                key={connector.uid}
                name={connector.name}
                iconUrl={getConnectorIcon(connector.id)}
                onClick={() => {
                    connect({ connector });
                    onClose();
                }}
            />
          ))}
        </div>
        <div className="p-4 text-xs text-brand-text-secondary text-center">
          By connecting a wallet, you agree to our Terms of Service.
        </div>
      </div>
    </div>
  );
};

export default WalletModal;