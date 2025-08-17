const express = require('express');
const router = express.Router();

// Mock meme coin data for demonstration
const mockCoins = new Map();

// Initialize with some mock data
function initializeMockData() {
  const mockSymbols = ['PEPE', 'DOGE', 'SHIB', 'FLOKI', 'BONK'];
  
  mockSymbols.forEach((symbol, index) => {
    mockCoins.set(symbol, {
      symbol,
      name: `${symbol} Token`,
      denom: `u${symbol.toLowerCase()}`,
      price: (Math.random() * 0.01 + 0.001).toFixed(6),
      marketCap: (Math.random() * 1000000 + 100000).toFixed(0),
      volume24h: (Math.random() * 500000 + 50000).toFixed(0),
      totalSupply: (Math.random() * 1000000000 + 100000000).toFixed(0),
      circulatingSupply: (Math.random() * 800000000 + 200000000).toFixed(0),
      priceChange24h: (Math.random() - 0.5) * 20,
      priceChange7d: (Math.random() - 0.5) * 40,
      lastUpdated: Date.now()
    });
  });
}

function generateMockFlowData(symbol, hours = 168) { // 1 week of hourly data
  const flows = [];
  const now = Date.now();
  const hourMs = 60 * 60 * 1000;

  for (let i = hours - 1; i >= 0; i--) {
    const timestamp = now - (i * hourMs);
    const inflow = Math.random() * 10000 + 1000;   // 1k to 11k
    const outflow = Math.random() * 8000 + 500;    // 500 to 8.5k
    const netFlow = inflow - outflow;
    
    flows.push({
      timestamp,
      inflow,
      outflow,
      netFlow,
      volume: inflow + outflow
    });
  }

  return flows;
}

function generateMockWhaleData(symbol) {
  const whales = [];
  const whaleCount = Math.floor(Math.random() * 5) + 3; // 3-7 whales

  for (let i = 0; i < whaleCount; i++) {
    whales.push({
      address: `sei1whale${i}${Math.random().toString(36).substr(2, 9)}`,
      balance: (Math.random() * 1000000 + 100000).toFixed(0),
      percentage: (Math.random() * 5 + 1).toFixed(2), // 1-6%
      lastActivity: Date.now() - Math.random() * 24 * 60 * 60 * 1000 // Random time in last 24h
    });
  }

  return whales.sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance));
}

// Initialize mock data
initializeMockData();

// Get meme coin information
router.get('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    // Validate symbol format
    if (!symbol || symbol.length < 2 || symbol.length > 10) {
      return res.status(400).json({ error: 'Invalid coin symbol format' });
    }

    // Check if we have mock data for this symbol
    let coinData = mockCoins.get(symbol.toUpperCase());
    
    if (!coinData) {
      // Generate new mock data for this symbol
      coinData = {
        symbol: symbol.toUpperCase(),
        name: `${symbol.toUpperCase()} Token`,
        denom: `u${symbol.toLowerCase()}`,
        price: (Math.random() * 0.01 + 0.001).toFixed(6),
        marketCap: (Math.random() * 1000000 + 100000).toFixed(0),
        volume24h: (Math.random() * 500000 + 50000).toFixed(0),
        totalSupply: (Math.random() * 1000000000 + 100000000).toFixed(0),
        circulatingSupply: (Math.random() * 800000000 + 200000000).toFixed(0),
        priceChange24h: (Math.random() - 0.5) * 20,
        priceChange7d: (Math.random() - 0.5) * 40,
        lastUpdated: Date.now()
      };
      
      mockCoins.set(symbol.toUpperCase(), coinData);
    }

    res.json({
      success: true,
      data: coinData
    });
  } catch (error) {
    console.error('Error getting meme coin info:', error);
    res.status(500).json({ error: 'Failed to get meme coin information' });
  }
});

// Get meme coin flow data
router.get('/:symbol/flow', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { timeframe = '24h', limit = 24 } = req.query;
    
    // Validate symbol format
    if (!symbol || symbol.length < 2 || symbol.length > 10) {
      return res.status(400).json({ error: 'Invalid coin symbol format' });
    }

    // Generate flow data based on timeframe
    let hours;
    switch (timeframe) {
      case '1h':
        hours = 1;
        break;
      case '24h':
        hours = 24;
        break;
      case '7d':
        hours = 168;
        break;
      case '30d':
        hours = 720;
        break;
      default:
        hours = 24;
    }

    const flows = generateMockFlowData(symbol.toUpperCase(), hours);
    const limitedFlows = flows.slice(-parseInt(limit));

    // Calculate summary statistics
    const totalInflow = limitedFlows.reduce((sum, f) => sum + f.inflow, 0);
    const totalOutflow = limitedFlows.reduce((sum, f) => sum + f.outflow, 0);
    const totalVolume = limitedFlows.reduce((sum, f) => sum + f.volume, 0);
    const netFlow = totalInflow - totalOutflow;

    res.json({
      success: true,
      data: {
        symbol: symbol.toUpperCase(),
        timeframe,
        flows: limitedFlows,
        summary: {
          totalInflow,
          totalOutflow,
          netFlow,
          totalVolume,
          averageInflow: totalInflow / limitedFlows.length,
          averageOutflow: totalOutflow / limitedFlows.length,
          flowRatio: totalInflow / (totalOutflow || 1)
        }
      }
    });
  } catch (error) {
    console.error('Error getting meme coin flow data:', error);
    res.status(500).json({ error: 'Failed to get meme coin flow data' });
  }
});

// Get meme coin whale wallets
router.get('/:symbol/whales', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { limit = 10 } = req.query;
    
    // Validate symbol format
    if (!symbol || symbol.length < 2 || symbol.length > 10) {
      return res.status(400).json({ error: 'Invalid coin symbol format' });
    }

    const whales = generateMockWhaleData(symbol.toUpperCase());
    const limitedWhales = whales.slice(0, parseInt(limit));

    // Calculate whale statistics
    const totalWhaleBalance = limitedWhales.reduce((sum, w) => sum + parseFloat(w.balance), 0);
    const averageWhaleBalance = totalWhaleBalance / limitedWhales.length;
    const whaleConcentration = limitedWhales.reduce((sum, w) => sum + parseFloat(w.percentage), 0);

    res.json({
      success: true,
      data: {
        symbol: symbol.toUpperCase(),
        whales: limitedWhales,
        statistics: {
          whaleCount: limitedWhales.length,
          totalWhaleBalance,
          averageWhaleBalance,
          whaleConcentration,
          topWhale: limitedWhales[0] || null
        }
      }
    });
  } catch (error) {
    console.error('Error getting meme coin whale data:', error);
    res.status(500).json({ error: 'Failed to get meme coin whale data' });
  }
});

// Get meme coin price history
router.get('/:symbol/price', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { timeframe = '7d', interval = '1h' } = req.query;
    
    // Validate symbol format
    if (!symbol || symbol.length < 2 || symbol.length > 10) {
      return res.status(400).json({ error: 'Invalid coin symbol format' });
    }

    // Generate price history data
    const priceHistory = generateMockPriceHistory(symbol.toUpperCase(), timeframe, interval);

    res.json({
      success: true,
      data: {
        symbol: symbol.toUpperCase(),
        timeframe,
        interval,
        priceHistory
      }
    });
  } catch (error) {
    console.error('Error getting meme coin price history:', error);
    res.status(500).json({ error: 'Failed to get meme coin price history' });
  }
});

// Get meme coin market data
router.get('/:symbol/market', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    // Validate symbol format
    if (!symbol || symbol.length < 2 || symbol.length > 10) {
      return res.status(400).json({ error: 'Invalid coin symbol format' });
    }

    let coinData = mockCoins.get(symbol.toUpperCase());
    
    if (!coinData) {
      return res.status(404).json({ error: 'Meme coin not found' });
    }

    // Generate additional market data
    const marketData = {
      ...coinData,
      liquidity: (Math.random() * 500000 + 100000).toFixed(0),
      holders: Math.floor(Math.random() * 10000 + 1000),
      transactions24h: Math.floor(Math.random() * 1000 + 100),
      averageTransactionSize: (Math.random() * 1000 + 100).toFixed(2),
      marketRank: Math.floor(Math.random() * 100 + 1),
      volatility: (Math.random() * 50 + 10).toFixed(2)
    };

    res.json({
      success: true,
      data: marketData
    });
  } catch (error) {
    console.error('Error getting meme coin market data:', error);
    res.status(500).json({ error: 'Failed to get meme coin market data' });
  }
});

// Get meme coin analytics
router.get('/:symbol/analytics', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { timeframe = '30d' } = req.query;
    
    // Validate symbol format
    if (!symbol || symbol.length < 2 || symbol.length > 10) {
      return res.status(400).json({ error: 'Invalid coin symbol format' });
    }

    // Generate comprehensive analytics
    const analytics = await generateMemeCoinAnalytics(symbol.toUpperCase(), timeframe);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error getting meme coin analytics:', error);
    res.status(500).json({ error: 'Failed to get meme coin analytics' });
  }
});

// Get meme coin comparison
router.get('/:symbol/compare', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { compareWith } = req.query;
    
    // Validate symbol format
    if (!symbol || symbol.length < 2 || symbol.length > 10) {
      return res.status(400).json({ error: 'Invalid coin symbol format' });
    }

    if (!compareWith) {
      return res.status(400).json({ error: 'compareWith parameter is required' });
    }

    const mainCoin = mockCoins.get(symbol.toUpperCase());
    const compareCoin = mockCoins.get(compareWith.toUpperCase());

    if (!mainCoin || !compareCoin) {
      return res.status(404).json({ error: 'One or both coins not found' });
    }

    const comparison = {
      main: mainCoin,
      compare: compareCoin,
      differences: {
        priceRatio: parseFloat(mainCoin.price) / parseFloat(compareCoin.price),
        marketCapRatio: parseFloat(mainCoin.marketCap) / parseFloat(compareCoin.marketCap),
        volumeRatio: parseFloat(mainCoin.volume24h) / parseFloat(compareCoin.volume24h),
        priceChangeDiff: mainCoin.priceChange24h - compareCoin.priceChange24h
      }
    };

    res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('Error comparing meme coins:', error);
    res.status(500).json({ error: 'Failed to compare meme coins' });
  }
});

// Helper functions
function generateMockPriceHistory(symbol, timeframe, interval) {
  const priceHistory = [];
  const now = Date.now();
  let intervalMs;
  let dataPoints;

  // Determine interval and data points
  switch (interval) {
    case '1m':
      intervalMs = 60 * 1000;
      break;
    case '5m':
      intervalMs = 5 * 60 * 1000;
      break;
    case '15m':
      intervalMs = 15 * 60 * 1000;
      break;
    case '1h':
      intervalMs = 60 * 60 * 1000;
      break;
    case '4h':
      intervalMs = 4 * 60 * 60 * 1000;
      break;
    case '1d':
      intervalMs = 24 * 60 * 60 * 1000;
      break;
    default:
      intervalMs = 60 * 60 * 1000;
  }

  switch (timeframe) {
    case '1d':
      dataPoints = 24;
      break;
    case '7d':
      dataPoints = 168;
      break;
    case '30d':
      dataPoints = 720;
      break;
    case '90d':
      dataPoints = 2160;
      break;
    default:
      dataPoints = 168;
  }

  let basePrice = Math.random() * 0.01 + 0.001;
  
  for (let i = dataPoints - 1; i >= 0; i--) {
    const timestamp = now - (i * intervalMs);
    const priceChange = (Math.random() - 0.5) * 0.002; // ±0.1% change
    basePrice = Math.max(0.0001, basePrice + priceChange);
    
    priceHistory.push({
      timestamp,
      price: basePrice.toFixed(6),
      volume: Math.random() * 10000 + 1000
    });
  }

  return priceHistory;
}

async function generateMemeCoinAnalytics(symbol, timeframe) {
  // Generate comprehensive analytics
  const flows = generateMockFlowData(symbol, timeframe === '30d' ? 720 : 168);
  const whales = generateMockWhaleData(symbol);
  
  const totalInflow = flows.reduce((sum, f) => sum + f.inflow, 0);
  const totalOutflow = flows.reduce((sum, f) => sum + f.outflow, 0);
  const totalVolume = flows.reduce((sum, f) => sum + f.volume, 0);
  const netFlow = totalInflow - totalOutflow;

  const whaleConcentration = whales.reduce((sum, w) => sum + parseFloat(w.percentage), 0);
  const averageWhaleBalance = whales.reduce((sum, w) => sum + parseFloat(w.balance), 0) / whales.length;

  return {
    symbol,
    timeframe,
    flowAnalytics: {
      totalInflow,
      totalOutflow,
      netFlow,
      totalVolume,
      averageInflow: totalInflow / flows.length,
      averageOutflow: totalOutflow / flows.length,
      flowRatio: totalInflow / (totalOutflow || 1),
      dataPoints: flows.length
    },
    whaleAnalytics: {
      whaleCount: whales.length,
      totalWhaleBalance: whales.reduce((sum, w) => sum + parseFloat(w.balance), 0),
      averageWhaleBalance,
      whaleConcentration,
      topWhale: whales[0] || null,
      distribution: whales.map(w => ({
        address: w.address,
        balance: w.balance,
        percentage: w.percentage
      }))
    },
    marketInsights: {
      trend: netFlow > 0 ? 'bullish' : 'bearish',
      whaleActivity: whaleConcentration > 20 ? 'high' : 'normal',
      liquidityHealth: totalVolume > 100000 ? 'healthy' : 'low',
      riskLevel: whaleConcentration > 30 ? 'high' : 'medium'
    }
  };
}

module.exports = router;
