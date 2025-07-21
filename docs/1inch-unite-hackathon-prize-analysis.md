# 1inch Unite Hackathon Prize Analysis & Learning Guide

## Total Prize Pool: $500,000

## Most Interesting Prize Tracks

### Top Tier Opportunities ($32,000 each)

| Rank | Prize Track | Amount | Why It's Interesting |
|------|-------------|---------|---------------------|
| 1 | **Extend Fusion+ to Bitcoin** | $32,000 | • High impact - Bitcoin is the largest crypto by market cap<br>• Technical challenge with UTXO model<br>• First-mover advantage in BTC DeFi<br>• Can leverage Ordinals/Runes ecosystem |
| 2 | **Extend Fusion+ to Aptos** | $32,000 | • Move language expertise is rare<br>• Growing ecosystem with institutional backing<br>• High-performance chain (160k TPS)<br>• Less competition due to newer tech |
| 3 | **Extend Fusion+ to Sui** | $32,000 | • Cutting-edge Move language<br>• Object-centric model is unique<br>• Backed by major VCs<br>• Growing DeFi ecosystem needs bridges |
| 4 | **Expand Limit Order Protocol** | $65,000 | • Highest single prize amount<br>• Creative freedom to build options, perps, etc.<br>• Can leverage existing 1inch infrastructure<br>• Real DeFi innovation potential |

### Second Tier Opportunities ($20,000-$32,000)

| Rank | Prize Track | Amount | Why It's Interesting |
|------|-------------|---------|---------------------|
| 5 | **Extend Fusion+ to Cosmos** | $32,000 | • IBC expertise valuable<br>• Large ecosystem to tap into<br>• Established developer community |
| 6 | **Build Full Application** | $30,000 | • Lower technical barrier<br>• UI/UX focused<br>• Can combine multiple APIs<br>• Portfolio builder opportunity |
| 7 | **Extend Fusion+ to Ton** | $20,000 | • Telegram integration potential<br>• Massive user base<br>• Unique architecture |

## Master Learning Table

### Core 1inch Technologies

| Technology | What to Learn | Resources Needed | Time Estimate |
|------------|---------------|------------------|---------------|
| **Fusion+ Protocol** | • Architecture & components<br>• Resolver/filler mechanism<br>• Order structure<br>• Security model | • 1inch docs<br>• GitHub repos<br>• Technical papers | 8-12 hours |
| **Cross-Chain Swaps** | • Hashlock mechanisms<br>• Timelock implementation<br>• Atomic swap theory<br>• Bridge security | • Cross-chain papers<br>• HTLC tutorials<br>• Bridge audits | 6-8 hours |
| **Limit Order Protocol** | • Order types<br>• Execution logic<br>• Gas optimization<br>• MEV protection | • Protocol docs<br>• Smart contracts<br>• Example implementations | 4-6 hours |
| **1inch APIs** | • Swap API<br>• Aggregation API<br>• Price feeds<br>• WebSocket streams | • API documentation<br>• Postman collections<br>• Integration examples | 3-4 hours |

## Prize-Specific Learning Requirements

### 1. Fusion+ to Bitcoin Track ($32,000)

| Topic | Details | Resources | Priority |
|-------|---------|-----------|----------|
| **Bitcoin Script** | • P2SH, P2WSH<br>• Timelock opcodes<br>• Multisig setup | Bitcoin Wiki, BIP docs | Critical |
| **UTXO Model** | • Transaction construction<br>• Fee estimation<br>• Change handling | Mastering Bitcoin book | Critical |
| **Lightning Network** | • HTLC in Lightning<br>• Channel mechanics | Lightning RFC | Medium |
| **Bitcoin Libraries** | • BitcoinJS<br>• Python-bitcoinlib | GitHub repos | High |

### 2. Fusion+ to Aptos Track ($32,000)

| Topic | Details | Resources | Priority |
|-------|---------|-----------|----------|
| **Move Language** | • Syntax basics<br>• Resource model<br>• Abilities system | Aptos docs, Move book | Critical |
| **Aptos Framework** | • Account model<br>• Transaction flow<br>• Events system | Aptos GitHub | Critical |
| **Cross-chain Messaging** | • LayerZero on Aptos<br>• Wormhole integration | Bridge docs | High |
| **Aptos SDK** | • TypeScript SDK<br>• Transaction building | SDK documentation | High |

### 3. Fusion+ to Sui Track ($32,000)

| Topic | Details | Resources | Priority |
|-------|---------|-----------|----------|
| **Sui Move** | • Object model<br>• Ownership types<br>• Dynamic fields | Sui docs | Critical |
| **Sui Architecture** | • Narwhal/Bullshark<br>• Object storage<br>• Gas model | Technical papers | High |
| **Programmable Transactions** | • Transaction blocks<br>• Composability | Sui examples | Critical |
| **Sui SDK** | • TypeScript/Rust SDKs<br>• Wallet integration | GitHub repos | High |

### 4. Limit Order Protocol Expansion ($65,000)

| Topic | Details | Resources | Priority |
|-------|---------|-----------|----------|
| **DeFi Derivatives** | • Options theory<br>• Perpetuals design<br>• Liquidation mechanics | DeFi papers | Critical |
| **Advanced Order Types** | • Stop-loss<br>• Trailing stops<br>• Conditional orders | Trading docs | Critical |
| **Gas Optimization** | • Assembly tricks<br>• Storage patterns<br>• Batch operations | Solidity docs | High |
| **MEV Protection** | • Commit-reveal<br>• Order encryption<br>• Fair ordering | Flashbots research | Medium |

### 5. Fusion+ to Cosmos Track ($32,000)

| Topic | Details | Resources | Priority |
|-------|---------|-----------|----------|
| **IBC Protocol** | • Channel lifecycle<br>• Packet flow<br>• Light clients | IBC specs | Critical |
| **CosmWasm** | • Smart contracts<br>• Message passing<br>• State management | CosmWasm docs | Critical |
| **Cosmos SDK** | • Module structure<br>• ABCI interface<br>• Tendermint | SDK tutorials | High |
| **Relayer Operation** | • Hermes setup<br>• Channel creation | Relayer guides | Medium |

### 6. Full Application Track ($30,000)

| Topic | Details | Resources | Priority |
|-------|---------|-----------|----------|
| **1inch API Suite** | • All endpoints<br>• Rate limits<br>• Error handling | API reference | Critical |
| **Frontend Framework** | • React/Next.js<br>• Web3 integration<br>• Wallet connection | Framework docs | Critical |
| **UI/UX Design** | • DeFi patterns<br>• Mobile responsive<br>• Accessibility | Design systems | High |
| **Backend Services** | • Price feeds<br>• Order tracking<br>• Analytics | Node.js guides | Medium |

### 7. Fusion+ to TON Track ($20,000)

| Topic | Details | Resources | Priority |
|-------|---------|-----------|----------|
| **FunC Language** | • Stack-based model<br>• Cell/slice types<br>• Message handling | TON docs | Critical |
| **TON Architecture** | • Sharding model<br>• Message routing<br>• Workchains | Whitepapers | High |
| **TON Connect** | • Wallet integration<br>• Deep links<br>• Transaction flow | SDK docs | Critical |
| **Telegram Integration** | • Bot API<br>• Mini apps<br>• Payment system | Telegram docs | Medium |

## Quick Start Checklist

### Week 1: Foundation
- [ ] Study 1inch Fusion+ architecture
- [ ] Understand cross-chain swap mechanics
- [ ] Pick target chain and study its basics
- [ ] Set up development environment

### Week 2: Deep Dive
- [ ] Master target chain's programming language
- [ ] Study existing bridge implementations
- [ ] Understand 1inch resolver/filler model
- [ ] Build proof of concept

### Week 3: Implementation
- [ ] Implement core swap logic
- [ ] Add security features (hashlock/timelock)
- [ ] Test edge cases
- [ ] Optimize gas usage

### Week 4: Polish
- [ ] Add stretch goals (UI, partial fills)
- [ ] Comprehensive testing
- [ ] Documentation
- [ ] Prepare demo

## Key Success Factors

1. **Technical Depth**: Judges value deep understanding over surface-level integration
2. **Security First**: Cross-chain = high risk. Show security considerations
3. **Real Innovation**: Don't just wrap existing bridges, add unique value
4. **Clean Code**: Well-documented, tested, and auditable code wins
5. **Clear Demo**: Complex tech needs simple explanation

## Resources Summary

### Essential Documentation
- [1inch Fusion+ Docs](https://docs.1inch.io/docs/fusion-swap/introduction)
- [1inch Limit Order Protocol](https://docs.1inch.io/docs/limit-order-protocol/introduction)
- [1inch Developer Portal](https://portal.1inch.dev/)

### Must-Read Papers
- "Atomic Cross-Chain Swaps" - original HTLC paper
- "MEV Protection in DeFi" - Flashbots research
- Target chain whitepapers and technical specs

### Development Tools
- Hardhat/Foundry for EVM chains
- Chain-specific SDKs and testnet faucets
- Cross-chain message passing protocols (LayerZero, Wormhole)