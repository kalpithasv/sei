import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

const MemeCoinTracker = ({ socket, addNotification }) => {
  const [coinSymbol, setCoinSymbol] = useState('');
  const [trackedCoins, setTrackedCoins] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTrackCoin = async () => {
    if (!coinSymbol.trim()) {
      addNotification('Please enter a coin symbol', 'error');
      return;
    }

    if (!socket) {
      addNotification('Not connected to server', 'error');
      return;
    }

    setIsLoading(true);
    try {
      socket.emit('track_memecoin', { symbol: coinSymbol.trim().toUpperCase() });
      
      // Add to tracked coins list
      const newCoin = {
        symbol: coinSymbol.trim().toUpperCase(),
        price: '$0.00',
        marketCap: '$0',
        volume24h: '$0',
        status: 'tracking'
      };
      
      setTrackedCoins(prev => [...prev, newCoin]);
      setCoinSymbol('');
      addNotification(`Started tracking meme coin: ${coinSymbol.trim().toUpperCase()}`, 'success');
    } catch (error) {
      addNotification(`Error tracking coin: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopTracking = (symbol) => {
    if (socket) {
      socket.emit('stop_tracking', { type: 'memecoin', identifier: symbol });
    }
    
    setTrackedCoins(prev => prev.filter(c => c.symbol !== symbol));
    if (selectedCoin?.symbol === symbol) {
      setSelectedCoin(null);
    }
    addNotification(`Stopped tracking coin: ${symbol}`, 'info');
  };

  const handleCoinSelect = (coin) => {
    setSelectedCoin(coin);
  };

  // Mock coin data for demonstration
  const mockCoinData = {
    price: '$0.000123',
    priceChange24h: '+45.67%',
    marketCap: '$1,234,567',
    volume24h: '$89,012',
    circulatingSupply: '10,000,000,000',
    totalSupply: '10,000,000,000',
    holders: 1234,
    liquidity: '$234,567',
    flowData: {
      inflow24h: '$45,678',
      outflow24h: '$23,456',
      netFlow: '+$22,222',
      topInflows: [
        { wallet: '0x1234...', amount: '$12,345', percentage: '27.0%' },
        { wallet: '0x5678...', amount: '$8,901', percentage: '19.5%' },
        { wallet: '0x9abc...', amount: '$6,789', percentage: '14.9%' }
      ],
      topOutflows: [
        { wallet: '0xdef0...', amount: '$8,765', percentage: '37.4%' },
        { wallet: '0x1234...', amount: '$5,432', percentage: '23.2%' },
        { wallet: '0x5678...', amount: '$3,210', percentage: '13.7%' }
      ]
    },
    whaleWallets: [
      { wallet: '0x1234...', balance: '1,000,000,000', percentage: '10.0%', value: '$123,000' },
      { wallet: '0x5678...', balance: '500,000,000', percentage: '5.0%', value: '$61,500' },
      { wallet: '0x9abc...', balance: '250,000,000', percentage: '2.5%', value: '$30,750' }
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

  const priceChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Price (USD)',
        data: [0.00008, 0.00009, 0.00012, 0.00015, 0.00011, 0.00013, 0.000123],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const flowChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Inflow (USD)',
        data: [12000, 15000, 18000, 22000, 19000, 25000, 45678],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderRadius: 8,
      },
      {
        label: 'Outflow (USD)',
        data: [8000, 12000, 15000, 18000, 16000, 20000, 23456],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderRadius: 8,
      },
    ],
  };

  const holderDistributionData = {
    labels: ['Whales (>5%)', 'Large (1-5%)', 'Medium (0.1-1%)', 'Small (<0.1%)'],
    datasets: [
      {
        data: [15, 25, 35, 25],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
        ],
        borderWidth: 2,
        borderColor: '#1e293b',
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Coin Input */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4 text-gradient">Meme Coin Analytics</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={coinSymbol}
            onChange={(e) => setCoinSymbol(e.target.value)}
            placeholder="Enter coin symbol (e.g., DOGE, SHIB)"
            className="input-field flex-1"
          />
          <button
            onClick={handleTrackCoin}
            disabled={isLoading || !coinSymbol.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Tracking...' : 'Track Coin'}
          </button>
        </div>
      </div>

      {/* Tracked Coins */}
      {trackedCoins.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Tracked Coins</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trackedCoins.map((coin) => (
              <div
                key={coin.symbol}
                className={`p-4 rounded-lg border cursor-pointer transition-all hover:scale-105 ${
                  selectedCoin?.symbol === coin.symbol
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-dark-600 bg-dark-800/50'
                }`}
                onClick={() => handleCoinSelect(coin)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-primary-400">{coin.symbol}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    coin.status === 'tracking' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {coin.status}
                  </span>
                </div>
                <div className="text-sm text-dark-300">
                  <div>Price: {coin.price}</div>
                  <div>Market Cap: {coin.marketCap}</div>
                  <div>24h Volume: {coin.volume24h}</div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStopTracking(coin.symbol);
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

      {/* Coin Analysis */}
      {selectedCoin && (
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">
            Coin Analysis: {selectedCoin.symbol}
          </h3>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="stat-card">
              <div className="text-2xl font-bold text-primary-400">{mockCoinData.price}</div>
              <div className="text-sm text-dark-400">Current Price</div>
              <div className={`text-xs ${mockCoinData.priceChange24h.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                {mockCoinData.priceChange24h}
              </div>
            </div>
            <div className="stat-card">
              <div className="text-2xl font-bold text-green-400">{mockCoinData.marketCap}</div>
              <div className="text-sm text-dark-400">Market Cap</div>
            </div>
            <div className="stat-card">
              <div className="text-2xl font-bold text-yellow-400">{mockCoinData.volume24h}</div>
              <div className="text-sm text-dark-400">24h Volume</div>
            </div>
            <div className="stat-card">
              <div className="text-2xl font-bold text-purple-400">{mockCoinData.holders}</div>
              <div className="text-sm text-dark-400">Holders</div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-lg font-semibold mb-3">Price History</h4>
              <div className="h-64">
                <Line data={priceChartData} options={chartOptions} />
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-3">Flow Analysis</h4>
              <div className="h-64">
                <Bar data={flowChartData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Flow Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="card">
              <h4 className="text-lg font-semibold mb-3 text-green-400">Inflow (24h)</h4>
              <div className="text-2xl font-bold">{mockCoinData.flowData.inflow24h}</div>
              <div className="text-sm text-dark-400">Money flowing into the token</div>
            </div>
            <div className="card">
              <h4 className="text-lg font-semibold mb-3 text-red-400">Outflow (24h)</h4>
              <div className="text-2xl font-bold">{mockCoinData.flowData.outflow24h}</div>
              <div className="text-sm text-dark-400">Money flowing out of the token</div>
            </div>
            <div className="card">
              <h4 className="text-lg font-semibold mb-3 text-blue-400">Net Flow</h4>
              <div className="text-2xl font-bold">{mockCoinData.flowData.netFlow}</div>
              <div className="text-sm text-dark-400">Net money movement</div>
            </div>
          </div>

          {/* Holder Distribution */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3">Holder Distribution</h4>
            <div className="h-64">
              <Doughnut data={holderDistributionData} options={chartOptions} />
            </div>
          </div>

          {/* Top Flows */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-lg font-semibold mb-3 text-green-400">Top Inflows</h4>
              <div className="space-y-2">
                {mockCoinData.flowData.topInflows.map((flow, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                    <span className="text-sm font-mono text-green-400">{flow.wallet}</span>
                    <div className="text-right">
                      <div className="text-sm text-green-400">{flow.amount}</div>
                      <div className="text-xs text-dark-400">{flow.percentage}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-3 text-red-400">Top Outflows</h4>
              <div className="space-y-2">
                {mockCoinData.flowData.topOutflows.map((flow, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg">
                    <span className="text-sm font-mono text-red-400">{flow.wallet}</span>
                    <div className="text-right">
                      <div className="text-sm text-red-400">{flow.amount}</div>
                      <div className="text-xs text-dark-400">{flow.percentage}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Whale Wallets */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Whale Wallets</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-600">
                    <th className="text-left py-2 text-dark-300">Wallet</th>
                    <th className="text-left py-2 text-dark-300">Balance</th>
                    <th className="text-left py-2 text-dark-300">Percentage</th>
                    <th className="text-left py-2 text-dark-300">Value (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {mockCoinData.whaleWallets.map((whale, index) => (
                    <tr key={index} className="border-b border-dark-700">
                      <td className="py-2 font-mono text-primary-400">{whale.wallet}</td>
                      <td className="py-2">{whale.balance}</td>
                      <td className="py-2">{whale.percentage}</td>
                      <td className="py-2">{whale.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemeCoinTracker;
