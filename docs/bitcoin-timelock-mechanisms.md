# Bitcoin Timelock Mechanisms: CLTV vs CSV

## Overview

Bitcoin provides two primary timelock mechanisms that are essential for implementing HTLCs and atomic swaps. Understanding the differences between CHECKLOCKTIMEVERIFY (CLTV) and CHECKSEQUENCEVERIFY (CSV) is crucial for Unite Agent implementation.

## CHECKLOCKTIMEVERIFY (CLTV) - Absolute Timelock

### What It Does
- Creates an **absolute** time constraint
- Locks funds until a specific block height or Unix timestamp
- Script fails if current time < specified time

### Format
```
<expiry_time> OP_CHECKLOCKTIMEVERIFY OP_DROP
```

### Time Specification
- **Block Height**: Numbers < 500,000,000 (e.g., 750000)
- **Unix Timestamp**: Numbers ≥ 500,000,000 (e.g., 1735689600)

### Example Usage in HTLC
```javascript
// Lock until block 750000
bitcoin.script.number.encode(750000),
bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,
bitcoin.opcodes.OP_DROP,

// Or lock until Jan 1, 2025
bitcoin.script.number.encode(1735689600),
bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,
bitcoin.opcodes.OP_DROP,
```

### Pros
- Simple to understand and implement
- Can set far future dates
- Ideal for fixed deadlines

### Cons
- Cannot extend deadline without new transaction
- Must account for block time variance

## CHECKSEQUENCEVERIFY (CSV) - Relative Timelock

### What It Does
- Creates a **relative** time constraint
- Locks funds for a period AFTER the UTXO is mined
- Measures time from when output was created

### Format
```
<relative_locktime> OP_CHECKSEQUENCEVERIFY OP_DROP
```

### Time Specification
- **Block-based**: Plain numbers (e.g., 144 = ~1 day)
- **Time-based**: With 0x00400000 flag (e.g., 0x00400000 | (86400 >> 9) = ~1 day)
- Maximum: 65535 blocks (~455 days) or 65535*512 seconds (~388 days)

### Example Usage
```javascript
// Lock for 144 blocks (approximately 1 day)
bitcoin.script.number.encode(144),
bitcoin.opcodes.OP_CHECKSEQUENCEVERIFY,
bitcoin.opcodes.OP_DROP,

// Lock for 86400 seconds (1 day) using time-based
const timeBasedLock = 0x00400000 | (86400 >> 9);
bitcoin.script.number.encode(timeBasedLock),
bitcoin.opcodes.OP_CHECKSEQUENCEVERIFY,
bitcoin.opcodes.OP_DROP,
```

### Pros
- Flexible - countdown starts when UTXO is created
- Avoids absolute deadline issues
- Better for channel-based protocols

### Cons
- Limited to ~455 days maximum
- More complex to calculate

## Comparison Table

| Feature | CLTV | CSV |
|---------|------|-----|
| Type | Absolute | Relative |
| Reference Point | Fixed time/block | UTXO creation |
| Maximum Lock | No limit | ~455 days |
| Use Case | Atomic swaps | Payment channels |
| Flexibility | Low | High |
| Complexity | Simple | Moderate |

## HTLC Implementation Patterns

### Pattern 1: Simple Atomic Swap (CLTV Only)
```
OP_IF
    # Alice can claim with secret
    OP_SHA256 <hash> OP_EQUALVERIFY
    <alice_pubkey> OP_CHECKSIG
OP_ELSE
    # Bob can reclaim after timeout
    <timeout_block> OP_CHECKLOCKTIMEVERIFY OP_DROP
    <bob_pubkey> OP_CHECKSIG
OP_ENDIF
```

### Pattern 2: Lightning-Style HTLC (Both)
```
OP_IF
    # Revocation path (CSV)
    <revocation_pubkey> OP_CHECKSIG
OP_ELSE
    <csv_delay> OP_CHECKSEQUENCEVERIFY OP_DROP
    OP_IF
        # HTLC success (with secret)
        OP_SHA256 <hash> OP_EQUALVERIFY
        <remote_pubkey> OP_CHECKSIG
    OP_ELSE
        # HTLC timeout (CLTV)
        <cltv_expiry> OP_CHECKLOCKTIMEVERIFY OP_DROP
        <local_pubkey> OP_CHECKSIG
    OP_ENDIF
OP_ENDIF
```

## Unite Agent Recommendations

### For Bitcoin-EVM Atomic Swaps
1. **Use CLTV** for primary timeout mechanism
2. Set Bitcoin timeout 2x longer than EVM timeout
3. Account for block time differences:
   - Bitcoin: ~10 minutes/block
   - Ethereum: ~12 seconds/block

### Recommended Timeouts
```javascript
const TIMEOUTS = {
  bitcoin: {
    blocks: 144,        // ~24 hours
    timestamp: 86400    // 24 hours in seconds
  },
  ethereum: {
    blocks: 7200,       // ~24 hours (12s blocks)
    timestamp: 43200    // 12 hours (safety margin)
  }
};
```

### Security Considerations
1. **Always use DROP**: Both opcodes leave value on stack
2. **Check nLockTime**: Transaction must have appropriate nLockTime
3. **Monitor approaching timeouts**: Alert users before expiry
4. **Test on testnet**: Block times can vary significantly

## Implementation Checklist

- [ ] Choose appropriate timelock type (CLTV for swaps)
- [ ] Calculate correct timeout values
- [ ] Account for block time variance
- [ ] Implement monitoring for approaching timeouts
- [ ] Test timeout scenarios thoroughly
- [ ] Handle edge cases (reorgs, delays)

## Common Pitfalls

1. **Forgetting OP_DROP**: Both opcodes require DROP after
2. **Wrong time format**: Mixing block height with timestamp
3. **Insufficient timeout margin**: Not accounting for congestion
4. **CSV misunderstanding**: Thinking it's from transaction time
5. **nSequence conflicts**: CSV requires specific nSequence values

## Testing Commands

```bash
# Bitcoin Core RPC - Create CLTV transaction
bitcoin-cli decodescript "04004c5e5bb17521..."

# Check current block height
bitcoin-cli getblockcount

# Get current Unix timestamp
date +%s

# Estimate confirmation time
bitcoin-cli estimatesmartfee 6
```

## References

- [BIP 65](https://github.com/bitcoin/bips/blob/master/bip-0065.mediawiki): CHECKLOCKTIMEVERIFY
- [BIP 112](https://github.com/bitcoin/bips/blob/master/bip-0112.mediawiki): CHECKSEQUENCEVERIFY
- [BIP 68](https://github.com/bitcoin/bips/blob/master/bip-0068.mediawiki): Sequence number meaning