import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

const NFTTracker = ({ socket, addNotification }) => {
  const [nftTokenId, setNftTokenId] = useState('');
  const [trackedNFTs, setTrackedNFTs] = useState([]);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTrackNFT = async () => {
    if (!nftTokenId.trim()) {
      addNotification('Please enter an NFT token ID', 'error');
      return;
    }

    if (!socket) {
      addNotification('Not connected to server', 'error');
      return;
    }

    setIsLoading(true);
    try {
      socket.emit('track_nft', { tokenId: nftTokenId.trim() });
      
      // Add to tracked NFTs list
      const newNFT = {
        tokenId: nftTokenId.trim(),
        name: 'Unknown NFT',
        collection: 'Unknown Collection',
        currentPrice: '0 SEI',
        status: 'tracking'
      };
      
      setTrackedNFTs(prev => [...prev, newNFT]);
      setNftTokenId('');
      addNotification(`Started tracking NFT: ${nftTokenId.trim()}`, 'success');
    } catch (error) {
      addNotification(`Error tracking NFT: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopTracking = (tokenId) => {
    if (socket) {
      socket.emit('stop_tracking', { type: 'nft', identifier: tokenId });
    }
    
    setTrackedNFTs(prev => prev.filter(n => n.tokenId !== tokenId));
    if (selectedNFT?.tokenId === tokenId) {
      setSelectedNFT(null);
    }
    addNotification(`Stopped tracking NFT: ${tokenId}`, 'info');
  };

  const handleNFTSelect = (nft) => {
    setSelectedNFT(nft);
  };

  // Mock NFT data for demonstration
  const mockNFTData = {
    name: 'Cosmic Ape #1234',
    collection: 'Cosmic Apes',
    description: 'A rare cosmic ape exploring the blockchain universe',
    image: 'https://via.placeholder.com/300x300/3b82f6/ffffff?text=APE',
    attributes: [
      { trait: 'Background', value: 'Cosmic', rarity: '15%' },
      { trait: 'Eyes', value: 'Laser', rarity: '8%' },
      { trait: 'Mouth', value: 'Smile', rarity: '25%' },
      { trait: 'Accessory', value: 'Crown', rarity: '3%' }
    ],
    currentPrice: '45.67 SEI',
    floorPrice: '42.00 SEI',
    highestBid: '43.50 SEI',
    totalVolume: '234.56 SEI',
    totalSales: 12,
    averagePrice: '19.55 SEI',
    priceChange24h: '+12.34%',
    rarity: 'Legendary',
    performance: {
      totalTransfers: 8,
      totalVolume: '234.56 SEI',
      averagePrice: '19.55 SEI',
      priceChange: '+156.78%',
      holdingPeriods: '2.3 days',
      marketActivity: 'High',
      performanceScore: 'A+'
    },
    movementHistory: [
      { type: 'Mint', from: '0x0000...', to: '0x1234...', price: '0.1 SEI', timestamp: '2024-01-15' },
      { type: 'Sale', from: '0x1234...', to: '0x5678...', price: '15.0 SEI', timestamp: '2024-02-20' },
      { type: 'Sale', from: '0x5678...', to: '0x9abc...', price: '25.0 SEI', timestamp: '2024-03-10' },
      { type: 'Sale', from: '0x9abc...', to: '0xdef0...', price: '35.0 SEI', timestamp: '2024-04-05' },
      { type: 'Sale', from: '0xdef0...', to: '0x1111...', price: '45.67 SEI', timestamp: '2024-05-12' }
    ],
    ownershipHistory: [
      { owner: '0x1234...', duration: '35 days', acquired: '2024-01-15', sold: '2024-02-20' },
      { owner: '0x5678...', duration: '18 days', acquired: '2024-02-20', sold: '2024-03-10' },
      { owner: '0x9abc...', duration: '26 days', acquired: '2024-03-10', sold: '2024-04-05' },
      { owner: '0xdef0...', duration: '37 days', acquired: '2024-04-05', sold: '2024-05-12' },
      { owner: '0x1111...', duration: 'Current', acquired: '2024-05-12', sold: 'N/A' }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8' },
      },
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8' },
        grid: { color: '#334155' },
      },
      y: {
        ticks: { color: '#94a3b8' },
        grid: { color: '#334155' },
      },
    },
  };

  const priceChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Price (SEI)',
        data: [0.1, 15.0, 25.0, 35.0, 45.67],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const volumeChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Volume (SEI)',
        data: [0, 15.0, 25.0, 35.0, 45.67],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderRadius: 8,
      },
    ],
  };

  const rarityDistributionData = {
    labels: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'],
    datasets: [
      {
        data: [40, 30, 20, 8, 2],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderWidth: 2,
        borderColor: '#1e293b',
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* NFT Input */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4 text-gradient">NFT Analytics</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={nftTokenId}
            onChange={(e) => setNftTokenId(e.target.value)}
            placeholder="Enter NFT token ID"
            className="input-field flex-1"
          />
          <button
            onClick={handleTrackNFT}
            disabled={isLoading || !nftTokenId.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Tracking...' : 'Track NFT'}
          </button>
        </div>
      </div>

      {/* Tracked NFTs */}
      {trackedNFTs.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Tracked NFTs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trackedNFTs.map((nft) => (
              <div
                key={nft.tokenId}
                className={`p-4 rounded-lg border cursor-pointer transition-all hover:scale-105 ${
                  selectedNFT?.tokenId === nft.tokenId
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-dark-600 bg-dark-800/50'
                }`}
                onClick={() => handleNFTSelect(nft)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-mono text-primary-400">
                    {nft.tokenId.slice(0, 8)}...{nft.tokenId.slice(-6)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    nft.status === 'tracking' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {nft.status}
                  </span>
                </div>
                <div className="text-sm text-dark-300">
                  <div>Name: {nft.name}</div>
                  <div>Collection: {nft.collection}</div>
                  <div>Price: {nft.currentPrice}</div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStopTracking(nft.tokenId);
                  }}
                  className="mt-2 w-full btn-secondary text-sm py-1"
                >
                  Stop Tracking
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NFT Analysis */}
      {selectedNFT && (
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">
            NFT Analysis: {selectedNFT.tokenId.slice(0, 8)}...{selectedNFT.tokenId.slice(-6)}
          </h3>
          
          {/* NFT Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-1">
              <div className="bg-dark-800/50 rounded-lg p-4">
                <img 
                  src={mockNFTData.image} 
                  alt={mockNFTData.name}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
                <h4 className="text-lg font-semibold mb-2">{mockNFTData.name}</h4>
                <p className="text-sm text-dark-300 mb-3">{mockNFTData.description}</p>
                <div className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-dark-300">Collection:</span>
                    <span>{mockNFTData.collection}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-dark-300">Rarity:</span>
                    <span className="text-yellow-400">{mockNFTData.rarity}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <h4 className="text-lg font-semibold mb-3">Attributes</h4>
              <div className="grid grid-cols-2 gap-3">
                {mockNFTData.attributes.map((attr, index) => (
                  <div key={index} className="bg-dark-800/50 rounded-lg p-3">
                    <div className="text-sm text-dark-300">{attr.trait}</div>
                    <div className="font-semibold">{attr.value}</div>
                    <div className="text-xs text-primary-400">{attr.rarity}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="stat-card">
              <div className="text-2xl font-bold text-primary-400">{mockNFTData.currentPrice}</div>
              <div className="text-sm text-dark-400">Current Price</div>
              <div className={`text-xs ${mockNFTData.priceChange24h.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                {mockNFTData.priceChange24h}
              </div>
            </div>
            <div className="stat-card">
              <div className="text-2xl font-bold text-green-400">{mockNFTData.floorPrice}</div>
              <div className="text-sm text-dark-400">Floor Price</div>
            </div>
            <div className="stat-card">
              <div className="text-2xl font-bold text-yellow-400">{mockNFTData.totalVolume}</div>
              <div className="text-sm text-dark-400">Total Volume</div>
            </div>
            <div className="stat-card">
              <div className="text-2xl font-bold text-purple-400">{mockNFTData.totalSales}</div>
              <div className="text-sm text-dark-400">Total Sales</div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-lg font-semibold mb-3">Price History</h4>
              <div className="h-64">
                <Line data={priceChartData} options={chartOptions} />
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-3">Volume History</h4>
              <div className="h-64">
                <Bar data={volumeChartData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3">Performance Analysis</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="stat-card">
                <div className="text-xl font-bold text-blue-400">{mockNFTData.performance.totalTransfers}</div>
                <div className="text-sm text-dark-400">Total Transfers</div>
              </div>
              <div className="stat-card">
                <div className="text-xl font-bold text-green-400">{mockNFTData.performance.performanceScore}</div>
                <div className="text-sm text-dark-400">Performance Score</div>
              </div>
              <div className="stat-card">
                <div className="text-xl font-bold text-yellow-400">{mockNFTData.performance.holdingPeriods}</div>
                <div className="text-sm text-dark-400">Avg Holding</div>
              </div>
              <div className="stat-card">
                <div className="text-xl font-bold text-purple-400">{mockNFTData.performance.marketActivity}</div>
                <div className="text-sm text-dark-400">Market Activity</div>
              </div>
            </div>
          </div>

          {/* Rarity Distribution */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3">Rarity Distribution</h4>
            <div className="h-64">
              <Doughnut data={rarityDistributionData} options={chartOptions} />
            </div>
          </div>

          {/* Movement History */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3">Movement History</h4>
            <div className="space-y-2">
              {mockNFTData.movementHistory.map((movement, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      movement.type === 'Mint' ? 'bg-green-500/20 text-green-400' :
                      movement.type === 'Sale' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {movement.type}
                    </span>
                    <span className="text-sm font-mono text-dark-400">
                      {movement.from} → {movement.to}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">{movement.price}</div>
                    <div className="text-xs text-dark-400">{movement.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ownership History */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Ownership History</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-600">
                    <th className="text-left py-2 text-dark-300">Owner</th>
                    <th className="text-left py-2 text-dark-300">Duration</th>
                    <th className="text-left py-2 text-dark-300">Acquired</th>
                    <th className="text-left py-2 text-dark-300">Sold</th>
                  </tr>
                </thead>
                <tbody>
                  {mockNFTData.ownershipHistory.map((owner, index) => (
                    <tr key={index} className="border-b border-dark-700">
                      <td className="py-2 font-mono text-primary-400">{owner.owner}</td>
                      <td className="py-2">{owner.duration}</td>
                      <td className="py-2">{owner.acquired}</td>
                      <td className="py-2">{owner.sold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTTracker;
