import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { BeerMugIcon } from './icons/BeerMugIcon';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-brand-surface/80 backdrop-blur-md border-b border-brand-secondary z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <BeerMugIcon className="h-8 w-8 text-brand-primary" />
            <span className="text-xl font-bold text-brand-text-primary">Cabac</span>
          </div>
          <ConnectButton />
        </div>
      </div>
    </header>
  );
};

export default Header;
