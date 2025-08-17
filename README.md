# Sei Blockchain Analytics Tool 🚀

A comprehensive blockchain analytics application built with the Sei MCP Kit that provides real-time insights into wallet behavior, meme coin movements, and NFT lifetime tracking.

## 🎯 Features

### 1. **Wallet Behavior Analysis**
- Track specific wallet addresses in real-time
- Monitor transaction patterns and frequency
- Analyze spending habits and token preferences
- Detect unusual activity patterns

### 2. **Meme Coin Analytics**
- Real-time tracking of meme coin inflows/outflows
- Price movement correlation with trading volume
- Whale wallet identification and monitoring
- Social sentiment integration

### 3. **NFT Lifetime Movement**
- Complete transaction history of NFTs
- Ownership transfer tracking
- Price evolution over time
- Rarity and market performance metrics

### 4. **Advanced Analytics**
- Interactive charts and visualizations
- Real-time notifications via WebSocket
- Export functionality for data analysis
- API endpoints for external integrations

## 🛠️ Technology Stack

- **Backend**: Node.js + Express
- **Blockchain Integration**: Sei MCP Kit
- **Real-time Communication**: Socket.io
- **Frontend**: Modern HTML5 + CSS3 + JavaScript
- **Data Visualization**: Chart.js
- **Security**: Helmet, CORS, Rate Limiting

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16.0.0
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd sei-blockchain-analytics
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start the application**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

5. **Open your browser**
Navigate to `http://localhost:3000`

## 📊 API Endpoints

### Wallet Analytics
- `GET /api/wallet/:address` - Get wallet information
- `GET /api/wallet/:address/transactions` - Get transaction history
- `GET /api/wallet/:address/behavior` - Get behavior analysis

### Meme Coin Tracking
- `GET /api/memecoin/:symbol` - Get coin information
- `GET /api/memecoin/:symbol/flow` - Get inflow/outflow data
- `GET /api/memecoin/:symbol/whales` - Get whale wallet data

### NFT Tracking
- `GET /api/nft/:tokenId` - Get NFT information
- `GET /api/nft/:tokenId/movement` - Get movement history
- `GET /api/nft/:tokenId/performance` - Get performance metrics

## 🔧 Configuration

Create a `.env` file with the following variables:

```env
PORT=3000
SEI_RPC_URL=https://sei-rpc-endpoint
SEI_CHAIN_ID=sei-devnet-1
MONGODB_URI=mongodb://localhost:27017/sei-analytics
JWT_SECRET=your-secret-key
```

## 📈 Usage Examples

### Track a Wallet
```javascript
// Connect to wallet tracking
const walletTracker = new WalletTracker('sei1...');
walletTracker.on('transaction', (tx) => {
    console.log('New transaction:', tx);
});
```

### Monitor Meme Coin
```javascript
// Track meme coin flows
const coinTracker = new MemeCoinTracker('PEPE');
coinTracker.on('flow', (data) => {
    console.log('Flow update:', data);
});
```

### Follow NFT Movement
```javascript
// Track NFT lifetime
const nftTracker = new NFTTracker('nft123');
nftTracker.on('transfer', (transfer) => {
    console.log('NFT transferred:', transfer);
});
```

## 🎨 UI Features

- **Responsive Design**: Works on all devices
- **Dark/Light Theme**: User preference support
- **Real-time Updates**: Live data streaming
- **Interactive Charts**: Zoom, pan, and filter capabilities
- **Export Options**: CSV, JSON, and PDF formats

## 🔒 Security Features

- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS protection
- Helmet security headers
- Environment variable protection

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 University Student Project

This project was developed as part of the Sei MCP Kit development challenge for university students. It demonstrates practical application of blockchain technology and real-time data analysis.

## 🤝 Support

For questions or support, please open an issue in the repository or contact the development team.

---

**Built with ❤️ by University Students using the Sei MCP Kit**
