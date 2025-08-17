const express = require('express');
const router = express.Router();

// Mock NFT data for demonstration
const mockNFTs = new Map();

// Initialize with some mock data
function initializeMockData() {
  const mockTokenIds = ['nft001', 'nft002', 'nft003', 'nft004', 'nft005'];
  
  mockTokenIds.forEach((tokenId, index) => {
    mockNFTs.set(tokenId, {
      tokenId,
      name: `NFT #${tokenId}`,
      description: `This is a unique NFT with ID ${tokenId}`,
      image: `https://example.com/nft/${tokenId}.png`,
      attributes: generateMockAttributes(),
      collection: `Collection ${Math.floor(index / 2) + 1}`,
      owner: `sei1owner${Math.random().toString(36).substr(2, 9)}`,
      previousOwners: [],
      mintDate: Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000,
      lastTransfer: null,
      currentPrice: (Math.random() * 1000 + 100).toFixed(2),
      floorPrice: (Math.random() * 500 + 50).toFixed(2),
      lastSalePrice: (Math.random() * 800 + 100).toFixed(2),
      lastUpdated: Date.now()
    });
  });
}

function generateMockAttributes() {
  const attributeTypes = ['Background', 'Body', 'Eyes', 'Mouth', 'Accessory'];
  const attributes = [];
  
  attributeTypes.forEach(type => {
    if (Math.random() > 0.3) { // 70% chance to have each attribute
      attributes.push({
        trait_type: type,
        value: `${type}_${Math.floor(Math.random() * 5) + 1}`,
        rarity: Math.random() > 0.8 ? 'rare' : 'common'
      });
    }
  });
  
  return attributes;
}

function generateMockMovementData(tokenId) {
  const movements = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  
  // Generate mock mint event
  const mintDate = now - Math.random() * 365 * dayMs; // Random date in last year
  movements.push({
    type: 'mint',
    timestamp: mintDate,
    from: null,
    to: `sei1creator${Math.random().toString(36).substr(2, 9)}`,
    price: 0,
    transactionHash: `mint_${tokenId}_${mintDate}`,
    blockHeight: Math.floor(Math.random() * 1000000)
  });

  // Generate mock transfers
  const transferCount = Math.floor(Math.random() * 8) + 2; // 2-9 transfers
  let currentOwner = movements[0].to;
  
  for (let i = 1; i <= transferCount; i++) {
    const transferDate = mintDate + (i * Math.random() * 30 * dayMs); // Random intervals
    const newOwner = `sei1owner${i}${Math.random().toString(36).substr(2, 9)}`;
    const price = Math.random() * 1000 + 50; // Random price
    
    movements.push({
      type: 'transfer',
      timestamp: transferDate,
      from: currentOwner,
      to: newOwner,
      price: price,
      transactionHash: `transfer_${tokenId}_${transferDate}`,
      blockHeight: Math.floor(Math.random() * 1000000)
    });
    
    currentOwner = newOwner;
  }

  // Sort by timestamp
  return movements.sort((a, b) => a.timestamp - b.timestamp);
}

// Initialize mock data
initializeMockData();

// Get NFT information
router.get('/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    
    // Validate token ID format
    if (!tokenId || tokenId.length === 0 || tokenId.length > 100) {
      return res.status(400).json({ error: 'Invalid NFT token ID format' });
    }

    // Check if we have mock data for this NFT
    let nftData = mockNFTs.get(tokenId);
    
    if (!nftData) {
      // Generate new mock data for this NFT
      nftData = {
        tokenId,
        name: `NFT #${tokenId}`,
        description: `This is a unique NFT with ID ${tokenId}`,
        image: `https://example.com/nft/${tokenId}.png`,
        attributes: generateMockAttributes(),
        collection: `Collection ${Math.floor(Math.random() * 5) + 1}`,
        owner: `sei1owner${Math.random().toString(36).substr(2, 9)}`,
        previousOwners: [],
        mintDate: Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000,
        lastTransfer: null,
        currentPrice: (Math.random() * 1000 + 100).toFixed(2),
        floorPrice: (Math.random() * 500 + 50).toFixed(2),
        lastSalePrice: (Math.random() * 800 + 100).toFixed(2),
        lastUpdated: Date.now()
      };
      
      mockNFTs.set(tokenId, nftData);
    }

    res.json({
      success: true,
      data: nftData
    });
  } catch (error) {
    console.error('Error getting NFT info:', error);
    res.status(500).json({ error: 'Failed to get NFT information' });
  }
});

// Get NFT movement history
router.get('/:tokenId/movement', async (req, res) => {
  try {
    const { tokenId } = req.params;
    const { limit = 50, offset = 0, type } = req.query;
    
    // Validate token ID format
    if (!tokenId || tokenId.length === 0 || tokenId.length > 100) {
      return res.status(400).json({ error: 'Invalid NFT token ID format' });
    }

    // Generate movement data
    const movements = generateMockMovementData(tokenId);
    
    // Apply filters
    let filteredMovements = movements;
    if (type) {
      filteredMovements = movements.filter(m => m.type === type);
    }

    // Apply pagination
    const total = filteredMovements.length;
    const paginatedMovements = filteredMovements.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      success: true,
      data: {
        tokenId,
        movements: paginatedMovements,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < total
        }
      }
    });
  } catch (error) {
    console.error('Error getting NFT movement history:', error);
    res.status(500).json({ error: 'Failed to get NFT movement history' });
  }
});

// Get NFT performance metrics
router.get('/:tokenId/performance', async (req, res) => {
  try {
    const { tokenId } = req.params;
    
    // Validate token ID format
    if (!tokenId || tokenId.length === 0 || tokenId.length > 100) {
      return res.status(400).json({ error: 'Invalid NFT token ID format' });
    }

    const movements = generateMockMovementData(tokenId);
    
    // Calculate performance metrics
    const performance = {
      totalTransfers: movements.filter(m => m.type === 'transfer').length,
      totalVolume: calculateTotalVolume(movements),
      averagePrice: calculateAveragePrice(movements),
      priceChange: calculatePriceChange(movements),
      holdingPeriods: calculateHoldingPeriods(movements),
      rarity: calculateRarity(movements),
      marketActivity: calculateMarketActivity(movements),
      performanceScore: calculatePerformanceScore(movements)
    };

    res.json({
      success: true,
      data: {
        tokenId,
        performance
      }
    });
  } catch (error) {
    console.error('Error getting NFT performance:', error);
    res.status(500).json({ error: 'Failed to get NFT performance' });
  }
});

// Get NFT ownership history
router.get('/:tokenId/ownership', async (req, res) => {
  try {
    const { tokenId } = req.params;
    
    // Validate token ID format
    if (!tokenId || tokenId.length === 0 || tokenId.length > 100) {
      return res.status(400).json({ error: 'Invalid NFT token ID format' });
    }

    const movements = generateMockMovementData(tokenId);
    
    // Build ownership history
    const ownershipHistory = [];
    let currentOwner = null;

    for (const movement of movements) {
      if (movement.type === 'mint') {
        currentOwner = movement.to;
      } else if (movement.type === 'transfer') {
        ownershipHistory.push({
          owner: currentOwner,
          from: movement.from,
          to: movement.to,
          timestamp: movement.timestamp,
          price: movement.price
        });
        currentOwner = movement.to;
      }
    }

    const uniqueOwners = [...new Set(ownershipHistory.map(o => o.owner))];
    const averageOwnershipDuration = calculateAverageOwnershipDuration(ownershipHistory);

    res.json({
      success: true,
      data: {
        tokenId,
        ownershipHistory: ownershipHistory.slice(-10), // Last 10 ownership changes
        statistics: {
          totalOwners: uniqueOwners.length,
          averageOwnershipDuration,
          currentOwner: currentOwner
        }
      }
    });
  } catch (error) {
    console.error('Error getting NFT ownership history:', error);
    res.status(500).json({ error: 'Failed to get NFT ownership history' });
  }
});

// Get NFT market data
router.get('/:tokenId/market', async (req, res) => {
  try {
    const { tokenId } = req.params;
    
    // Validate token ID format
    if (!tokenId || tokenId.length === 0 || tokenId.length > 100) {
      return res.status(400).json({ error: 'Invalid NFT token ID format' });
    }

    let nftData = mockNFTs.get(tokenId);
    
    if (!nftData) {
      return res.status(404).json({ error: 'NFT not found' });
    }

    // Generate additional market data
    const marketData = {
      ...nftData,
      offers: Math.floor(Math.random() * 5), // 0 to 4 offers
      views: Math.floor(Math.random() * 1000) + 100, // 100 to 1100 views
      likes: Math.floor(Math.random() * 100) + 10, // 10 to 110 likes
      rarityScore: calculateRarityScore(nftData.attributes),
      marketTrend: Math.random() > 0.5 ? 'up' : 'down',
      liquidityScore: Math.random() * 100 + 50 // 50 to 150
    };

    res.json({
      success: true,
      data: marketData
    });
  } catch (error) {
    console.error('Error getting NFT market data:', error);
    res.status(500).json({ error: 'Failed to get NFT market data' });
  }
});

// Get NFT analytics
router.get('/:tokenId/analytics', async (req, res) => {
  try {
    const { tokenId } = req.params;
    const { timeframe = 'all' } = req.query;
    
    // Validate token ID format
    if (!tokenId || tokenId.length === 0 || tokenId.length > 100) {
      return res.status(400).json({ error: 'Invalid NFT token ID format' });
    }

    const movements = generateMockMovementData(tokenId);
    const now = Date.now();
    let filteredMovements = movements;

    // Filter by timeframe
    switch (timeframe) {
      case '1d':
        filteredMovements = movements.filter(m => now - m.timestamp < 24 * 60 * 60 * 1000);
        break;
      case '7d':
        filteredMovements = movements.filter(m => now - m.timestamp < 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        filteredMovements = movements.filter(m => now - m.timestamp < 30 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        filteredMovements = movements.filter(m => now - m.timestamp < 365 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        filteredMovements = movements;
        break;
    }

    const analytics = {
      tokenId,
      timeframe,
      movementAnalytics: {
        totalMovements: filteredMovements.length,
        totalTransfers: filteredMovements.filter(m => m.type === 'transfer').length,
        totalVolume: calculateTotalVolume(filteredMovements),
        averagePrice: calculateAveragePrice(filteredMovements),
        uniqueOwners: new Set(filteredMovements.flatMap(m => [m.from, m.to]).filter(Boolean)).size
      },
      performanceAnalytics: {
        priceChange: calculatePriceChange(filteredMovements),
        holdingPeriods: calculateHoldingPeriods(filteredMovements),
        rarity: calculateRarity(filteredMovements),
        marketActivity: calculateMarketActivity(filteredMovements),
        performanceScore: calculatePerformanceScore(filteredMovements)
      }
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error getting NFT analytics:', error);
    res.status(500).json({ error: 'Failed to get NFT analytics' });
  }
});

// Get NFT collection data
router.get('/collection/:collectionName', async (req, res) => {
  try {
    const { collectionName } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    // Find NFTs in the collection
    const collectionNFTs = Array.from(mockNFTs.values())
      .filter(nft => nft.collection.toLowerCase().includes(collectionName.toLowerCase()));
    
    // Apply pagination
    const total = collectionNFTs.length;
    const paginatedNFTs = collectionNFTs.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    // Calculate collection statistics
    const totalVolume = collectionNFTs.reduce((sum, nft) => sum + parseFloat(nft.lastSalePrice || 0), 0);
    const averagePrice = totalVolume / collectionNFTs.length;
    const floorPrice = Math.min(...collectionNFTs.map(nft => parseFloat(nft.floorPrice || 0)));

    res.json({
      success: true,
      data: {
        collectionName,
        nfts: paginatedNFTs,
        statistics: {
          totalNFTs: total,
          totalVolume,
          averagePrice,
          floorPrice,
          uniqueOwners: new Set(collectionNFTs.map(nft => nft.owner)).size
        },
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < total
        }
      }
    });
  } catch (error) {
    console.error('Error getting NFT collection:', error);
    res.status(500).json({ error: 'Failed to get NFT collection' });
  }
});

// Helper functions
function calculateTotalVolume(movements) {
  return movements
    .filter(m => m.type === 'transfer' && m.price > 0)
    .reduce((total, m) => total + m.price, 0);
}

function calculateAveragePrice(movements) {
  const transfers = movements.filter(m => m.type === 'transfer' && m.price > 0);
  if (transfers.length === 0) return 0;
  
  return transfers.reduce((sum, m) => sum + m.price, 0) / transfers.length;
}

function calculatePriceChange(movements) {
  const transfers = movements.filter(m => m.type === 'transfer' && m.price > 0);
  if (transfers.length < 2) return { change: 0, percentage: 0 };
  
  const firstPrice = transfers[0].price;
  const lastPrice = transfers[transfers.length - 1].price;
  const change = lastPrice - firstPrice;
  const percentage = (change / firstPrice) * 100;
  
  return { change, percentage };
}

function calculateHoldingPeriods(movements) {
  const transfers = movements.filter(m => m.type === 'transfer');
  if (transfers.length < 2) return { average: 0, shortest: 0, longest: 0 };
  
  const periods = [];
  for (let i = 1; i < transfers.length; i++) {
    const period = transfers[i].timestamp - transfers[i-1].timestamp;
    periods.push(period);
  }
  
  const average = periods.reduce((sum, p) => sum + p, 0) / periods.length;
  const shortest = Math.min(...periods);
  const longest = Math.max(...periods);
  
  return { average, shortest, longest };
}

function calculateRarity(movements) {
  const transferCount = movements.filter(m => m.type === 'transfer').length;
  const timeSpan = movements.length > 1 ? 
    movements[movements.length - 1].timestamp - movements[0].timestamp : 0;
  
  let rarity = 'common';
  if (transferCount <= 2 && timeSpan > 180 * 24 * 60 * 60 * 1000) rarity = 'rare';
  if (transferCount <= 1 && timeSpan > 365 * 24 * 60 * 60 * 1000) rarity = 'legendary';
  
  return rarity;
}

function calculateMarketActivity(movements) {
  const recentMovements = movements.filter(m => {
    const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    return m.timestamp > oneMonthAgo;
  });
  
  if (recentMovements.length === 0) return 'inactive';
  if (recentMovements.length < 3) return 'low';
  if (recentMovements.length < 8) return 'medium';
  return 'high';
}

function calculatePerformanceScore(movements) {
  let score = 50; // Base score
  
  const transfers = movements.filter(m => m.type === 'transfer');
  if (transfers.length > 5) score += 15;
  if (transfers.length > 10) score += 10;
  
  const priceChange = calculatePriceChange(movements);
  if (priceChange.percentage > 100) score += 20;
  if (priceChange.percentage > 50) score += 15;
  if (priceChange.percentage > 0) score += 10;
  
  const recentActivity = movements.filter(m => {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return m.timestamp > oneWeekAgo;
  }).length;
  
  if (recentActivity > 0) score += 5;
  
  return Math.min(100, Math.max(0, score));
}

function calculateAverageOwnershipDuration(ownershipHistory) {
  if (ownershipHistory.length < 2) return 0;
  
  const durations = [];
  for (let i = 1; i < ownershipHistory.length; i++) {
    const duration = ownershipHistory[i].timestamp - ownershipHistory[i-1].timestamp;
    durations.push(duration);
  }
  
  return durations.reduce((sum, d) => sum + d, 0) / durations.length;
}

function calculateRarityScore(attributes) {
  if (!attributes || attributes.length === 0) return 50;
  
  let score = 0;
  attributes.forEach(attr => {
    if (attr.rarity === 'legendary') score += 25;
    else if (attr.rarity === 'rare') score += 15;
    else score += 5;
  });
  
  return Math.min(100, Math.max(0, score));
}

module.exports = router;
