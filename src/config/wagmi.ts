import { createConfig, http } from 'wagmi'
import { avalanche } from 'wagmi/chains'
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors'

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'demo-project-id'

export const config = createConfig({
  chains: [avalanche],
  connectors: [
    injected(),
    coinbaseWallet({ appName: 'GMX AVAX Trader' }),
    walletConnect({ projectId }),
  ],
  transports: {
    [avalanche.id]: http('https://api.avax.network/ext/bc/C/rpc'),
  },
})