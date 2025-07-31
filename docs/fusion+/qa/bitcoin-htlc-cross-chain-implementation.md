# Bitcoin HTLC Implementation in 1inch Fusion+ Cross-Chain Swaps

## Research Summary

This document provides comprehensive research findings on Bitcoin HTLC (Hash Time-Locked Contract) implementation for cross-chain swaps, with specific focus on how resolvers can handle ETH->BTC swaps while ensuring proper destination address handling.

## Key Findings: Bitcoin Script Limitations and Resolver Architecture

### 1. Bitcoin Script Destination Address Limitation

**Critical Discovery**: Bitcoin HTLC scripts cannot directly specify destination addresses when unlocking with a secret.

- The pubkey hashes in an HTLC script (`<seller pubkey hash>` and `<buyer pubkey hash>`) only establish **who can spend** the funds
- They do **NOT** define **where the funds must go** when spent
- The seller or buyer can redeem funds to any address they choose
- The destination address remains undecided until the moment of redemption

**Source**: Bitcoin Stack Exchange - "The inputs of a transaction have absolutely no ability to effect the outputs in any situation. They can only define who can spend, not the conditions for how they go about spending it."

### 2. Standard Bitcoin HTLC Script Structure

Based on BIP-199 specification:

```bitcoin
OP_IF
    [HASHOP] <digest> OP_EQUALVERIFY
    OP_DUP OP_HASH160 <seller pubkey hash>
OP_ELSE
    <num> [TIMEOUTOP] OP_DROP
    OP_DUP OP_HASH160 <buyer pubkey hash>
OP_ENDIF
OP_EQUALVERIFY OP_CHECKSIG
```

Where:
- `[HASHOP]` can be `OP_SHA256` or `OP_HASH160`
- `[TIMEOUTOP]` can be `OP_CHECKSEQUENCEVERIFY` or `OP_CHECKLOCKTIMEVERIFY`

### 3. Key Bitcoin Script Opcodes Used

- **OP_IF/OP_ELSE/OP_ENDIF**: Conditional execution paths
- **OP_SHA256**: Hash function for secret verification
- **OP_HASH160**: Hash function for address verification
- **OP_EQUALVERIFY**: Verify hash equality
- **OP_DUP**: Duplicate stack item
- **OP_CHECKSIG**: Verify signature
- **OP_CHECKSEQUENCEVERIFY**: Relative timelock
- **OP_CHECKLOCKTIMEVERIFY**: Absolute timelock
- **OP_DROP**: Remove item from stack

### 4. Two Execution Paths

#### Hash Lock Path (OP_IF branch)
- Requires secret preimage and valid signature
- Validates `SHA256(secret) == stored_hash`
- Checks signature against seller's public key
- Used for successful atomic swap completion

#### Time Lock Path (OP_ELSE branch)
- Activated after timeout period
- Allows buyer to reclaim funds
- Requires valid signature from buyer
- Used for refund scenarios

## 1inch Fusion+ Integration Challenges

### Current Architecture Gap

**Research Finding**: 1inch Fusion+ currently operates primarily on EVM-compatible chains and does not have documented Bitcoin HTLC resolver integration.

- Fusion+ uses resolver-based architecture for token swaps
- Resolvers execute swaps and pay gas fees for users
- Settlement contracts handle final token transfers
- No evidence of Bitcoin HTLC resolver implementation in current documentation

### Theoretical Bitcoin Integration Approach

For ETH->BTC swaps using Fusion+ architecture, resolvers would need to:

1. **Monitor Bitcoin HTLC Creation**
   - Watch for P2SH addresses created from HTLC scripts
   - Verify hash commitments match Ethereum side
   - Confirm proper timelock configuration

2. **Handle Secret Revelation**
   - Execute Ethereum settlement to reveal secret
   - Use revealed secret to claim Bitcoin HTLC
   - **Critical Issue**: Cannot guarantee destination address in Bitcoin script

3. **Destination Address Solution**
   - Resolver must honor off-chain agreement about destination
   - Use separate communication channel to specify Bitcoin address
   - Implement reputation/slashing mechanisms for resolver compliance

## Implementation Recommendations

### 1. P2SH Address Generation

```python
# Python example for HTLC P2SH address
txin_redeemScript = CScript([
    OP_IF, 
    OP_SHA256, hash_of_secret, OP_EQUALVERIFY, 
    OP_DUP, OP_HASH160, recipient_pubkey_hash, 
    OP_ELSE, 
    timeout_blocks, OP_CHECKLOCKTIMEVERIFY, OP_DROP, 
    OP_DUP, OP_HASH160, sender_pubkey_hash, 
    OP_ENDIF,
    OP_EQUALVERIFY, OP_CHECKSIG
])

p2sh_address = P2SH_Address.from_redeemScript(txin_redeemScript)
```

### 2. Resolver Bitcoin Integration

```typescript
interface BitcoinHTLCResolver {
  // Monitor Bitcoin HTLC creation
  watchHTLC(htlcAddress: string, secret_hash: string): Promise<void>;
  
  // Execute claim with destination address enforcement
  claimHTLC(
    secret: string, 
    htlcScript: string, 
    destinationAddress: string  // Off-chain specification
  ): Promise<string>;
  
  // Handle refund scenarios
  refundHTLC(htlcScript: string, timelock: number): Promise<string>;
}
```

### 3. Security Considerations

- **Timelock Coordination**: Ensure Bitcoin timelock > Ethereum timelock
- **Resolver Bonding**: Require economic incentives for honest behavior
- **Destination Verification**: Implement off-chain destination address commitments
- **Script Type**: Use P2WSH for witness script hash (more efficient than P2SH)

## Cross-Chain Atomic Swap Flow

### Complete ETH->BTC Swap Process

1. **Setup Phase**
   - Maker generates secret `s` and computes `hash(s)`
   - Creates Bitcoin HTLC with resolver's pubkey and timeout
   - Specifies destination Bitcoin address off-chain

2. **Funding Phase**
   - Maker deposits ETH into Fusion+ order
   - Resolver funds Bitcoin HTLC with `hash(s)`

3. **Execution Phase**
   - Resolver settles Ethereum side, revealing secret `s`
   - Resolver claims Bitcoin HTLC using secret `s`
   - **Trust Assumption**: Resolver sends BTC to specified address

4. **Completion**
   - Maker receives BTC at specified address
   - Resolver receives ETH from settlement contract

## Technical Limitations and Solutions

### Problem: Bitcoin Script Cannot Enforce Destination

**Current Limitation**: Bitcoin HTLC scripts only control **who** can spend, not **where** funds go.

**Solution Approaches**:

1. **Reputation-Based Resolvers**
   - Resolver staking/bonding mechanisms
   - Slashing for destination address violations
   - Community governance for resolver management

2. **Multi-Signature Escrow**
   - Include maker's signature requirement for destination
   - Use 2-of-2 multisig with resolver and maker
   - Atomic revelation of secret and destination signature

3. **Covenant-Like Constructs**
   - Future Bitcoin upgrades (e.g., SIGHASH_ANYPREVOUT)
   - Taproot script improvements
   - Layer 2 solutions with stronger guarantees

## Research Sources and References

### Official Documentation
- BIP-199: Hashed Time-Locked Contract transactions
- 1inch Fusion+ whitepaper and documentation
- Bitcoin Script opcodes reference

### Implementation Examples
- Bcoin cross-chain atomic swap guide
- ZBXCAT Bitcoin HTLC Python implementation
- Ravencoin HTLC P2SH atomic swap analysis

### Technical Analysis
- Bitcoin Stack Exchange HTLC destination address discussion
- 1inch Fusion+ resolver architecture documentation
- Cross-chain atomic swap research papers

## Conclusion

While Bitcoin HTLCs provide the cryptographic foundation for cross-chain atomic swaps, integrating them into 1inch Fusion+ architecture faces a fundamental challenge: **Bitcoin scripts cannot enforce destination addresses during unlock operations**.

This limitation requires additional trust assumptions or protocol modifications to ensure resolvers send Bitcoin to the correct maker addresses. Future 1inch Fusion+ Bitcoin integration would need to address this through reputation systems, bonding mechanisms, or alternative cryptographic constructs.

The research shows that while the technical foundation exists, practical implementation requires careful consideration of trust models and economic incentives to bridge the gap between Bitcoin's script limitations and Fusion+'s resolver architecture.

---

*Last Updated: July 31, 2025*
*Research Methodology: Web search of official documentation, technical specifications, and implementation examples*