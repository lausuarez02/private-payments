const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
require("dotenv").config();

// ABI for ServerEncryptedERC20 (minimal)
const CONTRACT_ABI = [
  "event DepositRequested(bytes32 indexed requestId, bytes packedData, bytes encryptedIndex)",
  "event BalanceStored(bytes32 indexed requestId, address indexed user, bytes encryptedAmount, bytes encryptedSymmetricKeyUser, bytes encryptedSymmetricKeyServer)",
  "event UserAuthenticated(address indexed user, bytes encryptedIndex)",
  "function requestCompleted(bytes32) external view returns (bool)",
  "function encryptedSupply() external view returns (uint256)",
  "function depositCompleted(bytes32) external view returns (bool)",
  "function storeDeposit(bytes32 _requestId, bytes32 _userIndex, bytes calldata _encryptedAmount, bytes calldata _encryptedSymmetricKeyUser, bytes calldata _encryptedSymmetricKeyServer) external",
  "function getEncryptedBalance(bytes32 _userIndex) external view returns (bytes memory encryptedAmount, bytes memory encryptedSymmetricKeyUser, bytes memory encryptedSymmetricKeyServer, bool exists)",
  "function getUserIndexByAddress(address _userAddress) external view returns (bytes memory encryptedIndex)",
  "function authenticateUser(bytes calldata _encryptedIndex) external"
];

class EventListenerServerTestnet {
  constructor() {
    this.provider = null;
    this.contract = null;
    this.contractAddress = null;
    this.serverAddress = null;
    this.serverPrivateKey = null;
    this.userPrivateKey = null;
    this.networkUrl = null;
  }

  // Generate random symmetric key (AES-256)
  generateSymmetricKey() {
    return crypto.randomBytes(32); // 256 bits for AES-256
  }

  // Encrypt amount with symmetric key using AES-256-GCM
  encryptAmount(amount, symmetricKey) {
    const iv = crypto.randomBytes(16); // Initialization vector
    const cipher = crypto.createCipheriv('aes-256-gcm', symmetricKey, iv);

    // Convert BigInt to string for encryption
    const amountStr = amount.toString();
    let encrypted = cipher.update(amountStr, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Return: iv + authTag + encrypted data (all concatenated)
    return Buffer.concat([iv, authTag, Buffer.from(encrypted, 'hex')]).toString('hex');
  }

  // Mock encryption for user's public key (simplified - would use ECIES in production)
  encryptSymmetricKeyForAddress(symmetricKey, address) {
    // In production, this would use ECIES with the address's public key
    // For now, we'll use a simple hash-based "encryption" for demonstration
    const addressHash = ethers.keccak256(ethers.toUtf8Bytes(address));
    const cipher = crypto.createCipheriv('aes-256-cbc',
      Buffer.from(addressHash.slice(2), 'hex'),
      Buffer.alloc(16, 0) // Zero IV for deterministic demo
    );

    let encrypted = cipher.update(symmetricKey);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return '0x' + encrypted.toString('hex');
  }

  // Decrypt symmetric key using private key
  decryptSymmetricKeyForAddress(encryptedKeyHex, privateKey) {
    try {
      // Get address from private key
      const wallet = new ethers.Wallet(privateKey);
      const address = wallet.address;

      // Use same hash-based decryption (mirror of encryption)
      const addressHash = ethers.keccak256(ethers.toUtf8Bytes(address));
      const decipher = crypto.createDecipheriv('aes-256-cbc',
        Buffer.from(addressHash.slice(2), 'hex'),
        Buffer.alloc(16, 0) // Same zero IV
      );

      const encryptedBuffer = Buffer.from(encryptedKeyHex.slice(2), 'hex');
      let decrypted = decipher.update(encryptedBuffer);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  // Decrypt amount using symmetric key
  decryptAmount(encryptedHex, symmetricKey) {
    try {
      const encrypted = Buffer.from(encryptedHex, 'hex');

      // Extract components: iv (16 bytes) + authTag (16 bytes) + ciphertext
      const iv = encrypted.slice(0, 16);
      const authTag = encrypted.slice(16, 32);
      const ciphertext = encrypted.slice(32);

      const decipher = crypto.createDecipheriv('aes-256-gcm', symmetricKey, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(ciphertext, null, 'utf8');
      decrypted += decipher.final('utf8');

      return BigInt(decrypted);
    } catch (error) {
      throw new Error(`Amount decryption failed: ${error.message}`);
    }
  }

  async initialize() {
    console.log("\n🚀 Event Listener Server Starting (TESTNET MODE)...");
    console.log("=".repeat(70));

    // Load environment variables
    if (!process.env.PRIVATE_KEY_2) {
      console.error("❌ PRIVATE_KEY_2 not found in environment variables!");
      console.error("   Please set PRIVATE_KEY_2 in your .env file");
      console.error("   This should be the server manager's private key");
      process.exit(1);
    }

    // Load configuration
    const deploymentPath = path.join(__dirname, "..", ".deployed-byal.json");

    if (!fs.existsSync(deploymentPath)) {
      console.error("❌ Configuration not found!");
      console.error("   Please run: npm run deploy:byal:testnet");
      process.exit(1);
    }

    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
    console.log("📂 Loaded configuration from .deployed-byal.json\n");

    // Validate network
    if (deploymentInfo.network !== "bscTestnet") {
      console.warn("⚠️  Warning: Deployment info shows network:", deploymentInfo.network);
      console.warn("   This server is configured for BSC Testnet");
      console.warn("   Make sure you deployed with: npm run deploy:byal:testnet");
    }

    this.contractAddress = deploymentInfo.contracts.ServerEncryptedERC20;
    this.serverPrivateKey = process.env.PRIVATE_KEY_2;
    this.userPrivateKey = process.env.PRIVATE_KEY; // Deployer key for testing
    this.networkUrl = "https://data-seed-prebsc-1-s1.binance.org:8545";

    // Create wallet from private key to get address
    const serverWallet = new ethers.Wallet(this.serverPrivateKey);
    this.serverAddress = serverWallet.address;

    console.log("Network:       BSC Testnet (Chain ID: 97)");
    console.log("RPC URL:      ", this.networkUrl);
    console.log("Contract:     ", this.contractAddress);
    console.log("Server Wallet:", this.serverAddress);
    console.log("Deployer:     ", deploymentInfo.accounts.deployer);
    console.log("=".repeat(70));

    // Verify server wallet matches deployment
    if (this.serverAddress !== deploymentInfo.accounts.serverWallet) {
      console.error("\n❌ ERROR: Server wallet mismatch!");
      console.error("   PRIVATE_KEY_2 address:", this.serverAddress);
      console.error("   Expected address:     ", deploymentInfo.accounts.serverWallet);
      console.error("\n   Make sure PRIVATE_KEY_2 is the second account used during deployment");
      process.exit(1);
    }

    // Connect to BSC Testnet provider
    this.provider = new ethers.JsonRpcProvider(this.networkUrl);

    // Verify connection
    try {
      const network = await this.provider.getNetwork();
      console.log("\n✅ Connected to network:");
      console.log("   Chain ID:", network.chainId.toString());
      console.log("   Name:", network.name);
    } catch (error) {
      console.error("\n❌ Failed to connect to BSC Testnet:", error.message);
      process.exit(1);
    }

    // Create server wallet for signing transactions
    this.serverWallet = new ethers.Wallet(this.serverPrivateKey, this.provider);

    // Check server wallet balance
    const balance = await this.provider.getBalance(this.serverAddress);
    console.log("\n💰 Server Wallet Balance:", ethers.formatEther(balance), "BNB");

    if (balance === 0n) {
      console.warn("\n⚠️  WARNING: Server wallet has 0 BNB!");
      console.warn("   You need BNB to pay for gas when calling storeDeposit");
      console.warn("   Get testnet BNB from: https://testnet.bnbchain.org/faucet-smart");
    }

    // Connect to contract with server wallet (can write)
    this.contract = new ethers.Contract(
      this.contractAddress,
      CONTRACT_ABI,
      this.serverWallet
    );

    console.log("\n✅ Server initialized successfully");
    console.log("🔗 View contract on BscScan:");
    console.log("   https://testnet.bscscan.com/address/" + this.contractAddress);
    console.log();
  }

  decodePackedData(packedData) {
    // Remove '0x' prefix
    const hex = packedData.slice(2);

    // abi.encodePacked format:
    // address: 20 bytes (40 hex chars)
    // uint256: 32 bytes (64 hex chars)
    // uint256: 32 bytes (64 hex chars)
    // uint256: 32 bytes (64 hex chars)

    let offset = 0;

    // Extract user address (20 bytes = 40 hex chars)
    const userHex = hex.slice(offset, offset + 40);
    const user = "0x" + userHex;
    offset += 40;

    // Extract amount (32 bytes = 64 hex chars)
    const amountHex = hex.slice(offset, offset + 64);
    const amount = BigInt("0x" + amountHex);
    offset += 64;

    // Extract timestamp (32 bytes = 64 hex chars)
    const timestampHex = hex.slice(offset, offset + 64);
    const timestamp = BigInt("0x" + timestampHex);
    offset += 64;

    // Extract block number (32 bytes = 64 hex chars)
    const blockNumberHex = hex.slice(offset, offset + 64);
    const blockNumber = BigInt("0x" + blockNumberHex);

    return {
      user: ethers.getAddress(user), // Normalize address checksum
      amount,
      timestamp,
      blockNumber,
    };
  }

  async startListening() {
    console.log("👂 Listening for DepositRequested events on BSC Testnet...");
    console.log("   (Waiting for deposits...)\n");

    // Listen for DepositRequested events
    this.contract.on(
      "DepositRequested",
      async (requestId, packedData, encryptedIndex, event) => {
        console.log("=".repeat(70));
        console.log("🔔 NEW DEPOSIT REQUEST RECEIVED");
        console.log("=".repeat(70));
        console.log("📋 Request ID:        ", requestId);
        console.log("📦 Packed Data (hex):  ", packedData);
        console.log("🔐 Encrypted Index:    ", encryptedIndex);
        console.log("🔗 Transaction Hash:   ", event.log.transactionHash);
        console.log("🔗 View on BscScan:    ", `https://testnet.bscscan.com/tx/${event.log.transactionHash}`);
        console.log("⏱️  Current Time:       ", new Date().toISOString());

        try {
          // Decode the packed data
          const decoded = this.decodePackedData(packedData);

          console.log("\n🔓 DECODED DATA:");
          console.log("   👤 User:         ", decoded.user);
          console.log(
            "   💰 Amount:       ",
            ethers.formatEther(decoded.amount)
          );
          console.log(
            "   ⏰ Timestamp:    ",
            decoded.timestamp.toString(),
            "(" + new Date(Number(decoded.timestamp) * 1000).toISOString() + ")"
          );
          console.log("   📦 Block Number: ", decoded.blockNumber.toString());

          // Verify the hash
          const recomputedHash = ethers.keccak256(packedData);
          const hashMatches = recomputedHash === requestId;
          console.log(
            "\n✅ Hash Verification: ",
            hashMatches ? "PASSED ✓" : "FAILED ✗"
          );

          // ============================================================
          // 🔐 ENCRYPTION PROCESS
          // ============================================================
          console.log("\n" + "=".repeat(70));
          console.log("🔐 ENCRYPTING AMOUNT");
          console.log("=".repeat(70));

          // Generate random symmetric key
          const symmetricKey = this.generateSymmetricKey();
          console.log("🔑 Generated Symmetric Key: ", symmetricKey.toString('hex'));

          // Encrypt the amount with the symmetric key
          const encryptedAmount = this.encryptAmount(decoded.amount, symmetricKey);
          console.log("🔒 Encrypted Amount:        ", encryptedAmount);

          // Encrypt symmetric key for USER
          const encryptedKeyForUser = this.encryptSymmetricKeyForAddress(symmetricKey, decoded.user);
          console.log("\n👤 USER ENCRYPTION:");
          console.log("   Address:                 ", decoded.user);
          console.log("   Encrypted Symmetric Key: ", encryptedKeyForUser);

          // Encrypt symmetric key for SERVER
          const encryptedKeyForServer = this.encryptSymmetricKeyForAddress(symmetricKey, this.serverAddress);
          console.log("\n🖥️  SERVER ENCRYPTION:");
          console.log("   Address:                 ", this.serverAddress);
          console.log("   Encrypted Symmetric Key: ", encryptedKeyForServer);

          console.log("\n" + "=".repeat(70));

          // ============================================================
          // 🔓 DECRYPTION TEST
          // ============================================================
          console.log("\n" + "=".repeat(70));
          console.log("🔓 TESTING DECRYPTION");
          console.log("=".repeat(70));

          // Test: Decrypt symmetric key using SERVER's private key
          console.log("\n🖥️  SERVER DECRYPTION TEST:");
          try {
            const decryptedKeyServer = this.decryptSymmetricKeyForAddress(encryptedKeyForServer, this.serverPrivateKey);
            console.log("   ✅ Decrypted Symmetric Key: ", decryptedKeyServer.toString('hex'));
            console.log("   ✅ Matches Original:        ", decryptedKeyServer.toString('hex') === symmetricKey.toString('hex') ? "YES ✓" : "NO ✗");

            // Decrypt amount using decrypted symmetric key
            const decryptedAmountServer = this.decryptAmount(encryptedAmount, decryptedKeyServer);
            console.log("   ✅ Decrypted Amount:         ", ethers.formatEther(decryptedAmountServer));
            console.log("   ✅ Matches Original:        ", decryptedAmountServer === decoded.amount ? "YES ✓" : "NO ✗");
          } catch (error) {
            console.log("   ❌ Decryption Failed:       ", error.message);
          }

          console.log("\n" + "=".repeat(70));

          // ============================================================
          // 🔓 GET USER INDEX FROM CONTRACT
          // ============================================================
          console.log("\n" + "=".repeat(70));
          console.log("🔓 GETTING USER INDEX FROM CONTRACT");
          console.log("=".repeat(70));

          let userIndex;
          try {
            // Get user's encrypted index from contract storage
            console.log("\n🖥️  Fetching encrypted index for user:", decoded.user);
            const encryptedIndexFromContract = await this.contract.getUserIndexByAddress(decoded.user);
            console.log("   📦 Encrypted Index (from contract):", encryptedIndexFromContract);

            // Decrypt the encrypted index using server's private key
            console.log("\n🖥️  Server decrypting user index...");
            const decryptedIndex = this.decryptSymmetricKeyForAddress(encryptedIndexFromContract, this.serverPrivateKey);
            userIndex = '0x' + decryptedIndex.toString('hex');
            console.log("   ✅ Decrypted Index (bytes32): ", userIndex);
          } catch (error) {
            console.log("   ❌ Failed to get/decrypt user index:", error.message);
            throw error;
          }

          console.log("\n" + "=".repeat(70));

          // ============================================================
          // 📝 STORE ENCRYPTED DATA ON-CHAIN
          // ============================================================
          console.log("\n" + "=".repeat(70));
          console.log("📝 STORING ENCRYPTED DATA ON-CHAIN");
          console.log("=".repeat(70));

          try {
            console.log("\n⏳ Calling storeDeposit on smart contract...");
            console.log("   Request ID:  ", requestId);
            console.log("   User Index:  ", userIndex);
            console.log("   (Original User Address: ", decoded.user, ")");

            const tx = await this.contract.storeDeposit(
              requestId,
              userIndex,
              '0x' + encryptedAmount,
              encryptedKeyForUser,
              encryptedKeyForServer
            );

            console.log("   📝 Transaction hash:", tx.hash);
            console.log("   🔗 View on BscScan: https://testnet.bscscan.com/tx/" + tx.hash);
            console.log("   ⏳ Waiting for confirmation...");

            const receipt = await tx.wait();
            console.log("   ✅ Transaction confirmed in block:", receipt.blockNumber);

            // Verify storage using user index
            const [storedEncAmount, storedKeyUser, storedKeyServer, exists] =
              await this.contract.getEncryptedBalance(userIndex);

            console.log("\n✅ VERIFICATION:");
            console.log("   Data stored on-chain:     ", exists ? "YES ✓" : "NO ✗");
            console.log("   Encrypted Amount length:  ", storedEncAmount.length, "bytes");
            console.log("   User Key length:          ", storedKeyUser.length, "bytes");
            console.log("   Server Key length:        ", storedKeyServer.length, "bytes");

          } catch (error) {
            console.log("   ❌ Failed to store on-chain:", error.message);
            if (error.data) {
              console.log("   Error data:", error.data);
            }
          }

          console.log("\n" + "=".repeat(70));

          // Check encrypted supply
          const encryptedSupply = await this.contract.encryptedSupply();
          console.log(
            "\n💼 Total Encrypted Supply: ",
            ethers.formatEther(encryptedSupply)
          );

          // Check completion status
          const isCompleted = await this.contract.depositCompleted(requestId);
          console.log("✅ Deposit Completed:      ", isCompleted);
        } catch (error) {
          console.log("⚠️  Error decoding or fetching details:", error.message);
          console.log(error.stack);
        }

        console.log("=".repeat(70));
        console.log("👂 Listening for more events...\n");
      }
    );

    // Keep process alive
    process.on("SIGINT", () => {
      console.log("\n\n👋 Shutting down server...");
      process.exit(0);
    });

    console.log("💡 Press Ctrl+C to stop the server\n");
  }

  async run() {
    await this.initialize();
    await this.startListening();
  }
}

// Run the server
const server = new EventListenerServerTestnet();
server.run().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
