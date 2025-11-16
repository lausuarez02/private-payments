// Contract addresses and configuration
// BSC Testnet addresses
export const CONTRACT_ADDRESSES = {
  ServerEncryptedERC20: "0xCF156f8F7a439BFf330e744b56aD812F036f45bc" as `0x${string}`,
  MockERC20: "0x453C19B1B0Dfa5273Fc20e0B520322aDE4BD7F90" as `0x${string}`,
} as const;

// Localhost addresses (for development)
export const CONTRACT_ADDRESSES_LOCALHOST = {
  ServerEncryptedERC20: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9" as `0x${string}`,
  MockERC20: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9" as `0x${string}`,
} as const;

export const NETWORK_CONFIG = {
  localhost: {
    chainId: 31337,
    rpcUrl: "http://127.0.0.1:8545",
  },
  bscTestnet: {
    chainId: 97,
    rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545",
  },
} as const;

// Server backend URL
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
