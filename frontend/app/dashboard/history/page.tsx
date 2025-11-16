"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ZKShieldIcon } from "@/components/zk-shield-icon"
import { PillBase } from "@/components/ui/3d-adaptive-navigation-bar"
import {
  Send,
  ArrowDownToLine,
  Lock,
  Loader2,
  ExternalLink,
  Shield,
  CheckCircle2
} from "lucide-react"
import { useAccount } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
import { useTransactionHistory } from '@/lib/hooks/useTransactionHistory'

export default function HistoryPage() {
  const { address, isConnected } = useAccount()
  const { open } = useAppKit()
  const { transactions, isLoading, error } = useTransactionHistory()

  const handleWalletClick = () => {
    open()
  }

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return 'Unknown time';

    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString();
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownToLine className="w-5 h-5" />;
      case 'balance_stored':
        return <Lock className="w-5 h-5" />;
      case 'authenticated':
        return <Shield className="w-5 h-5" />;
      default:
        return <Send className="w-5 h-5" />;
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'bg-green-500/20 text-green-400';
      case 'balance_stored':
        return 'bg-blue-500/20 text-blue-400';
      case 'authenticated':
        return 'bg-purple-500/20 text-purple-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  }

  const getTransactionTitle = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Deposit Requested';
      case 'balance_stored':
        return 'Balance Encrypted & Stored';
      case 'authenticated':
        return 'User Authenticated';
      default:
        return 'Transaction';
    }
  }

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
              {isConnected && address && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-primary/20">
                  <span className="font-mono text-sm">{`${address.slice(0, 6)}...${address.slice(-4)}`}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Transaction History</h1>
          <p className="text-muted-foreground text-lg">
            All your private transfers
          </p>
        </div>

        {/* Transactions */}
        <Card className="border-primary/40">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Activity</span>
              <Badge variant="encrypted">
                <Lock className="w-3 h-3" />
                100% Private
              </Badge>
            </CardTitle>
            <CardDescription>
              Your encrypted transaction history on-chain
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isConnected ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Connect your wallet to view transaction history</p>
                <Button onClick={() => open()}>
                  Connect Wallet
                </Button>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-400">{error}</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No transactions yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start by depositing tokens or making a transfer
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-start justify-between p-4 rounded-lg bg-card/50 border border-primary/10 hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getTransactionColor(tx.type)}`}>
                        {getTransactionIcon(tx.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{getTransactionTitle(tx.type)}</p>
                          <Badge variant="outline" className="text-xs">
                            Block {tx.blockNumber.toString()}
                          </Badge>
                        </div>

                        {/* Transaction Details */}
                        <div className="space-y-1 text-sm">
                          {tx.requestId && (
                            <p className="text-muted-foreground font-mono text-xs">
                              ID: {tx.requestId.slice(0, 10)}...{tx.requestId.slice(-8)}
                            </p>
                          )}
                          {tx.encryptedAmount && (
                            <p className="text-muted-foreground font-mono text-xs truncate">
                              Encrypted: {tx.encryptedAmount.slice(0, 20)}...
                            </p>
                          )}
                          {tx.user && tx.user !== '0x0000000000000000000000000000000000000000' && (
                            <p className="text-muted-foreground font-mono text-xs">
                              User: {tx.user.slice(0, 6)}...{tx.user.slice(-4)}
                            </p>
                          )}
                        </div>

                        {/* Transaction Hash Link */}
                        <a
                          href={`https://testnet.bscscan.com/tx/${tx.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span className="font-mono">{tx.transactionHash.slice(0, 8)}...{tx.transactionHash.slice(-6)}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-sm text-muted-foreground">
                        {formatTimestamp(tx.timestamp)}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-green-400 mt-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Confirmed</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <div className="mt-8 p-6 rounded-xl glass-effect border border-primary/20">
          <div className="flex items-start gap-3">
            <ZKShieldIcon className="w-6 h-6 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">Complete Privacy</h3>
              <p className="text-sm text-muted-foreground">
                All transaction amounts and recipients are encrypted. Only you can see the details of your transfers.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
