# Lightning-Style Pre-Signed Transactions on Bitcoin Mainnet

## Overview

Pre-signed transactions allow you to enforce destination addresses in Bitcoin HTLCs by creating the spending transaction BEFORE funding the HTLC. This technique is used in Lightning Network and works perfectly on Bitcoin mainnet.

## How It Works

### 1. Transaction Structure

```
[Funding TX] → [HTLC Output] → [Pre-signed Spending TX] → [Maker's Address]
```

### 2. Implementation Steps

#### Step 1: Create HTLC Address
```python
# Generate P2SH address for HTLC script
htlc_script = """
OP_IF
    OP_SHA256 <secret_hash> OP_EQUALVERIFY
    <resolver_pubkey> OP_CHECKSIG
OP_ELSE
    <timeout> OP_CHECKLOCKTIMEVERIFY OP_DROP
    <maker_pubkey> OP_CHECKSIG
OP_ENDIF
"""

# Convert to P2SH address
htlc_address = generate_p2sh_address(htlc_script)
```

#### Step 2: Create Pre-signed Transaction (BEFORE funding!)
```python
# Create spending transaction
spending_tx = {
    "inputs": [{
        "txid": "placeholder",  # Will be updated later
        "vout": 0,
        "script_sig": "",      # Empty for now
        "sequence": 0xfffffffe  # Enable time locks
    }],
    "outputs": [{
        "address": maker_btc_address,  # Enforced destination!
        "amount": htlc_amount - fee
    }]
}
```

#### Step 3: Resolver Signs First
```python
# Resolver creates signature for the success path
resolver_sig = sign_transaction(
    spending_tx,
    resolver_private_key,
    sighash_type=SIGHASH_ALL | SIGHASH_ANYONECANPAY
)

# This signature is given to the maker BEFORE funding
```

#### Step 4: Maker Verifies and Funds
```python
# Maker verifies the pre-signed transaction
# - Checks destination is correct
# - Validates resolver's signature
# - Only then funds the HTLC

funding_tx = create_transaction({
    "inputs": [...],
    "outputs": [{
        "address": htlc_address,
        "amount": htlc_amount
    }]
})
```

#### Step 5: Complete the Swap
```python
# When secret is revealed, complete the pre-signed tx
final_script_sig = """
<resolver_signature>
<resolver_pubkey>
<secret>
1  # OP_TRUE for IF branch
<htlc_script>
"""

# Update the pre-signed tx with actual funding txid
spending_tx["inputs"][0]["txid"] = funding_tx.txid
spending_tx["inputs"][0]["script_sig"] = final_script_sig

# Broadcast to claim funds to maker's address
```

## Key Requirements

### 1. SegWit Transactions
- Use SegWit to prevent transaction malleability
- Ensures txid won't change after signing

### 2. SIGHASH Flags
- `SIGHASH_ALL`: Signs all outputs (enforces destination)
- `SIGHASH_ANYONECANPAY`: Allows updating inputs later

### 3. Trust Model
- Maker must verify pre-signed tx BEFORE funding
- Resolver cannot change destination after signing
- Completely trustless once funded

## Example Implementation

```python
import bitcoin
from bitcoin import SelectParams
from bitcoin.core import *
from bitcoin.core.script import *

SelectParams('mainnet')

def create_htlc_with_presigned_tx(
    secret_hash,
    resolver_pubkey,
    maker_pubkey,
    maker_destination,
    timeout_blocks,
    amount_sats
):
    # 1. Create HTLC script
    htlc_script = CScript([
        OP_IF,
            OP_SHA256, secret_hash, OP_EQUALVERIFY,
            resolver_pubkey, OP_CHECKSIG,
        OP_ELSE,
            timeout_blocks, OP_CHECKLOCKTIMEVERIFY, OP_DROP,
            maker_pubkey, OP_CHECKSIG,
        OP_ENDIF
    ])
    
    # 2. Generate P2WSH address (SegWit)
    htlc_address = P2WSHBitcoinAddress.from_script(htlc_script)
    
    # 3. Create pre-signed spending transaction
    # (This happens BEFORE funding!)
    spending_tx = CMutableTransaction(
        vin=[CTxIn(COutPoint(), CScript(), nSequence=0xfffffffe)],
        vout=[CTxOut(amount_sats - 1000, maker_destination.to_scriptPubKey())]
    )
    
    # 4. Resolver signs with ANYONECANPAY
    sighash = SignatureHash(
        htlc_script,
        spending_tx,
        0,
        SIGHASH_ALL | SIGHASH_ANYONECANPAY,
        amount_sats,
        SIGVERSION_WITNESS_V0
    )
    
    resolver_sig = resolver_private_key.sign(sighash) + bytes([SIGHASH_ALL | SIGHASH_ANYONECANPAY])
    
    return {
        'htlc_address': htlc_address,
        'htlc_script': htlc_script,
        'presigned_tx': spending_tx,
        'resolver_sig': resolver_sig
    }
```

## Advantages

1. **Destination Enforcement**: Maker's address is locked in before funding
2. **Trustless**: No way for resolver to change destination
3. **Mainnet Compatible**: Works today on Bitcoin mainnet
4. **Simple**: No complex covenant opcodes needed

## Limitations

1. **Fee Estimation**: Must estimate fees when creating pre-signed tx
2. **No Fee Bumping**: Cannot use RBF without re-signing
3. **Single Destination**: Cannot split outputs

## Real-World Usage

- **Lightning Network**: Every channel uses this pattern
- **Submarine Swaps**: Loop protocol uses pre-signed txs
- **Atomic Swaps**: Many implementations use this approach

## Security Considerations

1. Always use SegWit to prevent malleability
2. Maker MUST verify pre-signed tx before funding
3. Use appropriate timeouts for refund path
4. Consider fee market changes over swap duration