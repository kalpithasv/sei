const express = require('express');
const router = express.Router();

// Mock analytics data for demonstration
const mockAnalytics = {
  platformStats: {
    totalWallets: 15420,
    totalTransactions: 892450,
    totalVolume: 45678900,
    activeUsers24h: 3420,
    activeUsers7d: 12890,
    totalNFTs: 5670,
    totalTokens: 89,
    lastUpdated: Date.now()
  },
  networkStats: {
    totalBlocks: 12345678,
    averageBlockTime: 6.2,
    totalValidators: 150,
    activeValidators: 125,
    totalStaked: 456789000,
    inflationRate: 7.2,
    lastUpdated: Date.now()
  },
  marketOverview: {
    topGainers: [
      { symbol: 'PEPE', change: 45.2, volume: 1234000 },
      { symbol: 'DOGE', change: 32.1, volume: 890000 },
      { symbol: 'SHIB', change: 28.7, volume: 567000 }
    ],
    topLosers: [
      { symbol: 'FLOKI', change: -18.3, volume: 234000 },
      { symbol: 'BONK', change: -15.7, volume: 189000 },
      { symbol: 'MOON', change: -12.4, volume: 145000 }
    ],
    trendingCollections: [
      { name: 'Sei Punks', volume: 89000, sales: 45 },
      { name: 'Cosmic Cats', volume: 67000, sales: 32 },
      { name: 'DeFi Warriors', volume: 54000, sales: 28 }
    ]
  }
};

// Get platform overview statistics
router.get('/overview', async (req, res) => {
  try {
    // Generate some dynamic data
    const now = Date.now();
    const hourMs = 60 * 60 * 1000;
    
    // Simulate real-time updates
    const updatedStats = {
      ...mockAnalytics.platformStats,
      totalTransactions: mockAnalytics.platformStats.totalTransactions + Math.floor(Math.random() * 100),
      totalVolume: mockAnalytics.platformStats.totalVolume + Math.floor(Math.random() * 10000),
      activeUsers24h: mockAnalytics.platformStats.activeUsers24h + Math.floor(Math.random() * 50),
      lastUpdated: now
    };

    res.json({
      success: true,
      data: {
        platform: updatedStats,
        network: mockAnalytics.networkStats,
        market: mockAnalytics.marketOverview,
        timestamp: now
      }
    });
  } catch (error) {
    console.error('Error getting platform overview:', error);
    res.status(500).json({ error: 'Failed to get platform overview' });
  }
});

// Get real-time network statistics
router.get('/network', async (req, res) => {
  try {
    const now = Date.now();
    
    // Simulate network activity
    const updatedNetworkStats = {
      ...mockAnalytics.networkStats,
      totalBlocks: mockAnalytics.networkStats.totalBlocks + Math.floor(Math.random() * 10),
      averageBlockTime: mockAnalytics.networkStats.averageBlockTime + (Math.random() - 0.5) * 0.5,
      totalStaked: mockAnalytics.networkStats.totalStaked + Math.floor(Math.random() * 1000),
      lastUpdated: now
    };

    // Generate recent block information
    const recentBlocks = [];
    for (let i = 0; i < 10; i++) {
      recentBlocks.push({
        height: updatedNetworkStats.totalBlocks - i,
        timestamp: now - (i * 6.2 * 1000), // 6.2 second intervals
        transactions: Math.floor(Math.random() * 100) + 50,
        validator: `validator_${Math.floor(Math.random() * 150) + 1}`,
        size: Math.floor(Math.random() * 1000) + 500
      });
    }

    res.json({
      success: true,
      data: {
        network: updatedNetworkStats,
        recentBlocks,
        timestamp: now
      }
    });
  } catch (error) {
    console.error('Error getting network statistics:', error);
    res.status(500).json({ error: 'Failed to get network statistics' });
  }
});

// Get market overview and trends
router.get('/market', async (req, res) => {
  try {
    const { timeframe = '24h' } = req.query;
    const now = Date.now();
    
    // Generate market data based on timeframe
    let marketData;
    switch (timeframe) {
      case '1h':
        marketData = generateMarketData(1, now);
        break;
      case '24h':
        marketData = generateMarketData(24, now);
        break;
      case '7d':
        marketData = generateMarketData(168, now);
        break;
      case '30d':
        marketData = generateMarketData(720, now);
        break;
      default:
        marketData = generateMarketData(24, now);
    }

    res.json({
      success: true,
      data: {
        timeframe,
        overview: marketData.overview,
        topMovers: marketData.topMovers,
        volumeLeaders: marketData.volumeLeaders,
        trendingAssets: marketData.trendingAssets,
        timestamp: now
      }
    });
  } catch (error) {
    console.error('Error getting market overview:', error);
    res.status(500).json({ error: 'Failed to get market overview' });
  }
});

// Get wallet analytics overview
router.get('/wallets', async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    const now = Date.now();
    
    // Generate wallet analytics
    const walletAnalytics = generateWalletAnalytics(timeframe, now);

    res.json({
      success: true,
      data: {
        timeframe,
        analytics: walletAnalytics,
        timestamp: now
      }
    });
  } catch (error) {
    console.error('Error getting wallet analytics:', error);
    res.status(500).json({ error: 'Failed to get wallet analytics' });
  }
});

// Get NFT market analytics
router.get('/nfts', async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    const now = Date.now();
    
    // Generate NFT analytics
    const nftAnalytics = generateNFTAnalytics(timeframe, now);

    res.json({
      success: true,
      data: {
        timeframe,
        analytics: nftAnalytics,
        timestamp: now
      }
    });
  } catch (error) {
    console.error('Error getting NFT analytics:', error);
    res.status(500).json({ error: 'Failed to get NFT analytics' });
  }
});

// Get cross-asset correlation analysis
router.get('/correlations', async (req, res) => {
  try {
    const { assets } = req.query;
    const assetList = assets ? assets.split(',') : ['PEPE', 'DOGE', 'SHIB'];
    
    // Generate correlation data
    const correlations = generateCorrelationData(assetList);

    res.json({
      success: true,
      data: {
        assets: assetList,
        correlations,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    console.error('Error getting correlation analysis:', error);
    res.status(500).json({ error: 'Failed to get correlation analysis' });
  }
});

// Get whale activity overview
router.get('/whales', async (req, res) => {
  try {
    const { timeframe = '24h' } = req.query;
    const now = Date.now();
    
    // Generate whale activity data
    const whaleActivity = generateWhaleActivityData(timeframe, now);

    res.json({
      success: true,
      data: {
        timeframe,
        activity: whaleActivity,
        timestamp: now
      }
    });
  } catch (error) {
    console.error('Error getting whale activity:', error);
    res.status(500).json({ error: 'Failed to get whale activity' });
  }
});

// Get platform performance metrics
router.get('/performance', async (req, res) => {
  try {
    const { metric = 'all' } = req.query;
    const now = Date.now();
    
    // Generate performance metrics
    const performance = generatePerformanceMetrics(metric, now);

    res.json({
      success: true,
      data: {
        metric,
        performance,
        timestamp: now
      }
    });
  } catch (error) {
    console.error('Error getting performance metrics:', error);
    res.status(500).json({ error: 'Failed to get performance metrics' });
  }
});

// Helper functions
function generateMarketData(hours, now) {
  const overview = {
    totalMarketCap: Math.random() * 10000000 + 5000000,
    totalVolume24h: Math.random() * 5000000 + 2000000,
    activeTokens: Math.floor(Math.random() * 50) + 30,
    priceChange24h: (Math.random() - 0.5) * 10
  };

  const topMovers = [
    { symbol: 'PEPE', change: Math.random() * 100, volume: Math.random() * 1000000 },
    { symbol: 'DOGE', change: Math.random() * 80, volume: Math.random() * 800000 },
    { symbol: 'SHIB', change: Math.random() * 60, volume: Math.random() * 600000 }
  ].sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

  const volumeLeaders = [
    { symbol: 'PEPE', volume: Math.random() * 2000000, transactions: Math.floor(Math.random() * 1000) },
    { symbol: 'DOGE', volume: Math.random() * 1500000, transactions: Math.floor(Math.random() * 800) },
    { symbol: 'SHIB', volume: Math.random() * 1000000, transactions: Math.floor(Math.random() * 600) }
  ].sort((a, b) => b.volume - a.volume);

  const trendingAssets = [
    { symbol: 'PEPE', socialScore: Math.random() * 100, mentions: Math.floor(Math.random() * 10000) },
    { symbol: 'DOGE', socialScore: Math.random() * 90, mentions: Math.floor(Math.random() * 8000) },
    { symbol: 'SHIB', socialScore: Math.random() * 80, mentions: Math.floor(Math.random() * 6000) }
  ].sort((a, b) => b.socialScore - a.socialScore);

  return { overview, topMovers, volumeLeaders, trendingAssets };
}

function generateWalletAnalytics(timeframe, now) {
  const timeframes = {
    '1d': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000
  };

  const period = timeframes[timeframe] || timeframes['30d'];
  const startTime = now - period;

  return {
    newWallets: Math.floor(Math.random() * 1000) + 500,
    activeWallets: Math.floor(Math.random() * 5000) + 2000,
    totalTransactions: Math.floor(Math.random() * 100000) + 50000,
    averageTransactionValue: Math.random() * 1000 + 100,
    topWalletTypes: [
      { type: 'trader', count: Math.floor(Math.random() * 2000) + 1000, percentage: Math.random() * 30 + 20 },
      { type: 'holder', count: Math.floor(Math.random() * 3000) + 1500, percentage: Math.random() * 40 + 30 },
      { type: 'miner', count: Math.floor(Math.random() * 1000) + 500, percentage: Math.random() * 20 + 10 }
    ],
    walletGrowth: generateTimeSeriesData(startTime, now, 24, 'wallets')
  };
}

function generateNFTAnalytics(timeframe, now) {
  const timeframes = {
    '1d': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000
  };

  const period = timeframes[timeframe] || timeframes['30d'];
  const startTime = now - period;

  return {
    totalSales: Math.floor(Math.random() * 10000) + 5000,
    totalVolume: Math.random() * 1000000 + 500000,
    averagePrice: Math.random() * 500 + 100,
    uniqueBuyers: Math.floor(Math.random() * 2000) + 1000,
    uniqueSellers: Math.floor(Math.random() * 1500) + 800,
    topCollections: [
      { name: 'Sei Punks', volume: Math.random() * 100000, sales: Math.floor(Math.random() * 500) },
      { name: 'Cosmic Cats', volume: Math.random() * 80000, sales: Math.floor(Math.random() * 400) },
      { name: 'DeFi Warriors', volume: Math.random() * 60000, sales: Math.floor(Math.random() * 300) }
    ],
    salesTrend: generateTimeSeriesData(startTime, now, 24, 'sales')
  };
}

function generateCorrelationData(assets) {
  const correlations = {};
  
  assets.forEach((asset1, i) => {
    correlations[asset1] = {};
    assets.forEach((asset2, j) => {
      if (i === j) {
        correlations[asset1][asset2] = 1.0;
      } else {
        correlations[asset1][asset2] = (Math.random() - 0.5) * 2; // -1 to 1
      }
    });
  });

  return correlations;
}

function generateWhaleActivityData(timeframe, now) {
  const timeframes = {
    '1h': 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000
  };

  const period = timeframes[timeframe] || timeframes['24h'];
  const startTime = now - period;

  return {
    activeWhales: Math.floor(Math.random() * 100) + 50,
    totalWhaleTransactions: Math.floor(Math.random() * 1000) + 500,
    averageWhaleTransactionValue: Math.random() * 10000 + 5000,
    topWhaleMoves: [
      { wallet: 'sei1whale1...', action: 'buy', symbol: 'PEPE', amount: Math.random() * 1000000 },
      { wallet: 'sei1whale2...', action: 'sell', symbol: 'DOGE', amount: Math.random() * 800000 },
      { wallet: 'sei1whale3...', action: 'buy', symbol: 'SHIB', amount: Math.random() * 600000 }
    ],
    whaleActivity: generateTimeSeriesData(startTime, now, 24, 'whale_activity')
  };
}

function generatePerformanceMetrics(metric, now) {
  const metrics = {
    all: {
      uptime: 99.9,
      responseTime: Math.random() * 100 + 50,
      throughput: Math.random() * 1000 + 500,
      errorRate: Math.random() * 0.1,
      activeConnections: Math.floor(Math.random() * 1000) + 500
    },
    api: {
      requestsPerSecond: Math.random() * 100 + 50,
      averageResponseTime: Math.random() * 200 + 100,
      successRate: 99.5 + Math.random() * 0.5,
      totalRequests: Math.floor(Math.random() * 1000000) + 500000
    },
    blockchain: {
      syncStatus: 'synced',
      lastBlockHeight: Math.floor(Math.random() * 1000000) + 1000000,
      averageBlockTime: 6.2 + (Math.random() - 0.5) * 0.5,
      networkHashrate: Math.random() * 1000000 + 500000
    }
  };

  return metrics[metric] || metrics.all;
}

function generateTimeSeriesData(startTime, endTime, dataPoints, type) {
  const data = [];
  const interval = (endTime - startTime) / dataPoints;
  
  for (let i = 0; i < dataPoints; i++) {
    const timestamp = startTime + (i * interval);
    let value;
    
    switch (type) {
      case 'wallets':
        value = Math.floor(Math.random() * 100) + 50;
        break;
      case 'sales':
        value = Math.floor(Math.random() * 1000) + 500;
        break;
      case 'whale_activity':
        value = Math.floor(Math.random() * 100) + 20;
        break;
      default:
        value = Math.random() * 100;
    }
    
    data.push({ timestamp, value });
  }
  
  return data;
}

module.exports = router;
