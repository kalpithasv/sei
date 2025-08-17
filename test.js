// Simple test script to demonstrate the Sei Blockchain Analytics API
// Run this with: node test.js

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Test data
const testWallet = 'sei1wallet1abcdefghijklmnopqrstuvwxyz123456789';
const testCoin = 'PEPE';
const testNFT = 'nft001';

async function testAPI() {
    console.log('🚀 Testing Sei Blockchain Analytics API...\n');

    try {
        // Test 1: Platform Overview
        console.log('1. Testing Platform Overview...');
        const overview = await axios.get(`${BASE_URL}/api/analytics/overview`);
        console.log('✅ Platform Overview:', overview.data.data.platform.totalWallets, 'wallets');
        console.log('   Network:', overview.data.data.network.totalBlocks, 'blocks');
        console.log('   Market:', overview.data.data.market.topGainers[0]?.symbol, 'top gainer\n');

        // Test 2: Wallet Analytics
        console.log('2. Testing Wallet Analytics...');
        const walletInfo = await axios.get(`${BASE_URL}/api/wallet/${testWallet}`);
        console.log('✅ Wallet Info:', walletInfo.data.data.address);
        console.log('   Balance:', walletInfo.data.data.balance.sei, 'SEI');
        console.log('   Transactions:', walletInfo.data.data.transactions.length, 'txs\n');

        // Test 3: Wallet Behavior Analysis
        const walletBehavior = await axios.get(`${BASE_URL}/api/wallet/${testWallet}/behavior`);
        console.log('✅ Wallet Behavior:');
        console.log('   Activity Level:', walletBehavior.data.data.activityLevel);
        console.log('   Risk Score:', walletBehavior.data.data.riskScore);
        console.log('   Behavior Type:', walletBehavior.data.data.behaviorType, '\n');

        // Test 4: Meme Coin Analytics
        console.log('3. Testing Meme Coin Analytics...');
        const coinInfo = await axios.get(`${BASE_URL}/api/memecoin/${testCoin}`);
        console.log('✅ Coin Info:', coinInfo.data.data.symbol);
        console.log('   Price: $', coinInfo.data.data.price);
        console.log('   Market Cap: $', coinInfo.data.data.marketCap, '\n');

        // Test 5: Meme Coin Flow Data
        const coinFlow = await axios.get(`${BASE_URL}/api/memecoin/${testCoin}/flow?timeframe=24h`);
        console.log('✅ Coin Flow Data:');
        console.log('   Total Inflow:', coinFlow.data.data.summary.totalInflow.toFixed(2));
        console.log('   Total Outflow:', coinFlow.data.data.summary.totalOutflow.toFixed(2));
        console.log('   Net Flow:', coinFlow.data.data.summary.netFlow.toFixed(2), '\n');

        // Test 6: NFT Analytics
        console.log('4. Testing NFT Analytics...');
        const nftInfo = await axios.get(`${BASE_URL}/api/nft/${testNFT}`);
        console.log('✅ NFT Info:', nftInfo.data.data.name);
        console.log('   Owner:', nftInfo.data.data.owner.substring(0, 12) + '...');
        console.log('   Current Price: $', nftInfo.data.data.currentPrice, '\n');

        // Test 7: NFT Performance
        const nftPerformance = await axios.get(`${BASE_URL}/api/nft/${testNFT}/performance`);
        console.log('✅ NFT Performance:');
        console.log('   Total Transfers:', nftPerformance.data.data.totalTransfers);
        console.log('   Total Volume: $', nftPerformance.data.data.totalVolume.toFixed(2));
        console.log('   Performance Score:', nftPerformance.data.data.performanceScore, '\n');

        // Test 8: Market Analytics
        console.log('5. Testing Market Analytics...');
        const marketData = await axios.get(`${BASE_URL}/api/analytics/market?timeframe=24h`);
        console.log('✅ Market Data:');
        console.log('   Total Market Cap: $', marketData.data.data.overview.totalMarketCap.toLocaleString());
        console.log('   Total Volume: $', marketData.data.data.overview.totalVolume24h.toLocaleString());
        console.log('   Active Tokens:', marketData.data.data.overview.activeTokens, '\n');

        // Test 9: Whale Activity
        console.log('6. Testing Whale Activity...');
        const whaleActivity = await axios.get(`${BASE_URL}/api/analytics/whales?timeframe=24h`);
        console.log('✅ Whale Activity:');
        console.log('   Active Whales:', whaleActivity.data.data.activity.activeWhales);
        console.log('   Total Transactions:', whaleActivity.data.data.activity.totalWhaleTransactions);
        console.log('   Average Transaction Value: $', whaleActivity.data.data.activity.averageWhaleTransactionValue.toFixed(2), '\n');

        // Test 10: Health Check
        console.log('7. Testing Health Check...');
        const health = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Health Status:', health.data.status);
        console.log('   Services:', Object.keys(health.data.services).join(', '), '\n');

        console.log('🎉 All tests passed successfully!');
        console.log('📊 The Sei Blockchain Analytics API is working correctly.');
        console.log('🌐 Open http://localhost:3000 in your browser to see the dashboard.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        }
        console.log('\n💡 Make sure the server is running on port 3000');
        console.log('   Run: npm start');
    }
}

// Run the tests
testAPI();
