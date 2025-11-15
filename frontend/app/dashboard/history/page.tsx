"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ZKShieldIcon } from "@/components/zk-shield-icon"
import { PillBase } from "@/components/ui/3d-adaptive-navigation-bar"
import {
  Send,
  ArrowDownToLine,
  Lock
} from "lucide-react"
import { useAccount } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'

export default function HistoryPage() {
  const { address, isConnected } = useAccount()
  const { open } = useAppKit()

  const handleWalletClick = () => {
    open()
  }

  const transactions = [
    {
      id: 1,
      type: "send",
      amount: "125.50",
      to: "0x1234...5678",
      timestamp: "2 hours ago",
      status: "completed"
    },
    {
      id: 2,
      type: "receive",
      amount: "50.00",
      from: "0x8765...4321",
      timestamp: "5 hours ago",
      status: "completed"
    },
    {
      id: 3,
      type: "send",
      amount: "200.00",
      to: "0xabcd...efgh",
      timestamp: "1 day ago",
      status: "completed"
    },
    {
      id: 4,
      type: "receive",
      amount: "75.25",
      from: "0xfedc...ba98",
      timestamp: "2 days ago",
      status: "completed"
    },
    {
      id: 5,
      type: "send",
      amount: "300.00",
      to: "0x9876...5432",
      timestamp: "3 days ago",
      status: "completed"
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
              <span className="font-bold text-xl">ZK Payments</span>
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
              Your encrypted transaction history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map((tx) => (
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
                      <p className="font-medium">
                        {tx.type === "send" ? "Sent to" : "Received from"}
                      </p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {tx.type === "send" ? tx.to : tx.from}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${
                      tx.type === "send" ? "text-red-400" : "text-green-400"
                    }`}>
                      {tx.type === "send" ? "-" : "+"}${tx.amount}
                    </p>
                    <p className="text-sm text-muted-foreground">{tx.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
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
