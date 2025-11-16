# ZK Payments - Privacy-Preserving Payment System

A privacy-focused payment platform built on BNB Smart Chain that enables encrypted transfers for enterprises, banks, and payment processors. Solving the #1 blocker to enterprise blockchain adoption: **privacy**.

## Table of Contents

- [Overview](#overview)
- [User Journey](#user-journey)
- [Architecture](#architecture)
- [Open-Source Dependencies](#open-source-dependencies)
- [Deployment Instructions](#deployment-instructions)
- [Development Guide](#development-guide)
- [Smart Contract Integration](#smart-contract-integration)

---

## Overview

**ZK Payments** provides privacy-preserving transfers on public blockchains using server-assisted encryption. Users can deposit tokens, maintain encrypted balances, and transfer funds privately while maintaining regulatory compliance through KYC.

### Key Features

- **Encrypted Balances**: User balances stored using AES-256-GCM encryption
- **Private Transfers**: Send tokens without revealing amounts on-chain
- **KYC Compliant**: Built-in identity verification for regulatory compliance
- **Server-Assisted**: Relayer processes encrypted operations off-chain
- **Multi-Chain**: Deployed on BSC Mainnet & Testnet
- **B2B Focused**: Designed for banks, payment processors, and enterprises

### Live Deployment

- **Mainnet**: `0x5c0D3877b4c0f4e9E2e773717DB3844d01eba0aE` (BNB Smart Chain)
- **Testnet**: `0x5c0D3877b4c0f4e9E2e773717DB3844d01eba0aE` (BSC Testnet)
- **Frontend**: [Your Deployment URL]

---

## User Journey

### Complete User Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ZK PAYMENTS USER JOURNEY                         │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   NEW USER   │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 1: KYC VERIFICATION (Optional for MVP)                             │
├─────────────────────────────────────────────────────────────────────────┤
│ • User provides identity documents                                      │
│ • System verifies identity                                              │
│ • User receives verified status                                         │
│ • Encrypted user index generated                                        │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 2: CONNECT WALLET                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ • User connects MetaMask/WalletConnect                                  │
│ • Frontend detects wallet address                                       │
│ • App displays available USDT balance                                   │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 3: DEPOSIT USDT                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│ Input: User enters deposit amount (e.g., 100 USDT)                     │
│                                                                          │
│ → 3.1 APPROVE TOKENS                                                    │
│   • User approves contract to spend USDT                                │
│   • Transaction sent to blockchain                                      │
│   • Approval confirmed                                                  │
│                                                                          │
│ → 3.2 REQUEST DEPOSIT                                                   │
│   • Generate encrypted user index                                       │
│   • Call requestDeposit(amount, encryptedIndex)                        │
│   • Smart contract emits DepositRequested event                        │
│                                                                          │
│ → 3.3 SERVER PROCESSING                                                 │
│   • Backend listens for DepositRequested event                         │
│   • Server generates encryption keys                                    │
│   • Encrypts amount with AES-256-GCM                                   │
│   • Stores encrypted balance on-chain                                   │
│   • Emits DepositCompleted event                                        │
│                                                                          │
│ Output: User now has encrypted balance                                  │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 4: CHECK ENCRYPTED BALANCE                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ • User views dashboard                                                  │
│ • Frontend queries encrypted balance from contract                      │
│ • Server decrypts balance for display (optional)                       │
│ • Dashboard shows: "100 USDT (Encrypted)"                              │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 5: SEND PRIVATE TRANSFER                                           │
├─────────────────────────────────────────────────────────────────────────┤
│ Input: Recipient address + Amount (e.g., 50 USDT to 0xABC...)         │
│                                                                          │
│ → 5.1 INITIATE TRANSFER                                                 │
│   • User enters recipient & amount                                      │
│   • Frontend calls requestTransfer(to, amount)                         │
│   • Smart contract emits TransferRequested event                       │
│                                                                          │
│ → 5.2 SERVER PROCESSING                                                 │
│   • Backend listens for TransferRequested event                        │
│   • Server decrypts sender balance                                      │
│   • Verifies sufficient funds                                           │
│   • Updates encrypted balances:                                         │
│     - Sender: 100 → 50 USDT (encrypted)                                │
│     - Recipient: 0 → 50 USDT (encrypted)                               │
│   • Commits changes on-chain                                            │
│   • Emits TransferCompleted event                                       │
│                                                                          │
│ Output: Transfer completed privately (amount hidden on-chain)           │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 6: VIEW TRANSACTION HISTORY                                        │
├─────────────────────────────────────────────────────────────────────────┤
│ • User navigates to History page                                        │
│ • Frontend queries past events (Deposits, Transfers, Withdrawals)      │
│ • Displays:                                                             │
│   - ✅ Deposit: +100 USDT                                               │
│   - ✅ Transfer to 0xABC...def: -50 USDT                                │
│   - 🔒 All amounts encrypted on-chain                                   │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 7: WITHDRAW (Optional)                                             │
├─────────────────────────────────────────────────────────────────────────┤
│ Input: Withdrawal amount (e.g., 50 USDT)                               │
│                                                                          │
│ → 7.1 REQUEST WITHDRAWAL                                                │
│   • User calls requestWithdraw(amount)                                 │
│   • Smart contract emits WithdrawRequested event                       │
│                                                                          │
│ → 7.2 SERVER PROCESSING                                                 │
│   • Backend decrypts balance                                            │
│   • Verifies sufficient funds                                           │
│   • Updates encrypted balance: 50 → 0 USDT                             │
│   • Approves withdrawal                                                 │
│   • Transfers actual USDT to user wallet                               │
│                                                                          │
│ Output: User receives 50 USDT in wallet                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

### User Journey Highlights

1. **Onboarding**: Connect wallet → Optional KYC verification
2. **Deposit**: Approve USDT → Deposit → Server encrypts balance
3. **Transact**: Send private transfers with encrypted amounts
4. **Monitor**: View encrypted balance and transaction history
5. **Withdraw**: Request withdrawal → Receive tokens back to wallet

---

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SYSTEM ARCHITECTURE                              │
└─────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND LAYER                                  │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Next.js    │  │   Wagmi      │  │   Viem       │  │   React      │ │
│  │   App Router │  │   Hooks      │  │   Ethereum   │  │   Query      │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                                            │
│  Pages:                                                                    │
│  • /dashboard      - Main dashboard with encrypted balance                │
│  • /dashboard/send - Private transfer interface                           │
│  • /dashboard/deposit - Deposit USDT into encrypted balance              │
│  • /dashboard/history - Transaction history viewer                        │
│  • /pitch          - Investor pitch deck                                  │
│                                                                            │
└─────────────────────────────────┬──────────────────────────────────────────┘
                                  │
                                  │ Web3 Calls (RPC)
                                  │
                                  ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                         BLOCKCHAIN LAYER                                   │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │              BNB SMART CHAIN (Mainnet & Testnet)                    │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │          ServerEncryptedERC20ByManual Contract                      │ │
│  ├─────────────────────────────────────────────────────────────────────┤ │
│  │                                                                      │ │
│  │  State Variables:                                                   │ │
│  │  • mapping(bytes32 => EncryptedBalance) balances                   │ │
│  │  • mapping(address => bytes) userToEncryptedIndex                  │ │
│  │                                                                      │ │
│  │  Core Functions:                                                    │ │
│  │  • requestDeposit(amount, encryptedIndex)                          │ │
│  │  • requestTransfer(to, amount)                                     │ │
│  │  • requestWithdraw(amount)                                         │ │
│  │                                                                      │ │
│  │  Events:                                                            │ │
│  │  • DepositRequested(user, amount, index)                          │ │
│  │  • TransferRequested(from, to, amount)                            │ │
│  │  • WithdrawRequested(user, amount)                                │ │
│  │  • DepositCompleted(user, encryptedBalance)                       │ │
│  │  • TransferCompleted(from, to)                                     │ │
│  │                                                                      │ │
│  └──────────────────────────────┬──────────────────────────────────────┘ │
│                                  │                                         │
└──────────────────────────────────┼─────────────────────────────────────────┘
                                   │
                                   │ Event Emission
                                   │
                                   ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                          BACKEND LAYER (Relayer)                           │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                    Node.js Event Listener                           │ │
│  ├─────────────────────────────────────────────────────────────────────┤ │
│  │                                                                      │ │
│  │  Components:                                                        │ │
│  │  • Event listener (ethers.js)                                      │ │
│  │  • Crypto module (AES-256-GCM)                                     │ │
│  │  • Key management system                                           │ │
│  │                                                                      │ │
│  │  Workflow:                                                          │ │
│  │  1. Listen for blockchain events                                   │ │
│  │  2. Decrypt user balances                                          │ │
│  │  3. Perform encrypted operations                                   │ │
│  │  4. Re-encrypt updated balances                                    │ │
│  │  5. Commit to blockchain                                           │ │
│  │                                                                      │ │
│  │  Encryption Process:                                                │ │
│  │  • Generate symmetric key (AES-256)                                │ │
│  │  • Encrypt balance with symmetric key                              │ │
│  │  • Encrypt symmetric key for user (recovery)                       │ │
│  │  • Encrypt symmetric key for server (operations)                   │ │
│  │                                                                      │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
└───────────────────────────────────────────────────────────────────────────┘
```

### Data Flow: Deposit Example

```
┌──────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
│  User    │         │ Frontend │         │Blockchain│         │ Backend  │
└────┬─────┘         └────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │                    │
     │ 1. Enter 100 USDT  │                    │                    │
     │───────────────────>│                    │                    │
     │                    │                    │                    │
     │                    │ 2. Approve ERC20   │                    │
     │                    │───────────────────>│                    │
     │                    │                    │                    │
     │ 3. Sign Approval   │                    │                    │
     │<───────────────────│                    │                    │
     │───────────────────>│                    │                    │
     │                    │                    │                    │
     │                    │ 4. requestDeposit()│                    │
     │                    │───────────────────>│                    │
     │                    │                    │                    │
     │                    │                    │ 5. DepositRequested│
     │                    │                    │    event emitted   │
     │                    │                    │───────────────────>│
     │                    │                    │                    │
     │                    │                    │                    │ 6. Generate
     │                    │                    │                    │    encryption
     │                    │                    │                    │    keys
     │                    │                    │                    │
     │                    │                    │ 7. Store encrypted │
     │                    │                    │<───────────────────│
     │                    │                    │    balance         │
     │                    │                    │                    │
     │                    │ 8. Deposit Success │                    │
     │                    │<───────────────────│                    │
     │                    │                    │                    │
     │ 9. Balance Updated │                    │                    │
     │<───────────────────│                    │                    │
     │                    │                    │                    │
```

### Encryption Scheme

```
┌─────────────────────────────────────────────────────────────┐
│                  ENCRYPTION ARCHITECTURE                     │
└─────────────────────────────────────────────────────────────┘

User Balance: 100 USDT
                │
                ▼
┌───────────────────────────────────────────────────────────┐
│ STEP 1: Generate Symmetric Key                            │
│ • Random AES-256 key generated                            │
│ • Key: k = randomBytes(32)                                │
└─────────────────────┬─────────────────────────────────────┘
                      │
                      ▼
┌───────────────────────────────────────────────────────────┐
│ STEP 2: Encrypt Balance                                   │
│ • Algorithm: AES-256-GCM                                  │
│ • encryptedAmount = encrypt(100, k)                       │
│ • Result: 0x8f3a2b... (encrypted bytes)                   │
└─────────────────────┬─────────────────────────────────────┘
                      │
                      ▼
┌───────────────────────────────────────────────────────────┐
│ STEP 3: Encrypt Symmetric Key (Dual Encryption)          │
│                                                            │
│ → For User Recovery:                                      │
│   • encryptedKeyUser = encrypt(k, userPublicKey)         │
│   • Allows user to recover balance                        │
│                                                            │
│ → For Server Operations:                                  │
│   • encryptedKeyServer = encrypt(k, serverPublicKey)     │
│   • Allows server to process transfers                    │
└─────────────────────┬─────────────────────────────────────┘
                      │
                      ▼
┌───────────────────────────────────────────────────────────┐
│ STEP 4: Store On-Chain                                    │
│                                                            │
│ EncryptedBalance {                                        │
│   encryptedAmount: 0x8f3a2b...,                          │
│   encryptedSymmetricKeyUser: 0x4d9e1f...,                │
│   encryptedSymmetricKeyServer: 0x7c2a8b...,              │
│   exists: true                                            │
│ }                                                          │
└───────────────────────────────────────────────────────────┘

Properties:
✅ Balance hidden from public view
✅ User can recover their balance
✅ Server can process operations
✅ No one else can decrypt
```

---

## Open-Source Dependencies

### Frontend Dependencies

#### Core Framework
- **[Next.js](https://nextjs.org)** `^16.0.3` - React framework for production-grade applications
- **[React](https://react.dev)** `^19.2.0` - UI library for building component-based interfaces
- **[React DOM](https://react.dev)** `^19.2.0` - React package for working with the DOM

#### Web3 & Blockchain
- **[@reown/appkit](https://github.com/reown-com/appkit)** `^1.8.14` - Web3 wallet connection UI components
- **[@reown/appkit-adapter-wagmi](https://github.com/reown-com/appkit)** `^1.8.14` - Wagmi adapter for AppKit
- **[wagmi](https://wagmi.sh)** `^2.19.4` - React hooks for Ethereum (wallet connection, contract interaction)
- **[viem](https://viem.sh)** `^2.39.0` - TypeScript interface for Ethereum (low-level blockchain operations)

#### State Management & Data Fetching
- **[@tanstack/react-query](https://tanstack.com/query)** `^5.90.9` - Async state management and data fetching

#### UI Components & Styling
- **[Tailwind CSS](https://tailwindcss.com)** `^4.0.0` - Utility-first CSS framework
- **[@tailwindcss/postcss](https://tailwindcss.com)** `^4.0.0` - PostCSS plugin for Tailwind CSS
- **[tw-animate-css](https://www.npmjs.com/package/tw-animate-css)** `^1.4.0` - Animation utilities for Tailwind
- **[next-themes](https://github.com/pacocoursey/next-themes)** `^0.4.6` - Theme management for Next.js (dark/light mode)
- **[Lucide React](https://lucide.dev)** `^0.553.0` - Beautiful icon library
- **[class-variance-authority](https://cva.style)** `^0.7.1` - CSS utility for component variants
- **[clsx](https://github.com/lukeed/clsx)** `^2.1.1` - Utility for constructing className strings
- **[tailwind-merge](https://github.com/dcastil/tailwind-merge)** `^3.4.0` - Merge Tailwind CSS classes without conflicts

#### Animations & Visualizations
- **[Framer Motion](https://www.framer.com/motion/)** `^12.23.24` - Production-ready animation library for React
- **[dotted-map](https://www.npmjs.com/package/dotted-map)** `^2.2.3` - Create dotted world map visualizations

#### Development Tools
- **[TypeScript](https://www.typescriptlang.org)** `^5.0.0` - Typed superset of JavaScript
- **[ESLint](https://eslint.org)** `^9.0.0` - JavaScript/TypeScript linter
- **[eslint-config-next](https://nextjs.org)** `^16.0.3` - ESLint configuration for Next.js
- **[@types/node](https://www.npmjs.com/package/@types/node)** `^20.0.0` - TypeScript definitions for Node.js
- **[@types/react](https://www.npmjs.com/package/@types/react)** `^19.0.0` - TypeScript definitions for React
- **[@types/react-dom](https://www.npmjs.com/package/@types/react-dom)** `^19.0.0` - TypeScript definitions for React DOM

### Backend Dependencies (Smart Contracts & Relayer)

Located in `/back` folder:

#### Smart Contract Development
- **[Hardhat](https://hardhat.org)** - Ethereum development environment
- **[Solidity](https://soliditylang.org)** `^0.8.20` - Smart contract programming language
- **[OpenZeppelin Contracts](https://openzeppelin.com/contracts)** - Secure smart contract library (ERC20, AccessControl)

#### Event Listener & Relayer
- **[ethers.js](https://docs.ethers.org)** `^6.0.0` - Complete Ethereum library for blockchain interaction
- **[Node.js Crypto](https://nodejs.org/api/crypto.html)** - Built-in cryptography module (AES-256-GCM)
- **[dotenv](https://github.com/motdotla/dotenv)** - Environment variable management

### Smart Contract Addresses

- **BSC Mainnet**: `0x5c0D3877b4c0f4e9E2e773717DB3844d01eba0aE`
- **BSC Testnet**: `0x5c0D3877b4c0f4e9E2e773717DB3844d01eba0aE`
- **USDT Token (BSC Mainnet)**: `0x55d398326f99059fF775485246999027B3197955`
- **USDT Token (BSC Testnet)**: `0x337610d27c682E347C9cD60BD4b3b107C9d34dDd`

---

## Deployment Instructions

### Prerequisites

1. **Node.js** (v18 or higher)
2. **npm** or **yarn** package manager
3. **Git** for version control
4. **Wallet** with BSC/BNB for gas fees (if deploying contracts)

### Local Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/zk-payments.git
cd zk-payments/frontend

# 2. Install dependencies
npm install
# or
yarn install

# 3. Create environment variables (optional)
# Create a .env.local file if needed for custom RPC endpoints
# NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# 4. Run development server
npm run dev
# or
yarn dev

# 5. Open browser
# Navigate to http://localhost:3000
```

### Production Build (Local Testing)

```bash
# Build for production
npm run build

# Start production server
npm run start

# Test at http://localhost:3000
```

### Deploy to Vercel (Recommended)

#### Option 1: Vercel Dashboard (Easiest)

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - **IMPORTANT**: Set root directory to `frontend`
   - Framework Preset: Next.js (auto-detected)
   - Click "Deploy"

3. **Your site will be live at**: `https://your-project.vercel.app`

#### Option 2: Vercel CLI

```bash
# 1. Install Vercel CLI globally
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy from frontend folder
cd frontend
vercel --prod

# 4. Follow the prompts
# - Set up and deploy? Y
# - Which scope? Your account
# - Link to existing project? N (first time) or Y (redeployment)
# - What's your project's name? zk-payments
# - In which directory is your code located? ./
# - Want to override settings? N

# 5. Your deployment URL will be displayed
```

#### Environment Variables (Vercel)

If you need custom configurations:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add variables:
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` (optional)
   - Any other custom RPC endpoints

### Deploy to Netlify

#### Step 1: Create `netlify.toml`

Already included in the project:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

#### Step 2: Deploy via Netlify Dashboard

1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub and select your repo
5. **Build settings**:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Click "Deploy site"

#### Step 3: Install Next.js Plugin

Netlify will automatically detect and install `@netlify/plugin-nextjs`

### Deploy to Custom VPS/Server

```bash
# 1. SSH into your server
ssh user@your-server-ip

# 2. Install Node.js (if not installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Clone repository
git clone https://github.com/yourusername/zk-payments.git
cd zk-payments/frontend

# 4. Install dependencies
npm install --production

# 5. Build application
npm run build

# 6. Install PM2 (process manager)
npm install -g pm2

# 7. Start application with PM2
pm2 start npm --name "zk-payments" -- start

# 8. Configure PM2 to start on reboot
pm2 startup
pm2 save

# 9. Setup Nginx reverse proxy (optional)
sudo apt-get install nginx

# Create Nginx config at /etc/nginx/sites-available/zk-payments
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/zk-payments /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 10. Setup SSL with Let's Encrypt (optional)
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Deploy with Docker

```dockerfile
# Create Dockerfile in frontend folder
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

```bash
# Build Docker image
docker build -t zk-payments .

# Run container
docker run -p 3000:3000 zk-payments
```

### Post-Deployment Checklist

- [ ] Verify `/pitch` page loads correctly
- [ ] Test wallet connection (MetaMask/WalletConnect)
- [ ] Test deposit flow on testnet
- [ ] Test transfer flow on testnet
- [ ] Check transaction history page
- [ ] Verify responsive design on mobile
- [ ] Test dark/light theme toggle
- [ ] Confirm smart contract addresses are correct
- [ ] Check console for any errors
- [ ] Verify all images load (team photos, logos)

### Troubleshooting Deployment

#### 404 Error on Routes

**Problem**: Routes like `/pitch` return 404

**Solution**:
- Verify `output: 'standalone'` is NOT set in `next.config.ts` (unless using Docker)
- Check deployment platform is using `frontend` folder as root
- Ensure all pages have `export default function PageName()`

#### Build Fails with Module Errors

**Problem**: Missing dependencies or module not found

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Images Not Loading

**Problem**: Team photos or assets return 404

**Solution**:
- Verify images are in `/public` folder
- Check image paths start with `/` (e.g., `/lau.jpeg` not `lau.jpeg`)
- Ensure images are committed to git

#### Wallet Connection Fails

**Problem**: WalletConnect doesn't open

**Solution**:
- Get a free project ID from [WalletConnect Cloud](https://cloud.walletconnect.com)
- Add to environment variables: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

---

## Development Guide

### Project Structure

```
frontend/
├── app/                        # Next.js app router
│   ├── page.tsx               # Homepage
│   ├── layout.tsx             # Root layout
│   ├── globals.css            # Global styles
│   ├── dashboard/             # Dashboard pages
│   │   ├── page.tsx          # Main dashboard
│   │   ├── send/             # Send transfer page
│   │   ├── deposit/          # Deposit page
│   │   ├── history/          # Transaction history
│   │   └── faucet/           # Testnet faucet
│   ├── pitch/                # Investor pitch deck
│   └── pitch-bnb/            # Detailed pitch version
├── components/                # React components
│   ├── ui/                   # UI components (buttons, cards, etc.)
│   ├── providers/            # Context providers (Web3, theme)
│   └── bnb-logo.tsx          # BNB Chain logo
├── lib/                       # Utility functions
│   ├── utils.ts              # Helper functions
│   ├── contracts.ts          # Contract addresses & ABIs
│   └── hooks/                # Custom React hooks
│       ├── useERC20Balance.ts
│       ├── useApproveERC20.ts
│       ├── useRequestDeposit.ts
│       └── useRequestTransfer.ts
├── public/                    # Static assets
│   ├── lau.jpeg              # Team photo - Lautaro
│   ├── tomi.jpeg             # Team photo - Tomas
│   └── ale.jpeg              # Team photo - Alejandro
├── next.config.ts            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies & scripts
```

### Key Custom Hooks

#### `useERC20Balance`
```typescript
// Get user's USDT balance
const { balance, isLoading, refetch } = useERC20Balance(address)
```

#### `useERC20Allowance`
```typescript
// Check if contract can spend user's tokens
const { allowance, refetch } = useERC20Allowance(
  address,
  CONTRACT_ADDRESSES.ServerEncryptedERC20
)
```

#### `useApproveERC20`
```typescript
// Approve contract to spend tokens
const { approve, isPending, isSuccess } = useApproveERC20()
await approve(spenderAddress, amount)
```

#### `useRequestDeposit`
```typescript
// Deposit USDT into encrypted balance
const { requestDeposit, isPending, isSuccess } = useRequestDeposit()
await requestDeposit(amount, encryptedIndex)
```

#### `useRequestTransfer`
```typescript
// Send private transfer
const { requestTransfer, isPending, isSuccess } = useRequestTransfer()
await requestTransfer(recipientAddress, amount)
```

### Adding New Features

1. **Create new hook** in `lib/hooks/`
2. **Add UI components** in `components/`
3. **Create page** in `app/your-feature/page.tsx`
4. **Update navigation** in dashboard layout
5. **Test thoroughly** on testnet before mainnet

---

## Smart Contract Integration

### Contract ABI Location

All ABIs are stored in `lib/contracts.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
  ServerEncryptedERC20: "0x5c0D3877b4c0f4e9E2e773717DB3844d01eba0aE",
  USDTToken: "0x55d398326f99059fF775485246999027B3197955"
}

export const SERVER_ENCRYPTED_ERC20_ABI = [...]
export const ERC20_ABI = [...]
```

### Key Contract Functions

#### `requestDeposit(uint256 amount, bytes memory encryptedIndex)`
Initiate deposit of USDT into encrypted balance

#### `requestTransfer(address to, uint256 amount)`
Request private transfer to another user

#### `requestWithdraw(uint256 amount)`
Request withdrawal of encrypted balance to wallet

### Events to Listen For

- `DepositRequested(address indexed user, uint256 amount, bytes encryptedIndex)`
- `DepositCompleted(address indexed user, bytes encryptedBalance)`
- `TransferRequested(address indexed from, address indexed to, uint256 amount)`
- `TransferCompleted(address indexed from, address indexed to)`
- `WithdrawRequested(address indexed user, uint256 amount)`

---

## Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License - see LICENSE file for details

---

## Support & Contact

- **Documentation**: [Whitepaper](../whitepaper.md)
- **GitHub Issues**: [Report bugs](https://github.com/yourusername/zk-payments/issues)
- **Email**: team@zkpayments.io
- **Twitter**: [@ZKPayments](https://twitter.com/zkpayments)

---

## Acknowledgments

Built with:
- [BNB Chain](https://www.bnbchain.org) - Blockchain infrastructure
- [Next.js](https://nextjs.org) - React framework
- [Wagmi](https://wagmi.sh) - Ethereum React hooks
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [OpenZeppelin](https://openzeppelin.com) - Smart contract security

**Privacy for the masses. Built on BNB Chain.**
