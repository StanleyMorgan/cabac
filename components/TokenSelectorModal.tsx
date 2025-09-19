
import React, { useState } from 'react';
import type { Token } from '../types';
import { CloseIcon } from './icons/CloseIcon';

interface TokenSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectToken: (token: Token) => void;
  tokens: Token[];
}

const TokenSelectorModal: React.FC<TokenSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectToken,
  tokens,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTokens = tokens.filter(
    (token) =>
      token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-brand-surface w-full max-w-md rounded-2xl flex flex-col h-[70vh] border border-brand-secondary">
        <div className="p-4 border-b border-brand-secondary">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Select a token</h3>
            <button onClick={onClose} className="text-brand-text-secondary hover:text-brand-text-primary">
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
          <input
            type="text"
            placeholder="Search name or paste address"
            className="w-full bg-brand-surface-2 border border-brand-secondary rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex-grow overflow-y-auto">
          <ul className="p-2">
            {filteredTokens.map((token) => (
              <li key={token.address}>
                <button
                  onClick={() => onSelectToken(token)}
                  className="w-full flex items-center p-3 hover:bg-brand-secondary rounded-lg transition-colors"
                >
                  <img src={token.logoURI} alt={token.name} className="w-8 h-8 rounded-full mr-4" />
                  <div>
                    <div className="font-bold text-left">{token.symbol}</div>
                    <div className="text-sm text-brand-text-secondary text-left">{token.name}</div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TokenSelectorModal;