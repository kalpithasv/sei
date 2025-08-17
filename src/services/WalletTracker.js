const EventEmitter = require('events');

class WalletTracker extends EventEmitter {
  constructor(seiClient, io) {
    super();
    this.seiClient = seiClient;
    this.io = io;
    this.trackedWallets = new Map(); // address -> { sockets, data, analysis }
    this.walletPatterns = new Map(); // address -> behavior patterns
    this.analysisCache = new Map(); // address -> cached analysis
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    
    // Subscribe to new transactions
    this.seiClient.on('newTransaction', (txData) => {
      this.processNewTransaction(txData);
    });
  }

  async initialize() {
    console.log('🔍 Initializing Wallet Tracker...');
    
    // Load any previously tracked wallets from storage
    // In a real app, you'd load from database
    this.isActive = true;
    
    console.log('✅ Wallet Tracker initialized');
  }

  async startTracking(address, socketId, options = {}) {
    try {
      console.log(`🔍 Starting to track wallet: ${address}`);
      
      // Validate address format
      if (!this.isValidAddress(address)) {
        throw new Error('Invalid wallet address format');
      }

      // Get initial wallet data
      const walletData = await this.getWalletData(address);
      
      // Initialize tracking for this wallet
      if (!this.trackedWallets.has(address)) {
        this.trackedWallets.set(address, {
          sockets: new Set(),
          data: walletData,
          analysis: null,
          lastUpdate: Date.now(),
          options: options
        });
      }

      // Add socket to tracking
      const walletInfo = this.trackedWallets.get(address);
      walletInfo.sockets.add(socketId);

      // Perform initial analysis
      const analysis = await this.analyzeWalletBehavior(address);
      walletInfo.analysis = analysis;

      // Send initial data to the socket
      this.io.to(socketId).emit('wallet_data', {
        address,
        data: walletData,
        analysis: analysis
      });

      console.log(`✅ Wallet ${address} tracking started for socket ${socketId}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to start tracking wallet ${address}:`, error.message);
      throw error;
    }
  }

  stopTracking(address, socketId) {
    try {
      if (this.trackedWallets.has(address)) {
        const walletInfo = this.trackedWallets.get(address);
        walletInfo.sockets.delete(socketId);

        // If no more sockets are tracking this wallet, remove it
        if (walletInfo.sockets.size === 0) {
          this.trackedWallets.delete(address);
          console.log(`🛑 Stopped tracking wallet: ${address}`);
        } else {
          console.log(`🔄 Socket ${socketId} stopped tracking wallet: ${address}`);
        }
      }
    } catch (error) {
      console.error(`Error stopping wallet tracking:`, error);
    }
  }

  removeSocket(socketId) {
    // Remove socket from all tracked wallets
    for (const [address, walletInfo] of this.trackedWallets.entries()) {
      if (walletInfo.sockets.has(socketId)) {
        this.stopTracking(address, socketId);
      }
    }
  }

  async getWalletData(address) {
    try {
      // Get wallet balance
      const balance = await this.seiClient.getWalletBalance(address);
      
      // Get recent transactions
      const transactions = await this.seiClient.getWalletTransactions(address, 50);
      
      // Get token holdings
      const tokenHoldings = await this.getTokenHoldings(address);
      
      return {
        address,
        balance,
        transactions: transactions || [],
        tokenHoldings,
        lastUpdated: Date.now()
      };
    } catch (error) {
      console.error(`Error getting wallet data for ${address}:`, error);
      throw error;
    }
  }

  async getTokenHoldings(address) {
    try {
      // This would typically query the blockchain for all tokens held by the wallet
      // For now, we'll return a mock structure
      return {
        sei: { amount: '1000000', denom: 'usei' },
        // Add other tokens as needed
      };
    } catch (error) {
      console.error(`Error getting token holdings for ${address}:`, error);
      return {};
    }
  }

  async analyzeWalletBehavior(address) {
    try {
      const walletData = await this.getWalletData(address);
      const transactions = walletData.transactions;
      
      if (!transactions || transactions.length === 0) {
        return this.getDefaultAnalysis();
      }

      // Analyze transaction patterns
      const analysis = {
        transactionCount: transactions.length,
        totalVolume: this.calculateTotalVolume(transactions),
        activityLevel: this.calculateActivityLevel(transactions),
        spendingPatterns: this.analyzeSpendingPatterns(transactions),
        tokenPreferences: this.analyzeTokenPreferences(transactions),
        riskScore: this.calculateRiskScore(transactions),
        behaviorType: this.classifyBehavior(transactions),
        unusualActivity: this.detectUnusualActivity(transactions),
        lastActivity: this.getLastActivity(transactions),
        trends: this.analyzeTrends(transactions)
      };

      // Cache the analysis
      this.analysisCache.set(address, {
        data: analysis,
        timestamp: Date.now()
      });

      return analysis;
    } catch (error) {
      console.error(`Error analyzing wallet behavior for ${address}:`, error);
      return this.getDefaultAnalysis();
    }
  }

  calculateTotalVolume(transactions) {
    try {
      return transactions.reduce((total, tx) => {
        const amount = parseFloat(tx.amount || 0);
        return total + amount;
      }, 0);
    } catch (error) {
      return 0;
    }
  }

  calculateActivityLevel(transactions) {
    try {
      const recentTransactions = transactions.filter(tx => {
        const txTime = new Date(tx.timestamp || tx.blockTime);
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        return txTime > oneWeekAgo;
      });

      if (recentTransactions.length === 0) return 'inactive';
      if (recentTransactions.length < 5) return 'low';
      if (recentTransactions.length < 20) return 'medium';
      return 'high';
    } catch (error) {
      return 'unknown';
    }
  }

  analyzeSpendingPatterns(transactions) {
    try {
      const patterns = {
        averageTransactionSize: 0,
        largestTransaction: 0,
        smallestTransaction: 0,
        frequency: 'unknown'
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
    } catch (error) {
      return {};
    }
  }

  analyzeTokenPreferences(transactions) {
    try {
      const tokenCounts = {};
      
      transactions.forEach(tx => {
        const denom = tx.denom || 'unknown';
        tokenCounts[denom] = (tokenCounts[denom] || 0) + 1;
      });

      // Sort by frequency
      const sortedTokens = Object.entries(tokenCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5); // Top 5 tokens

      return sortedTokens.map(([denom, count]) => ({ denom, count }));
    } catch (error) {
      return [];
    }
  }

  calculateRiskScore(transactions) {
    try {
      let riskScore = 0;
      
      // Factors that increase risk
      if (transactions.length > 100) riskScore += 20; // High activity
      if (transactions.length < 5) riskScore += 15; // Very low activity
      
      // Check for large transactions
      const largeTransactions = transactions.filter(tx => 
        parseFloat(tx.amount || 0) > 1000000 // 1M usei
      );
      if (largeTransactions.length > 10) riskScore += 25;
      
      // Normalize to 0-100 scale
      return Math.min(100, Math.max(0, riskScore));
    } catch (error) {
      return 50; // Default medium risk
    }
  }

  classifyBehavior(transactions) {
    try {
      if (transactions.length === 0) return 'inactive';
      
      const recentCount = transactions.filter(tx => {
        const txTime = new Date(tx.timestamp || tx.blockTime);
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        return txTime > oneDayAgo;
      }).length;

      if (recentCount > 50) return 'trader';
      if (recentCount > 20) return 'active_user';
      if (recentCount > 5) return 'regular_user';
      if (recentCount > 0) return 'occasional_user';
      return 'inactive';
    } catch (error) {
      return 'unknown';
    }
  }

  detectUnusualActivity(transactions) {
    try {
      const unusual = [];
      
      // Check for rapid transactions
      if (transactions.length > 10) {
        const recentTxs = transactions.slice(0, 10);
        const timeSpan = new Date(recentTxs[0].timestamp || recentTxs[0].blockTime) - 
                        new Date(recentTxs[recentTxs.length - 1].timestamp || recentTxs[recentTxs.length - 1].blockTime);
        
        if (timeSpan < 60000) { // Less than 1 minute
          unusual.push('rapid_transactions');
        }
      }

      // Check for large amount variations
      const amounts = transactions.map(tx => parseFloat(tx.amount || 0));
      if (amounts.length > 5) {
        const avg = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
        const largeVariations = amounts.filter(amt => amt > avg * 10);
        if (largeVariations.length > 0) {
          unusual.push('large_amount_variations');
        }
      }

      return unusual;
    } catch (error) {
      return [];
    }
  }

  getLastActivity(transactions) {
    try {
      if (transactions.length === 0) return null;
      
      const latestTx = transactions[0];
      return {
        timestamp: latestTx.timestamp || latestTx.blockTime,
        type: latestTx.type || 'unknown',
        amount: latestTx.amount || 0
      };
    } catch (error) {
      return null;
    }
  }

  analyzeTrends(transactions) {
    try {
      if (transactions.length < 10) return { trend: 'insufficient_data' };
      
      // Simple trend analysis based on transaction frequency
      const recentWeek = transactions.filter(tx => {
        const txTime = new Date(tx.timestamp || tx.blockTime);
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        return txTime > oneWeekAgo;
      }).length;
      
      const previousWeek = transactions.filter(tx => {
        const txTime = new Date(tx.timestamp || tx.blockTime);
        const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        return txTime > twoWeeksAgo && txTime <= oneWeekAgo;
      }).length;
      
      if (recentWeek > previousWeek * 1.5) return { trend: 'increasing', change: 'up' };
      if (recentWeek < previousWeek * 0.7) return { trend: 'decreasing', change: 'down' };
      return { trend: 'stable', change: 'stable' };
    } catch (error) {
      return { trend: 'unknown' };
    }
  }

  getDefaultAnalysis() {
    return {
      transactionCount: 0,
      totalVolume: 0,
      activityLevel: 'inactive',
      spendingPatterns: {},
      tokenPreferences: [],
      riskScore: 50,
      behaviorType: 'inactive',
      unusualActivity: [],
      lastActivity: null,
      trends: { trend: 'unknown' }
    };
  }

  async processNewTransaction(txData) {
    try {
      const { hash, decodedTx, blockHeight } = txData;
      
      // Check if this transaction involves any tracked wallets
      const involvedAddresses = this.extractAddressesFromTransaction(decodedTx);
      
      for (const address of involvedAddresses) {
        if (this.trackedWallets.has(address)) {
          await this.updateWalletData(address, txData);
        }
      }
    } catch (error) {
      console.error('Error processing new transaction:', error);
    }
  }

  extractAddressesFromTransaction(tx) {
    try {
      const addresses = [];
      
      // Extract addresses from transaction data
      // This is a simplified version - in reality you'd parse the actual transaction structure
      if (tx.data && tx.data.from) addresses.push(tx.data.from);
      if (tx.data && tx.data.to) addresses.push(tx.data.to);
      
      return addresses;
    } catch (error) {
      return [];
    }
  }

  async updateWalletData(address, txData) {
    try {
      const walletInfo = this.trackedWallets.get(address);
      if (!walletInfo) return;

      // Update wallet data
      const updatedData = await this.getWalletData(address);
      walletInfo.data = updatedData;
      walletInfo.lastUpdate = Date.now();

      // Re-analyze behavior
      const updatedAnalysis = await this.analyzeWalletBehavior(address);
      walletInfo.analysis = updatedAnalysis;

      // Notify all sockets tracking this wallet
      const notification = {
        address,
        newTransaction: txData,
        updatedData: updatedData,
        updatedAnalysis: updatedAnalysis,
        timestamp: Date.now()
      };

      walletInfo.sockets.forEach(socketId => {
        this.io.to(socketId).emit('wallet_update', notification);
      });

      console.log(`📊 Updated wallet data for ${address}`);
    } catch (error) {
      console.error(`Error updating wallet data for ${address}:`, error);
    }
  }

  isValidAddress(address) {
    // Basic Sei address validation
    return address && address.startsWith('sei1') && address.length === 44;
  }

  isActive() {
    return this.isActive && this.trackedWallets.size > 0;
  }

  getTrackingStats() {
    return {
      activeWallets: this.trackedWallets.size,
      totalSockets: Array.from(this.trackedWallets.values())
        .reduce((total, wallet) => total + wallet.sockets.size, 0),
      isActive: this.isActive
    };
  }
}

module.exports = WalletTracker;
