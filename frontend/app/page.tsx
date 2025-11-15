"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ZKShieldIcon } from "@/components/zk-shield-icon";
import { Shield, Lock, Eye, ArrowRight, Globe, Send } from "lucide-react";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { WorldMap } from "@/components/ui/world-map";
import { BNBLogo } from "@/components/bnb-logo";

export default function Home() {
  // Global transaction points for the world map
  const dots = [
    { start: { lat: 40.7128, lng: -74.0060 }, end: { lat: 51.5074, lng: -0.1278 } }, // NY to London
    { start: { lat: 35.6762, lng: 139.6503 }, end: { lat: -33.8688, lng: 151.2093 } }, // Tokyo to Sydney
    { start: { lat: 51.5074, lng: -0.1278 }, end: { lat: 1.3521, lng: 103.8198 } }, // London to Singapore
    { start: { lat: -23.5505, lng: -46.6333 }, end: { lat: 19.4326, lng: -99.1332 } }, // São Paulo to Mexico City
    { start: { lat: 55.7558, lng: 37.6173 }, end: { lat: 25.2048, lng: 55.2708 } }, // Moscow to Dubai
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Gradient Background */}
      <div className="fixed inset-0 cyber-grid">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col items-center text-center space-y-12">
              {/* Badge */}
              <Badge variant="encrypted" className="text-sm animate-fade-in">
                <Lock className="w-3 h-3" />
                Enterprise-Grade Zero-Knowledge
              </Badge>

              {/* Main Title with Animation */}
              <div className="space-y-6 max-w-5xl">
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold leading-[1.1]">
                  <VerticalCutReveal
                    splitBy="words"
                    staggerDuration={0.1}
                    staggerFrom="first"
                  >
                    Private
                  </VerticalCutReveal>
                  {" "}
                  <span className="text-primary glow-text">
                    <VerticalCutReveal
                      splitBy="words"
                      staggerDuration={0.1}
                      staggerFrom="first"
                      transition={{ delay: 0.2 }}
                    >
                      Payments
                    </VerticalCutReveal>
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light">
                  Enterprise payments with ZK encryption + KYC compliance.
                  <br />
                  Built for businesses on BNB Chain.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8">
                <Link href="/dashboard">
                  <Button size="lg" className="text-lg px-8 h-14 glow-effect">
                    Get Started
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* World Map Section */}
        <section className="container mx-auto px-4 py-32 max-w-7xl">
          <div className="relative">
            {/* Content */}
            <div className="relative space-y-12">
              {/* Title */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-primary/20 mb-4">
                  <Globe className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">ZK Payments Global Network</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-bold">
                  Enterprise Payments
                  <br />
                  <span className="text-primary glow-text">Globally Compliant</span>
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                  Private cross-border transfers with built-in KYC compliance.
                  <br />
                  Enterprise-grade security meets regulatory standards.
                </p>
              </div>

              {/* World Map */}
              <div className="relative bg-background rounded-2xl overflow-hidden">
                <WorldMap dots={dots} lineColor="#00ff64" />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
                {[
                  { value: "Enterprise", label: "KYC Verified" },
                  { value: "100%", label: "Private" },
                  { value: "<3s", label: "Settlement" },
                  { value: "195+", label: "Countries" }
                ].map((stat, i) => (
                  <div key={i} className="text-center space-y-2">
                    <div className="text-3xl md:text-4xl font-bold text-primary glow-text">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Scroll Animation Section */}
        <ContainerScroll
          titleComponent={
            <div className="space-y-4">
              <h2 className="text-4xl md:text-6xl font-bold">
                <span className="text-primary">Security</span> you can see
              </h2>
              <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
                Intuitive interface with military-grade encryption
              </p>
            </div>
          }
        >
          <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-card via-card to-primary/5 border border-primary/20">
            {/* Dashboard Preview Mock */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-primary/20">
                <div className="flex items-center gap-2">
                  <ZKShieldIcon className="w-6 h-6" />
                  <span className="font-bold">ZK Payments</span>
                </div>
                <Badge variant="encrypted">
                  <Lock className="w-3 h-3" />
                  Connected
                </Badge>
              </div>

              <div className="glass-effect rounded-xl p-8 space-y-4">
                <p className="text-sm text-muted-foreground">Encrypted Balance</p>
                <div className="text-5xl font-bold glow-text">1,245.50</div>
                <p className="text-2xl text-muted-foreground">BNB</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="glass-effect rounded-lg p-4 text-center">
                  <Send className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-sm">Send</p>
                </div>
                <div className="glass-effect rounded-lg p-4 text-center opacity-70">
                  <Eye className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-sm">Receive</p>
                </div>
                <div className="glass-effect rounded-lg p-4 text-center opacity-50">
                  <Lock className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-sm">Encrypt</p>
                </div>
              </div>
            </div>
          </div>
        </ContainerScroll>

        {/* Features Grid - Minimal */}
        <section className="container mx-auto px-4 py-32 max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-primary">Why</span> ZK?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: "ZK Encryption", desc: "Zero-Knowledge privacy" },
              { icon: Lock, title: "KYC Compliant", desc: "Enterprise compliance" },
              { icon: Eye, title: "Private Transfers", desc: "Confidential amounts" },
              { icon: BNBLogo, title: "BNB Chain", desc: "Fast & economical" }
            ].map((feature, i) => (
              <div key={i} className="group relative">
                <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl group-hover:bg-primary/10 transition-all" />
                <div className="relative glass-effect rounded-2xl p-8 hover:border-primary/40 transition-all space-y-4">
                  <feature.icon className="w-12 h-12 text-primary" />
                  <div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it Works - Minimal */}
        <section className="container mx-auto px-4 py-32 max-w-5xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Simple. <span className="text-primary">Compliant.</span> Private.
            </h2>
          </div>

          <div className="space-y-8">
            {[
              { num: "01", title: "KYC Verification", desc: "Complete enterprise onboarding" },
              { num: "02", title: "Encrypt Tokens", desc: "ZK-encrypted assets" },
              { num: "03", title: "Private Transfer", desc: "Compliant & confidential" }
            ].map((step) => (
              <div key={step.num} className="group flex items-center gap-8 glass-effect rounded-2xl p-8 hover:border-primary/40 transition-all">
                <div className="text-7xl font-bold text-primary/20 group-hover:text-primary/40 transition-all">
                  {step.num}
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-lg">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* KYC & Compliance Section */}
        <section className="container mx-auto px-4 py-32 max-w-6xl">
          <div className="glass-effect rounded-3xl p-12 md:p-16 border-primary/20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Regulatory Compliance</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold">
                  Privacy <span className="text-primary">+</span> Compliance
                </h2>
                <p className="text-lg text-muted-foreground">
                  ZK Payments combines Zero-Knowledge encryption with enterprise-grade KYC verification.
                  Your business gets complete transaction privacy while maintaining full regulatory compliance.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    title: "Enterprise KYC",
                    desc: "Full business verification and compliance documentation"
                  },
                  {
                    title: "Regulatory Ready",
                    desc: "Built to meet international financial regulations"
                  },
                  {
                    title: "Audit Trail",
                    desc: "Encrypted but auditable transaction records"
                  },
                  {
                    title: "Corporate Controls",
                    desc: "Multi-signature wallets and role-based permissions"
                  }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-card/50 border border-primary/10">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA - Minimal */}
        <section className="container mx-auto px-4 py-32 max-w-4xl">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-3xl" />
            <div className="relative glass-effect rounded-3xl p-16 text-center space-y-8 border-primary/40">
              <h2 className="text-4xl md:text-6xl font-bold">
                Ready for <span className="text-primary glow-text">Enterprise</span> Privacy?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join businesses using ZK Payments for compliant, private transfers
              </p>
              <Link href="/dashboard">
                <Button size="lg" className="text-lg px-12 h-16 glow-effect">
                  Access Now
                  <ArrowRight className="w-6 h-6 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer - Ultra Minimal */}
        <footer className="border-t border-primary/10 mt-32">
          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3">
                <ZKShieldIcon className="w-8 h-8" />
                <span className="text-2xl font-bold">ZK Payments</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Powered by Zero-Knowledge on</span>
                <BNBLogo className="w-4 h-4 text-primary" />
                <span>BNB Chain</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
