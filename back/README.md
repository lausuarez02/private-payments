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
| `npm run server:byal` | Start event listener server |
| `npm run client:byal` | Make a deposit (auto-authenticate) |

## 🌐 Deploying to BNB (BSC) Testnet

### 1. Setup Environment Variables

Create a `.env` file in the `back` directory:

```bash
cp .env.example .env
```

Edit `.env` and add your private key:

```env
PRIVATE_KEY=your_private_key_here_without_0x_prefix
```

⚠️ **IMPORTANT**:
- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- Never share your private key with anyone

### 2. Get Testnet BNB

Get free testnet BNB from the faucet:
- Visit: https://testnet.bnbchain.org/faucet-smart
- Enter your wallet address
- Request testnet BNB

### 3. Deploy to Testnet

```bash
npm run deploy:byal:testnet
```

This will:
- Deploy MockERC20 token to BSC Testnet
- Deploy ServerEncryptedERC20 contract
- Mint test tokens to your deployer address
- Save deployment info to `.deployed-byal.json`
- **NOT save private keys** (for security)

### 4. Verify Deployment

Check your deployment on BscScan Testnet:
- https://testnet.bscscan.com/
- Search for your contract address

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
- `server/event-listener-byal.js` - Event listener with encryption logic

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
