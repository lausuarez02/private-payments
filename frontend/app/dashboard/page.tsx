"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ZKShieldIcon } from "@/components/zk-shield-icon"
import { Input } from "@/components/ui/input"
import { PillBase } from "@/components/ui/3d-adaptive-navigation-bar"
import {
  Wallet,
  Send,
  ArrowDownToLine,
  History,
  Eye,
  EyeOff,
  Copy,
  Check,
  Lock,
  Loader2,
  Droplet
} from "lucide-react"
import { useAccount } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
import { useUserBalance } from '@/lib/hooks/useBalance'
import { formatUnits } from 'viem'

export default function Dashboard() {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true)
  const [copied, setCopied] = useState(false)
  const { address, isConnected } = useAccount()
  const { open } = useAppKit()

  // Get user's balance from contract
  const { encryptedBalance, decryptedBalance, isLoading, isDecrypting, error, refetch } = useUserBalance()

  const walletAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "0x742d...9a3f"

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

  const recentTransactions = [
    {
      id: 1,
      type: "send",
      amount: "125.50",
      token: "BNB",
      to: "0x1234...5678",
      status: "completed",
      timestamp: "2 hours ago",
      encrypted: true
    },
    {
      id: 2,
      type: "receive",
      amount: "50.00",
      token: "BNB",
      from: "0x8765...4321",
      status: "completed",
      timestamp: "5 hours ago",
      encrypted: true
    },
    {
      id: 3,
      type: "send",
      amount: "200.00",
      token: "BNB",
      to: "0xabcd...efgh",
      status: "pending",
      timestamp: "1 day ago",
      encrypted: true
    }
  ]

  return (
    <div className="min-h-screen cyber-grid">
      {/* Header */}
      <header className="border-b border-primary/20 glass-effect">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
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
      <main className="container mx-auto px-4 py-8">
        {/* Balance Card */}
        <div className="mb-8">
          <Card className="border-primary/40">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {encryptedBalance?.exists ? "Encrypted Balance" : "Balance"}
                  </p>
                  <div className="flex items-center gap-4">
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <h2 className="text-3xl font-bold">Loading...</h2>
                      </div>
                    ) : error ? (
                      <h2 className="text-3xl font-bold text-red-400">Error loading balance</h2>
                    ) : !encryptedBalance?.exists ? (
                      <div>
                        <h2 className="text-5xl font-bold glow-text">0.00</h2>
                        <p className="text-sm text-muted-foreground mt-2">No encrypted balance yet</p>
                      </div>
                    ) : isBalanceVisible ? (
                      encryptedBalance && encryptedBalance.encryptedAmount ? (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-4">
                            <h2 className="text-5xl font-bold glow-text">
                              {decryptedBalance || "••••••"}
                            </h2>
                            <span className="text-2xl text-muted-foreground">USDT</span>
                          </div>
                          {isDecrypting && (
                            <p className="text-xs text-muted-foreground flex items-center gap-2">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Decrypting...
                            </p>
                          )}
                          {!decryptedBalance && !isDecrypting && (
                            <div className="text-xs text-muted-foreground">
                              <p className="font-mono break-all">
                                Encrypted: {encryptedBalance.encryptedAmount.slice(0, 20)}...
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <h2 className="text-5xl font-bold">0.00</h2>
                      )
                    ) : (
                      <h2 className="text-5xl font-bold">••••••</h2>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => refetch()}
                    disabled={isLoading}
                  >
                    <Loader2 className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                    disabled={!encryptedBalance?.exists}
                  >
                    {isBalanceVisible ? (
                      <Eye className="w-5 h-5" />
                    ) : (
                      <EyeOff className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Link href="/dashboard/send" className="block">
                  <Button className="w-full" size="lg">
                    <Send className="w-5 h-5" />
                    Send
                  </Button>
                </Link>
                <Link href="/dashboard/deposit" className="block">
                  <Button variant="outline" size="lg" className="w-full">
                    <ArrowDownToLine className="w-5 h-5" />
                    Deposit
                  </Button>
                </Link>
                <Link href="/dashboard/faucet" className="block">
                  <Button variant="outline" size="lg" className="w-full">
                    <Droplet className="w-5 h-5" />
                    Faucet
                  </Button>
                </Link>
                <Link href="/dashboard/history" className="block">
                  <Button variant="outline" size="lg" className="w-full">
                    <History className="w-5 h-5" />
                    History
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  Recent Transactions
                </CardTitle>
                <CardDescription>
                  Your encrypted transfers history
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-primary/10 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === "send"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-green-500/20 text-green-400"
                    }`}>
                      {tx.type === "send" ? (
                        <Send className="w-5 h-5" />
                      ) : (
                        <ArrowDownToLine className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {tx.type === "send" ? "Sent to" : "Received from"}
                        </p>
                        {tx.encrypted && (
                          <Badge variant="encrypted" className="text-xs">
                            <Lock className="w-2 h-2" />
                            Encrypted
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground font-mono">
                        {tx.type === "send" ? tx.to : tx.from}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      tx.type === "send" ? "text-red-400" : "text-green-400"
                    }`}>
                      {tx.type === "send" ? "-" : "+"}{tx.amount} {tx.token}
                    </p>
                    <p className="text-sm text-muted-foreground">{tx.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
