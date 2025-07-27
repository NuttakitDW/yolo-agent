import { bitcoin, ECPair, getNetwork } from './setup';
import * as crypto from 'crypto';

/**
 * Example implementations of Bitcoin HTLC scripts
 * These are educational examples showing how to construct HTLCs
 */

// Helper function to compile opcodes to hex
function opcodeToHex(opcode: number): string {
  return opcode.toString(16).padStart(2, '0');
}

// Example 1: Create a basic HTLC script
export function createBasicHTLC(
  secretHash: Buffer,
  recipientPubKeyHash: Buffer,
  senderPubKeyHash: Buffer,
  timeoutBlocks: number
): Buffer {
  // Build the HTLC script using Bitcoin Script
  const script = bitcoin.script.compile([
    bitcoin.opcodes.OP_IF,
      // Claim path (with secret)
      bitcoin.opcodes.OP_SHA256,
      secretHash,
      bitcoin.opcodes.OP_EQUALVERIFY,
      bitcoin.opcodes.OP_DUP,
      bitcoin.opcodes.OP_HASH160,
      recipientPubKeyHash,
    bitcoin.opcodes.OP_ELSE,
      // Refund path (after timeout)
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

  return script;
}

// Example 2: Create HTLC with direct public key (more efficient)
export function createHTLCWithPubKeys(
  secretHash: Buffer,
  recipientPubKey: Buffer,
  senderPubKey: Buffer,
  timeoutBlocks: number
): Buffer {
  const script = bitcoin.script.compile([
    bitcoin.opcodes.OP_IF,
      bitcoin.opcodes.OP_SHA256,
      secretHash,
      bitcoin.opcodes.OP_EQUALVERIFY,
      recipientPubKey,
      bitcoin.opcodes.OP_CHECKSIG,
    bitcoin.opcodes.OP_ELSE,
      bitcoin.script.number.encode(timeoutBlocks),
      bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,
      bitcoin.opcodes.OP_DROP,
      senderPubKey,
      bitcoin.opcodes.OP_CHECKSIG,
    bitcoin.opcodes.OP_ENDIF
  ]);

  return script;
}

// Example 3: Create witness script for claiming HTLC
export function createClaimWitness(
  signature: Buffer,
  publicKey: Buffer,
  secret: Buffer
): Buffer[] {
  return [
    signature,
    publicKey,
    secret,
    Buffer.from([0x01]) // OP_TRUE to select IF branch
  ];
}

// Example 4: Create witness script for refund
export function createRefundWitness(
  signature: Buffer,
  publicKey: Buffer
): Buffer[] {
  return [
    signature,
    publicKey,
    Buffer.from([]) // OP_FALSE to select ELSE branch
  ];
}

// Example 5: Decode and analyze HTLC script
export function analyzeHTLCScript(script: Buffer): {
  type: string;
  secretHash?: string;
  timeout?: number;
  recipientPubKey?: string;
  senderPubKey?: string;
} {
  const decompiled = bitcoin.script.decompile(script);
  if (!decompiled) {
    throw new Error('Failed to decompile script');
  }

  const analysis: any = { type: 'HTLC' };

  // Find SHA256 hash
  for (let i = 0; i < decompiled.length; i++) {
    if (decompiled[i] === bitcoin.opcodes.OP_SHA256 && i + 1 < decompiled.length) {
      const hash = decompiled[i + 1];
      if (Buffer.isBuffer(hash)) {
        analysis.secretHash = hash.toString('hex');
      }
    }

    // Find timeout value
    if (decompiled[i] === bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY && i > 0) {
      const timeout = decompiled[i - 1];
      if (typeof timeout === 'number' || Buffer.isBuffer(timeout)) {
        analysis.timeout = bitcoin.script.number.decode(timeout as any);
      }
    }
  }

  return analysis;
}

// Example 6: Full HTLC creation flow
export async function createHTLCTransaction(
  fundingTxId: string,
  fundingVout: number,
  amount: number,
  secret: string,
  recipientAddress: string,
  senderAddress: string,
  timeoutBlocks: number
): Promise<{
  htlcAddress: string;
  redeemScript: Buffer;
  secretHash: string;
}> {
  const network = getNetwork();
  
  // Generate secret hash
  const secretBuffer = Buffer.from(secret, 'utf8');
  const secretHash = crypto.createHash('sha256').update(secretBuffer).digest();

  // Decode addresses to get public key hashes
  const recipientDecoded = bitcoin.address.fromBase58Check(recipientAddress);
  const senderDecoded = bitcoin.address.fromBase58Check(senderAddress);

  // Create HTLC script
  const redeemScript = createBasicHTLC(
    secretHash,
    recipientDecoded.hash,
    senderDecoded.hash,
    timeoutBlocks
  );

  // Create P2WSH address from the script
  const p2wsh = bitcoin.payments.p2wsh({
    redeem: { output: redeemScript },
    network
  });

  return {
    htlcAddress: p2wsh.address!,
    redeemScript,
    secretHash: secretHash.toString('hex')
  };
}

// Example usage and testing
export function demonstrateHTLCScripts() {
  console.log('=== Bitcoin HTLC Script Examples ===\n');

  // Example secret and hash
  const secret = 'my-secret-phrase';
  const secretBuffer = Buffer.from(secret, 'utf8');
  const secretHash = crypto.createHash('sha256').update(secretBuffer).digest();

  console.log('Secret:', secret);
  console.log('SHA256 Hash:', secretHash.toString('hex'));
  console.log();

  // Example keys (DO NOT USE IN PRODUCTION)
  const network = getNetwork();
  const recipientKey = ECPair.makeRandom({ network });
  const senderKey = ECPair.makeRandom({ network });

  // Create HTLC with public keys
  const htlcScript = createHTLCWithPubKeys(
    secretHash,
    recipientKey.publicKey,
    senderKey.publicKey,
    750000 // timeout at block 750000
  );

  console.log('HTLC Script (hex):', htlcScript.toString('hex'));
  console.log('Script Size:', htlcScript.length, 'bytes');
  console.log();

  // Decode the script
  const decoded = bitcoin.script.toASM(htlcScript);
  console.log('Decoded Script:');
  console.log(decoded.split(' ').join('\n'));
  console.log();

  // Create P2WSH address
  const p2wsh = bitcoin.payments.p2wsh({
    redeem: { output: htlcScript },
    network
  });
  console.log('P2WSH Address:', p2wsh.address);
  console.log('Script Hash:', p2wsh.hash?.toString('hex'));
}

// Run demonstration if called directly
if (require.main === module) {
  demonstrateHTLCScripts();
}