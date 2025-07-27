import * as dotenv from 'dotenv';
import { bitcoin, ECPair, getNetwork } from '../src/bitcoin/setup';
import { ethers } from 'ethers';
import * as crypto from 'crypto';

dotenv.config();

interface BitcoinWallet {
  address: string;
  privateKey: string;
  publicKey: string;
  wif: string;
}

interface EthereumWallet {
  address: string;
  privateKey: string;
  publicKey: string;
}

function generateBitcoinWallet(): BitcoinWallet {
  const network = getNetwork();
  const keyPair = ECPair.makeRandom({ network });
  
  // Generate P2WPKH address (native segwit, starts with bc1 or tb1)
  const { address } = bitcoin.payments.p2wpkh({
    pubkey: keyPair.publicKey,
    network,
  });

  return {
    address: address!,
    privateKey: keyPair.privateKey!.toString('hex'),
    publicKey: keyPair.publicKey.toString('hex'),
    wif: keyPair.toWIF(),
  };
}

function generateEthereumWallet(): EthereumWallet {
  const wallet = ethers.Wallet.createRandom();
  
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    publicKey: wallet.publicKey,
  };
}

function generateSharedSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}

async function main() {
  console.log('=== Generating Test Wallets for Unite Agent ===\n');

  // Generate Bitcoin wallet
  const btcWallet = generateBitcoinWallet();
  console.log('Bitcoin Wallet (Native SegWit):');
  console.log('  Network:', process.env.BITCOIN_NETWORK || 'testnet');
  console.log('  Address:', btcWallet.address);
  console.log('  Private Key (HEX):', btcWallet.privateKey);
  console.log('  Private Key (WIF):', btcWallet.wif);
  console.log('  Public Key:', btcWallet.publicKey);
  console.log();

  // Generate Ethereum wallet
  const ethWallet = generateEthereumWallet();
  console.log('Ethereum Wallet:');
  console.log('  Network:', process.env.ETHEREUM_NETWORK || 'sepolia');
  console.log('  Address:', ethWallet.address);
  console.log('  Private Key:', ethWallet.privateKey);
  console.log('  Public Key:', ethWallet.publicKey);
  console.log();

  // Generate example HTLC secret
  const secret = generateSharedSecret();
  const secretHash = crypto.createHash('sha256').update(Buffer.from(secret, 'hex')).digest('hex');
  console.log('Example HTLC Secret:');
  console.log('  Secret:', secret);
  console.log('  SHA256 Hash:', secretHash);
  console.log();

  console.log('=== Faucets for Test Tokens ===');
  console.log('Bitcoin Testnet:');
  console.log('  - https://bitcoinfaucet.uo1.net/');
  console.log('  - https://testnet-faucet.mempool.co/');
  console.log('  - https://coinfaucet.eu/en/btc-testnet/');
  console.log();
  console.log('Ethereum Sepolia:');
  console.log('  - https://sepoliafaucet.com/');
  console.log('  - https://sepolia-faucet.pk910.de/');
  console.log('  - https://faucet.quicknode.com/ethereum/sepolia');
  console.log();

  console.log('⚠️  IMPORTANT: Save these keys securely and NEVER use them on mainnet!');
  console.log('⚠️  Add them to your .env file (copy from .env.example)');
}

main().catch(console.error);