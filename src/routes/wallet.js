const express = require('express');
const router = express.Router();

// Mock wallet data for demonstration
const mockWallets = new Map();

// Initialize with some mock data
function initializeMockData() {
  const mockAddresses = [
    'sei1wallet1abcdefghijklmnopqrstuvwxyz123456789',
    'sei1wallet2abcdefghijklmnopqrstuvwxyz123456789',
    'sei1wallet3abcdefghijklmnopqrstuvwxyz123456789'
  ];

  mockAddresses.forEach((address, index) => {
    mockWallets.set(address, {
      address,
      balance: {
        sei: (Math.random() * 1000000 + 100000).toFixed(0),
        usdc: (Math.random() * 10000 + 1000).toFixed(2)
      },
      transactions: generateMockTransactions(20 + Math.floor(Math.random() * 30)),
      tokenHoldings: {
        sei: { amount: '1000000', denom: 'usei' },
        usdc: { amount: '5000', denom: 'uusdc' }
      },
      lastUpdated: Date.now()
    });
  });
}

function generateMockTransactions(count) {
  const transactions = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  for (let i = 0; i < count; i++) {
    const timestamp = now - Math.random() * 30 * dayMs; // Random time in last 30 days
    const amount = Math.random() * 10000 + 100;
    const type = Math.random() > 0.5 ? 'send' : 'receive';
    
    transactions.push({
      hash: `tx_${Math.random().toString(36).substr(2, 9)}`,
      timestamp,
      type,
      amount: amount.toFixed(2),
      denom: Math.random() > 0.7 ? 'usei' : 'uusdc',
      from: type === 'send' ? 'current_wallet' : `sei1sender${Math.random().toString(36).substr(2, 9)}`,
      to: type === 'send' ? `sei1receiver${Math.random().toString(36).substr(2, 9)}` : 'current_wallet',
      blockHeight: Math.floor(Math.random() * 1000000),
      fee: (Math.random() * 0.1 + 0.01).toFixed(4)
    });
  }

  return transactions.sort((a, b) => b.timestamp - a.timestamp);
}

// Initialize mock data
initializeMockData();

// Get wallet information
router.get('/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    // Validate address format
    if (!address || !address.startsWith('sei1') || address.length !== 44) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    // Check if we have mock data for this address
    let walletData = mockWallets.get(address);
    
    if (!walletData) {
      // Generate new mock data for this address
      walletData = {
        address,
        balance: {
          sei: (Math.random() * 1000000 + 100000).toFixed(0),
          usdc: (Math.random() * 10000 + 1000).toFixed(2)
        },
        transactions: generateMockTransactions(15 + Math.floor(Math.random() * 25)),
        tokenHoldings: {
          sei: { amount: '1000000', denom: 'usei' },
          usdc: { amount: '5000', denom: 'uusdc' }
        },
        lastUpdated: Date.now()
      };
      
      mockWallets.set(address, walletData);
    }

    res.json({
      success: true,
      data: walletData
    });
  } catch (error) {
    console.error('Error getting wallet info:', error);
    res.status(500).json({ error: 'Failed to get wallet information' });
  }
});

// Get wallet transactions
router.get('/:address/transactions', async (req, res) => {
  try {
    const { address } = req.params;
    const { limit = 50, offset = 0, type, denom } = req.query;
    
    // Validate address format
    if (!address || !address.startsWith('sei1') || address.length !== 44) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    let walletData = mockWallets.get(address);
    
    if (!walletData) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    let transactions = [...walletData.transactions];

    // Apply filters
    if (type) {
      transactions = transactions.filter(tx => tx.type === type);
    }
    
    if (denom) {
      transactions = transactions.filter(tx => tx.denom === denom);
    }

    // Apply pagination
    const total = transactions.length;
    const paginatedTransactions = transactions.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      success: true,
      data: {
        transactions: paginatedTransactions,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < total
        }
      }
    });
  } catch (error) {
    console.error('Error getting wallet transactions:', error);
    res.status(500).json({ error: 'Failed to get wallet transactions' });
  }
});

// Get wallet behavior analysis
router.get('/:address/behavior', async (req, res) => {
  try {
    const { address } = req.params;
    
    // Validate address format
    if (!address || !address.startsWith('sei1') || address.length !== 44) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    let walletData = mockWallets.get(address);
    
    if (!walletData) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const transactions = walletData.transactions;
    
    // Perform behavior analysis
    const analysis = {
      transactionCount: transactions.length,
      totalVolume: calculateTotalVolume(transactions),
      activityLevel: calculateActivityLevel(transactions),
      spendingPatterns: analyzeSpendingPatterns(transactions),
      tokenPreferences: analyzeTokenPreferences(transactions),
      riskScore: calculateRiskScore(transactions),
      behaviorType: classifyBehavior(transactions),
      unusualActivity: detectUnusualActivity(transactions),
      lastActivity: getLastActivity(transactions),
      trends: analyzeTrends(transactions)
    };

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Error analyzing wallet behavior:', error);
    res.status(500).json({ error: 'Failed to analyze wallet behavior' });
  }
});

// Get wallet token holdings
router.get('/:address/tokens', async (req, res) => {
  try {
    const { address } = req.params;
    
    // Validate address format
    if (!address || !address.startsWith('sei1') || address.length !== 44) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    let walletData = mockWallets.get(address);
    
    if (!walletData) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json({
      success: true,
      data: walletData.tokenHoldings
    });
  } catch (error) {
    console.error('Error getting wallet tokens:', error);
    res.status(500).json({ error: 'Failed to get wallet tokens' });
  }
});

// Get wallet statistics
router.get('/:address/stats', async (req, res) => {
  try {
    const { address } = req.params;
    const { timeframe = '30d' } = req.query;
    
    // Validate address format
    if (!address || !address.startsWith('sei1') || address.length !== 44) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    let walletData = mockWallets.get(address);
    
    if (!walletData) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const transactions = walletData.transactions;
    const now = Date.now();
    let filteredTransactions = transactions;

    // Filter by timeframe
    switch (timeframe) {
      case '1d':
        filteredTransactions = transactions.filter(tx => now - tx.timestamp < 24 * 60 * 60 * 1000);
        break;
      case '7d':
        filteredTransactions = transactions.filter(tx => now - tx.timestamp < 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        filteredTransactions = transactions.filter(tx => now - tx.timestamp < 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        filteredTransactions = transactions.filter(tx => now - tx.timestamp < 90 * 24 * 60 * 60 * 1000);
        break;
    }

    const stats = {
      timeframe,
      totalTransactions: filteredTransactions.length,
      totalVolume: calculateTotalVolume(filteredTransactions),
      averageTransactionSize: calculateAverageTransactionSize(filteredTransactions),
      mostActiveDay: findMostActiveDay(filteredTransactions),
      topTokens: findTopTokens(filteredTransactions),
      transactionTypes: countTransactionTypes(filteredTransactions)
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting wallet stats:', error);
    res.status(500).json({ error: 'Failed to get wallet statistics' });
  }
});

// Helper functions
function calculateTotalVolume(transactions) {
  return transactions.reduce((total, tx) => total + parseFloat(tx.amount || 0), 0);
}

function calculateActivityLevel(transactions) {
  const recentTransactions = transactions.filter(tx => {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return tx.timestamp > oneWeekAgo;
  });

  if (recentTransactions.length === 0) return 'inactive';
  if (recentTransactions.length < 5) return 'low';
  if (recentTransactions.length < 20) return 'medium';
  return 'high';
}

function analyzeSpendingPatterns(transactions) {
  const patterns = {
    averageTransactionSize: 0,
    largestTransaction: 0,
    smallestTransaction: 0
  };

  if (transactions.length > 0) {
    const amounts = transactions.map(tx => parseFloat(tx.amount || 0)).filter(amt => amt > 0);
    
    if (amounts.length > 0) {
      patterns.averageTransactionSize = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
      patterns.largestTransaction = Math.max(...amounts);
      patterns.smallestTransaction = Math.min(...amounts);
    }
  }

  return patterns;
}

function analyzeTokenPreferences(transactions) {
  const tokenCounts = {};
  
  transactions.forEach(tx => {
    const denom = tx.denom || 'unknown';
    tokenCounts[denom] = (tokenCounts[denom] || 0) + 1;
  });

  return Object.entries(tokenCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([denom, count]) => ({ denom, count }));
}

function calculateRiskScore(transactions) {
  let riskScore = 0;
  
  if (transactions.length > 100) riskScore += 20;
  if (transactions.length < 5) riskScore += 15;
  
  const largeTransactions = transactions.filter(tx => 
    parseFloat(tx.amount || 0) > 1000000
  );
  if (largeTransactions.length > 10) riskScore += 25;
  
  return Math.min(100, Math.max(0, riskScore));
}

function classifyBehavior(transactions) {
  if (transactions.length === 0) return 'inactive';
  
  const recentCount = transactions.filter(tx => {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    return tx.timestamp > oneDayAgo;
  }).length;

  if (recentCount > 50) return 'trader';
  if (recentCount > 20) return 'active_user';
  if (recentCount > 5) return 'regular_user';
  if (recentCount > 0) return 'occasional_user';
  return 'inactive';
}

function detectUnusualActivity(transactions) {
  const unusual = [];
  
  if (transactions.length > 10) {
    const recentTxs = transactions.slice(0, 10);
    const timeSpan = recentTxs[0].timestamp - recentTxs[recentTxs.length - 1].timestamp;
    
    if (timeSpan < 60000) {
      unusual.push('rapid_transactions');
    }
  }

  const amounts = transactions.map(tx => parseFloat(tx.amount || 0));
  if (amounts.length > 5) {
    const avg = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
    const largeVariations = amounts.filter(amt => amt > avg * 10);
    if (largeVariations.length > 0) {
      unusual.push('large_amount_variations');
    }
  }

  return unusual;
}

function getLastActivity(transactions) {
  if (transactions.length === 0) return null;
  
  const latestTx = transactions[0];
  return {
    timestamp: latestTx.timestamp,
    type: latestTx.type,
    amount: latestTx.amount
  };
}

function analyzeTrends(transactions) {
  if (transactions.length < 10) return { trend: 'insufficient_data' };
  
  const recentWeek = transactions.filter(tx => {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return tx.timestamp > oneWeekAgo;
  }).length;
  
  const previousWeek = transactions.filter(tx => {
    const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return tx.timestamp > twoWeeksAgo && tx.timestamp <= oneWeekAgo;
  }).length;
  
  if (recentWeek > previousWeek * 1.5) return { trend: 'increasing', change: 'up' };
  if (recentWeek < previousWeek * 0.7) return { trend: 'decreasing', change: 'down' };
  return { trend: 'stable', change: 'stable' };
}

function calculateAverageTransactionSize(transactions) {
  if (transactions.length === 0) return 0;
  const amounts = transactions.map(tx => parseFloat(tx.amount || 0)).filter(amt => amt > 0);
  return amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
}

function findMostActiveDay(transactions) {
  if (transactions.length === 0) return null;
  
  const dayCounts = {};
  transactions.forEach(tx => {
    const day = new Date(tx.timestamp).toDateString();
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  });
  
  const mostActiveDay = Object.entries(dayCounts)
    .sort(([,a], [,b]) => b - a)[0];
  
  return {
    date: mostActiveDay[0],
    transactionCount: mostActiveDay[1]
  };
}

function findTopTokens(transactions) {
  const tokenCounts = {};
  transactions.forEach(tx => {
    const denom = tx.denom || 'unknown';
    tokenCounts[denom] = (tokenCounts[denom] || 0) + 1;
  });
  
  return Object.entries(tokenCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([denom, count]) => ({ denom, count }));
}

function countTransactionTypes(transactions) {
  const typeCounts = {};
  transactions.forEach(tx => {
    const type = tx.type || 'unknown';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });
  
  return typeCounts;
}

module.exports = router;
