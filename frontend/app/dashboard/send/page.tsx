"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ZKShieldIcon } from "@/components/zk-shield-icon"
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  Loader2,
  ArrowRight
} from "lucide-react"

export default function SendPage() {
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleSend = async () => {
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsProcessing(false)
    setShowConfirmation(true)
  }

  if (showConfirmation) {
    return (
      <div className="min-h-screen cyber-grid flex items-center justify-center">
        <Card className="max-w-lg w-full mx-4 border-primary/40">
          <CardContent className="p-12">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center glow-effect">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold">Sent!</h2>
                <p className="text-muted-foreground text-lg">
                  ${amount} sent privately
                </p>
              </div>
              <div className="w-full space-y-3 p-6 rounded-xl bg-card/50 border border-primary/20">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">To</span>
                  <span className="font-mono text-sm">{recipient.slice(0, 8)}...{recipient.slice(-6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Privacy</span>
                  <Badge variant="encrypted">100% Private</Badge>
                </div>
              </div>
              <Link href="/dashboard" className="w-full">
                <Button className="w-full" size="lg">
                  Done
                </Button>
              </Link>
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
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5 text-primary" />
            <ZKShieldIcon className="w-8 h-8" />
            <span className="font-bold text-xl">Encrypted Payments</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4">Send Money</h1>
          <p className="text-muted-foreground text-xl">
            Private. Secure. Instant.
          </p>
        </div>

        {/* Simple Transfer Form */}
        <Card className="border-primary/40">
          <CardContent className="p-8 space-y-8">

            {/* Amount - BIG and prominent */}
            <div className="space-y-3">
              <label className="text-sm text-muted-foreground uppercase tracking-wide">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-4xl text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-5xl font-bold h-24 pl-16 border-2 border-primary/20 focus:border-primary/60"
                />
              </div>
              <p className="text-sm text-muted-foreground text-right">
                Available: $12,455.00
              </p>
            </div>

            {/* Recipient */}
            <div className="space-y-3">
              <label className="text-sm text-muted-foreground uppercase tracking-wide">
                Send To
              </label>
              <Input
                placeholder="Enter wallet address or username"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="h-14 text-lg border-2 border-primary/20 focus:border-primary/60"
              />
            </div>

            {/* Privacy badge */}
            <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-primary/5 border border-primary/20">
              <ZKShieldIcon className="w-5 h-5" />
              <span className="text-sm font-medium">This transfer is completely private</span>
            </div>

            {/* Send Button */}
            <Button
              className="w-full h-16 text-lg glow-effect"
              size="lg"
              onClick={handleSend}
              disabled={!recipient || !amount || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send ${amount || "0"}
                  <ArrowRight className="w-6 h-6" />
                </>
              )}
            </Button>

            {/* Fee info - subtle */}
            <p className="text-xs text-center text-muted-foreground">
              Network fee: ~$0.10
            </p>
          </CardContent>
        </Card>

        {/* Why Private - Simple explanation */}
        <div className="mt-8 p-6 rounded-xl glass-effect border border-primary/20">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <ZKShieldIcon className="w-5 h-5" />
            Why is this private?
          </h3>
          <p className="text-sm text-muted-foreground">
            Unlike regular transfers, no one can see how much you send or who receives it.
            Not even us. Your transaction is protected by advanced encryption.
          </p>
        </div>
      </main>
    </div>
  )
}
