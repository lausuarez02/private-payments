import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("\n🚀 Deploying ServerEncryptedERC20 (Manual) System...\n");

  const [deployer, serverWallet] = await ethers.getSigners();

  console.log("Deployer:", deployer.address);
  console.log("Server Wallet:", serverWallet.address);
  console.log(
    "Balance:",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    "ETH\n"
  );

  // 1. Deploy MockERC20 (for testing)
  console.log("📦 Deploying MockERC20...");
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const mockToken = await MockERC20.deploy(
    "Mock USDC",
    "mUSDC",
    ethers.parseEther("1000000")
  );
  await mockToken.waitForDeployment();
  const mockTokenAddress = await mockToken.getAddress();
  console.log("✅ MockERC20 deployed:", mockTokenAddress);

  // 2. Deploy ServerEncryptedERC20 from EncryptedServerERC20Manual.sol
  console.log("\n📦 Deploying ServerEncryptedERC20...");
  console.log("   Server Manager will be:", serverWallet.address);
  const ServerEncryptedERC20 = await ethers.getContractFactory(
    "ServerEncryptedERC20Manual"
  );

  // Deploy with token address and server manager address
  const serverManagerAddr = await serverWallet.getAddress();
  const serverEncrypted = (await ServerEncryptedERC20.deploy(
    mockTokenAddress,
    serverManagerAddr
  )) as any;
  await serverEncrypted.waitForDeployment();
  const serverEncryptedAddress = await serverEncrypted.getAddress();
  console.log("✅ ServerEncryptedERC20 deployed:", serverEncryptedAddress);

  // 3. Mint tokens to deployer for testing
  console.log("\n💰 Minting test tokens to deployer...");
  const mintAmount = ethers.parseEther("10000");
  const mintTx = await mockToken.mint(deployer.address, mintAmount);
  await mintTx.wait();
  console.log(
    "✅ Minted",
    ethers.formatEther(mintAmount),
    "mUSDC to",
    deployer.address
  );

  // 4. Approve contract to spend tokens
  console.log("\n✅ Approving ServerEncryptedERC20 to spend tokens...");
  const approveTx = await mockToken.approve(
    serverEncryptedAddress,
    ethers.MaxUint256
  );
  await approveTx.wait();
  console.log("✅ Approval granted");

  console.log("\n" + "=".repeat(70));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(70));
  console.log("MockERC20:              ", mockTokenAddress);
  console.log("ServerEncryptedERC20:   ", serverEncryptedAddress);
  console.log("Deployer:               ", deployer.address);
  console.log("Server Wallet:          ", serverWallet.address);
  console.log("=".repeat(70));

  // Save deployment info to .deployed-byal.json
  const deploymentInfo = {
    network: "localhost",
    timestamp: new Date().toISOString(),
    contracts: {
      ServerEncryptedERC20: serverEncryptedAddress,
      MockERC20: mockTokenAddress,
    },
    accounts: {
      deployer: deployer.address,
      serverWallet: serverWallet.address,
    },
    privateKeys: {
      // Hardhat default test private keys - NEVER use in production!
      deployer:
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
      serverWallet:
        "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
    },
  };

  const deploymentPath = path.join(__dirname, "..", ".deployed-byal.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n💾 Deployment info saved to .deployed-byal.json");
  console.log("\n🎉 Done! You can now run:");
  console.log("   npm run server:byal     # Start event listener server");
  console.log("   npm run client:byal     # Call requestDeposit");
  console.log();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
