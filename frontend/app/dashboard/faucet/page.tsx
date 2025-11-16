"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ZKShieldIcon } from "@/components/zk-shield-icon"
import { PillBase } from "@/components/ui/3d-adaptive-navigation-bar"
import {
  ArrowLeft,
  Droplet,
  Loader2,
  CheckCircle2,
  Copy,
  Check,
  Wallet,
  Lock
} from "lucide-react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
import { useERC20Balance } from '@/lib/contracts/hooks'
import { CONTRACT_ADDRESSES } from '@/lib/contracts/config'
import { MockERC20ABI } from '@/lib/contracts/abi'
import { parseUnits, formatUnits } from 'viem'

export default function FaucetPage() {
  const [amount, setAmount] = useState("1000")
  const [copied, setCopied] = useState(false)
  const { address, isConnected } = useAccount()
  const { open } = useAppKit()

  // Get current ERC20 balance
  const { balance, isLoading: isLoadingBalance, refetch } = useERC20Balance(address)

  // Mint function
  const { writeContract, data: hash, isPending, isError, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const walletAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"

  const handleWalletClick = () => {
    open()
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleMint = async () => {
    if (!address || !amount) return

    try {
      const amountInWei = parseUnits(amount, 18) // USDT has 18 decimals

      writeContract({
        address: CONTRACT_ADDRESSES.MockERC20,
        abi: MockERC20ABI,
        functionName: 'mint',
        args: [address, amountInWei],
      })
    } catch (err) {
      console.error('Mint error:', err)
    }
  }

  // Refetch balance when mint is successful
  if (isSuccess) {
    setTimeout(() => {
      refetch()
    }, 1000)
  }

  const quickAmounts = ["100", "500", "1000", "5000"]

  return (
    <div className="min-h-screen cyber-grid">
      {/* Header */}
      <header className="border-b border-primary/20 glass-effect">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5 text-primary" />
              <ZKShieldIcon className="w-8 h-8" />
              <span className="font-bold text-xl">Encrypted Payments</span>
            </Link>

            {/* 3D Navigation Bar */}
            <div className="absolute left-1/2 -translate-x-1/2">
              <PillBase onWalletClick={handleWalletClick} />
            </div>

            <div className="flex items-center gap-4">
              {isConnected ? (
                <>
                  <Badge variant="encrypted">
                    <Lock className="w-3 h-3" />
                    Connected
                  </Badge>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-primary/20">
                    <Wallet className="w-4 h-4 text-primary" />
                    <span className="font-mono text-sm">{walletAddress}</span>
                    <button onClick={copyAddress} className="ml-2">
                      {copied ? (
                        <Check className="w-4 h-4 text-primary" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <Button onClick={() => open()} variant="outline">
                  <Wallet className="w-4 h-4" />
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Droplet className="w-12 h-12 text-primary" />
            <h1 className="text-5xl font-bold">Token Faucet</h1>
          </div>
          <p className="text-muted-foreground text-xl">
            Get free test USDT tokens for testing
          </p>
        </div>

        {/* Current Balance Card */}
        <Card className="border-primary/40 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Your Current Balance</p>
                <div className="flex items-center gap-3">
                  {isLoadingBalance ? (
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  ) : (
                    <>
                      <p className="text-3xl font-bold glow-text">
                        {balance ? formatUnits(balance, 18) : "0"}
                      </p>
                      <span className="text-xl text-muted-foreground">USDT</span>
                    </>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => refetch()}
                disabled={isLoadingBalance}
              >
                <Loader2 className={`w-5 h-5 ${isLoadingBalance ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mint Card */}
        <Card className="border-primary/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplet className="w-5 h-5 text-primary" />
              Mint Test Tokens
            </CardTitle>
            <CardDescription>
              Request free USDT tokens to test the encrypted payment system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isConnected ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Connect your wallet to get test tokens</p>
                <Button onClick={() => open()} size="lg">
                  <Wallet className="w-5 h-5" />
                  Connect Wallet
                </Button>
              </div>
            ) : (
              <>
                {/* Amount Input */}
                <div className="space-y-3">
                  <label className="text-sm text-muted-foreground uppercase tracking-wide">
                    Amount to Mint
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="1000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="text-3xl font-bold h-20 pr-24 border-2 border-primary/20 focus:border-primary/60"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl text-muted-foreground">
                      USDT
                    </span>
                  </div>
                </div>

                {/* Quick Amount Buttons */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Quick amounts:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {quickAmounts.map((quickAmount) => (
                      <Button
                        key={quickAmount}
                        variant="outline"
                        onClick={() => setAmount(quickAmount)}
                        className="font-mono"
                      >
                        {quickAmount}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Success Message */}
                {isSuccess && (
                  <div className="flex items-center gap-2 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-400">Tokens minted successfully!</p>
                      {hash && (
                        <p className="text-xs text-muted-foreground font-mono mt-1">
                          Tx: {hash.slice(0, 10)}...{hash.slice(-8)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {isError && (
                  <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                    <p className="text-sm text-red-400">
                      {error?.message || "Failed to mint tokens"}
                    </p>
                  </div>
                )}

                {/* Mint Button */}
                <Button
                  className="w-full h-16 text-lg glow-effect"
                  size="lg"
                  onClick={handleMint}
                  disabled={!amount || isPending || isConfirming}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Confirming...
                    </>
                  ) : isConfirming ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Minting...
                    </>
                  ) : (
                    <>
                      <Droplet className="w-6 h-6" />
                      Mint {amount} USDT
                    </>
                  )}
                </Button>

                {/* Info */}
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    These are test tokens with no real value
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <div className="mt-8 p-6 rounded-xl glass-effect border border-primary/20">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Droplet className="w-5 h-5 text-primary" />
            What is a faucet?
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              A faucet allows you to get free test tokens for development and testing purposes.
              These tokens have no real value and can only be used on test networks.
            </p>
            <p>
              After minting tokens, you can deposit them into the encrypted payment system
              to test private transfers.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
