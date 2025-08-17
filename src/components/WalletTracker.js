import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';

const WalletTracker = ({ socket, addNotification }) => {
  const [walletAddress, setWalletAddress] = useState('');
  const [trackedWallets, setTrackedWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTrackWallet = async () => {
    if (!walletAddress.trim()) {
      addNotification('Please enter a wallet address', 'error');
      return;
    }

    if (!socket) {
      addNotification('Not connected to server', 'error');
      return;
    }

    setIsLoading(true);
    try {
      socket.emit('track_wallet', { address: walletAddress.trim() });
      
      // Add to tracked wallets list
      const newWallet = {
        address: walletAddress.trim(),
        balance: '0 SEI',
        transactions: 0,
        lastActivity: 'Never',
        status: 'tracking'
      };
      
      setTrackedWallets(prev => [...prev, newWallet]);
      setWalletAddress('');
      addNotification(`Started tracking wallet: ${walletAddress.trim()}`, 'success');
    } catch (error) {
      addNotification(`Error tracking wallet: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopTracking = (address) => {
    if (socket) {
      socket.emit('stop_tracking', { type: 'wallet', identifier: address });
    }
    
    setTrackedWallets(prev => prev.filter(w => w.address !== address));
    if (selectedWallet?.address === address) {
      setSelectedWallet(null);
    }
    addNotification(`Stopped tracking wallet: ${address}`, 'info');
  };

  const handleWalletSelect = (wallet) => {
    setSelectedWallet(wallet);
  };

  // Mock wallet data for demonstration
  const mockWalletData = {
    balance: '1,234.56 SEI',
    transactions: 89,
    totalVolume: '45,678.90 SEI',
    activityLevel: 'High',
    riskScore: 'Low',
    behaviorType: 'Regular Trader',
    tokenHoldings: [
      { symbol: 'SEI', amount: '1,234.56', value: '1,234.56' },
      { symbol: 'MEME', amount: '10,000', value: '500.00' },
      { symbol: 'DEFI', amount: '500', value: '250.00' }
    ],
    recentTransactions: [
      { hash: '0x1234...', type: 'Send', amount: '100 SEI', timestamp: '2 hours ago' },
      { hash: '0x5678...', type: 'Receive', amount: '50 SEI', timestamp: '5 hours ago' },
      { hash: '0x9abc...', type: 'Swap', amount: '25 SEI → 500 MEME', timestamp: '1 day ago' }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8' },
      },
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8' },
        grid: { color: '#334155' },
      },
      y: {
        ticks: { color: '#94a3b8' },
        grid: { color: '#334155' },
      },
    },
  };

  const balanceChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Balance (SEI)',
        data: [1200, 1250, 1180, 1300, 1280, 1350, 1234],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const transactionChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Transactions',
        data: [12, 19, 15, 25, 22, 30],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Wallet Input */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4 text-gradient">Wallet Tracking</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="Enter wallet address (e.g., sei1...)"
            className="input-field flex-1"
          />
          <button
            onClick={handleTrackWallet}
            disabled={isLoading || !walletAddress.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Tracking...' : 'Track Wallet'}
          </button>
        </div>
      </div>

      {/* Tracked Wallets */}
      {trackedWallets.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Tracked Wallets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trackedWallets.map((wallet) => (
              <div
                key={wallet.address}
                className={`p-4 rounded-lg border cursor-pointer transition-all hover:scale-105 ${
                  selectedWallet?.address === wallet.address
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-dark-600 bg-dark-800/50'
                }`}
                onClick={() => handleWalletSelect(wallet)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-mono text-primary-400">
                    {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    wallet.status === 'tracking' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {wallet.status}
                  </span>
                </div>
                <div className="text-sm text-dark-300">
                  <div>Balance: {wallet.balance}</div>
                  <div>Transactions: {wallet.transactions}</div>
                  <div>Last Activity: {wallet.lastActivity}</div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStopTracking(wallet.address);
                  }}
                  className="mt-2 w-full btn-secondary text-sm py-1"
                >
                  Stop Tracking
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wallet Analysis */}
      {selectedWallet && (
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">
            Wallet Analysis: {selectedWallet.address.slice(0, 8)}...{selectedWallet.address.slice(-6)}
          </h3>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="stat-card">
              <div className="text-2xl font-bold text-primary-400">{mockWalletData.balance}</div>
              <div className="text-sm text-dark-400">Current Balance</div>
            </div>
            <div className="stat-card">
              <div className="text-2xl font-bold text-green-400">{mockWalletData.transactions}</div>
              <div className="text-sm text-dark-400">Total Transactions</div>
            </div>
            <div className="stat-card">
              <div className="text-2xl font-bold text-yellow-400">{mockWalletData.activityLevel}</div>
              <div className="text-sm text-dark-400">Activity Level</div>
            </div>
            <div className="stat-card">
              <div className="text-2xl font-bold text-purple-400">{mockWalletData.riskScore}</div>
              <div className="text-sm text-dark-400">Risk Score</div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-lg font-semibold mb-3">Balance History</h4>
              <div className="h-64">
                <Line data={balanceChartData} options={chartOptions} />
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-3">Transaction Volume</h4>
              <div className="h-64">
                <Bar data={transactionChartData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Token Holdings */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3">Token Holdings</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-600">
                    <th className="text-left py-2 text-dark-300">Token</th>
                    <th className="text-left py-2 text-dark-300">Amount</th>
                    <th className="text-left py-2 text-dark-300">Value (SEI)</th>
                  </tr>
                </thead>
                <tbody>
                  {mockWalletData.tokenHoldings.map((token, index) => (
                    <tr key={index} className="border-b border-dark-700">
                      <td className="py-2 font-mono">{token.symbol}</td>
                      <td className="py-2">{token.amount}</td>
                      <td className="py-2">{token.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Transactions */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Recent Transactions</h4>
            <div className="space-y-2">
              {mockWalletData.recentTransactions.map((tx, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono text-dark-400">{tx.hash}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      tx.type === 'Send' ? 'bg-red-500/20 text-red-400' :
                      tx.type === 'Receive' ? 'bg-green-500/20 text-green-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {tx.type}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">{tx.amount}</div>
                    <div className="text-xs text-dark-400">{tx.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletTracker;
