import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import Notification from './components/Notification';

function App() {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:3001', {
      transports: ['websocket'],
      timeout: 20000,
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      addNotification('Connected to Sei Analytics Server', 'success');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
      addNotification('Disconnected from server', 'error');
    });

    newSocket.on('tracking_started', (data) => {
      addNotification(`Started tracking wallet: ${data.address}`, 'success');
    });

    newSocket.on('memecoin_tracking_started', (data) => {
      addNotification(`Started tracking meme coin: ${data.symbol}`, 'success');
    });

    newSocket.on('nft_tracking_started', (data) => {
      addNotification(`Started tracking NFT: ${data.tokenId}`, 'success');
    });

    newSocket.on('tracking_error', (data) => {
      addNotification(`Tracking error: ${data.error}`, 'error');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    const notification = { id, message, type, timestamp: new Date() };
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <Header isConnected={isConnected} />
      
      <main className="container mx-auto px-4 py-8">
        <Dashboard socket={socket} addNotification={addNotification} />
      </main>

      {/* Notification Container */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
