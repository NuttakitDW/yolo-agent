# Bitcoin HTLC Construction and Spending Guide

## Overview

This guide provides a comprehensive walkthrough for constructing and spending Hash Time Locked Contracts (HTLCs) on Bitcoin, based on practical implementation examples.

## HTLC Fundamentals

An HTLC allows funds to be spent in two ways:
1. **Hash Lock Path**: By revealing a secret preimage (immediate spending)
2. **Time Lock Path**: After a specified number of blocks have been mined (delayed refund)

## Prerequisites

### Environment Setup
```bash
# Start Bitcoin regtest with transaction indexing
bitcoind -regtest -txindex -daemon

# Install Python Bitcoin library
pip install python-bitcoinlib
```

### Required Knowledge
- Basic understanding of `bitcoin-cli` commands
- Bitcoin Script fundamentals
- Transaction construction concepts

## HTLC Script Structure

### Complete Redeem Script
```
OP_IF
    OP_SHA256
    <32-byte-hash>
    OP_EQUALVERIFY
    OP_DUP
    OP_HASH160
    <recipient-pubkey-hash>
OP_ELSE
    <timeout-blocks>
    OP_CHECKSEQUENCEVERIFY
    OP_DROP
    OP_DUP
    OP_HASH160
    <sender-pubkey-hash>
OP_ENDIF
OP_EQUALVERIFY
OP_CHECKSIG
```

### Script Breakdown

#### Hash Lock Path (IF branch)
- `OP_SHA256`: Hashes the provided preimage
- `<32-byte-hash>`: Expected hash to compare against
- `OP_EQUALVERIFY`: Ensures preimage hash matches
- `OP_DUP OP_HASH160`: Standard pubkey verification
- `<recipient-pubkey-hash>`: Recipient's address hash

#### Time Lock Path (ELSE branch)
- `<timeout-blocks>`: Number of blocks to wait (e.g., 10)
- `OP_CHECKSEQUENCEVERIFY`: Enforces relative timelock
- `OP_DROP`: Removes timeout value from stack
- `OP_DUP OP_HASH160`: Standard pubkey verification
- `<sender-pubkey-hash>`: Sender's address hash

## Implementation Steps

### Step 1: Generate Addresses

```python
# Generate sender address
sender_privkey = bitcoin.wallet.CKey()
sender_privkey.generate()
sender_pubkey = sender_privkey.pub
sender_address = bitcoin.wallet.P2PKHBitcoinAddress.from_pubkey(sender_pubkey)

# Generate recipient address
recipient_privkey = bitcoin.wallet.CKey()
recipient_privkey.generate()
recipient_pubkey = recipient_privkey.pub
recipient_address = bitcoin.wallet.P2PKHBitcoinAddress.from_pubkey(recipient_pubkey)
```

### Step 2: Create the HTLC Script

```python
import hashlib
from bitcoin.core import script

# Generate secret and hash
secret = b"my_secret_preimage"
secret_hash = hashlib.sha256(secret).digest()

# Build redeem script
timeout_blocks = 10

redeem_script = script.CScript([
    script.OP_IF,
        script.OP_SHA256,
        secret_hash,
        script.OP_EQUALVERIFY,
        script.OP_DUP,
        script.OP_HASH160,
        bitcoin.core.Hash160(recipient_pubkey),
    script.OP_ELSE,
        timeout_blocks,
        script.OP_CHECKSEQUENCEVERIFY,
        script.OP_DROP,
        script.OP_DUP,
        script.OP_HASH160,
        bitcoin.core.Hash160(sender_pubkey),
    script.OP_ENDIF,
    script.OP_EQUALVERIFY,
    script.OP_CHECKSIG
])

# Generate P2SH address
htlc_address = bitcoin.wallet.P2SHBitcoinAddress.from_redeemScript(redeem_script)
```

### Step 3: Fund the HTLC

```bash
# Send bitcoin to the HTLC address
bitcoin-cli -regtest sendtoaddress <htlc_address> 1.0

# Mine a block to confirm
bitcoin-cli -regtest generate 1
```

### Step 4: Spending the HTLC

#### Option A: Spend with Preimage (Recipient)

```python
# Create spending transaction
tx = CMutableTransaction()

# Add input (HTLC UTXO)
tx.vin.append(CTxIn(COutPoint(htlc_txid, htlc_vout)))

# Add output (minus fee)
amount_out = amount_in - fee
tx.vout.append(CTxOut(amount_out, recipient_address.to_scriptPubKey()))

# Sign transaction
sighash = SignatureHash(redeem_script, tx, 0, SIGHASH_ALL)
sig = recipient_privkey.sign(sighash) + bytes([SIGHASH_ALL])

# Build witness script (unlock with preimage)
witness_script = CScript([
    sig,
    recipient_pubkey,
    secret,  # The preimage!
    1,       # OP_TRUE to select IF branch
    redeem_script
])

# Set the scriptSig
tx.vin[0].scriptSig = witness_script

# Broadcast
bitcoin-cli -regtest sendrawtransaction <hex_tx>
```

#### Option B: Spend with Timeout (Sender)

```python
# Wait for timeout blocks
bitcoin-cli -regtest generate 10

# Create spending transaction with version 2 (required for CSV)
tx = CMutableTransaction(nVersion=2)

# Add input with appropriate nSequence
tx.vin.append(CTxIn(
    COutPoint(htlc_txid, htlc_vout),
    nSequence=timeout_blocks  # Must match or exceed CSV value
))

# Add output
tx.vout.append(CTxOut(amount_out, sender_address.to_scriptPubKey()))

# Sign transaction
sighash = SignatureHash(redeem_script, tx, 0, SIGHASH_ALL)
sig = sender_privkey.sign(sighash) + bytes([SIGHASH_ALL])

# Build witness script (unlock with timeout)
witness_script = CScript([
    sig,
    sender_pubkey,
    0,  # OP_FALSE to select ELSE branch
    redeem_script
])

# Set the scriptSig
tx.vin[0].scriptSig = witness_script

# Broadcast
bitcoin-cli -regtest sendrawtransaction <hex_tx>
```

## Important Considerations

### Transaction Version Requirements
- **Version 2 or higher** required for `OP_CHECKSEQUENCEVERIFY`
- Standard transactions use version 1
- Must explicitly set version when using CSV

### nSequence Field
- Must be greater than or equal to the CSV timeout value
- Enables relative timelock enforcement
- Default nSequence (0xffffffff) disables timelocks

### Confirmation Requirements
- Preimage path: Spendable after 1 confirmation
- Timeout path: Spendable after specified block confirmations
- Always wait for sufficient confirmations before considering final

## Common Pitfalls

1. **Incorrect Transaction Version**
   - Using version 1 with CSV will fail
   - Always use version 2+ for timelock transactions

2. **Wrong nSequence Value**
   - Must match or exceed CSV parameter
   - Setting too low will make transaction invalid

3. **Script Size Limitations**
   - Keep redeem scripts under 520 bytes
   - Consider using P2WSH for larger scripts

4. **Preimage Security**
   - Never reveal preimage before funding confirmed
   - Use cryptographically secure random generation

## Testing on Regtest

### Quick Test Flow
```bash
# 1. Generate blocks for initial funds
bitcoin-cli -regtest generate 101

# 2. Create and fund HTLC
# (Run Python script to get HTLC address)
bitcoin-cli -regtest sendtoaddress <htlc_address> 1.0
bitcoin-cli -regtest generate 1

# 3. Test preimage spending
# (Run spending script with preimage)

# 4. OR test timeout spending
bitcoin-cli -regtest generate 10
# (Run spending script with timeout)
```

## Production Considerations

⚠️ **Warning**: This example is for educational purposes only. For production use:

1. **Security Auditing**: Have scripts professionally reviewed
2. **Error Handling**: Implement comprehensive error checking
3. **Fee Estimation**: Use dynamic fee calculation
4. **Key Management**: Use hardware wallets or HSMs
5. **Monitoring**: Implement transaction monitoring
6. **Backup Plans**: Have recovery procedures

## Integration with Cross-Chain Swaps

For Unite project integration:

1. **Secret Generation**: Use secure random generation
2. **Hash Consistency**: Ensure same hash algorithm across chains
3. **Timeout Coordination**: Bitcoin timeout > Ethereum timeout
4. **Atomic Execution**: Monitor both chains simultaneously

## Code Repository Structure

```
unite-agent/
├── src/bitcoin/
│   ├── htlc.py          # HTLC construction
│   ├── spend.py         # Spending logic
│   └── monitor.py       # Transaction monitoring
├── tests/
│   └── test_htlc.py     # Unit tests
└── scripts/
    └── demo_htlc.py     # Demo script
```

## Next Steps

1. Implement monitoring for HTLC funding
2. Create automated spending logic
3. Integrate with Fusion+ resolver
4. Add error recovery mechanisms
5. Optimize for production use

## References

- [BIP 112](https://github.com/bitcoin/bips/blob/master/bip-0112.mediawiki) - CHECKSEQUENCEVERIFY
- [Bitcoin Script Reference](https://en.bitcoin.it/wiki/Script)
- [python-bitcoinlib Documentation](https://github.com/petertodd/python-bitcoinlib)