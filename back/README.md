# ServerEncryptedERC20 (ByAl) - Privacy-Enhanced Encrypted Token System

A server-assisted encrypted token balance system with enhanced privacy through encrypted user indexing. Users deposit tokens, the server encrypts balances, and all data is stored on-chain with multiple layers of encryption.

## 🚀 Quick Start

### Prerequisites
- Node.js installed
- Hardhat environment set up

### Running the Full System

**Terminal 1 - Start Local Blockchain**
```bash
npm run node
```

**Terminal 2 - Deploy Contracts**
```bash
npm run deploy:byal
```
This will:
- Deploy MockERC20 token
- Deploy ServerEncryptedERC20 contract
- Mint test tokens to deployer
- Approve contract to spend tokens
- Save deployment info to `.deployed-byal.json`

**Terminal 3 - Start Event Listener Server**
```bash
npm run server:byal
```
The server will:
- Listen for deposit events
- Encrypt balances with AES-256-GCM
- Encrypt symmetric keys for users and server
- Store encrypted data on-chain

**Terminal 4 - Make a Deposit**
```bash
npm run client:byal
```
The client will:
- Create encrypted user index from signature
- Call `requestDeposit(amount, encryptedIndex)`
- Auto-authenticate on first deposit
- Transfer tokens to contract

## 🔐 How The Authentication Flow Works

### 1. Client Creates Encrypted Index
```javascript
// User signs a message with their address
const message = `Hello from zkpayments ${wallet.address}`;
const signature = await wallet.signMessage(message);

// Hash the signature
const signatureHash = ethers.keccak256(ethers.toUtf8Bytes(signature));

// Encrypt hash for server manager
const encryptedIndex = encryptForAddress(signatureHash, SERVER_MANAGER_ADDRESS);
```

### 2. Client Calls requestDeposit
```javascript
await contract.requestDeposit(depositAmount, encryptedIndex);
```

### 3. Contract Auto-Stores Encrypted Index
On the first deposit, the contract automatically stores:
```solidity
userAddressToEncryptedIndex[msg.sender] = _encryptedIndex;
```

### 4. Server Queries User Index
When processing deposits, the server retrieves the user's encrypted index:
```javascript
const encryptedIndexFromContract = await contract.getUserIndexByAddress(userAddress);
```

### 5. Server Decrypts Index and Stores Balance
```javascript
const decryptedIndex = decryptSymmetricKeyForAddress(encryptedIndexFromContract, serverPrivateKey);
await contract.storeDeposit(requestId, decryptedIndex, encryptedAmount, ...);
```

## 📋 Architecture Overview

### Privacy Layers

1. **Encrypted User Index**: User's address is not directly linked to their balance on-chain
2. **Encrypted Balance Amount**: Balance encrypted with random symmetric key (AES-256-GCM)
3. **Encrypted Symmetric Keys**: Key encrypted separately for user and server
4. **Server-Side Decryption**: Only server can decrypt user indices

### Smart Contract Functions

**User Functions:**
- `authenticateUser(bytes encryptedIndex)` - Manually authenticate (optional)
- `requestDeposit(uint256 amount, bytes encryptedIndex)` - Deposit tokens and auto-authenticate
- `getUserIndexByAddress(address userAddress)` - View encrypted index for any user
- `getEncryptedBalance(bytes32 userIndex)` - View encrypted balance by index

**Server Functions (onlyServerManager):**
- `storeDeposit(bytes32 requestId, bytes32 userIndex, ...)` - Store encrypted balance data

### Events

- `UserAuthenticated(address indexed user, bytes encryptedIndex)` - Emitted on authentication
- `DepositRequested(bytes32 indexed requestId, bytes packedData, bytes encryptedIndex)` - Emitted on deposit request
- `BalanceStored(bytes32 indexed requestId, ...)` - Emitted when server stores encrypted data

## 🛠 Available Commands

| Command | Description |
|---------|-------------|
| `npm run compile` | Compile smart contracts |
| `npm run node` | Start local Hardhat blockchain |
| `npm run deploy:byal` | Deploy ServerEncryptedERC20 system (localhost) |
| `npm run deploy:byal:testnet` | Deploy to BSC Testnet |
| `npm run deploy:byal:mainnet` | Deploy to BSC Mainnet |
| `npm run server:byal` | Start event listener server (localhost) |
| `npm run server:byal:testnet` | Start event listener server (BSC Testnet) |
| `npm run server` | Start event listener (env-based, for Railway) |
| `npm run client:byal` | Make a deposit (localhost) |
| `npm run client:byal:testnet` | Make a deposit (BSC Testnet) |
| `npm run verify:testnet` | Verify contracts on BSC Testnet (automated) |
| `npm run verify:mainnet` | Verify contracts on BSC Mainnet (automated) |
| `npm run verify:prepare` | Prepare data for manual verification |

## 🌐 Deploying to BNB (BSC) Testnet

### 1. Setup Environment Variables

Create a `.env` file in the `back` directory:

```bash
cp .env.example .env
```

Edit `.env` and add your private keys:

```env
# Deployer account (first account)
PRIVATE_KEY=your_deployer_private_key_here_without_0x_prefix

# Server manager account (second account)
PRIVATE_KEY_2=your_server_manager_private_key_here_without_0x_prefix
```

⚠️ **IMPORTANT**:
- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- Never share your private keys with anyone
- You need TWO different accounts (deployer and server manager)
- Both accounts need testnet BNB for gas fees

### 2. Get Testnet BNB

Get free testnet BNB from the faucet for **BOTH** addresses:
- Visit: https://testnet.bnbchain.org/faucet-smart
- Enter your **deployer** wallet address → Request BNB
- Enter your **server manager** wallet address → Request BNB

### 3. Deploy to Testnet

```bash
npm run deploy:byal:testnet
```

This will:
- Use `PRIVATE_KEY` (deployer) and `PRIVATE_KEY_2` (server manager)
- Deploy MockERC20 token to BSC Testnet
- Deploy ServerEncryptedERC20 contract
- Mint test tokens to your deployer address
- Save deployment info to `.deployed-byal.json`
- **NOT save private keys** (for security)

### 4. Start Testnet Event Listener Server

In a separate terminal, run:

```bash
npm run server:byal:testnet
```

This will:
- Connect to BSC Testnet using RPC
- Use `PRIVATE_KEY_2` as the server manager
- Listen for deposit events on-chain
- Automatically encrypt and store balances when deposits occur

⚠️ **Note**: Make sure the server manager address has testnet BNB to pay for gas!

### 5. Make a Deposit on Testnet

In a separate terminal (with server running), make a test deposit:

```bash
npm run client:byal:testnet
```

This will:
- Connect to BSC Testnet
- Use `PRIVATE_KEY` (deployer account)
- Create encrypted user index from signature
- Call `requestDeposit` with encrypted index
- Automatically authenticate on first deposit
- Transfer tokens to the contract

The server will automatically:
- Detect the deposit event
- Encrypt the balance
- Store encrypted data on-chain

### 6. Verify Deployment

Check your deployment on BscScan Testnet:
- https://testnet.bscscan.com/
- Search for your contract address
- Monitor transactions in real-time
- View all deposits and encrypted storage transactions

### 7. Verify Contracts on BscScan

To verify your contracts' source code on BscScan, follow these steps:

#### Get an API Key (via Etherscan)

**Important**: BscScan now uses Etherscan API V2. You need to get your API key from Etherscan, not BscScan.

1. Go to https://etherscan.io/myapikey
2. Create a free Etherscan account (if you don't have one)
3. Click "API Keys" and generate a new API key
4. Copy the API key (it works for both BSC Testnet and Mainnet)

#### Add API Key to .env

Add your Etherscan API key to your `.env` file:

```env
BSCSCAN_API_KEY=your_etherscan_api_key_here
```

#### Automated Verification (May Show Warnings)

You can try automated verification, but you may see Etherscan V2 API deprecation warnings:

For **BSC Testnet**:
```bash
npm run verify:testnet
```

For **BSC Mainnet**:
```bash
npm run verify:mainnet
```

**Note**: The current Hardhat version (v2.x) shows deprecation warnings for Etherscan V2 API. Verification might still work, but if it fails, use the manual method below.

#### Manual Verification (Recommended)

For guaranteed working verification, use manual verification on BscScan:

**Step 1**: Prepare verification data
```bash
npm run verify:prepare
```

This will generate:
- Flattened source code files in `flattened/` directory
- ABI-encoded constructor arguments
- Step-by-step verification instructions with all the data you need

**Step 2**: Follow the printed instructions to verify on BscScan

The script will provide:
- Direct links to your contract pages on BscScan
- Exact constructor arguments (ABI-encoded)
- Flattened source code files ready to copy/paste

The verification process:
1. Go to your contract's page on BscScan (link provided by the script)
2. Click "Contract" tab → "Verify and Publish"
3. Fill in the details:
   - **Compiler Type**: Solidity (Single file)
   - **Compiler Version**: v0.8.28+commit.7893614a
   - **License**: MIT
   - **Optimization**: Yes (200 runs)
4. Paste the flattened source code (from `flattened/MockERC20.sol` or `flattened/ServerEncryptedERC20Manual.sol`)
5. Paste the constructor arguments (provided by the script, without the 0x prefix)
6. Click "Verify and Publish"

Repeat for both MockERC20 and ServerEncryptedERC20Manual contracts.

#### View Verified Contracts

After verification, you can view the source code, read/write to contracts, and see all events on BscScan:

- **Testnet**: https://testnet.bscscan.com/address/YOUR_CONTRACT_ADDRESS#code
- **Mainnet**: https://bscscan.com/address/YOUR_CONTRACT_ADDRESS#code

## 🚂 Deploying Event Listener to Railway

The event listener server can be deployed to Railway (or any cloud platform) without needing local deployment files.

### 1. Use the Environment Variable Based Server

The [server/event-listener.js](server/event-listener.js) file reads all configuration from environment variables instead of local files, making it perfect for cloud deployment.

### 2. Set Environment Variables on Railway

Add these environment variables in your Railway project:

```env
# Server manager private key
PRIVATE_KEY_2=your_server_manager_private_key

# Deployed contract address (from .deployed-byal.json)
CONTRACT_ADDRESS=0xYourContractAddress

# Network RPC URL
RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545

# Network name (for logging)
NETWORK_NAME=BSC Testnet

# Block explorer URL (optional)
EXPLORER_URL=https://testnet.bscscan.com
```

### 3. Configure Start Command

Set the start command in Railway to:

```bash
npm run server
```

Or in your `package.json` (already configured):

```json
{
  "scripts": {
    "server": "node server/event-listener.js"
  }
}
```

### 4. Deploy

Push your code to Railway and it will automatically:
- Install dependencies
- Start the event listener
- Listen for deposit events
- Encrypt and store balances on-chain

### Local Testing with Environment Variables

You can test the environment variable configuration locally:

1. Add the required variables to your `.env` file:
   ```env
   PRIVATE_KEY_2=your_key
   CONTRACT_ADDRESS=0xYourAddress
   RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
   NETWORK_NAME=BSC Testnet
   EXPLORER_URL=https://testnet.bscscan.com
   ```

2. Run the server:
   ```bash
   npm run server
   ```

### Network Configuration

The following networks are configured in `hardhat.config.ts`:

**BSC Testnet:**
- RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545
- Chain ID: 97
- Explorer: https://testnet.bscscan.com

**BSC Mainnet:**
- RPC URL: https://bsc-dataseed.binance.org/
- Chain ID: 56
- Explorer: https://bscscan.com

## 📁 Key Files

### Smart Contracts
- `contracts/EncryptedServerERC20ByAl.sol` - Main contract with authentication system
- `contracts/MockERC20.sol` - Test ERC20 token

### Server
- `server/event-listener-byal.js` - Event listener for localhost
- `server/event-listener-byal-testnet.js` - Event listener for BSC Testnet (reads from file)
- `server/event-listener.js` - Event listener for cloud deployment (reads from env vars)

### Client
- `examples/client-byal.js` - Client for making deposits

### Scripts
- `scripts/deployEncryptedByAl.ts` - Deployment script

### Configuration
- `.deployed-byal.json` - Auto-generated deployment info (created after deployment)

## 🔑 Encryption Details

### Symmetric Key Encryption (AES-256-GCM)
```javascript
// Server generates random 32-byte key
const symmetricKey = crypto.randomBytes(32);

// Encrypt amount with symmetric key
const cipher = crypto.createCipheriv('aes-256-gcm', symmetricKey, iv);
const encryptedAmount = cipher.update(amount) + cipher.final();
```

### Address-Based Key Encryption (Hash-Based Demo)
```javascript
// Encrypt symmetric key for a specific address
const addressHash = ethers.keccak256(ethers.toUtf8Bytes(address));
const cipher = crypto.createCipheriv('aes-256-cbc', addressHash, iv);
const encryptedKey = cipher.update(symmetricKey) + cipher.final();
```

⚠️ **Note**: This uses simplified hash-based encryption for demonstration. Production should use ECIES with actual public keys.

## 🏗 Data Flow

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │ 1. Signs message & creates encrypted index
       │ 2. Calls requestDeposit(amount, encryptedIndex)
       ▼
┌─────────────────────────────────┐
│   Smart Contract                │
│  - Auto-stores encrypted index  │
│  - Emits DepositRequested       │
└──────┬──────────────────────────┘
       │ 3. Event emitted
       ▼
┌─────────────────────────────────┐
│   Server (Event Listener)       │
│  - Gets encrypted index from    │
│    contract storage             │
│  - Decrypts index               │
│  - Generates symmetric key      │
│  - Encrypts amount              │
│  - Encrypts key for user        │
│  - Encrypts key for server      │
└──────┬──────────────────────────┘
       │ 4. Calls storeDeposit(...)
       ▼
┌─────────────────────────────────┐
│   Smart Contract                │
│  - Stores encrypted data        │
│  - Maps userIndex => encrypted  │
│    balance                      │
└─────────────────────────────────┘
```

## ⚠️ Security Notice

**This is a demonstration implementation for educational purposes.**

For production use:
- Replace hash-based encryption with proper ECIES
- Implement secure key management
- Use hardware security modules (HSM) for server keys
- Add rate limiting and access controls
- Conduct comprehensive security audits
- Never commit private keys to version control
- Use environment variables for sensitive data

## 📄 Test Configuration

The system uses Hardhat's default test accounts:
- **Deployer**: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- **Server**: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`

⚠️ **NEVER use these keys in production!**

## 📄 License

ISC
