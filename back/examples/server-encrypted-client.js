/**
 * Client for ServerEncryptedERC20
 *
 * Shows how users interact with server-encrypted balances:
 * 1. Request deposit
 * 2. Wait for server to encrypt
 * 3. Get encrypted balance
 * 4. Decrypt with signature
 *
 * Install: npm install ethers crypto dotenv
 */

const { ethers } = require('ethers');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const SERVER_ENCRYPTED_ERC20_ABI = [
  "function requestDeposit(uint256 amount) external returns (bytes32 requestId)",
  "function requestWithdrawal(uint256 amount, bytes signature) external returns (bytes32 requestId)",
  "function getEncryptedData(address user) external view returns (bytes encryptedBalance, bytes encryptedSymmetricKey, uint256 timestamp)",
  "function hasBalance(address user) external view returns (bool)",
  "function getPendingDeposit(bytes32 requestId) external view returns (address user, uint256 amount, uint256 timestamp, bool processed)"
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)"
];

class ServerEncryptedClient {
  constructor(provider, contractAddress, tokenAddress, signer) {
    this.provider = provider;
    this.contract = new ethers.Contract(contractAddress, SERVER_ENCRYPTED_ERC20_ABI, signer);
    this.token = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
    this.signer = signer;
  }

  /**
   * Decrypt symmetric key encrypted by server
   */
  decryptSymmetricKey(encryptedKey, userPrivateKey) {
    // This is a simplified version matching the server's encryption
    // In production, use proper ECIES decryption

    const buffer = Buffer.from(encryptedKey.slice(2), 'hex');

    // Extract ephemeral public key (first 65 bytes for uncompressed)
    const ephemeralPublicKey = buffer.slice(0, 65);
    const encryptedKeyData = buffer.slice(65);

    // Derive shared secret (simplified)
    const sharedSecret = ethers.keccak256(
      ethers.concat([
        ephemeralPublicKey,
        Buffer.from(userPrivateKey.slice(2), 'hex')
      ])
    );

    // XOR to decrypt (matches server's encryption)
    const symmetricKey = Buffer.alloc(encryptedKeyData.length);
    const secretBuffer = Buffer.from(sharedSecret.slice(2), 'hex');

    for (let i = 0; i < encryptedKeyData.length; i++) {
      symmetricKey[i] = encryptedKeyData[i] ^ secretBuffer[i % secretBuffer.length];
    }

    return symmetricKey;
  }

  /**
   * Decrypt balance with symmetric key
   */
  decryptBalance(encryptedBalance, symmetricKey) {
    const buffer = Buffer.from(encryptedBalance.slice(2), 'hex');

    const iv = buffer.slice(0, 16);
    const authTag = buffer.slice(16, 32);
    const encrypted = buffer.slice(32);

    const decipher = crypto.createDecipheriv('aes-256-gcm', symmetricKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, null, 'utf8');
    decrypted += decipher.final('utf8');

    return BigInt(decrypted);
  }

  /**
   * Request deposit
   */
  async deposit(amount) {
    console.log(`\n💳 Requesting deposit...`);
    console.log(`   Amount: ${ethers.formatEther(amount)} tokens`);

    try {
      // Approve tokens
      console.log(`   📝 Approving tokens...`);
      const approveTx = await this.token.approve(
        await this.contract.getAddress(),
        amount
      );
      await approveTx.wait();

      // Request deposit
      console.log(`   📤 Sending deposit request...`);
      const tx = await this.contract.requestDeposit(amount);

      console.log(`   ⏳ Waiting for confirmation...`);
      const receipt = await tx.wait();

      // Get request ID from event
      const event = receipt.logs.find(log => {
        try {
          return this.contract.interface.parseLog(log).name === 'DepositRequested';
        } catch (e) {
          return false;
        }
      });

      const requestId = event ? this.contract.interface.parseLog(event).args[0] : null;

      console.log(`   ✅ Deposit requested!`);
      console.log(`   Request ID: ${requestId}`);
      console.log(`   Transaction: ${receipt.hash}`);

      // Wait for server to process
      console.log(`\n   ⏳ Waiting for server to encrypt balance...`);
      await this.waitForServerProcessing(requestId);

      console.log(`   ✅ Balance encrypted and stored!`);

    } catch (error) {
      console.error(`   ❌ Error:`, error.message);
      throw error;
    }
  }

  /**
   * Wait for server to process deposit
   */
  async waitForServerProcessing(requestId, maxWaitTime = 30000) {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const [, , , processed] = await this.contract.getPendingDeposit(requestId);

      if (processed) {
        return true;
      }

      // Wait 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
      process.stdout.write('.');
    }

    throw new Error('Server processing timeout');
  }

  /**
   * Get and decrypt balance
   */
  async getBalance() {
    console.log(`\n💰 Getting balance...`);

    try {
      const userAddress = await this.signer.getAddress();

      // Check if user has balance
      const hasBalance = await this.contract.hasBalance(userAddress);
      if (!hasBalance) {
        console.log(`   ℹ️  No balance found`);
        return { balance: 0n, encrypted: null };
      }

      // Get encrypted data
      const [encryptedBalance, encryptedSymmetricKey, timestamp] =
        await this.contract.getEncryptedData(userAddress);

      console.log(`   📦 Encrypted balance: ${encryptedBalance.substring(0, 20)}...`);
      console.log(`   🔑 Encrypted key: ${encryptedSymmetricKey.substring(0, 20)}...`);
      console.log(`   🕐 Last updated: ${new Date(Number(timestamp) * 1000).toLocaleString()}`);

      // To decrypt, user needs their private key
      // This is done CLIENT-SIDE ONLY, never send private key to server!

      // For demo purposes, we'll show the structure
      // In production, user would decrypt in browser with MetaMask

      console.log(`\n   🔓 To decrypt balance:`);
      console.log(`   1. Use your Ethereum private key`);
      console.log(`   2. Decrypt the symmetric key with ECIES`);
      console.log(`   3. Decrypt the balance with AES-256-GCM`);

      return {
        balance: null, // Would be decrypted client-side
        encryptedBalance,
        encryptedSymmetricKey,
        timestamp
      };

    } catch (error) {
      console.error(`   ❌ Error:`, error.message);
      throw error;
    }
  }

  /**
   * Decrypt balance with user's private key (CLIENT-SIDE ONLY)
   */
  async decryptBalanceWithPrivateKey(privateKey) {
    console.log(`\n🔓 Decrypting balance...`);

    try {
      const userAddress = await this.signer.getAddress();

      // Get encrypted data
      const [encryptedBalance, encryptedSymmetricKey] =
        await this.contract.getEncryptedData(userAddress);

      // Decrypt symmetric key with user's private key
      console.log(`   🔑 Decrypting symmetric key...`);
      const symmetricKey = this.decryptSymmetricKey(
        encryptedSymmetricKey,
        privateKey
      );

      // Decrypt balance with symmetric key
      console.log(`   💰 Decrypting balance...`);
      const balance = this.decryptBalance(encryptedBalance, symmetricKey);

      console.log(`   ✅ Decrypted balance: ${ethers.formatEther(balance)} tokens`);

      return balance;

    } catch (error) {
      console.error(`   ❌ Decryption error:`, error.message);
      throw error;
    }
  }

  /**
   * Request withdrawal
   */
  async withdraw(amount) {
    console.log(`\n💸 Requesting withdrawal...`);
    console.log(`   Amount: ${ethers.formatEther(amount)} tokens`);

    try {
      // Create signature to prove ownership
      // In production, this would be a proper signature
      const message = ethers.solidityPackedKeccak256(
        ['address', 'uint256', 'string'],
        [await this.signer.getAddress(), amount, 'withdraw']
      );

      const signature = await this.signer.signMessage(ethers.getBytes(message));

      console.log(`   ✍️  Signature created`);

      // Request withdrawal
      console.log(`   📤 Sending withdrawal request...`);
      const tx = await this.contract.requestWithdrawal(amount, signature);

      console.log(`   ⏳ Waiting for confirmation...`);
      const receipt = await tx.wait();

      console.log(`   ✅ Withdrawal requested!`);
      console.log(`   Transaction: ${receipt.hash}`);
      console.log(`\n   ⏳ Waiting for server to process...`);

      // In production, you'd wait for the server to process
      // and emit the BalanceDecrypted event

    } catch (error) {
      console.error(`   ❌ Error:`, error.message);
      throw error;
    }
  }
}

// ============================================================
// EXAMPLE USAGE
// ============================================================

async function main() {
  // Try to load from .deployed.json first
  let deploymentInfo = null;
  const deploymentPath = path.join(__dirname, '..', '.deployed.json');

  if (fs.existsSync(deploymentPath)) {
    try {
      const deploymentData = fs.readFileSync(deploymentPath, 'utf8');
      deploymentInfo = JSON.parse(deploymentData);
      console.log(`📂 Loaded configuration from .deployed.json\n`);
    } catch (error) {
      console.warn(`⚠️  Warning: Could not read .deployed.json:`, error.message);
    }
  }

  // Setup (use .deployed.json if available, otherwise env vars)
  const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
  const CONTRACT_ADDRESS = process.env.SERVER_ENCRYPTED_CONTRACT ||
                          (deploymentInfo?.contracts?.ServerEncryptedERC20) ||
                          "0x...";
  const TOKEN_ADDRESS = process.env.MOCK_TOKEN_ADDRESS ||
                       (deploymentInfo?.contracts?.MockERC20) ||
                       "0x...";
  const PRIVATE_KEY = process.env.PRIVATE_KEY ||
                     (deploymentInfo?.privateKeys?.deployer) ||
                     "0x...";

  if (CONTRACT_ADDRESS === "0x..." || TOKEN_ADDRESS === "0x..." || PRIVATE_KEY === "0x...") {
    console.error(`\n❌ Error: Configuration not found!`);
    console.error(`\nPlease either:`);
    console.error(`  1. Run 'npm run deploy:server' to create .deployed.json`);
    console.error(`  2. Or set environment variables:`);
    console.error(`     export SERVER_ENCRYPTED_CONTRACT=0x...`);
    console.error(`     export MOCK_TOKEN_ADDRESS=0x...`);
    console.error(`     export PRIVATE_KEY=0x...`);
    process.exit(1);
  }

  // Connect
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log(`\n🔐 ServerEncryptedERC20 Client`);
  console.log(`=`.repeat(70));
  console.log(`Signer: ${signer.address}`);
  console.log(`Contract: ${CONTRACT_ADDRESS}`);
  console.log(`Token: ${TOKEN_ADDRESS}`);
  console.log(`=`.repeat(70));

  // Create client
  const client = new ServerEncryptedClient(
    provider,
    CONTRACT_ADDRESS,
    TOKEN_ADDRESS,
    signer
  );

  try {
    // 1. Deposit tokens
    await client.deposit(ethers.parseEther("100"));

    // 2. Get encrypted balance
    await client.getBalance();

    // 3. Decrypt balance (CLIENT-SIDE ONLY!)
    await client.decryptBalanceWithPrivateKey(PRIVATE_KEY);

    // 4. Request withdrawal
    // await client.withdraw(ethers.parseEther("30"));

  } catch (error) {
    console.error(`\n❌ Error:`, error.message);
  }
}

// Run if executed directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { ServerEncryptedClient };
