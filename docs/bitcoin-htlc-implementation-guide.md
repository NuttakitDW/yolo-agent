# Bitcoin HTLC Implementation Guide for Unite Agent

## Overview

This guide provides comprehensive information for implementing Hash Time Locked Contracts (HTLCs) on Bitcoin for cross-chain atomic swaps with 1inch Fusion+.

## Bitcoin Script Fundamentals

### Key Characteristics
- **Stack-based**: Operations manipulate a stack of values
- **Forth-like**: Uses postfix notation (RPN)
- **Not Turing-complete**: No loops or complex logic (security feature)
- **Deterministic**: Same input always produces same output

### Essential HTLC Opcodes

#### Hash Operations
- `OP_SHA256 (0xa8)`: SHA-256 hash of top stack item
- `OP_HASH160 (0xa9)`: RIPEMD-160(SHA-256(x))
- `OP_EQUALVERIFY (0x88)`: Verify two values are equal

#### Time Lock Operations
- `OP_CHECKLOCKTIMEVERIFY (0xb1)`: Absolute time lock
- `OP_CHECKSEQUENCEVERIFY (0xb2)`: Relative time lock

#### Control Flow
- `OP_IF (0x63)`: Begin conditional block
- `OP_ELSE (0x67)`: Else branch
- `OP_ENDIF (0x68)`: End conditional

#### Stack Operations
- `OP_DUP (0x76)`: Duplicate top stack item
- `OP_DROP (0x75)`: Remove top stack item
- `OP_CHECKSIG (0xac)`: Verify signature

## HTLC Script Template

### Basic HTLC Structure
```
OP_IF
    # Hash lock path
    OP_SHA256
    <32_byte_hash_of_secret>
    OP_EQUALVERIFY
    OP_DUP
    OP_HASH160
    <recipient_pubkey_hash>
OP_ELSE
    # Timeout path
    <timeout_blocks>
    OP_CHECKLOCKTIMEVERIFY
    OP_DROP
    OP_DUP
    OP_HASH160
    <sender_pubkey_hash>
OP_ENDIF
OP_EQUALVERIFY
OP_CHECKSIG
```

### Hex Representation Example
```
63a8206c3ab28dd6e2a443fec9d59b8afb71c7e939fba8df957e23a6524f5c0986f968876a914<recipient_pubkey_hash>6780<timeout>b17576a914<sender_pubkey_hash>6888ac
```

## Implementation Steps

### 1. Generate Secret and Hash
```javascript
// Generate 32-byte secret
const secret = crypto.randomBytes(32);
const hashOfSecret = crypto.createHash('sha256').update(secret).digest();
```

### 2. Create HTLC Transaction
```javascript
// Using bitcoinjs-lib
const htlc = bitcoin.script.compile([
  bitcoin.opcodes.OP_IF,
  bitcoin.opcodes.OP_SHA256,
  hashOfSecret,
  bitcoin.opcodes.OP_EQUALVERIFY,
  bitcoin.opcodes.OP_DUP,
  bitcoin.opcodes.OP_HASH160,
  recipientPubKeyHash,
  bitcoin.opcodes.OP_ELSE,
  bitcoin.script.number.encode(timeoutBlocks),
  bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,
  bitcoin.opcodes.OP_DROP,
  bitcoin.opcodes.OP_DUP,
  bitcoin.opcodes.OP_HASH160,
  senderPubKeyHash,
  bitcoin.opcodes.OP_ENDIF,
  bitcoin.opcodes.OP_EQUALVERIFY,
  bitcoin.opcodes.OP_CHECKSIG
]);
```

### 3. Fund HTLC (P2WSH)
```javascript
// Create P2WSH address
const p2wsh = bitcoin.payments.p2wsh({
  redeem: { output: htlc, network }
});

// Send funds to this address
const fundingTx = {
  to: p2wsh.address,
  amount: swapAmount
};
```

### 4. Redeem with Secret
```javascript
// Create witness script
const witness = [
  signature,
  publicKey,
  secret,
  bitcoin.opcodes.OP_TRUE, // Select IF branch
  htlc
];
```

### 5. Refund after Timeout
```javascript
// Create witness script for refund
const witness = [
  signature,
  publicKey,
  bitcoin.opcodes.OP_FALSE, // Select ELSE branch
  htlc
];
```

## Integration with Fusion+

### Cross-Chain Flow
1. **Initiate**: User wants to swap BTC for ETH
2. **Secret Generation**: Alice generates secret, shares hash with Bob
3. **Bitcoin HTLC**: Alice locks BTC with hash(secret) and 24hr timeout
4. **EVM HTLC**: Bob locks ETH with same hash and 12hr timeout
5. **Claim**: Alice reveals secret to claim ETH
6. **Complete**: Bob uses revealed secret to claim BTC

### Timing Considerations
- Bitcoin block time: ~10 minutes
- Recommended timeouts:
  - Maker (Bitcoin): 144 blocks (~24 hours)
  - Taker (EVM): 72 blocks (~12 hours)
- Safety margin: 50% difference prevents race conditions

## Security Best Practices

### 1. Secret Generation
- Use cryptographically secure random number generator
- Never reuse secrets across swaps
- Store secrets securely until swap completion

### 2. Timeout Configuration
- Always set maker timeout > taker timeout
- Account for network congestion
- Monitor for timeout approaching

### 3. Transaction Verification
- Verify HTLC script before funding
- Check correct amounts and addresses
- Confirm sufficient confirmations

### 4. Fee Management
- Include sufficient fees for timely confirmation
- Account for fee volatility on Bitcoin
- Reserve funds for potential RBF

## Tools and Libraries

### JavaScript/TypeScript
- **bitcoinjs-lib**: Full Bitcoin library with Script support
- **bcoin**: Alternative Bitcoin implementation
- **bitcore-lib**: Another Bitcoin library option

### Testing Tools
- **btcdeb**: Script debugger for Bitcoin
- **regtest**: Local Bitcoin network for testing
- **Bitcoin Core**: Reference implementation with RPC

### Example Libraries
```json
{
  "dependencies": {
    "bitcoinjs-lib": "^6.1.5",
    "ecpair": "^2.1.0",
    "tiny-secp256k1": "^2.2.3",
    "bitcoin-core": "^4.2.0"
  }
}
```

## Common Pitfalls

1. **Wrong Script Hash**: Ensure P2WSH uses SHA256 of script
2. **Endianness**: Bitcoin uses little-endian for some values
3. **Script Size**: Keep under 520 bytes for standard transactions
4. **Malleability**: Use SegWit to prevent transaction malleability

## References

- [BIP 199](https://github.com/bitcoin/bips/blob/master/bip-0199.mediawiki): HTLC specification
- [Bitcoin Script Wiki](https://en.bitcoin.it/wiki/Script): Complete opcode reference
- [Lightning Network BOLT](https://github.com/lightning/bolts): HTLC usage examples
- [Bitcoin Optech](https://bitcoinops.org/en/topics/htlc/): Technical discussions

## Next Steps

1. Set up Bitcoin Core node or use public API
2. Implement secret generation and management
3. Create HTLC creation and redemption functions
4. Test on Bitcoin testnet/signet
5. Integrate with Fusion+ resolver system