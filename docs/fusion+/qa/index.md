# 1inch Fusion+ Q&A Index

This index contains all documented questions and answers about 1inch Fusion+ implementation.

## Architecture & Integration

1. **[Rust HTLC Service with TypeScript Resolver Integration](./rust-htlc-typescript-resolver-integration.md)**
   - Can TypeScript resolver backend communicate with Rust HTLC service?
   - Best practices for multi-language microservices in Fusion+
   - Communication protocols (REST vs gRPC)
   - Performance and reliability considerations
   - Advantages of Rust for Bitcoin/HTLC operations
   - *Created: 2025-07-28*

2. **[Makers, Takers, and Resolvers: Complete Flow Analysis](./makers-takers-resolvers-detailed-flow.md)**
   - Does the maker need a resolver to complete their side of the swap?
   - Who handles signing and claiming from escrow/HTLC contracts?
   - Differences between maker and taker interactions with resolvers
   - Role of relayers vs resolvers in the maker's flow
   - Complete asset custody flow from maker's perspective
   - Technical implementation details of escrow contracts
   - *Created: 2025-07-31*

3. **[Bitcoin HTLC Cross-Chain Implementation](./bitcoin-htlc-cross-chain-implementation.md)**
   - How can resolvers unlock BTC in HTLCs while ensuring correct destination addresses?
   - What Bitcoin script opcodes are used in Fusion+ HTLCs?
   - Can Bitcoin scripts dictate destination addresses when unlocking with secrets?
   - How does Fusion+ handle Bitcoin script limitations for recipient specification?
   - Cross-chain atomic swap flow for ETH->BTC swaps
   - Security considerations and trust assumptions for Bitcoin integration
   - *Created: 2025-07-31*

---

*This index is updated automatically as new Q&A documents are added.*