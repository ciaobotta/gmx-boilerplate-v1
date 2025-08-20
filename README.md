# GMX AVAX Trader

A simple Next.js application for trading AVAX with leverage on GMX v2 using your MetaMask wallet on Avalanche.

## Features

- 🦊 **MetaMask Integration** - Connect your Avalanche wallet
- 📈 **Long/Short Positions** - Trade AVAX in both directions
- ⚡ **Leverage Trading** - Up to 10x leverage using USDC collateral
- 🎯 **Simple UI** - Clean interface for position management
- 🔒 **Secure** - Direct interaction with GMX v2 contracts

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Add your WalletConnect Project ID (optional)
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open Application**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - Connect your MetaMask wallet
   - Ensure you're on Avalanche network
   - Make sure you have USDC and AVAX in your wallet

## Prerequisites

- **MetaMask Wallet** with Avalanche network added
- **USDC on Avalanche** for collateral
- **AVAX** for gas fees (~0.01 AVAX per transaction)

## How to Use

1. **Connect Wallet** - Click the connect button and select MetaMask
2. **Switch to Avalanche** - Ensure you're on the correct network
3. **Choose Direction** - Select Long (bullish) or Short (bearish)
4. **Set Collateral** - Enter USDC amount for collateral
5. **Adjust Leverage** - Use slider to select leverage (1x-10x)
6. **Approve USDC** - First approve USDC spending
7. **Create Position** - Submit your leveraged position

## Important Notes

⚠️ **High Risk Warning**
- Leverage trading can result in total loss of funds
- Start with small amounts to test
- Only trade with money you can afford to lose

🔧 **Technical Details**
- Built on GMX v2 protocol
- Uses Avalanche C-Chain
- Market orders only (no limit orders in this version)
- ~0.01 AVAX execution fee per trade

## Contract Addresses (Avalanche)

- **ExchangeRouter**: `0x7C68C7866A64FA2160F78EEaE12217FFbf871fa8`
- **USDC Token**: `0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E`
- **AVAX/USDC Market**: `0x5792BB2e23De6F3D76Fa8eEDb15a14E97A31b3e4`

## Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Wagmi** - Ethereum library
- **Viem** - Low-level Ethereum library
- **Web3Modal** - Wallet connection

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## GMX v2 Price Feeds

GMX v2 provides comprehensive price feeds for assets through multiple mechanisms:

### Price Feed Architecture

**Oracle System**: GMX v2 uses Chainlink's low-latency Data Streams - a pull-based oracle model that aggregates token prices from top exchanges. The system includes:
- Oracle keepers that pull prices from reference exchanges and sign the data
- Archive nodes that store signed price information
- Order keepers that bundle signed oracle prices with trade requests

**Price Aggregation**: Mark prices are aggregated from multiple exchanges to reduce liquidation risks from temporary price wicks. The system provides both minimum and maximum prices to include bid-ask spread information.

### Available APIs for Price Data

REST API Endpoints (available on Arbitrum, Avalanche, Botanix):

1. **Real-time Tickers**: `https://{network}-api.gmxinfra.io/prices/tickers`
2. **Signed Prices**: `https://{network}-api.gmxinfra.io/signed_prices/latest`
3. **Historical Candlesticks**: `https://{network}-api.gmxinfra.io/prices/candles`
   - Supports timeframes: 1m, 5m, 15m, 1h, 4h, 1d
4. **Token List**: `https://{network}-api.gmxinfra.io/tokens`

**Smart Contracts**: GMX v2 contracts expose oracle interfaces for on-chain price access, with prices stored at 30 decimal precision.

The pricing system is designed for high-frequency trading with reduced slippage through the low-latency oracle integration.

## Application Capabilities Analysis

### What the App CAN Do:

#### Core Trading Functionality
- **Leverage Trading**: Execute long/short positions on AVAX with 1x-10x leverage using USDC collateral
- **GMX v2 Integration**: Direct connection to GMX v2 ExchangeRouter (`TradingInterface.tsx:174`)  
- **Market Orders**: Create market increase orders through GMX's orderType 2 (`TradingInterface.tsx:166`)
- **Wallet Integration**: Web3Modal support for MetaMask, Coinbase Wallet, WalletConnect (`wagmi-provider.tsx:13-19`)
- **Network Enforcement**: Automatic Avalanche network detection and switching (`TradingInterface.tsx:199-207`)

#### User Interface Features  
- **Real-time Balances**: Live USDC/AVAX balance display (`TradingInterface.tsx:89-98`)
- **Position Calculator**: Automatic position size calculation based on collateral × leverage (`TradingInterface.tsx:111`)
- **Execution Fees**: Transparent 0.01 AVAX execution fee display (`contracts.ts:20`)
- **Connection Status**: Visual GMX v2 connection indicator with contract addresses (`TradingInterface.tsx:228-240`)
- **Risk Warnings**: Prominent leverage trading risk disclaimers (`TradingInterface.tsx:334-338`)

### What the App CAN'T Do:

#### Trading Limitations
- **No Position Management**: Cannot close, modify, or monitor existing positions
- **No Limit Orders**: Only market orders supported, no stop-loss/take-profit
- **Hardcoded Pricing**: Uses static $30 AVAX price instead of real oracle data (`TradingInterface.tsx:143`)
- **No Multi-Asset**: Limited to AVAX/USDC market only (`contracts.ts:18`)
- **No Portfolio View**: Cannot track P&L, position history, or performance

#### Technical Constraints
- **Single Market**: Hardcoded to one GMX market address
- **Basic Error Handling**: Limited transaction failure recovery
- **No Price Feeds**: Missing integration with GMX's oracle system despite documentation
- **Static Slippage**: Fixed 0.2% slippage tolerance (`TradingInterface.tsx:144-146`)

### What the App COULD Do (Enhancement Potential):

#### Immediate Improvements
- **Oracle Integration**: Implement GMX's Chainlink Data Streams for real-time pricing (`https://avalanche-api.gmxinfra.io/prices/tickers`)
- **Position Dashboard**: Add position monitoring using GMX Reader contract (`contracts.ts:6`)
- **Order Management**: Support limit orders, stop-loss, take-profit via orderType variations
- **Multi-Market**: Extend to other GMX markets (BTC, ETH) using similar contract patterns

#### Advanced Features  
- **Portfolio Analytics**: P&L tracking, trading history, performance metrics
- **Risk Management**: Dynamic position sizing, liquidation warnings, margin requirements
- **Advanced Orders**: Trailing stops, dollar-cost averaging, grid trading
- **Cross-Chain**: Expand to Arbitrum GMX markets using same architecture

#### Integration Opportunities
- **Price Feeds**: Full GMX API integration for historical data and candlesticks
- **Notification System**: Position alerts, liquidation warnings, order fills
- **Social Trading**: Copy trading, strategy sharing, leaderboards
- **DeFi Composability**: Yield farming with unused collateral, automated rebalancing

The app provides a solid foundation for GMX v2 trading with proper contract integration and user experience, but has significant room for feature expansion and sophisticated trading functionality.

## License

MIT License - Trade responsibly!

---

**Built with ❤️ for DeFi traders on Avalanche**
