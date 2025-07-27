import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import { ECPairFactory } from 'ecpair';

// Initialize ECC library
bitcoin.initEccLib(ecc);
const ECPair = ECPairFactory(ecc);

// Network configurations
export const NETWORKS = {
  testnet: bitcoin.networks.testnet,
  mainnet: bitcoin.networks.bitcoin,
  regtest: bitcoin.networks.regtest
} as const;

// API endpoints for development (no local node required)
export const BITCOIN_API_ENDPOINTS = {
  testnet: {
    blockstream: 'https://blockstream.info/testnet/api',
    blockcypher: 'https://api.blockcypher.com/v1/btc/test3',
    mempool: 'https://mempool.space/testnet/api'
  },
  mainnet: {
    blockstream: 'https://blockstream.info/api',
    blockcypher: 'https://api.blockcypher.com/v1/btc/main',
    mempool: 'https://mempool.space/api'
  }
} as const;

// Export configured instances
export { bitcoin, ECPair, ecc };

// Helper to get network from environment
export function getNetwork(): bitcoin.Network {
  const networkName = process.env.BITCOIN_NETWORK || 'testnet';
  return NETWORKS[networkName as keyof typeof NETWORKS] || NETWORKS.testnet;
}

// Helper to get API endpoint
export function getApiEndpoint(): string {
  const network = process.env.BITCOIN_NETWORK || 'testnet';
  const provider = process.env.BITCOIN_API_PROVIDER || 'blockstream';
  
  if (provider === 'local') {
    const host = process.env.BITCOIN_RPC_HOST || 'localhost';
    const port = process.env.BITCOIN_RPC_PORT || '18332';
    return `http://${host}:${port}`;
  }
  
  return BITCOIN_API_ENDPOINTS[network as keyof typeof BITCOIN_API_ENDPOINTS]?.[provider as keyof typeof BITCOIN_API_ENDPOINTS.testnet] 
    || BITCOIN_API_ENDPOINTS.testnet.blockstream;
}