# Bitcoin HTLC Rust Implementation Guide

## Table of Contents
1. [Overview](#overview)
2. [Bitcoin Testnet Setup](#bitcoin-testnet-setup)
3. [Rust Project Setup](#rust-project-setup)
4. [Understanding Bitcoin Script & Opcodes](#understanding-bitcoin-script--opcodes)
5. [HTLC Script Construction](#htlc-script-construction)
6. [Transaction Creation & Signing](#transaction-creation--signing)
7. [Complete Implementation Example](#complete-implementation-example)
8. [Testing Your HTLC](#testing-your-htlc)

## Overview

This guide provides a complete walkthrough for implementing Bitcoin HTLCs (Hash Time Locked Contracts) in Rust. We'll build a service that can create, fund, claim, and refund HTLCs on Bitcoin testnet.

### What You'll Learn
- Setting up Bitcoin testnet connection
- Working with Bitcoin Script opcodes
- Creating P2SH HTLCs
- Signing and broadcasting transactions
- Testing with real testnet coins

### Architecture
```
┌─────────────────────┐
│   Rust Backend      │
│  (Your Service)     │
└──────────┬──────────┘
           │
     ┌─────▼──────┐
     │ Bitcoin    │
     │ Testnet    │
     │   Node     │
     └────────────┘
```

## Bitcoin Testnet Setup

### Option 1: Public Testnet (Recommended for Hackathon)

**Advantages:**
- No sync time required
- Immediately available
- Real network conditions
- Public block explorers

**Setup:**
```rust
// Use public RPC endpoints
const TESTNET_RPC: &str = "https://blockstream.info/testnet/api";
// Or use a service like BlockCypher, Mempool.space
```

**Getting Testnet Bitcoin:**
1. **Faucets** (Free testnet coins):
   - https://bitcoinfaucet.uo1.net/
   - https://testnet-faucet.com/btc-testnet/
   - https://coinfaucet.eu/en/btc-testnet/
   
2. **How to use faucets:**
   ```bash
   # 1. Generate a testnet address (we'll create this in code)
   # 2. Visit faucet website
   # 3. Enter your address
   # 4. Receive 0.001-0.01 tBTC
   # 5. Wait for confirmation (10-30 minutes)
   ```

### Option 2: Local Bitcoin Core (More Complex)

**Only if you need full control:**
```bash
# Download Bitcoin Core
wget https://bitcoincore.org/bin/bitcoin-core-26.0/bitcoin-26.0-x86_64-linux-gnu.tar.gz

# Extract and run
tar -xzf bitcoin-26.0-x86_64-linux-gnu.tar.gz
cd bitcoin-26.0/bin

# Start in testnet mode
./bitcoind -testnet -daemon

# Wait for sync (can take hours/days)
./bitcoin-cli -testnet getblockchaininfo
```

### Block Explorers for Testnet
- https://blockstream.info/testnet/
- https://live.blockcypher.com/btc-testnet/
- https://www.blockchain.com/explorer?view=btc-testnet

## Rust Project Setup

### 1. Create New Project
```bash
cargo new bitcoin-htlc --bin
cd bitcoin-htlc
```

### 2. Add Dependencies
```toml
# Cargo.toml
[package]
name = "bitcoin-htlc"
version = "0.1.0"
edition = "2021"

[dependencies]
# Core Bitcoin library
bitcoin = { version = "0.31", features = ["serde", "rand"] }

# Secp256k1 for cryptography
secp256k1 = { version = "0.28", features = ["rand", "global-context"] }

# For RPC communication
bitcoincore-rpc = "0.18"

# Utilities
hex = "0.4"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tokio = { version = "1", features = ["full"] }
reqwest = { version = "0.11", features = ["json"] }
chrono = "0.4"
sha2 = "0.10"

# For API server
actix-web = "4"
```

### 3. Project Structure
```
bitcoin-htlc/
├── Cargo.toml
├── src/
│   ├── main.rs
│   ├── htlc.rs          # HTLC script building
│   ├── bitcoin_client.rs # Bitcoin network interaction
│   ├── transactions.rs   # Transaction creation/signing
│   └── api.rs           # HTTP API endpoints
```

## Understanding Bitcoin Script & Opcodes

### What is Bitcoin Script?
Bitcoin Script is a stack-based programming language used to define spending conditions. It's intentionally limited to ensure security.

### Key Opcodes for HTLC

```rust
// Common opcodes we'll use
use bitcoin::opcodes::all::*;

// OP_IF (0x63) - Conditional execution
// OP_ELSE (0x67) - Alternative branch
// OP_ENDIF (0x68) - End conditional
// OP_HASH256 (0xAA) - Double SHA256 hash
// OP_EQUAL (0x87) - Check equality
// OP_EQUALVERIFY (0x88) - Check equality and fail if not
// OP_CHECKSIG (0xAC) - Verify signature
// OP_CHECKLOCKTIMEVERIFY (0xB1) - Check locktime
// OP_DROP (0x75) - Remove top stack item
// OP_DUP (0x76) - Duplicate top stack item
```

### HTLC Script Structure
```
IF
    # Claim path: requires secret + recipient signature
    OP_HASH256 <secret_hash> OP_EQUALVERIFY
    OP_DUP OP_HASH160 <recipient_pubkey_hash> OP_EQUALVERIFY
    OP_CHECKSIG
ELSE
    # Refund path: requires timeout + sender signature
    <timeout> OP_CHECKLOCKTIMEVERIFY OP_DROP
    OP_DUP OP_HASH160 <sender_pubkey_hash> OP_EQUALVERIFY
    OP_CHECKSIG
ENDIF
```

## HTLC Script Construction

### Complete HTLC Builder Implementation

```rust
// src/htlc.rs
use bitcoin::{
    blockdata::{opcodes, script::Builder},
    hashes::{sha256d, Hash},
    Script, Network, Address,
    PublicKey, ScriptBuf,
};
use bitcoin::hashes::hex::FromHex;

pub struct HtlcParams {
    pub recipient_pubkey: PublicKey,
    pub sender_pubkey: PublicKey,
    pub secret_hash: [u8; 32],
    pub timeout: u32, // Block height
}

impl HtlcParams {
    pub fn build_htlc_script(&self) -> ScriptBuf {
        // Convert public keys to pubkey hashes (20 bytes)
        let recipient_pubkey_hash = bitcoin::PublicKey::pubkey_hash(
            &self.recipient_pubkey, 
            bitcoin::PublicKeyHash
        );
        let sender_pubkey_hash = bitcoin::PublicKey::pubkey_hash(
            &self.sender_pubkey,
            bitcoin::PublicKeyHash  
        );

        // Build the HTLC script
        Builder::new()
            // IF branch - claim with secret
            .push_opcode(opcodes::all::OP_IF)
                // Check secret hash
                .push_opcode(opcodes::all::OP_HASH256)
                .push_slice(&self.secret_hash)
                .push_opcode(opcodes::all::OP_EQUALVERIFY)
                // Check recipient signature
                .push_opcode(opcodes::all::OP_DUP)
                .push_opcode(opcodes::all::OP_HASH160)
                .push_slice(recipient_pubkey_hash.as_ref())
                .push_opcode(opcodes::all::OP_EQUALVERIFY)
                .push_opcode(opcodes::all::OP_CHECKSIG)
            // ELSE branch - refund after timeout
            .push_opcode(opcodes::all::OP_ELSE)
                // Check timeout
                .push_int(self.timeout as i64)
                .push_opcode(opcodes::all::OP_CLTV)
                .push_opcode(opcodes::all::OP_DROP)
                // Check sender signature
                .push_opcode(opcodes::all::OP_DUP)
                .push_opcode(opcodes::all::OP_HASH160)
                .push_slice(sender_pubkey_hash.as_ref())
                .push_opcode(opcodes::all::OP_EQUALVERIFY)
                .push_opcode(opcodes::all::OP_CHECKSIG)
            .push_opcode(opcodes::all::OP_ENDIF)
            .into_script()
    }

    pub fn to_p2sh_address(&self, network: Network) -> Address {
        let script = self.build_htlc_script();
        Address::p2sh(&script, network).unwrap()
    }
}

// Helper functions
pub fn generate_secret() -> ([u8; 32], [u8; 32]) {
    use rand::Rng;
    let mut rng = rand::thread_rng();
    let mut secret = [0u8; 32];
    rng.fill(&mut secret);
    
    let secret_hash = sha256d::Hash::hash(&secret).to_byte_array();
    (secret, secret_hash)
}

#[cfg(test)]
mod tests {
    use super::*;
    use bitcoin::secp256k1::{Secp256k1, SecretKey};

    #[test]
    fn test_htlc_creation() {
        let secp = Secp256k1::new();
        
        // Generate test keys
        let sender_sk = SecretKey::from_slice(&[1u8; 32]).unwrap();
        let recipient_sk = SecretKey::from_slice(&[2u8; 32]).unwrap();
        
        let sender_pubkey = PublicKey::from_private_key(&secp, &sender_sk);
        let recipient_pubkey = PublicKey::from_private_key(&secp, &recipient_sk);
        
        // Generate secret
        let (secret, secret_hash) = generate_secret();
        
        // Create HTLC
        let htlc = HtlcParams {
            recipient_pubkey,
            sender_pubkey,
            secret_hash,
            timeout: 500_000, // Example block height
        };
        
        let script = htlc.build_htlc_script();
        println!("HTLC Script: {}", script.asm());
        
        let address = htlc.to_p2sh_address(Network::Testnet);
        println!("P2SH Address: {}", address);
    }
}
```

## Transaction Creation & Signing

### Key Concepts for Transaction Signing

1. **Private Keys**: Control spending
2. **Public Keys**: Verify signatures
3. **Signatures**: Prove ownership
4. **SIGHASH Types**: Define what parts of transaction are signed

### Transaction Builder

```rust
// src/transactions.rs
use bitcoin::{
    Transaction, TxIn, TxOut, OutPoint, Witness,
    psbt::PartiallySignedTransaction,
    secp256k1::{Secp256k1, SecretKey, Message},
    sighash::{SighashCache, EcdsaSighashType},
    Amount, FeeRate, ScriptBuf, Sequence,
};

pub struct TransactionBuilder {
    secp: Secp256k1<secp256k1::All>,
}

impl TransactionBuilder {
    pub fn new() -> Self {
        Self {
            secp: Secp256k1::new(),
        }
    }

    /// Create funding transaction to HTLC
    pub fn create_funding_tx(
        &self,
        utxo: OutPoint,
        utxo_amount: Amount,
        htlc_address: Address,
        htlc_amount: Amount,
        change_address: Address,
        fee_rate: FeeRate,
    ) -> Transaction {
        let mut tx = Transaction {
            version: 2,
            lock_time: bitcoin::absolute::LockTime::ZERO,
            input: vec![
                TxIn {
                    previous_output: utxo,
                    script_sig: ScriptBuf::new(),
                    sequence: Sequence::ENABLE_RBF_NO_LOCKTIME,
                    witness: Witness::new(),
                }
            ],
            output: vec![
                // HTLC output
                TxOut {
                    value: htlc_amount,
                    script_pubkey: htlc_address.script_pubkey(),
                },
            ],
        };

        // Calculate fee and add change output
        let fee = fee_rate.fee_vb(tx.vsize() as u64).unwrap();
        let change = utxo_amount - htlc_amount - fee;
        
        if change > Amount::from_sat(546) { // Dust limit
            tx.output.push(TxOut {
                value: change,
                script_pubkey: change_address.script_pubkey(),
            });
        }

        tx
    }

    /// Create claim transaction (with secret)
    pub fn create_claim_tx(
        &self,
        htlc_utxo: OutPoint,
        htlc_amount: Amount,
        htlc_script: ScriptBuf,
        secret: [u8; 32],
        recipient_key: SecretKey,
        recipient_address: Address,
        fee: Amount,
    ) -> Result<Transaction, Box<dyn std::error::Error>> {
        let mut tx = Transaction {
            version: 2,
            lock_time: bitcoin::absolute::LockTime::ZERO,
            input: vec![
                TxIn {
                    previous_output: htlc_utxo,
                    script_sig: ScriptBuf::new(),
                    sequence: Sequence::MAX,
                    witness: Witness::new(),
                }
            ],
            output: vec![
                TxOut {
                    value: htlc_amount - fee,
                    script_pubkey: recipient_address.script_pubkey(),
                }
            ],
        };

        // Sign the transaction
        let sighash = SighashCache::new(&mut tx).segwit_signature_hash(
            0,
            &htlc_script,
            htlc_amount,
            EcdsaSighashType::All,
        )?;

        let sig = self.secp.sign_ecdsa(
            &Message::from_slice(&sighash[..])?,
            &recipient_key,
        );

        // Build witness script
        let mut witness = Witness::new();
        witness.push(sig.serialize_der());
        witness.push(&[0x01]); // SIGHASH_ALL
        witness.push(&secret);
        witness.push(&[1u8]); // OP_TRUE for IF branch
        witness.push(htlc_script.as_bytes());

        tx.input[0].witness = witness;

        Ok(tx)
    }

    /// Create refund transaction (after timeout)
    pub fn create_refund_tx(
        &self,
        htlc_utxo: OutPoint,
        htlc_amount: Amount,
        htlc_script: ScriptBuf,
        sender_key: SecretKey,
        sender_address: Address,
        timeout: u32,
        fee: Amount,
    ) -> Result<Transaction, Box<dyn std::error::Error>> {
        let mut tx = Transaction {
            version: 2,
            lock_time: bitcoin::absolute::LockTime::from_height(timeout)?,
            input: vec![
                TxIn {
                    previous_output: htlc_utxo,
                    script_sig: ScriptBuf::new(),
                    sequence: Sequence::ZERO, // Required for locktime
                    witness: Witness::new(),
                }
            ],
            output: vec![
                TxOut {
                    value: htlc_amount - fee,
                    script_pubkey: sender_address.script_pubkey(),
                }
            ],
        };

        // Sign the transaction
        let sighash = SighashCache::new(&mut tx).segwit_signature_hash(
            0,
            &htlc_script,
            htlc_amount,
            EcdsaSighashType::All,
        )?;

        let sig = self.secp.sign_ecdsa(
            &Message::from_slice(&sighash[..])?,
            &sender_key,
        );

        // Build witness script
        let mut witness = Witness::new();
        witness.push(sig.serialize_der());
        witness.push(&[0x01]); // SIGHASH_ALL
        witness.push(&[]); // OP_FALSE for ELSE branch
        witness.push(htlc_script.as_bytes());

        tx.input[0].witness = witness;

        Ok(tx)
    }
}
```

## Complete Implementation Example

### Bitcoin Client for Testnet

```rust
// src/bitcoin_client.rs
use reqwest;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone)]
pub struct BitcoinClient {
    base_url: String,
    client: reqwest::Client,
}

impl BitcoinClient {
    pub fn new_testnet() -> Self {
        Self {
            base_url: "https://blockstream.info/testnet/api".to_string(),
            client: reqwest::Client::new(),
        }
    }

    pub async fn broadcast_transaction(&self, tx_hex: &str) -> Result<String, Box<dyn std::error::Error>> {
        let response = self.client
            .post(&format!("{}/tx", self.base_url))
            .body(tx_hex.to_string())
            .send()
            .await?
            .text()
            .await?;

        Ok(response) // Returns transaction ID
    }

    pub async fn get_transaction(&self, txid: &str) -> Result<TransactionInfo, Box<dyn std::error::Error>> {
        let response = self.client
            .get(&format!("{}/tx/{}", self.base_url, txid))
            .send()
            .await?
            .json()
            .await?;

        Ok(response)
    }

    pub async fn get_utxos(&self, address: &str) -> Result<Vec<Utxo>, Box<dyn std::error::Error>> {
        let response = self.client
            .get(&format!("{}/address/{}/utxo", self.base_url, address))
            .send()
            .await?
            .json()
            .await?;

        Ok(response)
    }

    pub async fn get_block_height(&self) -> Result<u32, Box<dyn std::error::Error>> {
        let response = self.client
            .get(&format!("{}/blocks/tip/height", self.base_url))
            .send()
            .await?
            .text()
            .await?;

        Ok(response.parse()?)
    }
}

#[derive(Debug, Deserialize, Serialize)]
pub struct TransactionInfo {
    pub txid: String,
    pub status: TransactionStatus,
    pub fee: u64,
    pub vout: Vec<Vout>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct TransactionStatus {
    pub confirmed: bool,
    pub block_height: Option<u32>,
    pub block_time: Option<u64>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Utxo {
    pub txid: String,
    pub vout: u32,
    pub value: u64,
    pub status: TransactionStatus,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Vout {
    pub scriptpubkey: String,
    pub scriptpubkey_address: String,
    pub value: u64,
}
```

### API Server

```rust
// src/api.rs
use actix_web::{web, HttpResponse, Result};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateHtlcRequest {
    pub recipient_address: String,
    pub sender_address: String,
    pub amount_sats: u64,
    pub timeout_blocks: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateHtlcResponse {
    pub htlc_address: String,
    pub redeem_script: String,
    pub secret_hash: String,
    pub timeout: u32,
}

pub struct AppState {
    pub bitcoin_client: BitcoinClient,
    pub htlcs: Arc<Mutex<HashMap<String, HtlcInfo>>>,
}

pub async fn create_htlc(
    data: web::Data<AppState>,
    req: web::Json<CreateHtlcRequest>,
) -> Result<HttpResponse> {
    // Implementation here
    // 1. Generate secret
    // 2. Create HTLC script
    // 3. Generate P2SH address
    // 4. Store HTLC info
    // 5. Return response
    
    Ok(HttpResponse::Ok().json(CreateHtlcResponse {
        htlc_address: "2N...".to_string(),
        redeem_script: "63a8...".to_string(),
        secret_hash: "abcd...".to_string(),
        timeout: 500000,
    }))
}
```

### Main Application

```rust
// src/main.rs
use actix_web::{web, App, HttpServer};
use std::sync::{Arc, Mutex};
use std::collections::HashMap;

mod htlc;
mod bitcoin_client;
mod transactions;
mod api;

use bitcoin_client::BitcoinClient;
use api::{AppState, create_htlc};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("Starting Bitcoin HTLC Service...");

    let bitcoin_client = BitcoinClient::new_testnet();
    
    // Test connection
    match bitcoin_client.get_block_height().await {
        Ok(height) => println!("Connected to Bitcoin testnet at height: {}", height),
        Err(e) => eprintln!("Failed to connect: {}", e),
    }

    let app_state = web::Data::new(AppState {
        bitcoin_client,
        htlcs: Arc::new(Mutex::new(HashMap::new())),
    });

    HttpServer::new(move || {
        App::new()
            .app_data(app_state.clone())
            .route("/htlc/create", web::post().to(create_htlc))
            .route("/health", web::get().to(|| async { "OK" }))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
```

## Testing Your HTLC

### Step-by-Step Testing Guide

1. **Generate Test Wallets**
```bash
# Install bitcoin CLI tools or use web wallet
# Generate testnet addresses for sender and recipient
```

2. **Get Testnet Coins**
```bash
# Visit faucet with your sender address
# Wait for confirmation (check on explorer)
```

3. **Create HTLC**
```bash
curl -X POST http://localhost:8080/htlc/create \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_address": "tb1q...",
    "sender_address": "tb1q...",
    "amount_sats": 10000,
    "timeout_blocks": 144
  }'
```

4. **Fund the HTLC**
```bash
# Send testnet BTC to the returned htlc_address
# Wait for confirmation
```

5. **Claim with Secret**
```bash
# Use the secret to claim before timeout
# Broadcast claim transaction
```

6. **Or Wait for Refund**
```bash
# After timeout blocks, broadcast refund transaction
```

### Debugging Tips

1. **Transaction Not Broadcasting?**
   - Check fee is sufficient (1-5 sat/vB for testnet)
   - Verify script is correct
   - Check UTXO is unspent

2. **Script Validation Failing?**
   - Use Bitcoin Core's `testmempoolaccept` RPC
   - Decode transaction with online tools
   - Check signature format

3. **Common Issues:**
   - Wrong network (mainnet vs testnet)
   - Incorrect endianness for values
   - Missing witness data
   - Locktime not set correctly

### Useful Commands

```bash
# Decode raw transaction
bitcoin-cli -testnet decoderawtransaction "hex..."

# Test if transaction would be accepted
bitcoin-cli -testnet testmempoolaccept '["hex..."]'

# Get current block height
bitcoin-cli -testnet getblockcount
```

## Security Considerations

1. **Never expose private keys**
2. **Always validate inputs**
3. **Use proper timeout values** (Bitcoin timeout > Ethereum timeout)
4. **Handle errors gracefully**
5. **Log all operations for debugging**

## Next Steps

1. Implement full API matching your OpenAPI spec
2. Add database for persistence
3. Create monitoring service for transactions
4. Build integration with Fusion+
5. Add comprehensive error handling
6. Create demo scripts

## Resources

- Bitcoin Script Reference: https://en.bitcoin.it/wiki/Script
- Rust Bitcoin Docs: https://docs.rs/bitcoin/
- Bitcoin Testnet Explorer: https://blockstream.info/testnet/
- Bitcoin Core RPC: https://developer.bitcoin.org/reference/rpc/

Remember: Start simple, test often, and build incrementally!