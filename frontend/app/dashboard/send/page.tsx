"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ZKShieldIcon } from "@/components/zk-shield-icon"
import {
  ArrowLeft,
  Send,
  Lock,
  ShieldCheck,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Loader2
} from "lucide-react"

export default function SendPage() {
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [isEncrypted, setIsEncrypted] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleSend = async () => {
    setIsProcessing(true)
    // Simulate ZK proof generation
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
                <h2 className="text-2xl font-bold">Transfer Successful</h2>
                <p className="text-muted-foreground">
                  Your encrypted transaction has been processed successfully
                </p>
              </div>
              <div className="w-full space-y-3 p-4 rounded-lg bg-card/50 border border-primary/20">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sent</span>
                  <span className="font-bold text-primary">{amount} BNB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Recipient</span>
                  <span className="font-mono text-xs">{recipient.slice(0, 6)}...{recipient.slice(-4)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Privacy</span>
                  <Badge variant="encrypted" className="text-xs">
                    <Lock className="w-2 h-2" />
                    100% Encrypted
                  </Badge>
                </div>
              </div>
              <Link href="/dashboard" className="w-full">
                <Button className="w-full">
                  Back to Dashboard
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
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5 text-primary" />
              <ZKShieldIcon className="w-8 h-8" />
              <span className="font-bold text-xl">ZK Payments</span>
            </Link>

            <Badge variant="encrypted">
              <Wallet className="w-3 h-3" />
              0x742d...9a3f
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Send Tokens</h1>
          <p className="text-muted-foreground text-lg">
            Transfer tokens privately and encrypted with Zero-Knowledge
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-5 h-5 text-primary" />
                <CardTitle className="text-base">ZK Encryption</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Amount and recipient fully private
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <CardTitle className="text-base">Verification</CardTitle>
              </div>
              <CardDescription className="text-xs">
                On-chain cryptographic proofs
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5 text-primary" />
                <CardTitle className="text-base">BNB Chain</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Fast and economical
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Transfer Form */}
        <Card className="border-primary/40">
          <CardHeader>
            <CardTitle>Transfer Details</CardTitle>
            <CardDescription>
              Enter your encrypted transfer details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Encryption Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Private Mode Active</p>
                  <p className="text-sm text-muted-foreground">
                    Transaction will be fully encrypted
                  </p>
                </div>
              </div>
              <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-background rounded-full"></div>
              </div>
            </div>

            {/* Recipient Address */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                Recipient Address
                <Badge variant="encrypted" className="text-xs">
                  <Lock className="w-2 h-2" />
                  Encrypted
                </Badge>
              </label>
              <Input
                placeholder="0x..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Address will be encrypted using ZK proofs
              </p>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                Amount
                <Badge variant="encrypted" className="text-xs">
                  <Lock className="w-2 h-2" />
                  Encrypted
                </Badge>
              </label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pr-16 text-lg"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  BNB
                </div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Amount will be hidden on blockchain
                </span>
                <span>Balance: 1,245.50 BNB</span>
              </div>
            </div>

            {/* Fee Estimate */}
            <div className="p-4 rounded-lg bg-card/50 border border-primary/10 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Comisión de Red</span>
                <span>~0.001 BNB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Comisión ZK</span>
                <span>~0.002 BNB</span>
              </div>
              <div className="border-t border-primary/10 pt-2 flex justify-between font-medium">
                <span>Total</span>
                <span className="text-primary">
                  {amount ? (parseFloat(amount) + 0.003).toFixed(3) : "0.003"} BNB
                </span>
              </div>
            </div>

            {/* ZK Proof Info */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/20 border border-primary/20">
              <ShieldCheck className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Generación de Prueba ZK</p>
                <p className="text-xs text-muted-foreground">
                  Se generará una prueba criptográfica que permite verificar la transacción
                  sin revelar el monto ni el destinatario. Este proceso toma aproximadamente 2-3 segundos.
                </p>
              </div>
            </div>

            {/* Send Button */}
            <Button
              className="w-full"
              size="lg"
              onClick={handleSend}
              disabled={!recipient || !amount || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating ZK Proof...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Encrypted Transfer
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="mt-6 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <ZKShieldIcon className="w-8 h-8 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-medium text-sm">Privacy Guaranteed</p>
                <p className="text-xs text-muted-foreground">
                  This transaction uses Zero-Knowledge Proofs to ensure that neither the amount,
                  recipient, nor your balance are publicly revealed on the blockchain.
                  Only you and the recipient will know the transfer details.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
