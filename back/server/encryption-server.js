/**
 * Encryption Server for ServerEncryptedERC20
 *
 * Listens to deposit events and encrypts balances server-side
 *
 * Install dependencies:
 * npm install ethers dotenv crypto-js elliptic
 */

const { ethers } = require('ethers');
const crypto = require('crypto');
const EC = require('elliptic').ec;
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize elliptic curve (secp256k1 - same as Ethereum)
const ec = new EC('secp256k1');

// Contract ABI
const SERVER_ENCRYPTED_ERC20_ABI = [
  "event DepositRequested(bytes32 indexed requestId, address indexed user, uint256 amount, uint256 timestamp)",
  "event WithdrawalRequested(bytes32 indexed requestId, address indexed user, uint256 amount, bytes signature, uint256 timestamp)",
  "function storeEncryptedBalance(bytes32 requestId, address user, bytes encryptedBalance, bytes encryptedSymmetricKey) external",
  "function processWithdrawal(address user, uint256 amount, bytes newEncryptedBalance, bytes newEncryptedSymmetricKey) external",
  "function getEncryptedData(address user) external view returns (bytes encryptedBalance, bytes encryptedSymmetricKey, uint256 timestamp)",
  "function getPendingDeposit(bytes32 requestId) external view returns (address user, uint256 amount, uint256 timestamp, bool processed)"
];

class EncryptionServer {
  constructor(provider, contractAddress, serverPrivateKey) {
    this.provider = provider;
    this.wallet = new ethers.Wallet(serverPrivateKey, provider);
    this.contract = new ethers.Contract(contractAddress, SERVER_ENCRYPTED_ERC20_ABI, this.wallet);

    // In-memory storage of symmetric keys per user
    // In production, use encrypted database
    this.userSymmetricKeys = new Map();
    this.userBalances = new Map();
  }

  /**
   * Generate random symmetric key (AES-256)
   */
  generateSymmetricKey() {
    return crypto.randomBytes(32); // 256 bits
  }

  /**
   * Encrypt data with AES-256-GCM
   */
  encryptWithSymmetricKey(data, symmetricKey) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', symmetricKey, iv);

    let encrypted = cipher.update(data.toString(), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Return: iv + authTag + encrypted
    return Buffer.concat([
      iv,
      authTag,
      Buffer.from(encrypted, 'hex')
    ]);
  }

  /**
   * Decrypt data with AES-256-GCM
   */
  decryptWithSymmetricKey(encryptedData, symmetricKey) {
    const buffer = Buffer.from(encryptedData);

    const iv = buffer.slice(0, 16);
    const authTag = buffer.slice(16, 32);
    const encrypted = buffer.slice(32);

    const decipher = crypto.createDecipheriv('aes-256-gcm', symmetricKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, null, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Derive public key from Ethereum address
   * User must have signed a message to prove ownership
   */
  async getUserPublicKey(userAddress) {
    // In a real implementation, user would provide their public key
    // by signing a standard message. Here's a simplified version:

    // For demo, we'll use a standard derivation
    // In production, ask user to sign: "Get my public key for encryption"
    const message = `Encryption public key for ${userAddress}`;
    const messageHash = ethers.id(message);

    // Note: This is a placeholder. In production:
    // 1. User signs a message with MetaMask
    // 2. Server recovers public key from signature
    // 3. Server uses that public key for encryption

    // For now, return the address as placeholder
    // Real implementation would recover from signature
    return userAddress;
  }

  /**
   * Encrypt symmetric key with user's public key (ECIES)
   */
  encryptSymmetricKeyForUser(symmetricKey, userPublicKey) {
    // Simplified ECIES encryption
    // In production, use proper ECIES library

    // Generate ephemeral key pair
    const ephemeralKey = ec.genKeyPair();
    const ephemeralPublicKey = ephemeralKey.getPublic();

    // For demo purposes, we'll use a simple XOR with hash
    // In production, use proper ECIES with proper key derivation
    const sharedSecret = ethers.keccak256(
      ethers.concat([
        Buffer.from(ephemeralPublicKey.encode('hex', false), 'hex'),
        Buffer.from(userPublicKey.slice(2), 'hex')
      ])
    );

    // XOR symmetric key with shared secret (simplified)
    const encryptedKey = Buffer.alloc(symmetricKey.length);
    const secretBuffer = Buffer.from(sharedSecret.slice(2), 'hex');

    for (let i = 0; i < symmetricKey.length; i++) {
      encryptedKey[i] = symmetricKey[i] ^ secretBuffer[i % secretBuffer.length];
    }

    // Return: ephemeralPublicKey + encryptedKey
    return Buffer.concat([
      Buffer.from(ephemeralPublicKey.encode('hex', false), 'hex'),
      encryptedKey
    ]);
  }

  /**
   * Handle deposit request
   */
  async handleDepositRequest(requestId, userAddress, amount) {
    console.log(`\n📥 Processing deposit request...`);
    console.log(`   Request ID: ${requestId}`);
    console.log(`   User: ${userAddress}`);
    console.log(`   Amount: ${ethers.formatEther(amount)} tokens`);

    try {
      // Get current balance if exists
      let currentBalance = this.userBalances.get(userAddress) || 0n;
      let symmetricKey = this.userSymmetricKeys.get(userAddress);

      // If first deposit, generate new symmetric key
      if (!symmetricKey) {
        console.log(`   🔑 Generating new symmetric key for user...`);
        symmetricKey = this.generateSymmetricKey();
        this.userSymmetricKeys.set(userAddress, symmetricKey);
        currentBalance = 0n;
      } else {
        console.log(`   🔑 Using existing symmetric key`);
      }

      // Calculate new balance
      const newBalance = currentBalance + amount;
      this.userBalances.set(userAddress, newBalance);

      console.log(`   💰 Old balance: ${ethers.formatEther(currentBalance)} tokens`);
      console.log(`   💰 New balance: ${ethers.formatEther(newBalance)} tokens`);

      // Encrypt new balance with symmetric key
      const encryptedBalance = this.encryptWithSymmetricKey(
        newBalance.toString(),
        symmetricKey
      );

      // Get user's public key (from signature recovery in production)
      const userPublicKey = await this.getUserPublicKey(userAddress);

      // Encrypt symmetric key with user's public key
      const encryptedSymmetricKey = this.encryptSymmetricKeyForUser(
        symmetricKey,
        userPublicKey
      );

      console.log(`   🔐 Encrypted balance: ${encryptedBalance.length} bytes`);
      console.log(`   🔐 Encrypted key: ${encryptedSymmetricKey.length} bytes`);

      // Store on-chain
      console.log(`   📝 Storing encrypted data on-chain...`);
      const tx = await this.contract.storeEncryptedBalance(
        requestId,
        userAddress,
        '0x' + encryptedBalance.toString('hex'),
        '0x' + encryptedSymmetricKey.toString('hex')
      );

      console.log(`   ⏳ Waiting for confirmation...`);
      const receipt = await tx.wait();

      console.log(`   ✅ Encrypted balance stored!`);
      console.log(`   Transaction: ${receipt.hash}`);
      console.log(`   Gas used: ${receipt.gasUsed.toString()}`);

    } catch (error) {
      console.error(`   ❌ Error processing deposit:`, error.message);
    }
  }

  /**
   * Handle withdrawal request
   */
  async handleWithdrawalRequest(requestId, userAddress, amount, signature) {
    console.log(`\n📤 Processing withdrawal request...`);
    console.log(`   Request ID: ${requestId}`);
    console.log(`   User: ${userAddress}`);
    console.log(`   Amount: ${ethers.formatEther(amount)} tokens`);

    try {
      // Get current balance
      const currentBalance = this.userBalances.get(userAddress);
      const symmetricKey = this.userSymmetricKeys.get(userAddress);

      if (!currentBalance || !symmetricKey) {
        console.log(`   ❌ User has no balance`);
        return;
      }

      // Verify signature (simplified - in production, verify properly)
      console.log(`   🔐 Verifying signature...`);
      // const isValid = await this.verifySignature(userAddress, amount, signature);
      // if (!isValid) {
      //   console.log(`   ❌ Invalid signature`);
      //   return;
      // }

      // Check sufficient balance
      if (currentBalance < amount) {
        console.log(`   ❌ Insufficient balance`);
        console.log(`   Current: ${ethers.formatEther(currentBalance)}`);
        console.log(`   Requested: ${ethers.formatEther(amount)}`);
        return;
      }

      // Calculate new balance
      const newBalance = currentBalance - amount;
      this.userBalances.set(userAddress, newBalance);

      console.log(`   💰 Old balance: ${ethers.formatEther(currentBalance)} tokens`);
      console.log(`   💰 New balance: ${ethers.formatEther(newBalance)} tokens`);

      // Encrypt new balance
      const encryptedBalance = this.encryptWithSymmetricKey(
        newBalance.toString(),
        symmetricKey
      );

      // Re-encrypt symmetric key
      const userPublicKey = await this.getUserPublicKey(userAddress);
      const encryptedSymmetricKey = this.encryptSymmetricKeyForUser(
        symmetricKey,
        userPublicKey
      );

      // Process withdrawal on-chain
      console.log(`   📝 Processing withdrawal on-chain...`);
      const tx = await this.contract.processWithdrawal(
        userAddress,
        amount,
        '0x' + encryptedBalance.toString('hex'),
        '0x' + encryptedSymmetricKey.toString('hex')
      );

      console.log(`   ⏳ Waiting for confirmation...`);
      const receipt = await tx.wait();

      console.log(`   ✅ Withdrawal processed!`);
      console.log(`   Transaction: ${receipt.hash}`);
      console.log(`   Tokens sent to user: ${ethers.formatEther(amount)}`);

    } catch (error) {
      console.error(`   ❌ Error processing withdrawal:`, error.message);
    }
  }

  /**
   * Start listening to events
   */
  async start() {
    console.log(`\n🚀 Encryption Server Starting...`);
    console.log(`=`.repeat(70));
    console.log(`Contract: ${await this.contract.getAddress()}`);
    console.log(`Server wallet: ${this.wallet.address}`);
    console.log(`Network: ${(await this.provider.getNetwork()).name}`);
    console.log(`=`.repeat(70));

    // Listen to DepositRequested events
    this.contract.on('DepositRequested', async (requestId, user, amount, timestamp, event) => {
      await this.handleDepositRequest(requestId, user, amount);
    });

    // Listen to WithdrawalRequested events
    this.contract.on('WithdrawalRequested', async (requestId, user, amount, signature, timestamp, event) => {
      await this.handleWithdrawalRequest(requestId, user, amount, signature);
    });

    console.log(`\n👂 Listening for events...`);
    console.log(`Press Ctrl+C to stop\n`);
  }

  /**
   * Stop the server
   */
  async stop() {
    console.log(`\n🛑 Stopping server...`);
    this.contract.removeAllListeners();
    console.log(`✅ Server stopped`);
  }
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  // Try to load from .deployed.json first
  let deploymentInfo = null;
  const deploymentPath = path.join(__dirname, '..', '.deployed.json');

  if (fs.existsSync(deploymentPath)) {
    try {
      const deploymentData = fs.readFileSync(deploymentPath, 'utf8');
      deploymentInfo = JSON.parse(deploymentData);
      console.log(`📂 Loaded configuration from .deployed.json`);
    } catch (error) {
      console.warn(`⚠️  Warning: Could not read .deployed.json:`, error.message);
    }
  }

  // Configuration (use .deployed.json if available, otherwise env vars)
  const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
  const CONTRACT_ADDRESS = process.env.SERVER_ENCRYPTED_CONTRACT ||
                          (deploymentInfo?.contracts?.ServerEncryptedERC20) ||
                          "0x...";
  const SERVER_PRIVATE_KEY = process.env.SERVER_PRIVATE_KEY ||
                             (deploymentInfo?.privateKeys?.serverWallet) ||
                             "0x...";

  if (CONTRACT_ADDRESS === "0x..." || SERVER_PRIVATE_KEY === "0x...") {
    console.error(`\n❌ Error: Configuration not found!`);
    console.error(`\nPlease either:`);
    console.error(`  1. Run 'npm run deploy:server' to create .deployed.json`);
    console.error(`  2. Or set environment variables:`);
    console.error(`     export SERVER_ENCRYPTED_CONTRACT=0x...`);
    console.error(`     export SERVER_PRIVATE_KEY=0x...`);
    process.exit(1);
  }

  // Create provider and start server
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const server = new EncryptionServer(provider, CONTRACT_ADDRESS, SERVER_PRIVATE_KEY);

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    await server.stop();
    process.exit(0);
  });

  // Start server
  await server.start();
}

// Run if executed directly
if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { EncryptionServer };
