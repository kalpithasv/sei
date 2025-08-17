const WebSocket = require('ws');

class SeiMCPClient {
  constructor() {
    this.client = null;
    this.wsConnection = null;
    this.isConnected = false;
    this.subscribers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    
    // Configuration
    this.config = {
      rpcUrl: process.env.SEI_RPC_URL || 'https://sei-rpc-endpoint',
      chainId: process.env.SEI_CHAIN_ID || 'sei-devnet-1',
      wsUrl: process.env.SEI_WS_URL || 'wss://sei-ws-endpoint',
      timeout: 30000
    };
  }

  async connect() {
    try {
      console.log('🔌 Connecting to Sei network (Mock Mode)...');
      
      // Mock connection for development
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      console.log('✅ Sei MCP Client connected successfully (Mock Mode)');
      return true;
    } catch (error) {
      console.error('❌ Failed to connect to Sei network:', error.message);
      throw error;
    }
  }

  async connectWebSocket() {
    return new Promise((resolve) => {
      console.log('✅ WebSocket connection established (Mock Mode)');
      resolve();
    });
  }

  subscribeToBlocks() {
    console.log('📡 Subscribed to new blocks (Mock Mode)');
  }

  handleWebSocketMessage(data) {
    try {
      const message = JSON.parse(data);
      console.log('📨 WebSocket message received:', message);
      
      // Emit events to subscribers
      if (message.method === 'tm.event=\'NewBlock\'') {
        this.emit('newBlock', message.params);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect().catch(console.error);
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('❌ Max reconnection attempts reached');
    }
  }

  // Mock methods for development
  async getWalletBalance(address) {
    return {
      address,
      balance: Math.random() * 1000,
      denom: 'usei',
      timestamp: new Date().toISOString()
    };
  }

  async getWalletTransactions(address, limit = 10) {
    const mockTransactions = [];
    for (let i = 0; i < limit; i++) {
      mockTransactions.push({
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        from: address,
        to: `0x${Math.random().toString(16).substr(2, 40)}`,
        amount: Math.random() * 100,
        denom: 'usei',
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString()
      });
    }
    return mockTransactions;
  }

  async getTokenInfo(symbol) {
    return {
      symbol,
      name: `${symbol} Token`,
      decimals: 6,
      totalSupply: Math.random() * 1000000,
      marketCap: Math.random() * 1000000,
      price: Math.random() * 10
    };
  }

  async getTokenHolders(symbol) {
    const mockHolders = [];
    for (let i = 0; i < 10; i++) {
      mockHolders.push({
        address: `0x${Math.random().toString(16).substr(2, 40)}`,
        balance: Math.random() * 100000,
        percentage: Math.random() * 100
      });
    }
    return mockHolders;
  }

  async getNFTInfo(tokenId) {
    return {
      tokenId,
      name: `NFT #${tokenId}`,
      collection: 'Mock Collection',
      metadata: {
        image: 'https://via.placeholder.com/300x300',
        attributes: [
          { trait: 'Rarity', value: 'Common' },
          { trait: 'Type', value: 'Mock' }
        ]
      },
      owner: `0x${Math.random().toString(16).substr(2, 40)}`,
      price: Math.random() * 100
    };
  }

  async getNFTTransactions(tokenId) {
    const mockTransactions = [];
    for (let i = 0; i < 5; i++) {
      mockTransactions.push({
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        tokenId,
        from: `0x${Math.random().toString(16).substr(2, 40)}`,
        to: `0x${Math.random().toString(16).substr(2, 40)}`,
        price: Math.random() * 100,
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString()
      });
    }
    return mockTransactions;
  }

  // Event emitter methods
  on(event, callback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    this.subscribers.get(event).push(callback);
  }

  emit(event, data) {
    if (this.subscribers.has(event)) {
      this.subscribers.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} callback:`, error);
        }
      });
    }
  }

  removeAllListeners(event) {
    if (event) {
      this.subscribers.delete(event);
    } else {
      this.subscribers.clear();
    }
  }

  disconnect() {
    this.isConnected = false;
    if (this.wsConnection) {
      this.wsConnection.close();
    }
    console.log('🔌 Sei MCP Client disconnected');
  }

  isConnected() {
    return this.isConnected;
  }
}

module.exports = SeiMCPClient;
