'use client'

import { useState } from 'react'
import { useAccount, useConnect, useDisconnect, useBalance, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, parseUnits, formatEther } from 'viem'
import { avalanche } from 'wagmi/chains'
import toast from 'react-hot-toast'
import { GMX_CONTRACTS, TOKENS, AVAX_USDC_MARKET, EXECUTION_FEE } from '@/config/contracts'

const EXCHANGE_ROUTER_ABI = [
  {
    "inputs": [
      {
        "components": [
          {
            "components": [
              { "name": "receiver", "type": "address" },
              { "name": "callbackContract", "type": "address" },
              { "name": "uiFeeReceiver", "type": "address" },
              { "name": "market", "type": "address" },
              { "name": "initialCollateralToken", "type": "address" },
              { "name": "swapPath", "type": "address[]" }
            ],
            "name": "addresses",
            "type": "tuple"
          },
          {
            "components": [
              { "name": "sizeDeltaUsd", "type": "uint256" },
              { "name": "initialCollateralDeltaAmount", "type": "uint256" },
              { "name": "triggerPrice", "type": "uint256" },
              { "name": "acceptablePrice", "type": "uint256" },
              { "name": "executionFee", "type": "uint256" },
              { "name": "callbackGasLimit", "type": "uint256" },
              { "name": "minOutputAmount", "type": "uint256" }
            ],
            "name": "numbers",
            "type": "tuple"
          },
          { "name": "orderType", "type": "uint8" },
          { "name": "decreasePositionSwapType", "type": "uint8" },
          { "name": "isLong", "type": "bool" },
          { "name": "shouldUnwrapNativeToken", "type": "bool" },
          { "name": "referralCode", "type": "bytes32" }
        ],
        "name": "params",
        "type": "tuple"
      }
    ],
    "name": "createOrder",
    "outputs": [{ "name": "", "type": "bytes32" }],
    "stateMutability": "payable",
    "type": "function"
  }
]

const ERC20_ABI = [
  {
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "owner", "type": "address" },
      { "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
]

export default function TradingInterface() {
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  
  const [collateralAmount, setCollateralAmount] = useState('')
  const [leverage, setLeverage] = useState(2)
  const [isLong, setIsLong] = useState(true)
  
  const { data: usdcBalance } = useBalance({
    address,
    token: TOKENS.USDC,
    chainId: avalanche.id,
  })
  
  const { data: avaxBalance } = useBalance({
    address,
    chainId: avalanche.id,
  })
  
  const { writeContract: writeApprove, data: approveHash } = useWriteContract()
  const { writeContract: writeCreateOrder, data: orderHash } = useWriteContract()
  
  const { isLoading: isApproving } = useWaitForTransactionReceipt({
    hash: approveHash,
  })
  
  const { isLoading: isCreatingOrder } = useWaitForTransactionReceipt({
    hash: orderHash,
  })

  const positionSize = collateralAmount ? (parseFloat(collateralAmount) * leverage).toString() : '0'
  
  const handleApprove = async () => {
    if (!collateralAmount || !address) return
    
    try {
      const amount = parseUnits(collateralAmount, 6) // USDC has 6 decimals
      
      writeApprove({
        address: TOKENS.USDC,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [GMX_CONTRACTS.ExchangeRouter, amount],
        chainId: avalanche.id,
      })
      
      toast.loading('Approving USDC...', { id: 'approve' })
    } catch (error) {
      console.error('Approve error:', error)
      toast.error('Failed to approve USDC')
    }
  }
  
  const handleCreateOrder = async () => {
    if (!collateralAmount || !address) return
    
    try {
      const collateralAmountBigInt = parseUnits(collateralAmount, 6) // USDC decimals
      const sizeDeltaUsd = parseUnits(positionSize, 30) // USD amounts use 30 decimals in GMX
      const executionFee = parseEther(EXECUTION_FEE)
      
      // Get current AVAX price (simplified - in production, use oracle)
      const currentPrice = parseUnits('30', 30) // $30 as example
      const acceptablePrice = isLong 
        ? currentPrice * BigInt(1002) / BigInt(1000) // +0.2% slippage for longs
        : currentPrice * BigInt(998) / BigInt(1000)   // -0.2% slippage for shorts
      
      const orderParams = {
        addresses: {
          receiver: address,
          callbackContract: '0x0000000000000000000000000000000000000000',
          uiFeeReceiver: '0x0000000000000000000000000000000000000000',
          market: AVAX_USDC_MARKET,
          initialCollateralToken: TOKENS.USDC,
          swapPath: [],
        },
        numbers: {
          sizeDeltaUsd,
          initialCollateralDeltaAmount: collateralAmountBigInt,
          triggerPrice: BigInt(0),
          acceptablePrice,
          executionFee,
          callbackGasLimit: BigInt(0),
          minOutputAmount: BigInt(0),
        },
        orderType: 2, // MarketIncrease
        decreasePositionSwapType: 0,
        isLong,
        shouldUnwrapNativeToken: false,
        referralCode: '0x0000000000000000000000000000000000000000000000000000000000000000',
      }
      
      writeCreateOrder({
        address: GMX_CONTRACTS.ExchangeRouter,
        abi: EXCHANGE_ROUTER_ABI,
        functionName: 'createOrder',
        args: [orderParams],
        value: executionFee,
        chainId: avalanche.id,
      })
      
      toast.loading('Creating order...', { id: 'order' })
    } catch (error) {
      console.error('Create order error:', error)
      toast.error('Failed to create order')
    }
  }

  if (!isConnected) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">Connect Your Wallet</h2>
        <p className="text-gray-400 mb-6">Connect your Avalanche wallet to start trading</p>
        <w3m-button />
      </div>
    )
  }
  
  if (chain?.id !== avalanche.id) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">Wrong Network</h2>
        <p className="text-gray-400 mb-6">Please switch to Avalanche network</p>
        <w3m-network-button />
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Trade AVAX</h2>
        <w3m-button />
      </div>
      
      {/* Balance Display */}
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-700 rounded">
        <div>
          <p className="text-sm text-gray-400">USDC Balance</p>
          <p className="font-mono">{usdcBalance ? parseFloat(formatEther(usdcBalance.value * BigInt(10**12))).toFixed(2) : '0.00'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">AVAX Balance</p>
          <p className="font-mono">{avaxBalance ? parseFloat(formatEther(avaxBalance.value)).toFixed(4) : '0.0000'}</p>
        </div>
      </div>
      
      {/* GMX Connection Status */}
      <div className="mb-6 p-3 bg-green-900/20 border border-green-600 rounded">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-green-400 text-sm font-medium">Connected to GMX v2</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          ExchangeRouter: {GMX_CONTRACTS.ExchangeRouter.slice(0, 6)}...{GMX_CONTRACTS.ExchangeRouter.slice(-4)}
        </p>
        <p className="text-xs text-gray-400">
          Market: AVAX/USDC ({AVAX_USDC_MARKET.slice(0, 6)}...{AVAX_USDC_MARKET.slice(-4)})
        </p>
      </div>
      
      {/* Direction Toggle */}
      <div className="flex mb-6">
        <button
          onClick={() => setIsLong(true)}
          className={`flex-1 py-2 px-4 rounded-l font-medium ${
            isLong ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
          }`}
        >
          Long
        </button>
        <button
          onClick={() => setIsLong(false)}
          className={`flex-1 py-2 px-4 rounded-r font-medium ${
            !isLong ? 'bg-red-600 text-white' : 'bg-gray-600 text-gray-300'
          }`}
        >
          Short
        </button>
      </div>
      
      {/* Collateral Input */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">Collateral (USDC)</label>
        <input
          type="number"
          value={collateralAmount}
          onChange={(e) => setCollateralAmount(e.target.value)}
          placeholder="0.00"
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
        />
      </div>
      
      {/* Leverage Slider */}
      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">Leverage: {leverage}x</label>
        <input
          type="range"
          min="1"
          max="10"
          step="0.1"
          value={leverage}
          onChange={(e) => setLeverage(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1x</span>
          <span>5x</span>
          <span>10x</span>
        </div>
      </div>
      
      {/* Position Info */}
      <div className="bg-gray-700 rounded p-4 mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-gray-400">Position Size:</span>
          <span className="font-mono">${positionSize} USD</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-400">Direction:</span>
          <span className={isLong ? 'text-green-400' : 'text-red-400'}>
            {isLong ? 'Long' : 'Short'} AVAX
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Execution Fee:</span>
          <span className="font-mono">{EXECUTION_FEE} AVAX</span>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleApprove}
          disabled={!collateralAmount || isApproving}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded font-medium transition-colors"
        >
          {isApproving ? 'Approving...' : 'Approve USDC'}
        </button>
        
        <button
          onClick={handleCreateOrder}
          disabled={!collateralAmount || isCreatingOrder}
          className={`w-full py-3 rounded font-medium transition-colors ${
            isLong 
              ? 'bg-green-600 hover:bg-green-700 disabled:bg-gray-600' 
              : 'bg-red-600 hover:bg-red-700 disabled:bg-gray-600'
          } disabled:cursor-not-allowed`}
        >
          {isCreatingOrder ? 'Creating Order...' : `${isLong ? 'Long' : 'Short'} AVAX`}
        </button>
      </div>
      
      <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-600 rounded">
        <p className="text-yellow-400 text-sm">
          ⚠️ This is high-risk leverage trading. You can lose more than your initial investment.
        </p>
      </div>
    </div>
  )
}