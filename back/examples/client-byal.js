const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

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
  console.log("\n🔐 ServerEncryptedERC20 Client (ByAl)\n");
  console.log("=".repeat(70));

  // Load configuration from .deployed-byal.json
  const deploymentPath = path.join(__dirname, "..", ".deployed-byal.json");

  if (!fs.existsSync(deploymentPath)) {
    console.error("❌ Configuration not found!");
    console.error("   Please run: npm run deploy:byal");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  console.log("📂 Loaded configuration from .deployed-byal.json\n");

  const CONTRACT_ADDRESS = deploymentInfo.contracts.ServerEncryptedERC20;
  const TOKEN_ADDRESS = deploymentInfo.contracts.MockERC20;
  const PRIVATE_KEY = deploymentInfo.privateKeys.deployer;

  // Connect to provider
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log("Signer:    ", wallet.address);
  console.log("Contract:  ", CONTRACT_ADDRESS);
  console.log("Token:     ", TOKEN_ADDRESS);
  console.log("=".repeat(70));

  // Connect to contracts
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
  const token = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, wallet);

  const tokenSymbol = await token.symbol();

  // Check balance
  const balance = await token.balanceOf(wallet.address);
  console.log(`\n💰 Your ${tokenSymbol} balance:`, ethers.formatEther(balance));

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
    await approveTx.wait();
    console.log("✅ Tokens approved");

    // Request deposit with encrypted index (use next nonce)
    console.log("\n⏳ Calling requestDeposit with encrypted index...");
    const tx = await contract.requestDeposit(depositAmount, encryptedIndex, {
      nonce: currentNonce + 1
    });
    console.log("   📝 Transaction hash:", tx.hash);

    const receipt = await tx.wait();
    console.log("   ✅ Transaction confirmed!");

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
      console.log("   (Server should log this requestId)");
    }

    // Check encrypted supply
    const encryptedSupply = await contract.encryptedSupply();
    console.log("\n💼 Total encrypted supply:", ethers.formatEther(encryptedSupply), tokenSymbol);

    console.log("\n✅ Done! Check the server logs to see the requestId.\n");

  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
