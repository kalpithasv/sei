const EventEmitter = require('events');

class NFTTracker extends EventEmitter {
  constructor(seiClient, io) {
    super();
    this.seiClient = seiClient;
    this.io = io;
    this.trackedNFTs = new Map(); // tokenId -> { sockets, data, movements, performance }
    this.movementHistory = new Map(); // tokenId -> movement history
    this.performanceData = new Map(); // tokenId -> performance metrics
    this.ownershipCache = new Map(); // tokenId -> ownership data
    this.cacheExpiry = 10 * 60 * 1000; // 10 minutes
    
    // Subscribe to new transactions
    this.seiClient.on('newTransaction', (txData) => {
      this.processNewTransaction(txData);
    });
  }

  async initialize() {
    console.log('🖼️ Initializing NFT Tracker...');
    
    // Load any previously tracked NFTs from storage
    // In a real app, you'd load from database
    this.isActive = true;
    
    console.log('✅ NFT Tracker initialized');
  }

  async startTracking(tokenId, socketId, options = {}) {
    try {
      console.log(`🖼️ Starting to track NFT: ${tokenId}`);
      
      // Validate token ID format
      if (!this.isValidTokenId(tokenId)) {
        throw new Error('Invalid NFT token ID format');
      }

      // Get initial NFT data
      const nftData = await this.getNFTData(tokenId);
      
      // Initialize tracking for this NFT
      if (!this.trackedNFTs.has(tokenId)) {
        this.trackedNFTs.set(tokenId, {
          sockets: new Set(),
          data: nftData,
          movements: [],
          performance: null,
          lastUpdate: Date.now(),
          options: options
        });

        // Initialize movement history
        this.movementHistory.set(tokenId, []);
        
        // Initialize performance data
        this.performanceData.set(tokenId, {});
      }

      // Add socket to tracking
      const nftInfo = this.trackedNFTs.get(tokenId);
      nftInfo.sockets.add(socketId);

      // Get initial movement data and performance analysis
      const movements = await this.getMovementHistory(tokenId);
      const performance = await this.analyzePerformance(tokenId);
      
      nftInfo.movements = movements;
      nftInfo.performance = performance;

      // Send initial data to the socket
      this.io.to(socketId).emit('nft_data', {
        tokenId,
        data: nftData,
        movements: movements,
        performance: performance
      });

      console.log(`✅ NFT ${tokenId} tracking started for socket ${socketId}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to start tracking NFT ${tokenId}:`, error.message);
      throw error;
    }
  }

  stopTracking(tokenId, socketId) {
    try {
      if (this.trackedNFTs.has(tokenId)) {
        const nftInfo = this.trackedNFTs.get(tokenId);
        nftInfo.sockets.delete(socketId);

        // If no more sockets are tracking this NFT, remove it
        if (nftInfo.sockets.size === 0) {
          this.trackedNFTs.delete(tokenId);
          this.movementHistory.delete(tokenId);
          this.performanceData.delete(tokenId);
          console.log(`🛑 Stopped tracking NFT: ${tokenId}`);
        } else {
          console.log(`🔄 Socket ${socketId} stopped tracking NFT: ${tokenId}`);
        }
      }
    } catch (error) {
      console.error(`Error stopping NFT tracking:`, error);
    }
  }

  removeSocket(socketId) {
    // Remove socket from all tracked NFTs
    for (const [tokenId, nftInfo] of this.trackedNFTs.entries()) {
      if (nftInfo.sockets.has(socketId)) {
        this.stopTracking(tokenId, socketId);
      }
    }
  }

  async getNFTData(tokenId) {
    try {
      // Get NFT metadata
      const metadata = await this.seiClient.getNFTInfo(tokenId);
      
      // Get current ownership
      const ownership = await this.getCurrentOwnership(tokenId);
      
      // Get current market data
      const marketData = await this.getMarketData(tokenId);
      
      return {
        tokenId,
        name: metadata?.name || `NFT #${tokenId}`,
        description: metadata?.description || 'No description available',
        image: metadata?.image || null,
        attributes: metadata?.attributes || [],
        collection: metadata?.collection || 'Unknown Collection',
        owner: ownership.currentOwner,
        previousOwners: ownership.previousOwners || [],
        mintDate: ownership.mintDate,
        lastTransfer: ownership.lastTransfer,
        currentPrice: marketData.currentPrice,
        floorPrice: marketData.floorPrice,
        lastSalePrice: marketData.lastSalePrice,
        lastUpdated: Date.now()
      };
    } catch (error) {
      console.error(`Error getting NFT data for ${tokenId}:`, error);
      throw error;
    }
  }

  async getCurrentOwnership(tokenId) {
    try {
      // Check cache first
      const cached = this.ownershipCache.get(tokenId);
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }

      // Get ownership from blockchain
      const ownership = await this.seiClient.getNFTOwnership(tokenId);
      
      // Cache the ownership data
      this.ownershipCache.set(tokenId, {
        data: ownership,
        timestamp: Date.now()
      });

      return ownership;
    } catch (error) {
      console.error(`Error getting ownership for NFT ${tokenId}:`, error);
      // Return mock data for demonstration
      return {
        currentOwner: `sei1owner${Math.random().toString(36).substr(2, 9)}`,
        previousOwners: [],
        mintDate: Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000, // Random date in last year
        lastTransfer: null
      };
    }
  }

  async getMarketData(tokenId) {
    try {
      // Mock market data - in reality you'd fetch from NFT marketplaces
      return {
        currentPrice: Math.random() * 1000 + 100,      // 100 to 1100
        floorPrice: Math.random() * 500 + 50,          // 50 to 550
        lastSalePrice: Math.random() * 800 + 100,      // 100 to 900
        offers: Math.floor(Math.random() * 5),         // 0 to 4 offers
        views: Math.floor(Math.random() * 1000) + 100  // 100 to 1100 views
      };
    } catch (error) {
      console.error(`Error getting market data for NFT ${tokenId}:`, error);
      return { currentPrice: 0, floorPrice: 0, lastSalePrice: 0, offers: 0, views: 0 };
    }
  }

  async getMovementHistory(tokenId) {
    try {
      // Get movement history for the NFT
      const movements = this.movementHistory.get(tokenId) || [];
      
      // If we don't have enough data, generate some mock data
      if (movements.length < 10) {
        const mockMovements = this.generateMockMovementData(tokenId);
        this.movementHistory.set(tokenId, mockMovements);
        return mockMovements;
      }

      return movements.slice(-50); // Last 50 movements
    } catch (error) {
      console.error(`Error getting movement history for NFT ${tokenId}:`, error);
      return [];
    }
  }

  generateMockMovementData(tokenId) {
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

  async analyzePerformance(tokenId) {
    try {
      const movements = this.movementHistory.get(tokenId) || [];
      
      if (movements.length === 0) {
        return this.getDefaultPerformance();
      }

      // Calculate performance metrics
      const performance = {
        totalTransfers: movements.filter(m => m.type === 'transfer').length,
        totalVolume: this.calculateTotalVolume(movements),
        averagePrice: this.calculateAveragePrice(movements),
        priceChange: this.calculatePriceChange(movements),
        holdingPeriods: this.calculateHoldingPeriods(movements),
        rarity: this.calculateRarity(movements),
        marketActivity: this.calculateMarketActivity(movements),
        performanceScore: this.calculatePerformanceScore(movements)
      };

      // Cache the performance data
      this.performanceData.set(tokenId, {
        data: performance,
        timestamp: Date.now()
      });

      return performance;
    } catch (error) {
      console.error(`Error analyzing performance for NFT ${tokenId}:`, error);
      return this.getDefaultPerformance();
    }
  }

  calculateTotalVolume(movements) {
    try {
      return movements
        .filter(m => m.type === 'transfer' && m.price > 0)
        .reduce((total, m) => total + m.price, 0);
    } catch (error) {
      return 0;
    }
  }

  calculateAveragePrice(movements) {
    try {
      const transfers = movements.filter(m => m.type === 'transfer' && m.price > 0);
      if (transfers.length === 0) return 0;
      
      return transfers.reduce((sum, m) => sum + m.price, 0) / transfers.length;
    } catch (error) {
      return 0;
    }
  }

  calculatePriceChange(movements) {
    try {
      const transfers = movements.filter(m => m.type === 'transfer' && m.price > 0);
      if (transfers.length < 2) return { change: 0, percentage: 0 };
      
      const firstPrice = transfers[0].price;
      const lastPrice = transfers[transfers.length - 1].price;
      const change = lastPrice - firstPrice;
      const percentage = (change / firstPrice) * 100;
      
      return { change, percentage };
    } catch (error) {
      return { change: 0, percentage: 0 };
    }
  }

  calculateHoldingPeriods(movements) {
    try {
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
    } catch (error) {
      return { average: 0, shortest: 0, longest: 0 };
    }
  }

  calculateRarity(movements) {
    try {
      // Simple rarity calculation based on transfer frequency
      const transferCount = movements.filter(m => m.type === 'transfer').length;
      const timeSpan = movements.length > 1 ? 
        movements[movements.length - 1].timestamp - movements[0].timestamp : 0;
      
      let rarity = 'common';
      if (transferCount <= 2 && timeSpan > 180 * 24 * 60 * 60 * 1000) rarity = 'rare';
      if (transferCount <= 1 && timeSpan > 365 * 24 * 60 * 60 * 1000) rarity = 'legendary';
      
      return rarity;
    } catch (error) {
      return 'unknown';
    }
  }

  calculateMarketActivity(movements) {
    try {
      const recentMovements = movements.filter(m => {
        const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        return m.timestamp > oneMonthAgo;
      });
      
      if (recentMovements.length === 0) return 'inactive';
      if (recentMovements.length < 3) return 'low';
      if (recentMovements.length < 8) return 'medium';
      return 'high';
    } catch (error) {
      return 'unknown';
    }
  }

  calculatePerformanceScore(movements) {
    try {
      let score = 50; // Base score
      
      // Factors that increase score
      const transfers = movements.filter(m => m.type === 'transfer');
      if (transfers.length > 5) score += 15; // High transfer count
      if (transfers.length > 10) score += 10; // Very high transfer count
      
      // Price appreciation
      const priceChange = this.calculatePriceChange(movements);
      if (priceChange.percentage > 100) score += 20; // 100%+ appreciation
      if (priceChange.percentage > 50) score += 15;  // 50%+ appreciation
      if (priceChange.percentage > 0) score += 10;   // Any appreciation
      
      // Recent activity
      const recentActivity = movements.filter(m => {
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        return m.timestamp > oneWeekAgo;
      }).length;
      
      if (recentActivity > 0) score += 5; // Recent activity bonus
      
      return Math.min(100, Math.max(0, score));
    } catch (error) {
      return 50;
    }
  }

  getDefaultPerformance() {
    return {
      totalTransfers: 0,
      totalVolume: 0,
      averagePrice: 0,
      priceChange: { change: 0, percentage: 0 },
      holdingPeriods: { average: 0, shortest: 0, longest: 0 },
      rarity: 'unknown',
      marketActivity: 'inactive',
      performanceScore: 50
    };
  }

  async processNewTransaction(txData) {
    try {
      const { hash, decodedTx, blockHeight } = txData;
      
      // Check if this transaction involves any tracked NFTs
      const involvedNFTs = this.extractNFTsFromTransaction(decodedTx);
      
      for (const nft of involvedNFTs) {
        if (this.trackedNFTs.has(nft.tokenId)) {
          await this.updateNFTData(nft.tokenId, txData, nft);
        }
      }
    } catch (error) {
      console.error('Error processing new transaction for NFTs:', error);
    }
  }

  extractNFTsFromTransaction(tx) {
    try {
      const nfts = [];
      
      // Extract NFT information from transaction data
      // This is a simplified version - in reality you'd parse the actual transaction structure
      if (tx.data && tx.data.tokenId) {
        nfts.push({
          tokenId: tx.data.tokenId,
          type: tx.data.type || 'transfer',
          from: tx.data.from,
          to: tx.data.to,
          price: tx.data.price || 0
        });
      }
      
      return nfts;
    } catch (error) {
      return [];
    }
  }

  async updateNFTData(tokenId, txData, nftInfo) {
    try {
      const nftTracker = this.trackedNFTs.get(tokenId);
      if (!nftTracker) return;

      // Update NFT data
      const updatedData = await this.getNFTData(tokenId);
      nftTracker.data = updatedData;
      nftTracker.lastUpdate = Date.now();

      // Add new movement
      const newMovement = {
        type: nftInfo.type,
        timestamp: Date.now(),
        from: nftInfo.from,
        to: nftInfo.to,
        price: nftInfo.price,
        transactionHash: txData.hash,
        blockHeight: txData.blockHeight
      };

      const movements = this.movementHistory.get(tokenId) || [];
      movements.push(newMovement);
      
      // Keep only last 1000 movements
      if (movements.length > 1000) {
        movements.splice(0, movements.length - 1000);
      }
      
      this.movementHistory.set(tokenId, movements);
      nftTracker.movements = movements.slice(-50); // Last 50 for real-time updates

      // Re-analyze performance
      const updatedPerformance = await this.analyzePerformance(tokenId);
      nftTracker.performance = updatedPerformance;

      // Notify all sockets tracking this NFT
      const notification = {
        tokenId,
        newTransaction: txData,
        newMovement: newMovement,
        updatedData: updatedData,
        updatedMovements: nftTracker.movements,
        updatedPerformance: updatedPerformance,
        timestamp: Date.now()
      };

      nftTracker.sockets.forEach(socketId => {
        this.io.to(socketId).emit('nft_update', notification);
      });

      console.log(`📊 Updated NFT data for ${tokenId}`);
    } catch (error) {
      console.error(`Error updating NFT data for ${tokenId}:`, error);
    }
  }

  isValidTokenId(tokenId) {
    // Basic token ID validation
    return tokenId && tokenId.length > 0 && tokenId.length <= 100;
  }

  isActive() {
    return this.isActive && this.trackedNFTs.size > 0;
  }

  getTrackingStats() {
    return {
      activeNFTs: this.trackedNFTs.size,
      totalSockets: Array.from(this.trackedNFTs.values())
        .reduce((total, nft) => total + nft.sockets.size, 0),
      isActive: this.isActive
    };
  }

  // Additional analytics methods
  async getMovementAnalytics(tokenId, timeframe = 'all') {
    try {
      const movements = this.movementHistory.get(tokenId) || [];
      if (movements.length === 0) return null;

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

      if (filteredMovements.length === 0) return null;

      const transfers = filteredMovements.filter(m => m.type === 'transfer');
      const totalVolume = transfers.reduce((sum, m) => sum + (m.price || 0), 0);
      const uniqueOwners = new Set(transfers.flatMap(m => [m.from, m.to]).filter(Boolean)).size;

      return {
        timeframe,
        totalMovements: filteredMovements.length,
        totalTransfers: transfers.length,
        totalVolume,
        averagePrice: totalVolume / (transfers.length || 1),
        uniqueOwners,
        dataPoints: filteredMovements.length
      };
    } catch (error) {
      console.error(`Error getting movement analytics for NFT ${tokenId}:`, error);
      return null;
    }
  }

  async getOwnershipAnalytics(tokenId) {
    try {
      const movements = this.movementHistory.get(tokenId) || [];
      if (movements.length === 0) return null;

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
      const averageOwnershipDuration = this.calculateAverageOwnershipDuration(ownershipHistory);

      return {
        totalOwners: uniqueOwners.length,
        ownershipHistory: ownershipHistory.slice(-10), // Last 10 ownership changes
        averageOwnershipDuration,
        currentOwner: currentOwner
      };
    } catch (error) {
      console.error(`Error getting ownership analytics for NFT ${tokenId}:`, error);
      return null;
    }
  }

  calculateAverageOwnershipDuration(ownershipHistory) {
    try {
      if (ownershipHistory.length < 2) return 0;
      
      const durations = [];
      for (let i = 1; i < ownershipHistory.length; i++) {
        const duration = ownershipHistory[i].timestamp - ownershipHistory[i-1].timestamp;
        durations.push(duration);
      }
      
      return durations.reduce((sum, d) => sum + d, 0) / durations.length;
    } catch (error) {
      return 0;
    }
  }
}

module.exports = NFTTracker;
