'use client'

import { useState, useEffect } from 'react'

interface AvaxPriceData {
  price: number
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

export function useAvaxPrice(): AvaxPriceData {
  const [priceData, setPriceData] = useState<AvaxPriceData>({
    price: 0,
    loading: true,
    error: null,
    lastUpdated: null
  })

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        setPriceData(prev => ({ ...prev, loading: true, error: null }))
        
        // First try CoinGecko as a reliable fallback for testing
        try {
          const cgResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=avalanche-2&vs_currencies=usd')
          if (cgResponse.ok) {
            const cgData = await cgResponse.json()
            if (cgData['avalanche-2']?.usd) {
              setPriceData({
                price: cgData['avalanche-2'].usd,
                loading: false,
                error: null,
                lastUpdated: new Date()
              })
              return
            }
          }
        } catch (cgError) {
          console.log('CoinGecko fallback failed, trying GMX API')
        }
        
        // Use GMX Avalanche API for real-time ticker data
        const response = await fetch('https://avalanche-api.gmxinfra.io/prices/tickers', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        })

        if (!response.ok) {
          throw new Error(`GMX API Error: ${response.status}`)
        }

        const data = await response.json()
        console.log('GMX API Response:', data.slice(0, 3)) // Log first few entries
        
        // Find AVAX price in the response
        const avaxTicker = data.find((ticker: any) => 
          ticker.tokenSymbol === 'AVAX' || 
          ticker.tokenAddress?.toLowerCase() === '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7'
        )

        console.log('AVAX ticker found:', avaxTicker)

        if (avaxTicker && avaxTicker.minPrice) {
          let price = parseFloat(avaxTicker.minPrice)
          console.log('Raw price:', price)
          
          // GMX uses different decimal precisions - let's try to figure it out
          if (price > 1000000) {
            // Try 30 decimals first (common for USD prices in DeFi)
            price = price / Math.pow(10, 30)
            console.log('After 30 decimals:', price)
            
            if (price < 0.1) {
              // Try 18 decimals
              price = parseFloat(avaxTicker.minPrice) / Math.pow(10, 18)
              console.log('After 18 decimals:', price)
            }
            
            if (price < 0.1) {
              // Try 12 decimals
              price = parseFloat(avaxTicker.minPrice) / Math.pow(10, 12)
              console.log('After 12 decimals:', price)
            }
          }
          
          setPriceData({
            price,
            loading: false,
            error: null,
            lastUpdated: new Date()
          })
        } else {
          throw new Error('AVAX price not found in GMX response')
        }
      } catch (error) {
        console.error('Price fetch error:', error)
        setPriceData(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch price'
        }))
      }
    }

    // Fetch immediately
    fetchPrice()

    // Set up interval for updates every 30 seconds (respects rate limits)
    const interval = setInterval(fetchPrice, 30000)

    return () => clearInterval(interval)
  }, [])

  return priceData
}