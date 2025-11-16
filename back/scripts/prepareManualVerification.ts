import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function main() {
  console.log("\n📋 Preparing Manual Verification Data\n");
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

  const mockTokenAddress = deploymentInfo.contracts.MockERC20;
  const serverEncryptedAddress = deploymentInfo.contracts.ServerEncryptedERC20;
  const serverWalletAddress = deploymentInfo.accounts.serverWallet;

  console.log("📝 Contract Addresses:");
  console.log("   MockERC20:              ", mockTokenAddress);
  console.log("   ServerEncryptedERC20:   ", serverEncryptedAddress);
  console.log("   Server Manager:         ", serverWalletAddress);
  console.log();
  console.log("=".repeat(70));

  // Generate constructor arguments
  console.log("\n🔧 Constructor Arguments (ABI-encoded):\n");

  // MockERC20 constructor arguments
  const mockERC20Args = ethers.AbiCoder.defaultAbiCoder().encode(
    ["string", "string", "uint256"],
    ["Mock USDC", "mUSDC", ethers.parseEther("1000000")]
  );
  console.log("📦 MockERC20:");
  console.log("   " + mockERC20Args);
  console.log();

  // ServerEncryptedERC20Manual constructor arguments
  const serverEncryptedArgs = ethers.AbiCoder.defaultAbiCoder().encode(
    ["address", "address"],
    [mockTokenAddress, serverWalletAddress]
  );
  console.log("📦 ServerEncryptedERC20Manual:");
  console.log("   " + serverEncryptedArgs);
  console.log();

  console.log("=".repeat(70));
  console.log("\n📄 Manual Verification Instructions:\n");

  const explorerBase = deploymentInfo.network === "bscTestnet"
    ? "https://testnet.bscscan.com"
    : "https://bscscan.com";

  console.log("1. Go to MockERC20 contract:");
  console.log(`   ${explorerBase}/address/${mockTokenAddress}#code`);
  console.log();
  console.log("2. Click 'Verify and Publish'");
  console.log();
  console.log("3. Fill in the form:");
  console.log("   - Compiler Type: Solidity (Single file)");
  console.log("   - Compiler Version: v0.8.28+commit.7893614a");
  console.log("   - Open Source License Type: MIT License (MIT)");
  console.log();
  console.log("4. Click 'Continue'");
  console.log();
  console.log("5. Paste the contract source code");
  console.log("   (Use the flattened version or copy from contracts/MockERC20.sol)");
  console.log();
  console.log("6. Optimization: Yes (200 runs)");
  console.log();
  console.log("7. Constructor Arguments ABI-encoded:");
  console.log("   " + mockERC20Args.slice(2)); // Remove 0x prefix
  console.log();
  console.log("8. Click 'Verify and Publish'");
  console.log();
  console.log("=".repeat(70));
  console.log();
  console.log("Repeat the same process for ServerEncryptedERC20Manual:");
  console.log(`   ${explorerBase}/address/${serverEncryptedAddress}#code`);
  console.log();
  console.log("Constructor Arguments ABI-encoded:");
  console.log("   " + serverEncryptedArgs.slice(2)); // Remove 0x prefix
  console.log();
  console.log("=".repeat(70));

  // Try to generate flattened files
  console.log("\n📄 Generating flattened source code files...\n");

  try {
    // Flatten MockERC20
    console.log("⏳ Flattening MockERC20...");
    const mockOutput = path.join(__dirname, "..", "flattened", "MockERC20.sol");
    await execAsync(`npx hardhat flatten contracts/MockERC20.sol > "${mockOutput}"`);
    console.log(`✅ Saved to: ${mockOutput}`);

    // Flatten ServerEncryptedERC20Manual
    console.log("⏳ Flattening ServerEncryptedERC20Manual...");
    const serverOutput = path.join(__dirname, "..", "flattened", "ServerEncryptedERC20Manual.sol");
    await execAsync(`npx hardhat flatten contracts/EncryptedServerERC20ByManual.sol > "${serverOutput}"`);
    console.log(`✅ Saved to: ${serverOutput}`);

    console.log("\n✅ Flattened files generated successfully!");
    console.log("   You can now copy these files and paste them into BscScan\n");
  } catch (error: any) {
    console.log("\n⚠️  Could not generate flattened files automatically");
    console.log("   You can manually flatten using:");
    console.log("   npx hardhat flatten contracts/MockERC20.sol");
    console.log("   npx hardhat flatten contracts/EncryptedServerERC20ByManual.sol");
    console.log();
  }

  console.log("=".repeat(70));
  console.log();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
