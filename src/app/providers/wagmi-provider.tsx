'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider as WagmiProviderCore } from 'wagmi'
import { config } from '@/config/wagmi'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { avalanche } from 'wagmi/chains'

const queryClient = new QueryClient()

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'demo-project-id'

createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true,
  enableOnramp: true,
  defaultChain: avalanche,
})

export function WagmiProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProviderCore config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProviderCore>
  )
}