const EventEmitter = require('events');

class MemeCoinTracker extends EventEmitter {
  constructor(seiClient, io) {
    super();
    this.seiClient = seiClient;
    this.io = io;
    this.trackedCoins = new Map(); // symbol -> { sockets, data, flows, whales }
    this.flowHistory = new Map(); // symbol -> flow history
    this.whaleWallets = new Map(); // symbol -> whale wallets
    this.priceCache = new Map(); // symbol -> price data
    this.cacheExpiry = 2 * 60 * 1000; // 2 minutes
    
    // Subscribe to new transactions
    this.seiClient.on('newTransaction', (txData) => {
      this.processNewTransaction(txData);
    });
  }

  async initialize() {
    console.log('🪙 Initializing Meme Coin Tracker...');
    
    // Load any previously tracked coins from storage
    // In a real app, you'd load from database
    this.isActive = true;
    
    console.log('✅ Meme Coin Tracker initialized');
  }

  async startTracking(symbol, socketId, options = {}) {
    try {
      console.log(`🪙 Starting to track meme coin: ${symbol}`);
      
      // Validate symbol format
      if (!this.isValidSymbol(symbol)) {
        throw new Error('Invalid coin symbol format');
      }

      // Get initial coin data
      const coinData = await this.getCoinData(symbol);
      
      // Initialize tracking for this coin
      if (!this.trackedCoins.has(symbol)) {
        this.trackedCoins.set(symbol, {
          sockets: new Set(),
          data: coinData,
          flows: [],
          whales: [],
          lastUpdate: Date.now(),
          options: options
        });

        // Initialize flow history
        this.flowHistory.set(symbol, []);
        
        // Initialize whale wallets
        this.whaleWallets.set(symbol, []);
      }

      // Add socket to tracking
      const coinInfo = this.trackedCoins.get(symbol);
      coinInfo.sockets.add(socketId);

      // Get initial flow data and whale analysis
      const flows = await this.getFlowData(symbol);
      const whales = await this.analyzeWhaleWallets(symbol);
      
      coinInfo.flows = flows;
      coinInfo.whales = whales;

      // Send initial data to the socket
      this.io.to(socketId).emit('memecoin_data', {
        symbol,
        data: coinData,
        flows: flows,
        whales: whales
      });

      console.log(`✅ Meme coin ${symbol} tracking started for socket ${socketId}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to start tracking meme coin ${symbol}:`, error.message);
      throw error;
    }
  }

  stopTracking(symbol, socketId) {
    try {
      if (this.trackedCoins.has(symbol)) {
        const coinInfo = this.trackedCoins.get(symbol);
        coinInfo.sockets.delete(socketId);

        // If no more sockets are tracking this coin, remove it
        if (coinInfo.sockets.size === 0) {
          this.trackedCoins.delete(symbol);
          this.flowHistory.delete(symbol);
          this.whaleWallets.delete(symbol);
          console.log(`🛑 Stopped tracking meme coin: ${symbol}`);
        } else {
          console.log(`🔄 Socket ${socketId} stopped tracking meme coin: ${symbol}`);
        }
      }
    } catch (error) {
      console.error(`Error stopping meme coin tracking:`, error);
    }
  }

  removeSocket(socketId) {
    // Remove socket from all tracked coins
    for (const [symbol, coinInfo] of this.trackedCoins.entries()) {
      if (coinInfo.sockets.has(socketId)) {
        this.stopTracking(symbol, socketId);
      }
    }
  }

  async getCoinData(symbol) {
    try {
      // Get token information
      const tokenInfo = await this.seiClient.getTokenInfo(symbol);
      
      // Get current price (mock data for now)
      const price = await this.getCurrentPrice(symbol);
      
      // Get market cap and volume
      const marketData = await this.getMarketData(symbol);
      
      return {
        symbol,
        name: tokenInfo?.name || symbol,
        denom: tokenInfo?.denom || symbol,
        price: price,
        marketCap: marketData.marketCap,
        volume24h: marketData.volume24h,
        totalSupply: tokenInfo?.totalSupply || '0',
        circulatingSupply: tokenInfo?.circulatingSupply || '0',
        lastUpdated: Date.now()
      };
    } catch (error) {
      console.error(`Error getting coin data for ${symbol}:`, error);
      throw error;
    }
  }

  async getCurrentPrice(symbol) {
    try {
      // Check cache first
      const cached = this.priceCache.get(symbol);
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.price;
      }

      // In a real implementation, you'd fetch from price feeds or DEX
      // For now, we'll generate mock data
      const mockPrice = Math.random() * 0.01 + 0.001; // Random price between 0.001 and 0.011
      
      // Cache the price
      this.priceCache.set(symbol, {
        price: mockPrice,
        timestamp: Date.now()
      });

      return mockPrice;
    } catch (error) {
      console.error(`Error getting current price for ${symbol}:`, error);
      return 0;
    }
  }

  async getMarketData(symbol) {
    try {
      // Mock market data - in reality you'd fetch from exchanges
      return {
        marketCap: Math.random() * 1000000 + 100000, // 100k to 1.1M
        volume24h: Math.random() * 500000 + 50000,   // 50k to 550k
        priceChange24h: (Math.random() - 0.5) * 20, // -10% to +10%
        priceChange7d: (Math.random() - 0.5) * 40   // -20% to +20%
      };
    } catch (error) {
      console.error(`Error getting market data for ${symbol}:`, error);
      return { marketCap: 0, volume24h: 0, priceChange24h: 0, priceChange7d: 0 };
    }
  }

  async getFlowData(symbol) {
    try {
      // Get recent flow data for the coin
      const flows = this.flowHistory.get(symbol) || [];
      
      // If we don't have enough data, generate some mock data
      if (flows.length < 24) {
        const mockFlows = this.generateMockFlowData(symbol);
        this.flowHistory.set(symbol, mockFlows);
        return mockFlows;
      }

      return flows.slice(-24); // Last 24 data points
    } catch (error) {
      console.error(`Error getting flow data for ${symbol}:`, error);
      return [];
    }
  }

  generateMockFlowData(symbol) {
    const flows = [];
    const now = Date.now();
    const hourMs = 60 * 60 * 1000;

    for (let i = 23; i >= 0; i--) {
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

  async analyzeWhaleWallets(symbol) {
    try {
      // Get token holders
      const holders = await this.seiClient.getTokenHolders(symbol);
      
      if (!holders || holders.length === 0) {
        return this.generateMockWhaleData(symbol);
      }

      // Sort by balance and identify whales (top 10%)
      const sortedHolders = holders.sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance));
      const whaleThreshold = Math.ceil(sortedHolders.length * 0.1);
      const whales = sortedHolders.slice(0, whaleThreshold);

      return whales.map(holder => ({
        address: holder.address,
        balance: holder.balance,
        percentage: (parseFloat(holder.balance) / parseFloat(holder.totalSupply)) * 100,
        lastActivity: holder.lastActivity || null
      }));
    } catch (error) {
      console.error(`Error analyzing whale wallets for ${symbol}:`, error);
      return this.generateMockWhaleData(symbol);
    }
  }

  generateMockWhaleData(symbol) {
    // Generate mock whale data for demonstration
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

  async processNewTransaction(txData) {
    try {
      const { hash, decodedTx, blockHeight } = txData;
      
      // Check if this transaction involves any tracked meme coins
      const involvedTokens = this.extractTokensFromTransaction(decodedTx);
      
      for (const token of involvedTokens) {
        if (this.trackedCoins.has(token.symbol)) {
          await this.updateCoinData(token.symbol, txData, token);
        }
      }
    } catch (error) {
      console.error('Error processing new transaction for meme coins:', error);
    }
  }

  extractTokensFromTransaction(tx) {
    try {
      const tokens = [];
      
      // Extract token information from transaction data
      // This is a simplified version - in reality you'd parse the actual transaction structure
      if (tx.data && tx.data.denom) {
        tokens.push({
          symbol: tx.data.denom,
          amount: tx.data.amount || 0,
          from: tx.data.from,
          to: tx.data.to
        });
      }
      
      return tokens;
    } catch (error) {
      return [];
    }
  }

  async updateCoinData(symbol, txData, tokenInfo) {
    try {
      const coinInfo = this.trackedCoins.get(symbol);
      if (!coinInfo) return;

      // Update coin data
      const updatedData = await this.getCoinData(symbol);
      coinInfo.data = updatedData;
      coinInfo.lastUpdate = Date.now();

      // Update flow data
      const newFlow = this.calculateFlow(tokenInfo, txData);
      const flows = this.flowHistory.get(symbol) || [];
      flows.push(newFlow);
      
      // Keep only last 168 data points (1 week of hourly data)
      if (flows.length > 168) {
        flows.splice(0, flows.length - 168);
      }
      
      this.flowHistory.set(symbol, flows);
      coinInfo.flows = flows.slice(-24); // Last 24 for real-time updates

      // Update whale analysis if needed
      if (this.shouldUpdateWhaleAnalysis(symbol)) {
        const updatedWhales = await this.analyzeWhaleWallets(symbol);
        coinInfo.whales = updatedWhales;
        this.whaleWallets.set(symbol, updatedWhales);
      }

      // Notify all sockets tracking this coin
      const notification = {
        symbol,
        newTransaction: txData,
        updatedData: updatedData,
        updatedFlows: coinInfo.flows,
        updatedWhales: coinInfo.whales,
        timestamp: Date.now()
      };

      coinInfo.sockets.forEach(socketId => {
        this.io.to(socketId).emit('memecoin_update', notification);
      });

      console.log(`📊 Updated meme coin data for ${symbol}`);
    } catch (error) {
      console.error(`Error updating meme coin data for ${symbol}:`, error);
    }
  }

  calculateFlow(tokenInfo, txData) {
    try {
      const amount = parseFloat(tokenInfo.amount || 0);
      const timestamp = Date.now();
      
      // Determine if this is inflow or outflow based on transaction type
      // This is simplified - in reality you'd analyze the transaction more carefully
      const isInflow = tokenInfo.to && !tokenInfo.from; // New tokens being minted
      const isOutflow = tokenInfo.from && !tokenInfo.to; // Tokens being burned
      
      let inflow = 0;
      let outflow = 0;
      
      if (isInflow) {
        inflow = amount;
      } else if (isOutflow) {
        outflow = amount;
      } else {
        // Transfer between wallets - split based on direction
        inflow = amount * 0.5;
        outflow = amount * 0.5;
      }

      return {
        timestamp,
        inflow,
        outflow,
        netFlow: inflow - outflow,
        volume: inflow + outflow,
        transactionHash: txData.hash
      };
    } catch (error) {
      console.error('Error calculating flow:', error);
      return {
        timestamp: Date.now(),
        inflow: 0,
        outflow: 0,
        netFlow: 0,
        volume: 0,
        transactionHash: txData.hash
      };
    }
  }

  shouldUpdateWhaleAnalysis(symbol) {
    try {
      const lastUpdate = this.whaleWallets.get(symbol)?.lastUpdate || 0;
      const now = Date.now();
      const updateInterval = 15 * 60 * 1000; // 15 minutes
      
      return (now - lastUpdate) > updateInterval;
    } catch (error) {
      return true; // Update if we can't determine
    }
  }

  isValidSymbol(symbol) {
    // Basic symbol validation
    return symbol && symbol.length >= 2 && symbol.length <= 10 && /^[A-Z0-9]+$/.test(symbol);
  }

  isActive() {
    return this.isActive && this.trackedCoins.size > 0;
  }

  getTrackingStats() {
    return {
      activeCoins: this.trackedCoins.size,
      totalSockets: Array.from(this.trackedCoins.values())
        .reduce((total, coin) => total + coin.sockets.size, 0),
      isActive: this.isActive
    };
  }

  // Additional analytics methods
  async getFlowAnalytics(symbol, timeframe = '24h') {
    try {
      const flows = this.flowHistory.get(symbol) || [];
      if (flows.length === 0) return null;

      const now = Date.now();
      let filteredFlows = flows;

      // Filter by timeframe
      switch (timeframe) {
        case '1h':
          filteredFlows = flows.filter(f => now - f.timestamp < 60 * 60 * 1000);
          break;
        case '24h':
          filteredFlows = flows.filter(f => now - f.timestamp < 24 * 60 * 60 * 1000);
          break;
        case '7d':
          filteredFlows = flows.filter(f => now - f.timestamp < 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          filteredFlows = flows.filter(f => now - f.timestamp < 30 * 24 * 60 * 60 * 1000);
          break;
      }

      if (filteredFlows.length === 0) return null;

      const totalInflow = filteredFlows.reduce((sum, f) => sum + f.inflow, 0);
      const totalOutflow = filteredFlows.reduce((sum, f) => sum + f.outflow, 0);
      const totalVolume = filteredFlows.reduce((sum, f) => sum + f.volume, 0);
      const netFlow = totalInflow - totalOutflow;

      return {
        timeframe,
        totalInflow,
        totalOutflow,
        netFlow,
        totalVolume,
        averageInflow: totalInflow / filteredFlows.length,
        averageOutflow: totalOutflow / filteredFlows.length,
        flowRatio: totalInflow / (totalOutflow || 1),
        dataPoints: filteredFlows.length
      };
    } catch (error) {
      console.error(`Error getting flow analytics for ${symbol}:`, error);
      return null;
    }
  }

  async getWhaleAnalytics(symbol) {
    try {
      const whales = this.whaleWallets.get(symbol) || [];
      if (whales.length === 0) return null;

      const totalWhaleBalance = whales.reduce((sum, w) => sum + parseFloat(w.balance), 0);
      const averageWhaleBalance = totalWhaleBalance / whales.length;
      const topWhale = whales[0];
      const whaleConcentration = whales.reduce((sum, w) => sum + parseFloat(w.percentage), 0);

      return {
        whaleCount: whales.length,
        totalWhaleBalance,
        averageWhaleBalance,
        topWhale,
        whaleConcentration,
        distribution: whales.map(w => ({
          address: w.address,
          balance: w.balance,
          percentage: w.percentage
        }))
      };
    } catch (error) {
      console.error(`Error getting whale analytics for ${symbol}:`, error);
      return null;
    }
  }
}

module.exports = MemeCoinTracker;
