import { bsc, bscTestnet } from '@reown/appkit/networks'

// 1. Get projectId from https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || '8a67e23f9c7e4e0a8b9c2d1e3f4a5b6c'

// 2. BSC Networks only (mainnet and testnet)
export const networks = [bsc, bscTestnet]

// 3. App metadata
export const metadata = {
  name: 'Encrypted Payments',
  description: 'Enterprise payments with encryption + KYC compliance on BNB Chain',
  url: 'https://zkpayments.app',
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}
