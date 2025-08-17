const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import our custom modules
const WalletTracker = require('./services/WalletTracker');
const MemeCoinTracker = require('./services/MemeCoinTracker');
const NFTTracker = require('./services/NFTTracker');
const SeiMCPClient = require('./services/SeiMCPClient');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Initialize Sei MCP Client
const seiClient = new SeiMCPClient();

// Initialize tracking services
const walletTracker = new WalletTracker(seiClient, io);
const memeCoinTracker = new MemeCoinTracker(seiClient, io);
const nftTracker = new NFTTracker(seiClient, io);

// API Routes
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/memecoin', require('./routes/memecoin'));
app.use('/api/nft', require('./routes/nft'));
app.use('/api/analytics', require('./routes/analytics'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: {
      wallet: walletTracker.isActive(),
      memecoin: memeCoinTracker.isActive(),
      nft: nftTracker.isActive()
    }
  });
});

// Main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Handle wallet tracking requests
  socket.on('track_wallet', async (data) => {
    try {
      const { address, options } = data;
      await walletTracker.startTracking(address, socket.id, options);
      socket.emit('tracking_started', { address, status: 'success' });
    } catch (error) {
      socket.emit('tracking_error', { error: error.message });
    }
  });

  // Handle meme coin tracking requests
  socket.on('track_memecoin', async (data) => {
    try {
      const { symbol, options } = data;
      await memeCoinTracker.startTracking(symbol, socket.id, options);
      socket.emit('memecoin_tracking_started', { symbol, status: 'success' });
    } catch (error) {
      socket.emit('tracking_error', { error: error.message });
    }
  });

  // Handle NFT tracking requests
  socket.on('track_nft', async (data) => {
    try {
      const { tokenId, options } = data;
      await nftTracker.startTracking(tokenId, socket.id, options);
      socket.emit('nft_tracking_started', { tokenId, status: 'success' });
    } catch (error) {
      socket.emit('tracking_error', { error: error.message });
    }
  });

  // Handle stop tracking requests
  socket.on('stop_tracking', (data) => {
    const { type, identifier } = data;
    switch (type) {
      case 'wallet':
        walletTracker.stopTracking(identifier, socket.id);
        break;
      case 'memecoin':
        memeCoinTracker.stopTracking(identifier, socket.id);
        break;
      case 'nft':
        nftTracker.stopTracking(identifier, socket.id);
        break;
    }
    socket.emit('tracking_stopped', { type, identifier });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    // Clean up tracking for this socket
    walletTracker.removeSocket(socket.id);
    memeCoinTracker.removeSocket(socket.id);
    nftTracker.removeSocket(socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 3001;

// Start server
server.listen(PORT, async () => {
  console.log(`🚀 Sei Blockchain Analytics Server running on port ${PORT}`);
  console.log(`📊 Dashboard available at http://localhost:${PORT}`);
  
  try {
    // Initialize Sei MCP connection
    await seiClient.connect();
    console.log('✅ Connected to Sei MCP Server');
    
    // Start background services
    await walletTracker.initialize();
    await memeCoinTracker.initialize();
    await nftTracker.initialize();
    
    console.log('✅ All tracking services initialized');
  } catch (error) {
    console.error('❌ Failed to initialize services:', error.message);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

module.exports = { app, server, io };
