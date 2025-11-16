"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Lock,
  Eye,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Building2,
  Users,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Zap,
  Target,
  Wallet,
  FileCheck,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { BNBLogo } from "@/components/bnb-logo";

export default function PitchPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 10;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && currentSlide < totalSlides - 1) {
        setCurrentSlide(currentSlide + 1);
      } else if (e.key === "ArrowLeft" && currentSlide > 0) {
        setCurrentSlide(currentSlide - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide]);

  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Gradient Background */}
      <div className="fixed inset-0 cyber-grid">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Slides Container */}
      <div className="relative z-10 h-full w-full">
        <div
          className="flex h-full w-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {/* Slide 1: Title */}
          <div className="min-w-full h-full flex items-center justify-center px-4">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center space-y-8">
                <Badge variant="encrypted" className="text-sm animate-fade-in">
                  <Lock className="w-3 h-3" />
                  Investor Pitch Deck
                </Badge>

                <h1 className="text-6xl md:text-8xl font-bold leading-tight">
                  The Future of
                  <br />
                  <span className="text-primary glow-text">Private Payments</span>
                </h1>

                <p className="text-2xl md:text-3xl text-muted-foreground max-w-3xl mx-auto">
                  Enterprise-grade encrypted payments on BNB Chain.
                  <br />
                  Privacy meets compliance.
                </p>

                <div className="pt-8">
                  <p className="text-lg text-muted-foreground/60">
                    Press → or click arrows to navigate
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 2: Customer Demand */}
          <div className="min-w-full h-full flex items-center justify-center px-4">
            <div className="container mx-auto max-w-6xl">
              <div className="space-y-12">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-primary/20 mb-4">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Market Reality</span>
                  </div>
                  <h2 className="text-5xl md:text-7xl font-bold">
                    Customers <span className="text-primary glow-text">Demand Privacy</span>
                  </h2>
                  <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                    Your clients don't want their financial activity exposed on public blockchains
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="glass-effect rounded-2xl p-10 border border-primary/20 space-y-6">
                    <h3 className="text-3xl font-bold">What Customers Want</h3>
                    <ul className="space-y-4">
                      {[
                        "Hide account balances from public view",
                        "Keep transaction amounts private",
                        "Protect business cash flow data",
                        "Prevent competitor surveillance",
                        "Avoid becoming hacker targets"
                      ].map((demand, i) => (
                        <li key={i} className="flex items-start gap-3 text-lg">
                          <CheckCircle className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                          <span>{demand}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="glass-effect rounded-2xl p-10 border border-primary/20 space-y-6">
                    <h3 className="text-3xl font-bold">The Problem for Banks</h3>
                    <ul className="space-y-4">
                      {[
                        "Can't use public blockchains",
                        "Balance exposure = security risk",
                        "Regulatory privacy requirements",
                        "Client confidentiality mandates",
                        "Losing customers to privacy concerns"
                      ].map((problem, i) => (
                        <li key={i} className="flex items-start gap-3 text-lg">
                          <AlertTriangle className="w-6 h-6 text-red-400 mt-0.5 flex-shrink-0" />
                          <span>{problem}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="glass-effect rounded-2xl p-8 border border-primary/20 text-center">
                  <p className="text-3xl font-bold text-primary mb-2">
                    89% of enterprises cite privacy as a blocker to blockchain adoption
                  </p>
                  <p className="text-lg text-muted-foreground">
                    Source: Deloitte Global Blockchain Survey 2023
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 3: The B2B Problem */}
          <div className="min-w-full h-full flex items-center justify-center px-4">
            <div className="container mx-auto max-w-6xl">
              <div className="space-y-12">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-red-500/20 mb-4">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-medium">The Problem</span>
                  </div>
                  <h2 className="text-5xl md:text-7xl font-bold">
                    Banks Can't Use <span className="text-red-400">Public Blockchains</span>
                  </h2>
                  <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                    Financial institutions need blockchain efficiency WITHOUT transparency
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    {
                      icon: Building2,
                      title: "Banks & Financial Institutions",
                      desc: "Can't expose client balances, transaction volumes, or institutional holdings on public ledgers",
                      color: "text-red-400"
                    },
                    {
                      icon: Users,
                      title: "Payment Processors",
                      desc: "Merchant transaction data and volumes visible to competitors and bad actors",
                      color: "text-red-400"
                    },
                    {
                      icon: Target,
                      title: "Enterprise Clients",
                      desc: "B2B payments expose supplier relationships, cash positions, and business strategy",
                      color: "text-red-400"
                    }
                  ].map((problem, i) => (
                    <div key={i} className="glass-effect rounded-2xl p-8 border border-red-500/20 space-y-4">
                      <problem.icon className={`w-12 h-12 ${problem.color}`} />
                      <div>
                        <h3 className="text-xl font-bold mb-2">{problem.title}</h3>
                        <p className="text-sm text-muted-foreground">{problem.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="glass-effect rounded-2xl p-8 border border-red-500/20 text-center">
                  <p className="text-3xl font-bold text-red-400 mb-2">
                    No bank wants their balance sheet on a public blockchain
                  </p>
                  <p className="text-lg text-muted-foreground">
                    Privacy is not optional - it's a requirement
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 4: The Solution */}
          <div className="min-w-full h-full flex items-center justify-center px-4">
            <div className="container mx-auto max-w-6xl">
              <div className="space-y-12">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-primary/20 mb-4">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Our Solution</span>
                  </div>
                  <h2 className="text-5xl md:text-7xl font-bold">
                    Privacy for <span className="text-primary glow-text">B2B Payments</span>
                  </h2>
                  <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                    Give your business clients the privacy they demand while maintaining full compliance
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {[
                    {
                      icon: Lock,
                      title: "Encrypted Balances",
                      desc: "Your balance is encrypted on-chain. Only you can decrypt and see your funds.",
                      features: ["AES-256-GCM encryption", "Zero-knowledge proofs", "On-chain storage"]
                    },
                    {
                      icon: Shield,
                      title: "KYC Compliant",
                      desc: "Built-in enterprise KYC verification for regulatory compliance.",
                      features: ["Enterprise verification", "Audit trails", "Regulatory ready"]
                    },
                    {
                      icon: Zap,
                      title: "Fast & Cheap",
                      desc: "Built on BNB Chain for lightning-fast, low-cost transactions.",
                      features: ["<3s settlement", "Low gas fees", "High throughput"]
                    },
                    {
                      icon: Users,
                      title: "Business Ready",
                      desc: "Multi-signature wallets and role-based permissions for enterprises.",
                      features: ["Multi-sig support", "Team permissions", "Corporate controls"]
                    }
                  ].map((solution, i) => (
                    <div key={i} className="glass-effect rounded-2xl p-6 border border-primary/20 space-y-3">
                      <solution.icon className="w-10 h-10 text-primary" />
                      <div>
                        <h3 className="text-xl font-bold mb-2">{solution.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{solution.desc}</p>
                        <ul className="space-y-1">
                          {solution.features.map((feature, j) => (
                            <li key={j} className="flex items-center gap-2 text-xs">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Slide 5: How It Works */}
          <div className="min-w-full h-full flex items-center justify-center px-4">
            <div className="container mx-auto max-w-5xl">
              <div className="space-y-12">
                <div className="text-center space-y-4">
                  <h2 className="text-5xl md:text-7xl font-bold">
                    How It <span className="text-primary">Works</span>
                  </h2>
                  <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                    Simple for your clients, powerful for your business
                  </p>
                </div>

                <div className="space-y-6">
                  {[
                    {
                      num: "01",
                      title: "KYC Verification",
                      desc: "Complete one-time enterprise onboarding and verification",
                      tech: "Enterprise-grade identity verification"
                    },
                    {
                      num: "02",
                      title: "Deposit Funds",
                      desc: "Deposit your tokens - they're instantly encrypted with AES-256-GCM",
                      tech: "Server-assisted encryption with symmetric keys"
                    },
                    {
                      num: "03",
                      title: "Private Transfers",
                      desc: "Send encrypted payments - amounts are hidden, compliance is maintained",
                      tech: "Zero-knowledge proofs + encrypted balances"
                    },
                    {
                      num: "04",
                      title: "Decrypt & Withdraw",
                      desc: "Only you can decrypt your balance and withdraw your funds",
                      tech: "Client-side decryption with your private key"
                    }
                  ].map((step) => (
                    <div key={step.num} className="group flex items-start gap-6 glass-effect rounded-2xl p-6 hover:border-primary/40 transition-all">
                      <div className="text-5xl font-bold text-primary/20 group-hover:text-primary/40 transition-all">
                        {step.num}
                      </div>
                      <div className="flex-1 space-y-1">
                        <h3 className="text-2xl font-bold">{step.title}</h3>
                        <p className="text-muted-foreground">{step.desc}</p>
                        <p className="text-sm text-primary/60">{step.tech}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Slide 6: Market Opportunity */}
          <div className="min-w-full h-full flex items-center justify-center px-4">
            <div className="container mx-auto max-w-6xl">
              <div className="space-y-12">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-primary/20 mb-4">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">B2B Market</span>
                  </div>
                  <h2 className="text-5xl md:text-7xl font-bold">
                    Massive <span className="text-primary glow-text">B2B Opportunity</span>
                  </h2>
                  <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                    Banks and enterprises need privacy to serve their customers
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    {
                      value: "$1.8T",
                      label: "Daily Crypto Volume",
                      desc: "Total addressable market"
                    },
                    {
                      value: "$156B",
                      label: "Cross-Border Payments",
                      desc: "Annual market (2024)"
                    },
                    {
                      value: "78%",
                      label: "Privacy Demand",
                      desc: "Businesses wanting private txs"
                    }
                  ].map((stat, i) => (
                    <div key={i} className="glass-effect rounded-2xl p-8 border border-primary/20 text-center space-y-4">
                      <div className="text-6xl font-bold text-primary glow-text">
                        {stat.value}
                      </div>
                      <div>
                        <div className="text-xl font-bold mb-1">{stat.label}</div>
                        <div className="text-sm text-muted-foreground">{stat.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Slide 7: B2B Use Cases */}
          <div className="min-w-full h-full flex items-center justify-center px-4">
            <div className="container mx-auto max-w-6xl">
              <div className="space-y-12">
                <div className="text-center space-y-4">
                  <h2 className="text-5xl md:text-7xl font-bold">
                    B2B <span className="text-primary glow-text">Use Cases</span>
                  </h2>
                  <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                    Built for businesses serving customers who demand privacy
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="glass-effect rounded-2xl p-10 border border-primary/20 space-y-6">
                    <h3 className="text-3xl font-bold">Primary Targets (B2B)</h3>
                    <ul className="space-y-4">
                      {[
                        "Digital Banks & Neobanks - Need privacy to compete with traditional banks",
                        "Payment Processors - Protect merchant transaction data",
                        "Crypto Exchanges - Institutional clients require privacy",
                        "Corporate Treasury - B2B payments without exposure",
                        "Fintech Platforms - Privacy-as-a-service for end users"
                      ].map((market, i) => (
                        <li key={i} className="flex items-start gap-3 text-lg">
                          <Building2 className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                          <span>{market}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="glass-effect rounded-2xl p-10 border border-primary/20 space-y-6">
                    <h3 className="text-3xl font-bold">Why They Choose Us</h3>
                    <ul className="space-y-4">
                      {[
                        "White-label ready - Your brand, our privacy",
                        "API-first - Integrate in days, not months",
                        "KYC built-in - Compliance from day one",
                        "Customer retention - Privacy = competitive advantage",
                        "Revenue share - Monetize privacy features"
                      ].map((advantage, i) => (
                        <li key={i} className="flex items-start gap-3 text-lg">
                          <Zap className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                          <span>{advantage}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 8: B2B Business Model */}
          <div className="min-w-full h-full flex items-center justify-center px-4">
            <div className="container mx-auto max-w-6xl">
              <div className="space-y-12">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-primary/20 mb-4">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">B2B Revenue Model</span>
                  </div>
                  <h2 className="text-5xl md:text-7xl font-bold">
                    Recurring <span className="text-primary glow-text">B2B Revenue</span>
                  </h2>
                  <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                    Enterprise SaaS + transaction fees from partner networks
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {[
                    {
                      icon: Building2,
                      title: "Enterprise Licensing",
                      desc: "$5K-$50K/month per bank or payment processor",
                      revenue: "Primary B2B revenue stream"
                    },
                    {
                      icon: Wallet,
                      title: "Revenue Share",
                      desc: "0.1-0.2% of partner transaction volume",
                      revenue: "Scales with partner growth"
                    },
                    {
                      icon: FileCheck,
                      title: "White-Label Premium",
                      desc: "Custom branding + dedicated infrastructure",
                      revenue: "$25K-$100K setup + monthly fee"
                    },
                    {
                      icon: Users,
                      title: "API Platform",
                      desc: "Pay-per-transaction for fintech integrations",
                      revenue: "$0.01-$0.05 per encrypted tx"
                    }
                  ].map((model, i) => (
                    <div key={i} className="glass-effect rounded-2xl p-8 border border-primary/20 space-y-4">
                      <model.icon className="w-12 h-12 text-primary" />
                      <div>
                        <h3 className="text-2xl font-bold mb-2">{model.title}</h3>
                        <p className="text-muted-foreground mb-2">{model.desc}</p>
                        <p className="text-sm text-primary font-semibold">{model.revenue}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="glass-effect rounded-2xl p-8 border border-primary/20">
                  <div className="grid md:grid-cols-3 gap-8 text-center">
                    <div>
                      <div className="text-4xl font-bold text-primary mb-2">10-20</div>
                      <div className="text-sm text-muted-foreground">Enterprise Partners Year 1</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-primary mb-2">$15M ARR</div>
                      <div className="text-sm text-muted-foreground">Target Year 1 (B2B Focus)</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-primary mb-2">65%</div>
                      <div className="text-sm text-muted-foreground">Gross Margin (SaaS)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 9: B2B Roadmap */}
          <div className="min-w-full h-full flex items-center justify-center px-4">
            <div className="container mx-auto max-w-6xl">
              <div className="space-y-10">
                <div className="text-center space-y-4">
                  <h2 className="text-5xl md:text-7xl font-bold">
                    B2B <span className="text-primary glow-text">Go-to-Market</span>
                  </h2>
                </div>

                <div className="space-y-6">
                  {[
                    {
                      quarter: "Q1 2026",
                      title: "Pilot Partners",
                      items: ["3-5 digital banks pilot program", "White-label SDK launch", "First partner integration live"]
                    },
                    {
                      quarter: "Q2 2026",
                      title: "Partner Growth",
                      items: ["10+ enterprise partners", "API marketplace launch", "Revenue share model proven"]
                    },
                    {
                      quarter: "Q3 2026",
                      title: "Scale Infrastructure",
                      items: ["Multi-region deployment", "Partner portal + analytics", "100K+ end users via partners"]
                    },
                    {
                      quarter: "Q4 2026",
                      title: "Market Leader",
                      items: ["50+ enterprise partners", "$15M ARR from B2B", "Series A for expansion"]
                    }
                  ].map((phase, i) => (
                    <div key={i} className="glass-effect rounded-2xl p-6 border border-primary/20">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-40">
                          <div className="text-3xl font-bold text-primary">{phase.quarter}</div>
                          <div className="text-lg font-semibold mt-1">{phase.title}</div>
                        </div>
                        <div className="flex-1">
                          <ul className="grid md:grid-cols-3 gap-4">
                            {phase.items.map((item, j) => (
                              <li key={j} className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Slide 10: Final CTA */}
          <div className="min-w-full h-full flex items-center justify-center px-4">
            <div className="container mx-auto max-w-4xl">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-3xl" />
                <div className="relative glass-effect rounded-3xl p-16 text-center space-y-8 border-primary/40">
                  <h2 className="text-5xl md:text-7xl font-bold">
                    Partner with <span className="text-primary glow-text">Privacy Leaders</span>
                  </h2>
                  <p className="text-2xl text-muted-foreground max-w-2xl mx-auto">
                    Give your customers the privacy they demand. Win in the B2B blockchain market.
                  </p>

                  <div className="glass-effect rounded-2xl p-8 border border-primary/20 text-left max-w-xl mx-auto">
                    <h3 className="text-xl font-bold mb-4 text-center">Ready to Offer Privacy?</h3>
                    <ul className="space-y-3">
                      {[
                        "White-label solution in 30 days",
                        "No upfront integration costs",
                        "Revenue share from day one",
                        "Full technical support"
                      ].map((benefit, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Link href="/dashboard">
                      <Button size="lg" className="text-lg px-12 h-16 glow-effect">
                        Try Platform
                        <ArrowRight className="w-6 h-6 ml-2" />
                      </Button>
                    </Link>
                    <Link href="/">
                      <Button size="lg" variant="outline" className="text-lg px-12 h-16">
                        Partner With Us
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="glass-effect rounded-full p-4 border border-primary/20 flex items-center gap-6">
          {/* Previous Button */}
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className={`p-3 rounded-full transition-all ${
              currentSlide === 0
                ? "opacity-30 cursor-not-allowed"
                : "hover:bg-primary/20 hover:border-primary/40 border border-transparent"
            }`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Slide Indicators */}
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all rounded-full ${
                  index === currentSlide
                    ? "w-8 h-3 bg-primary"
                    : "w-3 h-3 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={nextSlide}
            disabled={currentSlide === totalSlides - 1}
            className={`p-3 rounded-full transition-all ${
              currentSlide === totalSlides - 1
                ? "opacity-30 cursor-not-allowed"
                : "hover:bg-primary/20 hover:border-primary/40 border border-transparent"
            }`}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Slide Counter */}
      <div className="fixed top-8 right-8 z-50 glass-effect rounded-full px-6 py-3 border border-primary/20">
        <span className="text-sm font-medium">
          {currentSlide + 1} / {totalSlides}
        </span>
      </div>
    </div>
  );
}
