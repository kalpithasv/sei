import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PlatformOverview = () => {
  const [overviewData, setOverviewData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchOverviewData = async () => {
      setIsLoading(true);
      try {
        // Mock data - in real app, this would be an API call
        const mockData = {
          totalWallets: 15420,
          activeWallets: 8920,
          totalTransactions: 456789,
          totalVolume: 2345678.90,
          networkStats: {
            blockHeight: 1234567,
            avgBlockTime: 2.3,
            totalStaked: 5678901.23,
            validators: 150
          },
          marketStats: {
            totalMarketCap: 9876543.21,
            totalVolume24h: 123456.78,
            activeTokens: 89,
            activeNFTs: 456
          }
        };
        
        setOverviewData(mockData);
      } catch (error) {
        console.error('Error fetching overview data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#94a3b8',
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#94a3b8',
        },
        grid: {
          color: '#334155',
        },
      },
      y: {
        ticks: {
          color: '#94a3b8',
        },
        grid: {
          color: '#334155',
        },
      },
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!overviewData) {
    return (
      <div className="text-center text-red-400">
        Failed to load overview data
      </div>
    );
  }

  const transactionChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Transactions',
        data: [1234, 2345, 3456, 4567, 5678, 6789, 7890],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const volumeChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Volume (SEI)',
        data: [123456, 234567, 345678, 456789, 567890, 678901],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 8,
      },
    ],
  };

  const walletDistributionData = {
    labels: ['Active', 'Inactive', 'New'],
    datasets: [
      {
        data: [overviewData.activeWallets, overviewData.totalWallets - overviewData.activeWallets, 1234],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)',
        ],
        borderWidth: 2,
        borderColor: '#1e293b',
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="text-3xl font-bold text-primary-400">
            {overviewData.totalWallets.toLocaleString()}
          </div>
          <div className="text-sm text-dark-400">Total Wallets</div>
        </div>
        
        <div className="stat-card">
          <div className="text-3xl font-bold text-green-400">
            {overviewData.activeWallets.toLocaleString()}
          </div>
          <div className="text-sm text-dark-400">Active Wallets</div>
        </div>
        
        <div className="stat-card">
          <div className="text-3xl font-bold text-yellow-400">
            {overviewData.totalTransactions.toLocaleString()}
          </div>
          <div className="text-sm text-dark-400">Total Transactions</div>
        </div>
        
        <div className="stat-card">
          <div className="text-3xl font-bold text-purple-400">
            {overviewData.totalVolume.toLocaleString()}
          </div>
          <div className="text-sm text-dark-400">Total Volume (SEI)</div>
        </div>
      </div>

      {/* Network & Market Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-semibold mb-4 text-gradient">Network Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-dark-300">Block Height</span>
              <span className="font-mono">{overviewData.networkStats.blockHeight.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-300">Avg Block Time</span>
              <span>{overviewData.networkStats.avgBlockTime}s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-300">Total Staked</span>
              <span>{overviewData.networkStats.totalStaked.toLocaleString()} SEI</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-300">Validators</span>
              <span>{overviewData.networkStats.validators}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold mb-4 text-gradient">Market Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-dark-300">Total Market Cap</span>
              <span className="font-mono">${overviewData.marketStats.totalMarketCap.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-300">24h Volume</span>
              <span className="font-mono">${overviewData.marketStats.totalVolume24h.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-300">Active Tokens</span>
              <span>{overviewData.marketStats.activeTokens}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-300">Active NFTs</span>
              <span>{overviewData.marketStats.activeNFTs}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Weekly Transactions</h3>
          <div className="h-64">
            <Line data={transactionChartData} options={chartOptions} />
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Monthly Volume</h3>
          <div className="h-64">
            <Bar data={volumeChartData} options={chartOptions} />
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Wallet Distribution</h3>
          <div className="h-64">
            <Doughnut data={walletDistributionData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformOverview;
