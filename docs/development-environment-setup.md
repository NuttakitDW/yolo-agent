# Fusion+ Cross-Chain Development Environment Setup

## Overview

Complete setup guide for building ETH-BTC cross-chain swaps using 1inch Fusion+ protocol.

## Prerequisites

- Node.js v18+ and npm/yarn
- Git
- Docker (optional, for local nodes)
- 8GB+ RAM recommended

## 1. Project Structure

```bash
unite-agent/
├── src/
│   ├── bitcoin/           # Bitcoin HTLC implementation
│   ├── ethereum/          # Ethereum contract interactions
│   ├── fusion/            # 1inch Fusion+ integration
│   ├── resolver/          # Cross-chain resolver logic
│   └── utils/             # Shared utilities
├── contracts/             # Smart contracts
├── scripts/              # Deployment and testing scripts
├── test/                 # Test suites
└── config/               # Configuration files
```

## 2. Core Dependencies

### Package.json
```json
{
  "name": "unite-fusion-agent",
  "version": "1.0.0",
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "test": "jest",
    "test:integration": "jest --testPathPattern=integration"
  },
  "dependencies": {
    // Bitcoin libraries
    "bitcoinjs-lib": "^6.1.5",
    "ecpair": "^2.1.0",
    "tiny-secp256k1": "^2.2.3",
    "bitcoin-core": "^4.2.0",
    
    // Ethereum libraries
    "ethers": "^6.11.0",
    "@1inch/fusion-sdk": "^2.0.0",
    "@1inch/limit-order-protocol-utils": "^5.0.0",
    
    // Development tools
    "dotenv": "^16.4.0",
    "axios": "^1.6.5",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "typescript": "^5.3.3",
    "jest": "^29.7.0",
    "nodemon": "^3.0.3",
    "hardhat": "^2.19.4"
  }
}
```

## 3. Bitcoin Setup

### Option A: Bitcoin Core (Full Node)
```bash
# Install Bitcoin Core
wget https://bitcoincore.org/bin/bitcoin-core-26.0/bitcoin-26.0-x86_64-linux-gnu.tar.gz
tar -xzf bitcoin-26.0-x86_64-linux-gnu.tar.gz
sudo install -m 0755 -o root -g root bitcoin-26.0/bin/* /usr/local/bin/

# Configure bitcoin.conf for testnet
mkdir ~/.bitcoin
cat > ~/.bitcoin/bitcoin.conf << EOF
testnet=1
server=1
rpcuser=yourusername
rpcpassword=yourpassword
rpcallowip=127.0.0.1
rpcport=18332
EOF

# Start Bitcoin daemon
bitcoind -daemon
```

### Option B: Bitcoin RPC Services
```typescript
// Using public APIs (for development only)
const BITCOIN_RPC_ENDPOINTS = {
  testnet: {
    blockstream: 'https://blockstream.info/testnet/api',
    blockcypher: 'https://api.blockcypher.com/v1/btc/test3'
  },
  mainnet: {
    blockstream: 'https://blockstream.info/api',
    blockcypher: 'https://api.blockcypher.com/v1/btc/main'
  }
};
```

### Bitcoin Libraries Setup
```typescript
// src/bitcoin/setup.ts
import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import { ECPairFactory } from 'ecpair';

// Initialize
bitcoin.initEccLib(ecc);
const ECPair = ECPairFactory(ecc);

// Network configuration
const NETWORKS = {
  testnet: bitcoin.networks.testnet,
  mainnet: bitcoin.networks.bitcoin
};

export { bitcoin, ECPair, NETWORKS };
```

## 4. Ethereum Setup

### Ethereum Node Options
```bash
# Option 1: Local Hardhat node
npx hardhat node

# Option 2: Use public RPC
ETHEREUM_RPC_TESTNET=https://sepolia.infura.io/v3/YOUR_KEY
ETHEREUM_RPC_MAINNET=https://mainnet.infura.io/v3/YOUR_KEY
```

### Smart Contract Setup
```solidity
// contracts/CrossChainHTLC.sol
pragma solidity ^0.8.20;

contract CrossChainHTLC {
    struct HTLC {
        address sender;
        address receiver;
        uint256 amount;
        bytes32 hashlock;
        uint256 timelock;
        bool withdrawn;
        bool refunded;
    }
    
    mapping(bytes32 => HTLC) public htlcs;
    
    // Implementation details...
}
```

## 5. 1inch Fusion+ Integration

### SDK Configuration
```typescript
// src/fusion/config.ts
import { FusionSDK, NetworkEnum } from '@1inch/fusion-sdk';

const fusionSDK = new FusionSDK({
  url: 'https://api.1inch.dev/fusion',
  network: NetworkEnum.ETHEREUM,
  authKey: process.env.ONEINCH_API_KEY
});

export { fusionSDK };
```

### Resolver Setup
```typescript
// src/resolver/CrossChainResolver.ts
export class CrossChainResolver {
  constructor(
    private bitcoinClient: BitcoinClient,
    private ethereumClient: EthereumClient,
    private fusionSDK: FusionSDK
  ) {}

  async resolveOrder(order: FusionOrder) {
    // Cross-chain resolution logic
  }
}
```

## 6. Environment Configuration

### .env File
```bash
# Bitcoin Configuration
BITCOIN_NETWORK=testnet
BITCOIN_RPC_USER=yourusername
BITCOIN_RPC_PASS=yourpassword
BITCOIN_RPC_HOST=localhost
BITCOIN_RPC_PORT=18332

# Ethereum Configuration
ETHEREUM_NETWORK=sepolia
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
ETHEREUM_PRIVATE_KEY=your_test_private_key

# 1inch Configuration
ONEINCH_API_KEY=your_1inch_api_key
FUSION_RESOLVER_ADDRESS=0x...

# Application
LOG_LEVEL=debug
PORT=3000
```

## 7. Docker Setup (Optional)

### docker-compose.yml
```yaml
version: '3.8'

services:
  bitcoin:
    image: ruimarinho/bitcoin-core:latest
    command: [
      "-testnet",
      "-server",
      "-rpcuser=test",
      "-rpcpassword=test",
      "-rpcallowip=0.0.0.0/0",
      "-rpcbind=0.0.0.0"
    ]
    ports:
      - "18332:18332"
    volumes:
      - bitcoin-data:/home/bitcoin/.bitcoin

  ethereum:
    image: ethereum/client-go:latest
    command: [
      "--sepolia",
      "--http",
      "--http.addr=0.0.0.0",
      "--http.api=eth,net,web3"
    ]
    ports:
      - "8545:8545"
    volumes:
      - ethereum-data:/root/.ethereum

volumes:
  bitcoin-data:
  ethereum-data:
```

## 8. Test Wallets & Faucets

### Bitcoin Testnet
- **Faucet**: https://bitcoinfaucet.uo1.net/
- **Explorer**: https://blockstream.info/testnet/

### Ethereum Sepolia
- **Faucet**: https://sepoliafaucet.com/
- **Explorer**: https://sepolia.etherscan.io/

### Generate Test Wallets
```typescript
// scripts/generateWallets.ts
import { generateBitcoinWallet, generateEthereumWallet } from '../src/utils/wallets';

async function setup() {
  // Bitcoin wallet
  const btcWallet = generateBitcoinWallet('testnet');
  console.log('Bitcoin Address:', btcWallet.address);
  console.log('Bitcoin Private Key:', btcWallet.privateKey);
  
  // Ethereum wallet
  const ethWallet = generateEthereumWallet();
  console.log('Ethereum Address:', ethWallet.address);
  console.log('Ethereum Private Key:', ethWallet.privateKey);
}
```

## 9. Quick Start Commands

```bash
# 1. Clone and install
git clone <your-repo>
cd unite-agent
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your configuration

# 3. Generate test wallets
npm run generate-wallets

# 4. Start development
npm run dev

# 5. Run tests
npm test
```

## 10. Integration Checklist

- [ ] Bitcoin node/API connected
- [ ] Ethereum node/API connected
- [ ] Test wallets funded
- [ ] 1inch API key obtained
- [ ] Smart contracts deployed
- [ ] Environment variables configured
- [ ] Basic HTLC test passing

## Next Steps

1. Implement Bitcoin HTLC creation/redemption
2. Deploy Ethereum HTLC contracts
3. Build Fusion+ resolver interface
4. Create cross-chain coordination logic
5. Test atomic swap flow end-to-end

## Resources

- [1inch Fusion+ Docs](https://docs.1inch.io/docs/fusion-swap/introduction)
- [Bitcoin Script Reference](https://en.bitcoin.it/wiki/Script)
- [Ethereum Development](https://ethereum.org/developers)
- [Unite Hackathon Resources](https://unite.1inch.io/)