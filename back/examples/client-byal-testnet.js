const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
require("dotenv").config();

// ABI for ServerEncryptedERC20 (minimal - just what we need)
const CONTRACT_ABI = [
  "function requestDeposit(uint256 _amount, bytes calldata _encryptedIndex) external returns (bytes32 requestId)",
  "function encryptedSupply() external view returns (uint256)",
  "function authenticateUser(bytes calldata _encryptedIndex) external",
  "function getUserIndexByAddress(address _userAddress) external view returns (bytes memory encryptedIndex)",
  "event DepositRequested(bytes32 indexed requestId, bytes packedData, bytes encryptedIndex)",
  "event UserAuthenticated(address indexed user, bytes encryptedIndex)"
];

const TOKEN_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function symbol() external view returns (string)",
];

// Encrypt data for a specific address (same method as server)
function encryptForAddress(data, address) {
  // Use same hash-based encryption as server
  const addressHash = ethers.keccak256(ethers.toUtf8Bytes(address));
  const cipher = crypto.createCipheriv('aes-256-cbc',
    Buffer.from(addressHash.slice(2), 'hex'),
    Buffer.alloc(16, 0) // Zero IV for deterministic demo
  );

  let encrypted = cipher.update(data);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return '0x' + encrypted.toString('hex');
}

async function main() {
  console.log("\n🔐 ServerEncryptedERC20 Client (BSC Testnet)\n");
  console.log("=".repeat(70));

  // Check for private key
  if (!process.env.PRIVATE_KEY) {
    console.error("❌ PRIVATE_KEY not found in environment variables!");
    console.error("   Please set PRIVATE_KEY in your .env file");
    console.error("   This should be your deployer's private key");
    process.exit(1);
  }

  // Load configuration from .deployed-byal.json
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
    console.warn("   This client is configured for BSC Testnet");
    console.warn("   Make sure you deployed with: npm run deploy:byal:testnet");
  }

  const CONTRACT_ADDRESS = deploymentInfo.contracts.ServerEncryptedERC20;
  const TOKEN_ADDRESS = deploymentInfo.contracts.MockERC20;
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  const NETWORK_URL = "https://data-seed-prebsc-1-s1.binance.org:8545";

  // Connect to BSC Testnet provider
  const provider = new ethers.JsonRpcProvider(NETWORK_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log("Network:   BSC Testnet (Chain ID: 97)");
  console.log("RPC URL:  ", NETWORK_URL);
  console.log("Signer:   ", wallet.address);
  console.log("Contract: ", CONTRACT_ADDRESS);
  console.log("Token:    ", TOKEN_ADDRESS);
  console.log("=".repeat(70));

  // Verify connection
  try {
    const network = await provider.getNetwork();
    console.log("\n✅ Connected to network:");
    console.log("   Chain ID:", network.chainId.toString());
    if (network.chainId !== 97n) {
      console.error("\n❌ ERROR: Wrong network! Expected Chain ID 97 (BSC Testnet)");
      process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ Failed to connect to BSC Testnet:", error.message);
    process.exit(1);
  }

  // Check wallet balance
  const bnbBalance = await provider.getBalance(wallet.address);
  console.log("\n💰 Your BNB balance:", ethers.formatEther(bnbBalance), "BNB");

  if (bnbBalance === 0n) {
    console.warn("\n⚠️  WARNING: You have 0 BNB!");
    console.warn("   You need BNB to pay for gas fees");
    console.warn("   Get testnet BNB from: https://testnet.bnbchain.org/faucet-smart");
    console.warn("\n   Continuing anyway (might fail)...");
  }

  // Connect to contracts
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
  const token = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, wallet);

  const tokenSymbol = await token.symbol();

  // Check token balance
  const balance = await token.balanceOf(wallet.address);
  console.log(`\n💰 Your ${tokenSymbol} balance:`, ethers.formatEther(balance));

  if (balance === 0n) {
    console.error(`\n❌ You have 0 ${tokenSymbol} tokens!`);
    console.error("   The deployment script should have minted tokens to the deployer");
    console.error("   Make sure you deployed with the same PRIVATE_KEY");
    process.exit(1);
  }

  // Amount to deposit
  const depositAmount = ethers.parseEther("100");
  console.log(`\n📤 Requesting deposit of ${ethers.formatEther(depositAmount)} ${tokenSymbol}...`);

  try {
    // ============================================================
    // 🔐 CREATE ENCRYPTED USER INDEX
    // ============================================================
    console.log("\n" + "=".repeat(70));
    console.log("🔐 CREATING ENCRYPTED USER INDEX");
    console.log("=".repeat(70));

    // Step 1: Sign a message with the user's address
    const message = `Hello from zkpayments ${wallet.address}`;
    console.log("\n📝 Message to sign:     ", message);

    const signature = await wallet.signMessage(message);
    console.log("✍️  Signature:           ", signature);

    // Step 2: Hash the signature using keccak256
    const signatureHash = ethers.keccak256(ethers.toUtf8Bytes(signature));
    console.log("🔑 Signature Hash:      ", signatureHash);

    // Step 3: Encrypt the hash for the server manager
    const SERVER_MANAGER_ADDRESS = deploymentInfo.accounts.serverWallet;
    const encryptedIndex = encryptForAddress(Buffer.from(signatureHash.slice(2), 'hex'), SERVER_MANAGER_ADDRESS);
    console.log("🔒 Encrypted for Server:", encryptedIndex);
    console.log("   (Server Address:     ", SERVER_MANAGER_ADDRESS, ")");

    console.log("\n" + "=".repeat(70));

    // Get current nonce to avoid nonce issues
    const currentNonce = await provider.getTransactionCount(wallet.address, "latest");
    console.log(`\n📊 Current nonce: ${currentNonce}`);

    // Approve if needed
    console.log("⏳ Approving tokens...");
    const approveTx = await token.approve(CONTRACT_ADDRESS, depositAmount, {
      nonce: currentNonce
    });
    console.log("   📝 Approval tx hash:", approveTx.hash);
    console.log("   🔗 View on BscScan: https://testnet.bscscan.com/tx/" + approveTx.hash);

    await approveTx.wait();
    console.log("✅ Tokens approved");

    // Request deposit with encrypted index (use next nonce)
    console.log("\n⏳ Calling requestDeposit with encrypted index...");
    const tx = await contract.requestDeposit(depositAmount, encryptedIndex, {
      nonce: currentNonce + 1
    });
    console.log("   📝 Transaction hash:", tx.hash);
    console.log("   🔗 View on BscScan: https://testnet.bscscan.com/tx/" + tx.hash);

    const receipt = await tx.wait();
    console.log("   ✅ Transaction confirmed in block:", receipt.blockNumber);

    // Extract requestId from event
    const event = receipt.logs.find(log => {
      try {
        return contract.interface.parseLog(log)?.name === "DepositRequested";
      } catch {
        return false;
      }
    });

    if (event) {
      const parsedEvent = contract.interface.parseLog(event);
      const requestId = parsedEvent.args.requestId;
      console.log("\n🎯 Request ID:", requestId);
      console.log("   (Server should process this deposit)\n");
    }

    // Check encrypted supply
    const encryptedSupply = await contract.encryptedSupply();
    console.log("💼 Total encrypted supply:", ethers.formatEther(encryptedSupply), tokenSymbol);

    console.log("\n✅ Done! Check the server logs to see the deposit being processed.");
    console.log("🔗 Monitor on BscScan: https://testnet.bscscan.com/address/" + CONTRACT_ADDRESS);
    console.log();

  } catch (error) {
    console.error("\n❌ Error:", error.message);

    if (error.code === "INSUFFICIENT_FUNDS") {
      console.error("\n💡 You don't have enough BNB to pay for gas fees");
      console.error("   Get testnet BNB from: https://testnet.bnbchain.org/faucet-smart");
    } else if (error.code === "NONCE_EXPIRED" || error.code === "REPLACEMENT_UNDERPRICED") {
      console.error("\n💡 Try running the command again (nonce issue)");
    }

    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
