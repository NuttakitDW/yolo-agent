# Q&A: Can 1inch Fusion+ Resolver Work with HTLC API Services?

## Question
Can 1inch's Fusion+ resolver work with HTLC (Hash Time-Locked Contract) API services, or do we need to modify the resolver code? What types of integrations does the resolver support, and can it handle cross-chain swaps with Bitcoin or non-EVM chains?

## Answer

**Yes, the 1inch Fusion+ resolver can work with HTLC API services through custom implementation.** The resolver architecture is specifically designed to be extensible and allows for:

1. Custom resolver backend implementations
2. External API integrations
3. Custom smart contract logic
4. Cross-chain atomic swap mechanisms

### How Fusion+ Resolver Works

The resolver consists of three main components:

1. **Resolver Backend (Off-chain)**
   - Fully private implementation controlled by the resolver operator
   - Can integrate with any external API, including HTLC services
   - Decides which orders to fill and implements custom business logic

2. **Worker Contract (On-chain)**
   - Executes trades through the settlement contract
   - Implements `takerInteraction()` method for custom logic
   - Can interact with external contracts including HTLC contracts

3. **Settlement Infrastructure**
   - Uses atomic swap technology with timelock protection
   - Already implements HTLC-like patterns for cross-chain swaps

### HTLC Integration Implementation

To integrate an HTLC API service, you would:

1. **Modify the Resolver Backend**
```javascript
// Example backend integration
class HTLCResolver {
  async processOrder(order) {
    // 1. Check order profitability
    const profitable = await this.checkProfitability(order);
    
    // 2. Call HTLC API service
    const htlcParams = await this.htlcAPI.createSwap({
      amount: order.amount,
      token: order.token,
      chain: order.destinationChain
    });
    
    // 3. Execute through worker contract
    await this.workerContract.executeHTLCSwap(order, htlcParams);
  }
}
```

2. **Extend the Worker Contract**
```solidity
contract HTLCWorkerContract {
    function executeHTLCSwap(
        bytes calldata orderData,
        bytes calldata htlcParams
    ) external onlyOwner {
        // Decode parameters
        // Create HTLC on source chain
        // Coordinate with destination chain
        // Complete atomic swap
    }
    
    function takerInteraction(
        address taker,
        bytes calldata data
    ) external {
        // Custom HTLC interaction logic
        // Can call external HTLC contracts
    }
}
```

### Cross-Chain and Bitcoin Support

Fusion+ already supports cross-chain swaps using atomic swap technology. For Bitcoin/non-EVM chains:

1. **Native Fusion+ Support**
   - Uses escrow contracts with secret hashes and timelocks
   - Implements atomic "all-or-nothing" transactions
   - Resolver manages cross-chain coordination

2. **Bitcoin Integration Approach**
   - Resolver backend manages Bitcoin HTLC creation via API
   - Monitors Bitcoin blockchain for confirmations
   - Coordinates with EVM-based escrows on the other side
   - Acts as trusted intermediary between chains

### Key Implementation Considerations

1. **No Core Modification Required**
   - Fusion+ resolver is designed for custom implementations
   - You create your own resolver backend and worker contracts
   - The core protocol remains unchanged

2. **API Integration Flexibility**
   - Resolver backend can call any external API
   - Already supports 1inch Aggregation API integration
   - Can add HTLC API calls in the same manner

3. **Security Requirements**
   - Custom resolver code must be independently audited
   - Need robust error handling for HTLC failures
   - Implement proper timelock management

### Example Architecture
```
User Order → Resolver Backend → HTLC API Service
     ↓              ↓                    ↓
Settlement ← Worker Contract ← HTLC Contracts
Contract    (Custom Logic)    (Cross-chain)
```

### Getting Started

1. **Study Examples**
   - [1inch/fusion-resolver-example](https://github.com/1inch/fusion-resolver-example)
   - [1inch/cross-chain-resolver-example](https://github.com/1inch/cross-chain-resolver-example)

2. **Requirements**
   - Stake minimum 5% of Unicorn Power in 1INCH tokens
   - Pass KYC/KYB verification
   - Deploy custom resolver contracts

3. **Implementation Steps**
   - Fork resolver example
   - Add HTLC API integration to backend
   - Modify worker contract for HTLC interactions
   - Test thoroughly before mainnet deployment

The Fusion+ resolver architecture provides all the necessary hooks and flexibility to integrate HTLC API services without modifying the core protocol.

## Additional Clarifications

### What is a Resolver Backend?

The resolver backend is the off-chain server component that resolvers run to participate in Fusion+. Think of it as the "brain" of your resolver operation:

- **Private Infrastructure**: Completely controlled by the resolver operator (you)
- **Decision Engine**: Monitors orders, decides which to fill based on profitability
- **Integration Hub**: Connects to external services, APIs, and blockchain nodes
- **Custom Logic**: Implements your unique trading strategies and business logic

**Key Point**: The backend is NOT part of 1inch's code - it's YOUR code running on YOUR servers.

### Do We Need to Modify Existing 1inch Code?

**NO** - You don't modify 1inch's code. Instead:

1. **Create Your Own Backend**: Either from scratch or fork their example resolver
2. **Independent Operation**: Each resolver runs their own backend implementation
3. **Custom Implementation**: Like building your own trading bot that interfaces with the Fusion+ protocol
4. **Protocol Integration**: Your backend communicates with Fusion+ through standard interfaces

Think of it like this: 1inch provides the protocol (like HTTP), you build your own server that speaks that protocol.

### Is Running a Resolver Like Running a Node?

**YES** - Running a resolver backend is very similar to running a blockchain node:

- **24/7 Operation**: Must run continuously to monitor orders
- **Real-time Processing**: Responds to new orders as they appear
- **Infrastructure Requirements**: Needs reliable hosting, monitoring, and maintenance
- **Competitive Environment**: Multiple resolvers compete for profitable orders

**Differences from Traditional Nodes**:
- Instead of validating blocks, you're executing trades
- Instead of consensus, you're competing on execution speed and efficiency
- Instead of block rewards, you earn from profitable trade execution

### How Will Others Use Our HTLC Service?

Two implementation models are possible:

#### Option A: Exclusive Resolver Model
- **We Run It**: Only we operate the HTLC-enabled resolver
- **User Flow**: Users create orders specifically requesting HTLC execution
- **Monopoly Position**: We're the sole provider of HTLC cross-chain swaps
- **Advantages**: Full control, all profits, simpler implementation
- **Disadvantages**: Single point of failure, scaling limitations

#### Option B: Open Network Model
- **Publish Code**: Make resolver implementation open source
- **API Key Distribution**: Other resolvers get Thunder Portal API keys
- **Decentralized Network**: Multiple resolvers can offer HTLC services
- **Advantages**: More resilient, better liquidity, network effects
- **Disadvantages**: Competition, need to maintain public codebase

### The Uber Analogy Explained

Understanding Fusion+ through the Uber lens:

- **Fusion+ Platform** = Uber app infrastructure
- **Resolver Backend** = Driver's app on their phone
- **Regular Resolvers** = Regular Uber drivers
- **HTLC Resolver** = Uber Black drivers with special certification
- **Thunder Portal API** = Special license/certification to provide premium service

Just like:
- Only drivers with the Uber app can accept rides
- Only drivers with Black certification can accept Black rides
- Only resolvers with HTLC capability can execute HTLC orders

**Key Insight**: Users request the service type (regular swap vs HTLC swap), and only qualified resolvers can fulfill those specific requests.

## References
- Research conducted on: 2025-07-28
- Sources: 1inch official documentation, GitHub repositories, technical blog posts
- Updated with clarifications from implementation discussion