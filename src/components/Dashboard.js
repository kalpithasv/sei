import React, { useState, useEffect } from 'react';
import WalletTracker from './WalletTracker';
import MemeCoinTracker from './MemeCoinTracker';
import NFTTracker from './NFTTracker';
import PlatformOverview from './PlatformOverview';

const Dashboard = ({ socket, addNotification }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Platform Overview', icon: '📊' },
    { id: 'wallet', label: 'Wallet Tracking', icon: '👛' },
    { id: 'memecoin', label: 'Meme Coin Analytics', icon: '🚀' },
    { id: 'nft', label: 'NFT Analytics', icon: '🖼️' },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <PlatformOverview />;
      case 'wallet':
        return <WalletTracker socket={socket} addNotification={addNotification} />;
      case 'memecoin':
        return <MemeCoinTracker socket={socket} addNotification={addNotification} />;
      case 'nft':
        return <NFTTracker socket={socket} addNotification={addNotification} />;
      default:
        return <PlatformOverview />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gradient">
          Sei Blockchain Analytics Dashboard
        </h1>
        <p className="text-xl text-dark-300 max-w-3xl mx-auto">
          Track wallets, analyze meme coins, monitor NFTs, and gain insights into the Sei ecosystem
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap justify-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`tab-button flex items-center space-x-2 px-6 py-3 ${
              activeTab === tab.id ? 'active' : ''
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {renderTabContent()}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-lg p-8 flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            <p className="text-white">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
