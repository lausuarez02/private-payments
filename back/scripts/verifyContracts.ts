import { run } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("\n🔍 Verifying Contracts on BscScan...\n");
  console.log("=".repeat(70));

  // Load deployment info
  const deploymentPath = path.join(__dirname, "..", ".deployed-byal.json");

  if (!fs.existsSync(deploymentPath)) {
    console.error("❌ Deployment file not found!");
    console.error("   Please run deployment first:");
    console.error("   - For testnet: npm run deploy:byal:testnet");
    console.error("   - For mainnet: npm run deploy:byal:mainnet");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));

  console.log("📂 Loaded deployment from .deployed-byal.json");
  console.log("   Network:", deploymentInfo.network);
  console.log("   Chain ID:", deploymentInfo.chainId);
  console.log();

  // Check for BscScan API key
  if (!process.env.BSCSCAN_API_KEY) {
    console.error("❌ BSCSCAN_API_KEY not found in environment variables!");
    console.error("   Please add it to your .env file");
    console.error("");
    console.error("   🔑 BscScan now uses Etherscan API V2");
    console.error("   Get your FREE API key from: https://etherscan.io/myapikey");
    console.error("   1. Create an Etherscan account (it's free)");
    console.error("   2. Go to 'API Keys' and generate a new key");
    console.error("   3. Add it to your .env file as: BSCSCAN_API_KEY=your_key_here");
    console.error("");
    process.exit(1);
  }

  const mockTokenAddress = deploymentInfo.contracts.MockERC20;
  const serverEncryptedAddress = deploymentInfo.contracts.ServerEncryptedERC20;
  const serverWalletAddress = deploymentInfo.accounts.serverWallet;

  console.log("📝 Contract Addresses:");
  console.log("   MockERC20:              ", mockTokenAddress);
  console.log("   ServerEncryptedERC20:   ", serverEncryptedAddress);
  console.log("   Server Manager:         ", serverWalletAddress);
  console.log();
  console.log("=".repeat(70));

  // Verify MockERC20
  console.log("\n📦 Verifying MockERC20...\n");
  try {
    await run("verify:verify", {
      address: mockTokenAddress,
      constructorArguments: [
        "Mock USDC",           // name
        "mUSDC",               // symbol
        "1000000000000000000000000"  // initial supply (1,000,000 tokens with 18 decimals)
      ],
    });
    console.log("✅ MockERC20 verified successfully!");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("ℹ️  MockERC20 is already verified");
    } else {
      console.error("❌ Error verifying MockERC20:");
      console.error("   ", error.message);
    }
  }

  // Verify ServerEncryptedERC20Manual
  console.log("\n📦 Verifying ServerEncryptedERC20Manual...\n");
  try {
    await run("verify:verify", {
      address: serverEncryptedAddress,
      constructorArguments: [
        mockTokenAddress,      // underlying token address
        serverWalletAddress    // server manager address
      ],
      contract: "contracts/EncryptedServerERC20ByManual.sol:ServerEncryptedERC20Manual"
    });
    console.log("✅ ServerEncryptedERC20Manual verified successfully!");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("ℹ️  ServerEncryptedERC20Manual is already verified");
    } else {
      console.error("❌ Error verifying ServerEncryptedERC20Manual:");
      console.error("   ", error.message);
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log("✅ Verification Complete!");
  console.log("=".repeat(70));

  // Display links based on network
  const explorerBase = deploymentInfo.network === "bscTestnet"
    ? "https://testnet.bscscan.com"
    : "https://bscscan.com";

  console.log("\n🔗 View Verified Contracts:");
  console.log(`   MockERC20:              ${explorerBase}/address/${mockTokenAddress}#code`);
  console.log(`   ServerEncryptedERC20:   ${explorerBase}/address/${serverEncryptedAddress}#code`);
  console.log();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
