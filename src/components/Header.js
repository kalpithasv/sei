import React, { useState } from 'react';

const Header = ({ isConnected }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-dark-800/50 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">Sei Analytics</h1>
              <p className="text-xs text-dark-400">Blockchain Intelligence Platform</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#dashboard" className="text-dark-300 hover:text-white transition-colors">
              Dashboard
            </a>
            <a href="#wallet" className="text-dark-300 hover:text-white transition-colors">
              Wallet Tracking
            </a>
            <a href="#memecoin" className="text-dark-300 hover:text-white transition-colors">
              Meme Coin
            </a>
            <a href="#nft" className="text-dark-300 hover:text-white transition-colors">
              NFT Analytics
            </a>
          </nav>

          {/* Connection Status and Actions */}
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm text-dark-300">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* Theme Toggle */}
            <button className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors">
              <svg className="w-5 h-5 text-dark-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-5 h-5 text-dark-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <nav className="flex flex-col space-y-3">
              <a href="#dashboard" className="text-dark-300 hover:text-white transition-colors py-2">
                Dashboard
              </a>
              <a href="#wallet" className="text-dark-300 hover:text-white transition-colors py-2">
                Wallet Tracking
              </a>
              <a href="#memecoin" className="text-dark-300 hover:text-white transition-colors py-2">
                Meme Coin
              </a>
              <a href="#nft" className="text-dark-300 hover:text-white transition-colors py-2">
                NFT Analytics
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
