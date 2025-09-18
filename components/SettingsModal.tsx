
import React, { useState } from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    slippage: number;
    setSlippage: (value: number) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, slippage, setSlippage }) => {
    const [customSlippage, setCustomSlippage] = useState<string>(slippage.toString());

    if (!isOpen) return null;

    const handleCustomSlippageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCustomSlippage(value);
        if (value && !isNaN(parseFloat(value))) {
            setSlippage(parseFloat(value));
        }
    };

    const slippageOptions = [0.1, 0.5, 1.0];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-brand-surface w-full max-w-sm rounded-2xl shadow-lg border border-brand-secondary">
                <div className="flex justify-between items-center p-4 border-b border-brand-secondary">
                    <h3 className="text-lg font-bold">Settings</h3>
                    <button onClick={onClose} className="text-brand-text-secondary hover:text-brand-text-primary">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-4">
                    <h4 className="font-semibold mb-2">Slippage Tolerance</h4>
                    <div className="flex space-x-2">
                        {slippageOptions.map(option => (
                            <button
                                key={option}
                                onClick={() => { setSlippage(option); setCustomSlippage(option.toString()); }}
                                className={`flex-1 py-2 rounded-lg transition-colors ${slippage === option ? 'bg-brand-primary text-white' : 'bg-brand-secondary hover:bg-gray-700'}`}
                            >
                                {option}%
                            </button>
                        ))}
                         <input
                            type="text"
                            value={customSlippage}
                            onChange={handleCustomSlippageChange}
                            className="w-24 bg-brand-surface-2 border border-brand-secondary rounded-lg p-2 text-right focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        />
                         <span className="flex items-center">%</span>
                    </div>
                    {slippage > 1 && slippage <= 5 && (
                        <p className="text-sm text-yellow-400 mt-3">Your transaction may be frontrun.</p>
                    )}
                     {slippage > 5 && (
                        <p className="text-sm text-brand-accent mt-3">Your transaction may fail or be frontrun.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
