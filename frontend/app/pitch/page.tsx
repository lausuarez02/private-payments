"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Lock,
  Building2,
  Users,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Zap,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { BNBLogo } from "@/components/bnb-logo";

export default function PitchPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 11;

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
            <div className="container mx-auto max-w-6xl text-center space-y-12">
              <h1 className="text-7xl md:text-9xl font-bold leading-tight">
                The Future of
                <br />
                <span className="text-primary glow-text">Private Payments</span>
              </h1>
              <p className="text-3xl text-muted-foreground">
                Privacy meets compliance.
              </p>
            </div>
          </div>

          {/* Slide 2: The Problem - Simplified */}
          <div className="min-w-full h-full flex items-center justify-center px-4">
            <div className="container mx-auto max-w-5xl text-center space-y-20">
              <h2 className="text-6xl md:text-8xl font-bold">
                Customers Demand
                <br />
                <span className="text-primary glow-text">Privacy</span>
              </h2>

              <div className="text-5xl font-bold text-primary">
                89%
              </div>

              <p className="text-3xl text-muted-foreground max-w-3xl mx-auto">
                of enterprises cite privacy as a blocker
                <br />
                to blockchain adoption
              </p>
            </div>
          </div>

          {/* Slide 3: Banks Problem - Improved */}
          <div className="min-w-full h-full flex items-center justify-center px-4">
            <div className="container mx-auto max-w-5xl text-center space-y-20">
              <h2 className="text-6xl md:text-8xl font-bold leading-tight">
                Banks Can't Use
                <br />
                <span className="text-red-400">Public Blockchains</span>
              </h2>

              <div className="grid md:grid-cols-3 gap-12 mt-16">
                <div className="space-y-4">
                  <Building2 className="w-20 h-20 text-red-400 mx-auto" />
                  <h3 className="text-2xl font-bold">Banks</h3>
                </div>
                <div className="space-y-4">
                  <Users className="w-20 h-20 text-red-400 mx-auto" />
                  <h3 className="text-2xl font-bold">Payment Processors</h3>
                </div>
                <div className="space-y-4">
                  <Shield className="w-20 h-20 text-red-400 mx-auto" />
                  <h3 className="text-2xl font-bold">Enterprises</h3>
                </div>
              </div>

              <p className="text-3xl font-bold text-red-400 mt-16">
                Privacy is not optional
              </p>
            </div>
          </div>

          {/* Slide 4: The Solution - Minimal */}
          <div className="min-w-full h-full flex items-center justify-center px-4">
            <div className="container mx-auto max-w-6xl text-center space-y-20">
              <h2 className="text-6xl md:text-8xl font-bold leading-tight">
                Privacy for
                <br />
                <span className="text-primary glow-text">B2B Payments</span>
              </h2>

              <div className="grid md:grid-cols-2 gap-16 mt-16 max-w-4xl mx-auto">
                <div className="space-y-4">
                  <Lock className="w-20 h-20 text-primary mx-auto" />
                  <h3 className="text-3xl font-bold">Encrypted</h3>
                </div>
                <div className="space-y-4">
                  <Shield className="w-20 h-20 text-primary mx-auto" />
                  <h3 className="text-3xl font-bold">Compliant</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 5: How It Works - Titles Only */}
          <div className="min-w-full h-full flex items-center justify-center px-4">
            <div className="container mx-auto max-w-4xl space-y-12">
              <h2 className="text-6xl md:text-8xl font-bold text-center mb-20">
                How It <span className="text-primary">Works</span>
              </h2>

              <div className="space-y-8">
                {[
                  { num: "01", title: "KYC Verification" },
                  { num: "02", title: "Deposit Funds" },
                  { num: "03", title: "Private Transfers" },
                  { num: "04", title: "Decrypt & Withdraw" }
                ].map((step) => (
                  <div key={step.num} className="flex items-center gap-12 p-8 glass-effect rounded-2xl border border-primary/20">
                    <div className="text-7xl font-bold text-primary/40">
                      {step.num}
                    </div>
                    <h3 className="text-4xl font-bold flex-1">{step.title}</h3>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Slide 6: Market - Traditional Finance Focus */}
          <div className="min-w-full h-full flex items-center justify-center px-4">
            <div className="container mx-auto max-w-6xl space-y-16">
              <h2 className="text-6xl md:text-8xl font-bold text-center">
                The <span className="text-primary glow-text">Market</span>
              </h2>

              <div className="grid md:grid-cols-2 gap-12">
                <div className="glass-effect rounded-3xl p-12 border border-primary/20 text-center space-y-6">
                  <h3 className="text-3xl font-bold">Global Banking</h3>
                  <div className="text-7xl font-bold text-primary glow-text">$140T</div>
                  <p className="text-xl text-muted-foreground">Assets under management</p>
                </div>

                <div className="glass-effect rounded-3xl p-12 border border-primary/20 text-center space-y-6">
                  <h3 className="text-3xl font-bold">Fintech Market</h3>
                  <div className="text-7xl font-bold text-primary glow-text">$310B</div>
                  <p className="text-xl text-muted-foreground">Market size (2024)</p>
                </div>
              </div>

              <div className="glass-effect rounded-3xl p-12 border border-primary/20 text-center">
                <p className="text-4xl font-bold text-primary mb-4">0.1% Market Share</p>
                <p className="text-5xl font-bold">= $140M ARR</p>
              </div>
            </div>
          </div>

          {/* Slide 7: B2B Focus - Integrations & Support */}
          <div className="min-w-full h-full flex items-center justify-center px-4">
            <div className="container mx-auto max-w-5xl space-y-16">
              <h2 className="text-6xl md:text-8xl font-bold text-center">
                <span className="text-primary glow-text">Enterprise</span> Ready
              </h2>

              <div className="grid md:grid-cols-3 gap-12">
                {[
                  { icon: Zap, title: "API Integrations", subtitle: "Days not months" },
                  { icon: Users, title: "24/7 Support", subtitle: "Dedicated team" },
                  { icon: Shield, title: "Security Audits", subtitle: "Third-party verified" }
                ].map((item, i) => (
                  <div key={i} className="text-center space-y-6">
                    <item.icon className="w-24 h-24 text-primary mx-auto" />
                    <h3 className="text-3xl font-bold">{item.title}</h3>
                    <p className="text-xl text-muted-foreground">{item.subtitle}</p>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-12 mt-16">
                <div className="glass-effect rounded-2xl p-10 border border-primary/20 text-center">
                  <h4 className="text-2xl font-bold mb-4">White-Label</h4>
                  <p className="text-lg text-muted-foreground">Your brand, our privacy</p>
                </div>
                <div className="glass-effect rounded-2xl p-10 border border-primary/20 text-center">
                  <h4 className="text-2xl font-bold mb-4">Compliance</h4>
                  <p className="text-lg text-muted-foreground">KYC built-in from day one</p>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 8: Revenue - Clean & Simple */}
          <div className="min-w-full h-full flex items-center justify-center px-4">
            <div className="container mx-auto max-w-6xl space-y-16">
              <h2 className="text-6xl md:text-8xl font-bold text-center">
                <span className="text-primary glow-text">B2B</span> Revenue
              </h2>

              <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                <div className="glass-effect rounded-3xl p-12 border border-primary/20 text-center space-y-6">
                  <Building2 className="w-16 h-16 text-primary mx-auto" />
                  <h3 className="text-2xl font-bold">Enterprise Licensing</h3>
                  <p className="text-4xl font-bold text-primary">$5K-$50K/mo</p>
                </div>

                <div className="glass-effect rounded-3xl p-12 border border-primary/20 text-center space-y-6">
                  <DollarSign className="w-16 h-16 text-primary mx-auto" />
                  <h3 className="text-2xl font-bold">Revenue Share</h3>
                  <p className="text-4xl font-bold text-primary">0.1-0.2%</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mt-16">
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary mb-2">10-20</div>
                  <div className="text-lg text-muted-foreground">Partners Year 1</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary mb-2">$15M</div>
                  <div className="text-lg text-muted-foreground">ARR Target</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary mb-2">65%</div>
                  <div className="text-lg text-muted-foreground">Gross Margin</div>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 9: Roadmap */}
          <div className="min-w-full h-full flex items-center justify-center px-4">
            <div className="container mx-auto max-w-5xl space-y-12">
              <h2 className="text-6xl md:text-8xl font-bold text-center mb-16">
                <span className="text-primary glow-text">2026</span> Roadmap
              </h2>

              <div className="space-y-8">
                {[
                  { q: "Q1", title: "Pilot Partners", milestone: "3-5 banks" },
                  { q: "Q2", title: "Partner Growth", milestone: "10+ partners" },
                  { q: "Q3", title: "Scale", milestone: "100K users" },
                  { q: "Q4", title: "Market Leader", milestone: "$15M ARR" }
                ].map((phase, i) => (
                  <div key={i} className="flex items-center gap-8 glass-effect rounded-2xl p-8 border border-primary/20">
                    <div className="text-5xl font-bold text-primary w-32">
                      {phase.q}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold mb-2">{phase.title}</h3>
                      <p className="text-xl text-muted-foreground">{phase.milestone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Slide 10: The Team */}
          <div className="min-w-full h-full flex items-center justify-center px-4">
            <div className="container mx-auto max-w-6xl space-y-16">
              <h2 className="text-6xl md:text-8xl font-bold text-center">
                The <span className="text-primary glow-text">Team</span>
              </h2>

              <div className="grid md:grid-cols-3 gap-12">
                {/* Lautaro */}
                <div className="text-center space-y-6">
                  <div className="w-48 h-48 mx-auto rounded-full glass-effect border-4 border-primary/20 overflow-hidden">
                    <Image
                      src="/lau.jpeg"
                      alt="Lautaro"
                      width={192}
                      height={192}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold mb-2">Lautaro</h3>
                    <p className="text-xl text-primary mb-3">Co-Founder</p>
                    <div className="space-y-2 text-muted-foreground">
                      <p className="text-lg">Physics Background</p>
                      <p className="text-lg">ML in Banking</p>
                    </div>
                  </div>
                </div>

                {/* Tomas */}
                <div className="text-center space-y-6">
                  <div className="w-48 h-48 mx-auto rounded-full glass-effect border-4 border-primary/20 overflow-hidden">
                    <Image
                      src="/tomi.jpeg"
                      alt="Tomas"
                      width={192}
                      height={192}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold mb-2">Tomas</h3>
                    <p className="text-xl text-primary mb-3">Smart Contract Engineer</p>
                    <div className="space-y-2 text-muted-foreground">
                      <p className="text-lg">ZK Expert</p>
                      <p className="text-lg">FHE Development</p>
                    </div>
                  </div>
                </div>

                {/* Alejandro */}
                <div className="text-center space-y-6">
                  <div className="w-48 h-48 mx-auto rounded-full glass-effect border-4 border-primary/20 overflow-hidden">
                    <Image
                      src="/ale.jpeg"
                      alt="Alejandro"
                      width={192}
                      height={192}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold mb-2">Alejandro</h3>
                    <p className="text-xl text-primary mb-3">Co-Founder & SC Engineer</p>
                    <div className="space-y-2 text-muted-foreground">
                      <p className="text-lg">Smart Contracts</p>
                      <p className="text-lg">Blockchain Architecture</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 11: Final CTA */}
          <div className="min-w-full h-full flex items-center justify-center px-4">
            <div className="container mx-auto max-w-4xl text-center space-y-16">
              <h2 className="text-6xl md:text-9xl font-bold leading-tight">
                Partner with
                <br />
                <span className="text-primary glow-text">Privacy Leaders</span>
              </h2>

              <p className="text-3xl text-muted-foreground max-w-2xl mx-auto">
                Give your customers the privacy they demand
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                <Link href="/dashboard">
                  <Button size="lg" className="text-xl px-16 h-20 glow-effect">
                    Try Platform
                    <ArrowRight className="w-6 h-6 ml-2" />
                  </Button>
                </Link>
                <Link href="/">
                  <Button size="lg" variant="outline" className="text-xl px-16 h-20">
                    Partner With Us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="glass-effect rounded-full p-4 border border-primary/20 flex items-center gap-6">
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
