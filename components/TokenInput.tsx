
import React from 'react';
import type { Token } from '../types';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface TokenInputProps {
  label: string;
  token: Token;
  amount: string;
  onAmountChange: (amount: string) => void;
  onTokenSelect: () => void;
  balance: number;
  isOutput?: boolean;
}

const TokenInput: React.FC<TokenInputProps> = ({
  label,
  token,
  amount,
  onAmountChange,
  onTokenSelect,
  balance,
  isOutput = false
}) => {
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and a single decimal point
    const value = e.target.value;
    if (/^[0-9]*\.?[0-9]*$/.test(value)) {
      onAmountChange(value);
    }
  };

  return (
    <div className="bg-brand-surface-2 p-4 rounded-xl mb-1">
      <div className="flex justify-between items-center text-sm text-brand-text-secondary mb-2">
        <span>{label}</span>
        <span>Balance: {balance.toFixed(2)}</span>
      </div>
      <div className="flex justify-between items-center">
        <input
          type="text"
          inputMode="decimal"
          placeholder="0.0"
          className="bg-transparent text-3xl font-mono focus:outline-none w-full text-brand-text-primary"
          value={amount}
          onChange={handleAmountChange}
          readOnly={isOutput}
        />
        <button
          onClick={onTokenSelect}
          className="flex items-center space-x-2 bg-brand-secondary hover:bg-gray-700 p-2 rounded-full transition-colors"
        >
          <img src={token.logoURI} alt={token.name} className="w-6 h-6 rounded-full" />
          <span className="font-bold text-lg">{token.symbol}</span>
          <ChevronDownIcon className="w-5 h-5 text-brand-text-secondary" />
        </button>
      </div>
    </div>
  );
};

export default TokenInput;
