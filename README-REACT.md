# Sei Blockchain Analytics - React Frontend

This is the React frontend for the Sei Blockchain Analytics tool, built with modern React hooks, Tailwind CSS, and Chart.js for data visualization.

## Features

- **Modern React Architecture**: Built with React 18, functional components, and hooks
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Real-time Updates**: Socket.io integration for live data updates
- **Interactive Charts**: Chart.js integration for data visualization
- **Responsive Design**: Mobile-first responsive design
- **Dark Theme**: Beautiful dark theme with glassmorphism effects

## Components Structure

```
src/
├── components/
│   ├── Dashboard.js          # Main dashboard with tab navigation
│   ├── Header.js             # Navigation header with connection status
│   ├── Notification.js       # Toast notifications system
│   ├── PlatformOverview.js   # Platform statistics and charts
│   ├── WalletTracker.js      # Wallet tracking and analysis
│   ├── MemeCoinTracker.js    # Meme coin flow analytics
│   └── NFTTracker.js         # NFT movement tracking
├── App.js                    # Main app component
├── index.js                  # React entry point
└── index.css                 # Tailwind CSS and custom styles
```

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the backend server (in one terminal):
```bash
npm run dev
```

3. Start the React frontend (in another terminal):
```bash
npm run dev:frontend
```

The React app will open at `http://localhost:3000` and will connect to the backend at `http://localhost:3001`.

### Development Scripts

- `npm run dev:frontend` - Start React development server
- `npm run build` - Build React app for production
- `npm run start` - Start backend server
- `npm run dev` - Start backend server with nodemon

## Key Features

### 1. Platform Overview
- Network statistics
- Market overview
- Interactive charts for transactions and volume
- Wallet distribution analysis

### 2. Wallet Tracking
- Track specific wallet addresses
- Real-time balance and transaction monitoring
- Behavior analysis and risk scoring
- Token holdings visualization

### 3. Meme Coin Analytics
- Track meme coin flows
- Inflow/outflow analysis
- Whale wallet identification
- Price and volume charts

### 4. NFT Analytics
- Track NFT movement history
- Performance metrics
- Rarity analysis
- Ownership history tracking

## Styling

The app uses Tailwind CSS with custom components and utilities:

- **Glass Cards**: Semi-transparent cards with backdrop blur
- **Gradient Text**: Primary color gradients for headings
- **Dark Theme**: Consistent dark color palette
- **Responsive Grid**: Mobile-first responsive layouts
- **Animations**: Smooth transitions and hover effects

## Socket.io Integration

The frontend connects to the backend via Socket.io for real-time updates:

- Wallet tracking events
- Meme coin flow updates
- NFT movement notifications
- Connection status monitoring

## Chart.js Integration

Interactive charts are implemented using Chart.js with React-Chartjs-2:

- Line charts for price history
- Bar charts for volume analysis
- Doughnut charts for distribution data
- Custom styling for dark theme

## Customization

### Colors
The app uses a custom color palette defined in `tailwind.config.js`:

- Primary: Blue shades (#3b82f6)
- Dark: Gray shades (#0f172a to #f8fafc)
- Accent colors for different data types

### Components
Custom component classes are defined in `src/index.css`:

- `.glass-card` - Glassmorphism effect
- `.btn-primary` - Primary button styling
- `.input-field` - Form input styling
- `.stat-card` - Statistics card styling

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

## Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 3000 (React) and 3001 (Backend) are available
2. **Socket connection**: Ensure the backend server is running before starting the frontend
3. **Chart rendering**: Check browser console for Chart.js errors

### Development Tips

- Use React DevTools for component debugging
- Check Network tab for API calls
- Monitor Socket.io events in browser console
- Use Tailwind CSS IntelliSense in VS Code

## Contributing

1. Follow the existing component structure
2. Use Tailwind CSS classes for styling
3. Implement proper error handling
4. Add loading states for async operations
5. Test responsive design on different screen sizes

## License

MIT License - see main project README for details.
