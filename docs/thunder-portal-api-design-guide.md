# Thunder Portal API Design Guide

## Overview

This document explains the design decisions and patterns used in the Thunder Portal Bitcoin HTLC Service API, with a focus on integration with 1inch Fusion+ resolvers.

## API Design Principles

### 1. RESTful Architecture
- **Resource-Oriented URLs**: All endpoints represent resources (swaps, HTLCs, quotes) rather than actions
- **Proper HTTP Methods**: POST for creation, GET for retrieval, DELETE for removal
- **Stateless Operations**: Each request contains all information needed for processing

### 2. Clean Separation of Swap Types
The API clearly separates three atomic swap types:
- **Submarine Swaps** (`/swaps/submarine`): On-chain → Lightning
- **Reverse Swaps** (`/swaps/reverse`): Lightning → On-chain  
- **Chain Swaps** (`/swaps/chain`): Chain → Chain (e.g., Bitcoin → Liquid)

### 3. Asynchronous Operation Support
Given the nature of blockchain operations:
- **Webhook Subscriptions**: Real-time updates for swap status changes
- **Status Polling**: Traditional REST endpoints for status checking
- **Event-Driven Architecture**: Fine-grained events for each state transition

## Key Design Patterns

### 1. Two-Phase Commit Pattern
```
1. Quote Phase: Get pricing and validate feasibility
2. Execution Phase: Create and execute the swap
```

This pattern allows Fusion+ resolvers to:
- Pre-validate swaps before committing
- Lock in rates with quote IDs
- Optimize routing decisions

### 2. HTLC Lifecycle Management
The API provides explicit states for the complete HTLC lifecycle:
```
created → waiting_for_deposit → deposit_confirmed → htlc_created 
→ invoice_pending → invoice_paid → claim_pending → claimed
```

Alternative paths:
```
→ refund_pending → refunded (timeout case)
→ expired → failed (error case)
```

### 3. Cooperative vs Unilateral Settlement
The API supports both settlement methods:
- **Cooperative Close** (`/htlc/{htlcId}/cooperative-close`): Using MuSig2 for efficiency
- **Unilateral Claim** (`/htlc/{htlcId}/claim`): Traditional preimage reveal

## Fusion+ Integration Considerations

### 1. Metadata Support
All swap creation endpoints include an optional `metadata` field:
```yaml
metadata:
  type: object
  description: Optional metadata for Fusion+ integration
  additionalProperties: true
```

This allows Fusion+ resolvers to:
- Track order correlations
- Store routing information
- Maintain audit trails

### 2. Atomic Operations
The API ensures atomicity through:
- **Preimage Hash Commitment**: All swaps require upfront hash commitment
- **Timeout Protection**: Explicit block height timeouts
- **Refund Mechanisms**: Guaranteed fund recovery paths

### 3. Fee Transparency
Multiple fee types are clearly exposed:
- **Miner Fees**: On-chain transaction costs
- **Service Fees**: Platform charges
- **Total Costs**: All-inclusive amounts for user clarity

## Security Considerations

### 1. Authentication
- **API Key Authentication**: Via `X-API-Key` header
- **Webhook Security**: HMAC-SHA256 signatures for webhook payloads
- **Public Endpoint**: Only health check is public

### 2. Cryptographic Requirements
- **Public Key Validation**: Regex patterns ensure correct format
- **Preimage Security**: 32-byte preimages (256-bit security)
- **Signature Verification**: For refunds and cooperative closes

### 3. Transaction Safety
- **Confirmation Requirements**: Configurable based on amount
- **Rate Limiting**: Implicit through API key management
- **Idempotency**: Quote IDs prevent duplicate swaps

## Bitcoin-Specific Design Elements

### 1. UTXO Management
The API abstracts UTXO complexity while providing:
- **Fee Rate Control**: Optional `feeRate` parameters
- **Address Generation**: BIP21 URIs for user convenience
- **Script Transparency**: Exposed redeem scripts for verification

### 2. Network Support
- **Multi-Network**: Mainnet, testnet, and regtest support
- **Cross-Chain**: Bitcoin, Liquid, and Lightning Network
- **Network Status**: Health endpoint exposes network state

### 3. Block Height References
All timeouts use block heights rather than timestamps:
- **Deterministic**: No timezone or clock sync issues
- **Bitcoin-Native**: Aligns with blockchain consensus
- **Verifiable**: Can be checked on-chain

## Error Handling

### 1. Structured Error Responses
```json
{
  "code": "INVALID_INVOICE",
  "message": "The provided Lightning invoice is invalid or expired",
  "details": {
    "invoice": "lnbc1...",
    "expiryTime": "2024-01-15T10:00:00Z"
  }
}
```

### 2. Business Logic Errors
- **402 Payment Required**: Insufficient liquidity
- **409 Conflict**: State conflicts (e.g., already claimed)
- **503 Service Unavailable**: Temporary issues

## Webhook Design

### 1. Event Granularity
Fine-grained events allow selective subscriptions:
- `swap.created`
- `swap.deposit.confirmed`
- `swap.htlc.created`
- `swap.claimed`
- etc.

### 2. Reliability Patterns
- **Idempotent Processing**: Same event can be received multiple times
- **Signature Verification**: HMAC prevents tampering
- **Retry Logic**: Implicit in webhook delivery

## Performance Optimizations

### 1. Efficient Queries
- **Direct Resource Access**: `/swaps/{swapId}` for single lookups
- **Filtered Responses**: Only relevant data returned
- **Pagination Ready**: Structure supports future pagination

### 2. Caching Opportunities
- **Quote Caching**: Quotes valid for defined periods
- **Static Data**: Trading pairs cached client-side
- **Health Status**: Can be cached briefly

## Future Extensibility

### 1. Version Path
- **URL Versioning**: `/v1/` prefix for future versions
- **Backward Compatibility**: New fields are optional

### 2. Additional Features
The design accommodates future additions:
- Batch operations
- Advanced routing preferences  
- Multi-hop swaps
- Privacy features (coinjoins, payjoins)

## Integration Checklist

For Fusion+ resolver integration:

1. **Authentication Setup**
   - [ ] Obtain API key
   - [ ] Configure secure storage

2. **Webhook Configuration**
   - [ ] Set up webhook endpoint
   - [ ] Implement signature verification
   - [ ] Handle all relevant events

3. **Error Handling**
   - [ ] Implement retry logic
   - [ ] Handle all error codes
   - [ ] Log for debugging

4. **Testing**
   - [ ] Test on testnet first
   - [ ] Verify timeout scenarios
   - [ ] Test refund paths

5. **Monitoring**
   - [ ] Track swap success rates
   - [ ] Monitor API latency
   - [ ] Alert on failures

## Conclusion

The Thunder Portal API provides a clean, RESTful interface for Bitcoin atomic swaps that aligns well with modern API design principles while respecting Bitcoin-specific requirements. The design prioritizes:

- **Developer Experience**: Clear endpoints and comprehensive documentation
- **Reliability**: Explicit state management and error handling
- **Security**: Cryptographic verification at every step
- **Integration**: Seamless fit with Fusion+ architecture

This foundation enables efficient cross-chain swaps while maintaining the security guarantees of atomic swap protocols.