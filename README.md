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

## License

MIT License - Trade responsibly!

---

**Built with ❤️ for DeFi traders on Avalanche**
