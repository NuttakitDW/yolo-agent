# Makers, Takers, and Resolvers in 1inch Fusion+ Cross-Chain Swaps

*Created: 2025-07-31*

## Executive Summary

This document provides a comprehensive analysis of the roles and responsibilities of makers, takers, and resolvers in 1inch Fusion+ cross-chain swaps, specifically addressing the maker's perspective and asset custody flow.

## Key Questions Answered

1. **Does the maker also need a resolver to complete their side of the swap?**
2. **Who handles the signing and claiming of coins from escrow/HTLC contracts on the maker's side?**
3. **Is there a difference between how makers and takers interact with resolvers?**
4. **What is the exact role of relayers vs resolvers in the maker's flow?**

---

## 1. Maker's Relationship with Resolvers

### **Answer: No, makers do not need their own resolver**

**Key Finding:** Makers are passive participants in the execution phase. They only need to:
- Sign the initial intent/order off-chain
- Wait for resolver execution
- Receive their tokens once the atomic swap completes

**Technical Details:**
- Makers create and sign a Fusion+ order (intent) specifying their desired swap parameters
- This intent is broadcast to the 1inch network and distributed to all registered resolvers
- Resolvers compete in a Dutch auction to fulfill the maker's order
- The winning resolver handles ALL on-chain execution for both sides of the swap

**From the research:**
> "The process typically has three phases and involves two main participants: the maker, who creates the order, and the resolver, who fills it"

> "The maker initiates the process by signing a 1inch Fusion+ order and broadcasting it to 1inch"

---

## 2. Signing and Claiming Responsibilities

### **Maker's Signing Responsibilities:**
**Limited to Intent Creation Only**

1. **Initial Order Signing (Off-chain):**
   - Makers sign a Fusion+ limit order containing:
     - Source token and amount
     - Destination chain and token
     - Minimum acceptable rate
     - Expiration parameters
     - Secret hash (for HTLC)

2. **Token Approval:**
   - Makers must approve their source tokens for transfer by the resolver
   - This is typically done through standard ERC-20 approval mechanisms

### **Resolver's Signing Responsibilities:**
**Handles All On-Chain Execution**

1. **Order Execution:**
   - Resolvers execute the maker's signed order on-chain via the Limit Order Protocol
   - Deploy escrow contracts on both source and destination chains

2. **Escrow Management:**
   - Create and fund `EscrowSrc` contract on source chain (locks maker's tokens)
   - Create and fund `EscrowDst` contract on destination chain (deposits resolver's tokens)
   - Manage secret revelation and token claiming

3. **Transaction Signing:**
   - All on-chain transactions are signed by the resolver
   - Includes escrow creation, funding, and claiming transactions

**From the research:**
> "The resolver executes the order on-chain via the Limit Order Protocol"

> "The winning resolver deposits the maker's assets into an escrow contract on the source chain, and then deposits the corresponding assets into an escrow on the destination chain"

---

## 3. Asset Custody and Control Flow

### **Complete Asset Flow from Maker's Perspective:**

#### **Phase 1: Intent Creation**
- **Maker Control:** 100% custody of source tokens
- **Action:** Sign intent off-chain, approve tokens for resolver transfer

#### **Phase 2: Dutch Auction**
- **Maker Control:** Still holds source tokens (approved for transfer)
- **Action:** Wait for resolver to win auction and execute order

#### **Phase 3: Escrow Creation**
- **Resolver Action:** Executes maker's order, transferring tokens to `EscrowSrc`
- **Maker Control:** 0% - tokens locked in escrow contract
- **Escrow Control:** Smart contract holds tokens with hashlock/timelock conditions

#### **Phase 4: Cross-Chain Escrow**
- **Resolver Action:** Deposits destination tokens in `EscrowDst` on target chain
- **Maker Control:** 0% on source chain, 0% on destination chain (tokens in escrow)

#### **Phase 5: Atomic Swap Completion**
- **Resolver Action:** Reveals secret to claim source tokens and unlock destination tokens for maker
- **Maker Control:** 100% custody of destination tokens
- **Final State:** Maker receives desired tokens on destination chain

### **Critical Security Insight:**
**Makers never directly interact with escrow contracts.** All escrow interactions (creation, funding, claiming) are handled by resolvers on behalf of makers.

**From the research:**
> "The maker's tokens are locked in an `EscrowSrc` clone on the source chain"

> "Once both escrows are verified by the relayer, the secret is revealed, allowing the resolver to unlock the assets on the destination chain for the maker"

---

## 4. Relayers vs Resolvers: Role Clarification

### **Resolvers (Primary Actors):**
- **Definition:** Professional traders who compete to fill orders
- **Requirements:** Must stake 1INCH tokens and meet minimum Unicorn Power requirements
- **Responsibilities:**
  - Participate in Dutch auctions
  - Execute on-chain transactions
  - Deploy and manage escrow contracts
  - Provide liquidity on destination chain
  - Pay all gas fees

### **Relayers (Infrastructure Layer):**
- **Definition:** Infrastructure components that facilitate order distribution and verification
- **Responsibilities:**
  - Distribute maker intents to resolvers
  - Verify escrow contract deployments
  - Coordinate secret revelation timing
  - Monitor timelock expiration

**Key Distinction:** Relayers are infrastructure/coordination layer, while resolvers are the economic actors who actually execute swaps.

**From the research:**
> "Once both escrows are verified by the relayer, the secret is revealed"

> "Professional traders, known as resolvers, compete to execute swaps at the most favorable rates"

---

## 5. Maker vs Taker Interaction Differences

### **Important Clarification:**
In 1inch Fusion+ context, "takers" and "resolvers" refer to the same entities. The terminology can be confusing:

- **Traditional DEX:** Makers create orders, takers fill them
- **1inch Fusion+:** Makers create intents, resolvers (also called takers) fulfill them

### **Interaction Patterns:**

#### **Makers:**
- **Passive Role:** Create intent, wait for execution
- **No Direct Resolver Interaction:** Never communicate directly with resolvers
- **System Mediated:** All interactions happen through 1inch infrastructure

#### **Resolvers/Takers:**
- **Active Role:** Monitor auctions, compete for orders, execute swaps
- **Direct System Interaction:** Deploy contracts, manage escrows, reveal secrets
- **Economic Responsibility:** Provide capital, pay gas fees, take execution risk

**From the research:**
> "Unlike legacy swaps, in Fusion mode swaps, the actual transaction for exchanging one token into another is done by a resolver"

---

## 6. Security and Recovery Mechanisms

### **Timelock Protection for Makers:**
- If resolver fails to complete swap within timelock period
- Escrow contracts automatically return funds to original owners
- No action required from maker - protection is built into smart contracts

### **Safety Deposits:**
- Resolvers deposit safety tokens in each escrow
- Incentivizes successful completion
- Transferred to recovery resolver if original resolver fails

**From the research:**
> "Timelock protection: if the swap is not completed within the designated time, the resolver cancels the contracts, and the funds are returned to their original owners"

> "In the event of a failed swap, any resolver or any participating entity can cancel the swap and return the assets to their original owners"

---

## 7. Technical Implementation Details

### **Smart Contract Architecture:**
- **EscrowFactory:** Deploys escrow contracts for each swap
- **EscrowSrc:** Holds maker's source tokens with hashlock/timelock
- **EscrowDst:** Holds resolver's destination tokens with same conditions
- **Settlement Contract:** Validates and executes limit orders

### **Atomic Swap Mechanism:**
- Uses hashlock (secret hash) to link both escrows
- Timelock provides automatic refund mechanism
- Secret revelation enables simultaneous token release

**From the research:**
> "For each chain participating in the Atomic Swap mechanism, one copy of the EscrowSrc, EscrowDst and EscrowFactory contracts is deployed"

---

## Summary: Maker's Perspective

1. **Minimal Active Participation:** Makers only sign initial intent and approve tokens
2. **No Resolver Dependency:** Makers don't need their own resolver - the system provides them
3. **Automated Execution:** All on-chain activities handled by winning resolver
4. **Protected Custody:** Smart contracts ensure atomic completion or automatic refund
5. **Gas-Free Experience:** Resolvers pay all gas fees throughout the process

The 1inch Fusion+ system is designed to provide makers with a "set and forget" experience while maintaining security through atomic swap technology and economic incentives for resolvers.

---

## References

- [1inch Fusion+ Official Documentation](https://1inch.io/fusion/)
- [Fusion Resolver Example Repository](https://github.com/1inch/fusion-resolver-example)
- [Cross-Chain Swap Repository](https://github.com/1inch/cross-chain-swap)
- [1inch Fusion+ Technical Blog Posts](https://blog.1inch.io/)
- [Fusion Protocol Settlement Contract](https://github.com/1inch/fusion-protocol)

---

*This document represents current understanding as of July 2025. Technical implementations may evolve.*