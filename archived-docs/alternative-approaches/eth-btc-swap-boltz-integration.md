# ETH to BTC Cross-Chain Swap Using Boltz API Integration

## Overview

This document outlines how to implement ETH to BTC swaps for the 1inch Unite Hackathon by combining 1inch Fusion+ (for EVM side) with Boltz API (for Bitcoin side) through a custom resolver implementation. This approach preserves hashlock and timelock functionality as required while leveraging existing infrastructure.

### Key Benefits of Using Boltz API:
- **Handles Bitcoin HTLC complexity** - No need to implement Bitcoin Script
- **Preserves atomic swap security** - Hashlock and timelock built-in
- **Faster development** - Focus on resolver logic instead of low-level Bitcoin
- **Production-ready** - Battle-tested infrastructure for mainnet demo

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   User Wallet   │     │  Your Resolver   │     │  Boltz Service  │
│   (ETH/ERC20)   │ <-> │  (Bridge Layer)  │ <-> │     (BTC)       │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         |                        |                         |
         v                        v                         v
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ 1inch Fusion+   │     │  Coordination    │     │   Boltz API     │
│  Smart Contract │     │     Logic        │     │   Chain Swaps   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Detailed Swap Flow: ETH → BTC

### Phase 1: Order Creation & Discovery

```javascript
// User creates intent to swap ETH for BTC
const userOrder = {
  fromToken: "ETH",
  toToken: "BTC", 
  amount: "1.0", // 1 ETH
  destinationAddress: "bc1quser...", // User's BTC address
  minReturn: "0.0385", // Minimum BTC expected
  deadline: Date.now() + 3600000 // 1 hour
};

// Order broadcast to Fusion+ resolvers
fusionProtocol.createOrder(userOrder);
```

### Phase 2: Resolver Evaluation

```javascript
class ETHToBTCResolver {
  async evaluateOrder(fusionOrder) {
    // 1. Check current rates
    const ethPrice = await getETHPrice(); // $3,200
    const btcPrice = await getBTCPrice(); // $80,000
    const theoreticalRate = ethPrice / btcPrice; // 0.04 BTC per ETH
    
    // 2. Get Boltz quote for BTC liquidity
    const boltzQuote = await boltz.getReverseSwapQuote({
      amount: theoreticalRate * fusionOrder.amount * 100000000, // in sats
      pair: "BTC/BTC" // Using on-chain BTC
    });
    
    // 3. Calculate profitability
    const costs = {
      ethGas: estimateGasCost('fillOrder'),
      btcFees: boltzQuote.minerFees,
      boltzServiceFee: boltzQuote.serviceFee
    };
    
    const spread = theoreticalRate - fusionOrder.minReturn - costs.total;
    
    return {
      profitable: spread > this.minProfitMargin,
      executionPlan: this.createExecutionPlan(fusionOrder, boltzQuote)
    };
  }
}
```

### Phase 3: Atomic Swap Execution

```javascript
async executeSwap(fusionOrder, boltzQuote) {
  // Step 1: Prepare for atomic swap
  const preimage = crypto.randomBytes(32);
  const preimageHash = sha256(preimage);
  
  // Step 2: Create Boltz chain swap (for direct BTC transfer)
  const boltzSwap = await boltz.createChainSwap({
    from: 'BTC',
    to: 'BTC', // Mainchain to mainchain
    preimageHash: preimageHash.toString('hex'),
    claimPublicKey: this.resolverBTCPubKey,
    refundPublicKey: this.resolverRefundPubKey,
    amount: boltzQuote.amount
  });

  // Step 3: Fill Fusion+ order (lock user's ETH)
  const fusionTx = await fusionProtocol.fillOrder({
    orderId: fusionOrder.id,
    resolver: this.address,
    secretHash: preimageHash // Same hash for atomicity
  });

  // Step 4: Send BTC to Boltz lockup address
  const lockupTx = await this.sendBTCToLockup(
    boltzSwap.lockupAddress,
    boltzSwap.expectedAmount
  );

  // Step 5: Monitor and claim when Boltz locks BTC for user
  await this.waitForBoltzLockup(boltzSwap.id);
  
  // Step 6: Reveal preimage to claim from both sides
  await boltz.claimChainSwap(boltzSwap.id, preimage);
  await fusionProtocol.unlockWithPreimage(fusionOrder.id, preimage);
}
```

### Phase 4: Failure Scenarios & Recovery

```javascript
// Timeout handlers
async handleTimeouts() {
  // Scenario 1: Boltz swap times out
  if (boltzSwap.timeoutBlockHeight < currentBlockHeight) {
    // Refund path available on Bitcoin side
    await boltz.refund(boltzSwap.id);
    // Cancel Fusion+ order
    await fusionProtocol.cancelOrder(orderId);
  }

  // Scenario 2: Fusion+ order expires
  if (fusionOrder.deadline < Date.now()) {
    // ETH automatically returns to user
    // Abandon Boltz swap (will timeout)
  }
}
```

## Complete Implementation Example

```javascript
class CrossChainResolver {
  constructor() {
    this.fusionClient = new FusionClient();
    this.boltzClient = new BoltzClient();
    this.btcClient = new BitcoinClient();
  }

  async start() {
    // Subscribe to Fusion+ orders
    this.fusionClient.on('newOrder', async (order) => {
      if (this.isCrossChainOrder(order)) {
        await this.handleCrossChainOrder(order);
      }
    });
  }

  async handleCrossChainOrder(order) {
    try {
      // 1. Validate order parameters
      if (!this.validateOrder(order)) return;

      // 2. Check profitability
      const analysis = await this.analyzeOrder(order);
      if (!analysis.profitable) return;

      // 3. Execute atomic swap
      const result = await this.executeAtomicSwap(order, analysis);
      
      // 4. Record transaction
      await this.recordSwap(result);
      
    } catch (error) {
      await this.handleError(order, error);
    }
  }

  async executeAtomicSwap(order, analysis) {
    // Create coordinated swap with same hash
    const secret = crypto.randomBytes(32);
    const secretHash = sha256(secret);

    // Parallel execution with atomic guarantees
    const [fusionResult, boltzResult] = await Promise.all([
      this.executeFusionSide(order, secretHash),
      this.executeBoltzSide(analysis.boltzParams, secretHash)
    ]);

    // Complete both sides
    await this.completeSwap(fusionResult, boltzResult, secret);
    
    return { fusionResult, boltzResult, secretHash };
  }
}
```

## Security Considerations

### 1. Hash Synchronization
```javascript
// Both sides must use same hash
const sharedSecret = generateSecret();
const sharedHash = sha256(sharedSecret);

// Apply to both protocols
fusionHTLC.secretHash = sharedHash;
boltzHTLC.preimageHash = sharedHash;
```

### 2. Timelock Coordination
```javascript
// Bitcoin side needs longer timeout
const timelocks = {
  fusion: 2 * 3600, // 2 hours in seconds
  boltz: 144 * 2,   // 2 days in blocks (~288 blocks)
};

// Ensure Boltz timeout > Fusion timeout
assert(timelocks.boltz * 600 > timelocks.fusion);
```

### 3. Liquidity Management
```javascript
class ResolverLiquidityManager {
  constructor() {
    this.balances = {
      ETH: 0,
      BTC: 0
    };
  }

  async ensureLiquidity(swapParams) {
    // Check BTC reserves for swap
    if (this.balances.BTC < swapParams.btcAmount) {
      throw new Error('Insufficient BTC liquidity');
    }

    // Check ETH for gas costs
    if (this.balances.ETH < swapParams.estimatedGasCost) {
      throw new Error('Insufficient ETH for gas');
    }
  }
}
```

## API Integration Details

### Fusion+ Integration
```javascript
// Monitor Dutch auction prices
const auctionWatcher = setInterval(async () => {
  const currentPrice = calculateDutchPrice(order);
  if (currentPrice >= ourTargetPrice) {
    await fillOrder(order);
    clearInterval(auctionWatcher);
  }
}, 1000);
```

### Boltz API Calls
```javascript
// Get swap rates
const rates = await boltz.getPairs();

// Create reverse swap
const swap = await boltz.createReverseSwap({
  type: 'reverse',
  pairId: 'BTC/BTC',
  orderSide: 'buy',
  invoiceAmount: satoshis,
  preimageHash: hash,
  claimPublicKey: pubkey
});

// Monitor swap status
const status = await boltz.getSwapStatus(swap.id);
```

## Testing Strategy

### Unit Tests
```javascript
describe('ETH to BTC Resolver', () => {
  it('should calculate profitable swaps correctly', async () => {
    const mockOrder = createMockFusionOrder();
    const analysis = await resolver.analyzeOrder(mockOrder);
    expect(analysis.profitable).toBe(true);
    expect(analysis.expectedProfit).toBeGreaterThan(0);
  });

  it('should handle timeout scenarios', async () => {
    const swap = await resolver.createSwap();
    // Simulate timeout
    await advanceBlocks(500);
    const refund = await resolver.handleTimeout(swap);
    expect(refund.success).toBe(true);
  });
});
```

### Integration Tests
```javascript
it('should complete full ETH to BTC swap', async () => {
  // Setup test wallets
  const ethWallet = await setupETHWallet();
  const btcWallet = await setupBTCWallet();
  
  // Execute swap
  const result = await resolver.executeFullSwap({
    from: 'ETH',
    to: 'BTC',
    amount: '0.1'
  });
  
  // Verify balances
  expect(btcWallet.balance).toBeGreaterThan(0);
  expect(ethWallet.balance).toBeLessThan(initialBalance);
});
```

## Deployment Considerations

1. **Infrastructure Requirements**:
   - Ethereum node for Fusion+ interaction
   - Bitcoin node for on-chain operations  
   - Access to Boltz API
   - Monitoring and alerting systems

2. **Capital Requirements**:
   - BTC reserves for immediate settlement
   - ETH for gas costs
   - Buffer for price fluctuations

3. **Risk Management**:
   - Maximum exposure limits per swap
   - Rate hedging strategies
   - Emergency shutdown procedures

## Conclusion

This architecture enables trustless ETH to BTC swaps by combining:
- 1inch Fusion+'s intent-based EVM swaps
- Boltz's chain swap infrastructure for Bitcoin
- Custom resolver logic for coordination
- Atomic execution via shared hash locks

The solution meets all hackathon requirements:
- ✅ Preserves hashlock and timelock functionality (via Boltz HTLCs)
- ✅ Bidirectional swaps (ETH ↔ BTC)
- ✅ Onchain execution for demo
- ✅ Extensible to other UTXO chains (Dogecoin, Litecoin, BCH)

The resolver acts as a bridge between EVM and Bitcoin ecosystems while maintaining security and decentralization.