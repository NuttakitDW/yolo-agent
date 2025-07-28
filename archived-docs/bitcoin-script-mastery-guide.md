# Bitcoin Script Mastery Guide for HTLC Implementation

## Overview

Bitcoin Script is a stack-based, Forth-like programming language used to define spending conditions for Bitcoin transactions. This guide focuses on the specific opcodes and patterns needed for HTLC implementation.

## Core Concepts

### 1. Stack-Based Execution
- Operations manipulate a stack (LIFO - Last In, First Out)
- Values are pushed onto the stack and operations consume them
- Script succeeds if the final stack has a non-zero value

### 2. Reverse Polish Notation (RPN)
```
Traditional: 2 + 3 = 5
Bitcoin Script: 2 3 OP_ADD
```

### 3. Script Types for HTLCs
- **P2SH** (Pay to Script Hash) - Legacy, starts with '3'
- **P2WSH** (Pay to Witness Script Hash) - SegWit, cheaper fees, recommended

## Essential HTLC Opcodes

### Hash Operations

#### OP_SHA256 (0xa8)
```bitcoin
// Example: Verify a preimage
<preimage> OP_SHA256 <expected_hash> OP_EQUAL

// Stack visualization:
// Initial: [preimage]
// After SHA256: [hash_of_preimage]
// After push: [hash_of_preimage, expected_hash]
// After EQUAL: [1] (if match) or [0] (if no match)
```

**Use in HTLC**: Verify the secret provided matches the hash lock

#### OP_HASH160 (0xa9)
```bitcoin
// Computes RIPEMD160(SHA256(x))
<data> OP_HASH160 <expected_hash> OP_EQUAL
```

**Use in HTLC**: Used for public key hashing in address generation

### Time Lock Operations

#### OP_CHECKLOCKTIMEVERIFY (0xb1)
```bitcoin
// Absolute timelock - fails if current time < specified time
<unix_timestamp_or_block_height> OP_CHECKLOCKTIMEVERIFY OP_DROP

// Example: Lock until block 750000
750000 OP_CHECKLOCKTIMEVERIFY OP_DROP

// Example: Lock until Jan 1, 2025 (timestamp: 1735689600)
1735689600 OP_CHECKLOCKTIMEVERIFY OP_DROP
```

**Key Points**:
- Values < 500,000,000 = block height
- Values ≥ 500,000,000 = Unix timestamp
- Requires transaction nLockTime ≥ script value
- Always follow with OP_DROP

#### OP_CHECKSEQUENCEVERIFY (0xb2)
```bitcoin
// Relative timelock - lock for N blocks after UTXO creation
<relative_locktime> OP_CHECKSEQUENCEVERIFY OP_DROP

// Example: Lock for 144 blocks (~1 day)
144 OP_CHECKSEQUENCEVERIFY OP_DROP
```

**Use in HTLC**: Typically not used for simple atomic swaps, more for Lightning

### Conditional Operations

#### OP_IF / OP_ELSE / OP_ENDIF
```bitcoin
// Basic conditional structure
<condition> OP_IF
    // Execute if condition is true (non-zero)
OP_ELSE
    // Execute if condition is false (zero)
OP_ENDIF
```

**HTLC Pattern**:
```bitcoin
OP_IF
    // Hash lock path (with secret)
OP_ELSE
    // Timeout path (refund)
OP_ENDIF
```

### Stack Manipulation

#### OP_DUP (0x76)
```bitcoin
// Duplicate top stack item
// [A] → [A, A]
<pubkey> OP_DUP OP_HASH160 <pubkey_hash> OP_EQUALVERIFY
```

#### OP_DROP (0x75)
```bitcoin
// Remove top stack item
// [A, B] → [A]
<timelock> OP_CHECKLOCKTIMEVERIFY OP_DROP
```

### Verification Operations

#### OP_EQUALVERIFY (0x88)
```bitcoin
// Check equality and fail if not equal
<value1> <value2> OP_EQUALVERIFY
// Continues only if value1 == value2
```

#### OP_CHECKSIG (0xac)
```bitcoin
// Verify signature against public key
<signature> <pubkey> OP_CHECKSIG
// Returns 1 if valid, 0 if invalid
```

## Complete HTLC Script Pattern

### Basic HTLC Template
```bitcoin
OP_IF
    // Path 1: Claim with secret (recipient)
    OP_SHA256
    <32_byte_hash_of_secret>
    OP_EQUALVERIFY
    <recipient_pubkey>
    OP_CHECKSIG
OP_ELSE
    // Path 2: Refund after timeout (sender)
    <timeout_block_or_timestamp>
    OP_CHECKLOCKTIMEVERIFY
    OP_DROP
    <sender_pubkey>
    OP_CHECKSIG
OP_ENDIF
```

### Hex Encoding Example
```
// OP_IF
63
// OP_SHA256
a8
// Push 32 bytes (0x20)
20
// 32-byte hash
<64 hex chars>
// OP_EQUALVERIFY
88
// Push 33 bytes (0x21) for pubkey
21
// 33-byte compressed pubkey
<66 hex chars>
// OP_CHECKSIG
ac
// OP_ELSE
67
// Push timeout value (varies)
04<timeout_bytes>
// OP_CHECKLOCKTIMEVERIFY
b1
// OP_DROP
75
// Push 33 bytes for pubkey
21
// 33-byte compressed pubkey
<66 hex chars>
// OP_CHECKSIG
ac
// OP_ENDIF
68
```

## Script Execution Examples

### Example 1: Claiming with Secret
```
Initial Stack: [signature, pubkey, secret, 1]
After OP_IF: [signature, pubkey, secret] (takes true path)
After OP_SHA256: [signature, pubkey, hash_of_secret]
After push hash: [signature, pubkey, hash_of_secret, expected_hash]
After OP_EQUALVERIFY: [signature, pubkey] (continues if match)
After OP_CHECKSIG: [1] (success)
```

### Example 2: Timeout Refund
```
Initial Stack: [signature, pubkey, 0]
After OP_IF: [signature, pubkey] (takes false path)
After push timeout: [signature, pubkey, timeout]
After OP_CHECKLOCKTIMEVERIFY: [signature, pubkey, timeout]
After OP_DROP: [signature, pubkey]
After OP_CHECKSIG: [1] (success if after timeout)
```

## Common Patterns and Best Practices

### 1. Always Use OP_DROP After Timelocks
```bitcoin
// Correct
<timeout> OP_CHECKLOCKTIMEVERIFY OP_DROP

// Wrong - leaves timeout on stack
<timeout> OP_CHECKLOCKTIMEVERIFY
```

### 2. Hash Verification Pattern
```bitcoin
// Standard pattern for hash verification
OP_SHA256 <expected_hash> OP_EQUALVERIFY
```

### 3. Public Key Verification
```bitcoin
// Always end paths with signature check
<pubkey> OP_CHECKSIG
```

## Advanced Techniques

### 1. Multiple Hash Functions
```bitcoin
// Using different hash functions for compatibility
OP_IF
    OP_SHA256
OP_ELSE
    OP_HASH160
OP_ENDIF
<hash> OP_EQUALVERIFY
```

### 2. Multi-Path HTLCs
```bitcoin
OP_IF
    // Path 1: Normal claim
    OP_SHA256 <hash1> OP_EQUALVERIFY
    <pubkey1> OP_CHECKSIG
OP_ELSE
    OP_IF
        // Path 2: Alternative claim
        OP_SHA256 <hash2> OP_EQUALVERIFY
        <pubkey2> OP_CHECKSIG
    OP_ELSE
        // Path 3: Timeout
        <timeout> OP_CHECKLOCKTIMEVERIFY OP_DROP
        <pubkey3> OP_CHECKSIG
    OP_ENDIF
OP_ENDIF
```

## Testing Your Scripts

### 1. Script Debugger (btcdeb)
```bash
# Install btcdeb
git clone https://github.com/bitcoin-core/btcdeb.git
cd btcdeb
./autogen.sh
./configure
make

# Debug a script
btcdeb '[script]' '[witness_data]'
```

### 2. Bitcoin Core RPC
```bash
# Decode a script
bitcoin-cli decodescript "6382012088a820..."

# Test script execution
bitcoin-cli testmempoolaccept '[{"hex":"..."}]'
```

### 3. Online Tools
- [Bitcoin Script Debugger](https://siminchen.github.io/bitcoinIDE/)
- [Script Playground](https://www.crmarsh.com/script-playground/)

## Security Considerations

### 1. Secret Generation
- Use cryptographically secure random number generator
- Never reuse secrets across different HTLCs
- 32 bytes (256 bits) recommended for secrets

### 2. Timeout Settings
- Bitcoin timeout should be 2x Ethereum timeout
- Account for block time variance (±2 hours possible)
- Monitor approaching timeouts

### 3. Script Size
- Keep scripts under 520 bytes (standard limit)
- Use SegWit (P2WSH) for larger scripts
- Minimize script complexity

## Practice Exercises

### Exercise 1: Basic HTLC
Create an HTLC that:
- Can be claimed with secret "hello" (SHA256: 2cf24dba...)
- Times out after block 800000
- Refunds to your address

### Exercise 2: Decode Existing HTLC
Find a Lightning Network HTLC transaction on the blockchain and decode its script.

### Exercise 3: Custom Timelock
Create an HTLC with both:
- Minimum 6 confirmations (CSV)
- Absolute deadline (CLTV)

## Quick Reference Card

| Opcode | Hex | Stack Effect | HTLC Use |
|--------|-----|--------------|----------|
| OP_SHA256 | 0xa8 | [x] → [sha256(x)] | Hash lock |
| OP_IF | 0x63 | [x] → [] | Conditional |
| OP_ELSE | 0x67 | [] → [] | Alternative |
| OP_ENDIF | 0x68 | [] → [] | End conditional |
| OP_CHECKLOCKTIMEVERIFY | 0xb1 | [x] → [x] | Timeout |
| OP_DROP | 0x75 | [x] → [] | Clean stack |
| OP_DUP | 0x76 | [x] → [x, x] | Duplicate |
| OP_EQUALVERIFY | 0x88 | [x, y] → [] or fail | Verify hash |
| OP_CHECKSIG | 0xac | [sig, pub] → [0/1] | Verify signature |

## Resources for Deep Learning

1. **Bitcoin Script Wiki**: https://en.bitcoin.it/wiki/Script
2. **BIP 65 (CLTV)**: https://github.com/bitcoin/bips/blob/master/bip-0065.mediawiki
3. **BIP 112 (CSV)**: https://github.com/bitcoin/bips/blob/master/bip-0112.mediawiki
4. **Mastering Bitcoin**: Chapter on Bitcoin Script
5. **Bitcoin Optech**: https://bitcoinops.org/en/topics/

## Next Steps

1. Practice writing scripts by hand
2. Use btcdeb to trace execution
3. Deploy test HTLCs on testnet
4. Study Lightning Network HTLC implementations
5. Build automated HTLC creation tools