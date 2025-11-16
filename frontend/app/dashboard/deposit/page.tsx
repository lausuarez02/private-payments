"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ZKShieldIcon } from "@/components/zk-shield-icon"
import { PillBase } from "@/components/ui/3d-adaptive-navigation-bar"
import {
  ArrowLeft,
  Lock,
  Loader2,
  CheckCircle2,
  Copy,
  Check,
  Wallet,
  AlertCircle,
  ArrowRight,
  Shield
} from "lucide-react"
import { useAccount } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
import { useERC20Balance, useERC20Allowance, useApproveERC20, useRequestDeposit } from '@/lib/contracts/hooks'
import { CONTRACT_ADDRESSES } from '@/lib/contracts/config'
import { parseUnits, formatUnits } from 'viem'

export default function DepositPage() {
  const [amount, setAmount] = useState("")
  const [copied, setCopied] = useState(false)
  const [currentStep, setCurrentStep] = useState<'input' | 'approve' | 'deposit' | 'complete'>('input')
  const [depositTxHash, setDepositTxHash] = useState<string | null>(null)

  const { address, isConnected } = useAccount()
  const { open } = useAppKit()

  // Get ERC20 balance and allowance
  const { balance, isLoading: isLoadingBalance, refetch: refetchBalance } = useERC20Balance(address)
  const { allowance, refetch: refetchAllowance } = useERC20Allowance(address, CONTRACT_ADDRESSES.ServerEncryptedERC20)

  // Approve and Deposit hooks
  const { approve, isPending: isApproving, isConfirming: isApprovingConfirming, isSuccess: isApproved, hash: approveHash } = useApproveERC20()
  const { requestDeposit, isPending: isDepositing, isConfirming: isDepositConfirming, isSuccess: isDeposited, hash: depositHash } = useRequestDeposit()

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

  // Check if already approved
  const amountInWei = amount ? parseUnits(amount, 18) : BigInt(0)
  const needsApproval = allowance !== undefined && amountInWei > allowance

  const handleApprove = async () => {
    if (!amount || !address) return

    setCurrentStep('approve')
    await approve(CONTRACT_ADDRESSES.ServerEncryptedERC20, amountInWei)
  }

  const handleDeposit = async () => {
    if (!amount || !address) return

    setCurrentStep('deposit')

    // Generate a simple encrypted index (in production, this would be properly encrypted)
    // For now, we'll use a hash of the user's address as a placeholder
    const encryptedIndex = `0x${Buffer.from(address).toString('hex')}` as `0x${string}`

    await requestDeposit(amountInWei, encryptedIndex)
  }

  // Auto-progress through steps
  useEffect(() => {
    if (isApproved && currentStep === 'approve') {
      refetchAllowance()
      // Small delay to let allowance update
      setTimeout(() => {
        handleDeposit()
      }, 1000)
    }
  }, [isApproved, currentStep])

  useEffect(() => {
    if (isDeposited && currentStep === 'deposit') {
      setDepositTxHash(depositHash || null)
      setCurrentStep('complete')
      // Refetch balance after deposit
      setTimeout(() => {
        refetchBalance()
      }, 2000)
    }
  }, [isDeposited, currentStep])

  // Success screen
  if (currentStep === 'complete') {
    return (
      <div className="min-h-screen cyber-grid flex items-center justify-center">
        <Card className="max-w-lg w-full mx-4 border-primary/40">
          <CardContent className="p-12">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center glow-effect">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold">Deposit Complete!</h2>
                <p className="text-muted-foreground text-lg">
                  {amount} USDT deposited and encrypted
                </p>
              </div>
              <div className="w-full space-y-3 p-6 rounded-xl bg-card/50 border border-primary/20">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-mono">{amount} USDT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Privacy</span>
                  <Badge variant="encrypted">
                    <Lock className="w-3 h-3" />
                    Fully Encrypted
                  </Badge>
                </div>
                {depositTxHash && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction</span>
                    <span className="font-mono text-xs">{depositTxHash.slice(0, 8)}...{depositTxHash.slice(-6)}</span>
                  </div>
                )}
              </div>
              <div className="w-full space-y-2">
                <Link href="/dashboard" className="w-full block">
                  <Button className="w-full" size="lg">
                    Back to Dashboard
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={() => {
                    setCurrentStep('input')
                    setAmount("")
                    setDepositTxHash(null)
                  }}
                >
                  Make Another Deposit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

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
            <Shield className="w-12 h-12 text-primary" />
            <h1 className="text-5xl font-bold">Deposit Tokens</h1>
          </div>
          <p className="text-muted-foreground text-xl">
            Deposit USDT into your encrypted balance
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className={`flex items-center gap-2 ${currentStep === 'input' ? 'text-primary' : currentStep === 'approve' || currentStep === 'deposit' ? 'text-green-400' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${currentStep === 'input' ? 'border-primary bg-primary/20' : currentStep === 'approve' || currentStep === 'deposit' ? 'border-green-400 bg-green-400/20' : 'border-muted-foreground/20'}`}>
                {currentStep === 'approve' || currentStep === 'deposit' ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <span className="text-sm font-medium">Amount</span>
            </div>
            <div className={`flex-1 h-0.5 mx-4 ${currentStep === 'approve' || currentStep === 'deposit' ? 'bg-green-400' : 'bg-muted-foreground/20'}`} />
            <div className={`flex items-center gap-2 ${currentStep === 'approve' ? 'text-primary' : currentStep === 'deposit' ? 'text-green-400' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${currentStep === 'approve' ? 'border-primary bg-primary/20' : currentStep === 'deposit' ? 'border-green-400 bg-green-400/20' : 'border-muted-foreground/20'}`}>
                {currentStep === 'deposit' ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <span className="text-sm font-medium">Approve</span>
            </div>
            <div className={`flex-1 h-0.5 mx-4 ${currentStep === 'deposit' ? 'bg-green-400' : 'bg-muted-foreground/20'}`} />
            <div className={`flex items-center gap-2 ${currentStep === 'deposit' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${currentStep === 'deposit' ? 'border-primary bg-primary/20' : 'border-muted-foreground/20'}`}>
                3
              </div>
              <span className="text-sm font-medium">Deposit</span>
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <Card className="border-primary/40 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
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
                onClick={() => refetchBalance()}
                disabled={isLoadingBalance}
              >
                <Loader2 className={`w-5 h-5 ${isLoadingBalance ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Deposit Card */}
        <Card className="border-primary/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Deposit to Encrypted Balance
            </CardTitle>
            <CardDescription>
              Your tokens will be encrypted for maximum privacy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isConnected ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Connect your wallet to deposit</p>
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
                    Amount to Deposit
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      disabled={currentStep !== 'input'}
                      className="text-3xl font-bold h-20 pr-24 border-2 border-primary/20 focus:border-primary/60"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl text-muted-foreground">
                      USDT
                    </span>
                  </div>
                </div>

                {/* Privacy Info */}
                <div className="flex items-center gap-2 p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <Lock className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">Your balance will be fully encrypted on-chain</span>
                </div>

                {/* Transaction Status */}
                {(isApproving || isApprovingConfirming || isDepositing || isDepositConfirming) && (
                  <div className="flex items-center gap-2 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                    <div>
                      <p className="text-sm font-medium text-blue-400">
                        {currentStep === 'approve' && 'Approving tokens...'}
                        {currentStep === 'deposit' && 'Depositing and encrypting...'}
                      </p>
                      {approveHash && currentStep === 'approve' && (
                        <p className="text-xs text-muted-foreground font-mono mt-1">
                          {approveHash.slice(0, 10)}...{approveHash.slice(-8)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                {needsApproval && currentStep === 'input' ? (
                  <Button
                    className="w-full h-16 text-lg glow-effect"
                    size="lg"
                    onClick={handleApprove}
                    disabled={!amount || isApproving || isApprovingConfirming}
                  >
                    {isApproving || isApprovingConfirming ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        Approve {amount || "0"} USDT
                        <ArrowRight className="w-6 h-6" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    className="w-full h-16 text-lg glow-effect"
                    size="lg"
                    onClick={handleDeposit}
                    disabled={!amount || currentStep !== 'input' || isDepositing || isDepositConfirming}
                  >
                    {isDepositing || isDepositConfirming ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Depositing...
                      </>
                    ) : (
                      <>
                        <Lock className="w-6 h-6" />
                        Deposit {amount || "0"} USDT
                      </>
                    )}
                  </Button>
                )}

                <p className="text-xs text-center text-muted-foreground">
                  Network fee: ~$0.10 • You'll need to approve first, then deposit
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <div className="mt-8 p-6 rounded-xl glass-effect border border-primary/20">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            How does deposit work?
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Step 1:</strong> Approve the contract to spend your USDT tokens
            </p>
            <p>
              <strong>Step 2:</strong> Deposit tokens which will be encrypted on-chain
            </p>
            <p>
              <strong>Step 3:</strong> Your encrypted balance will be available for private transfers
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
