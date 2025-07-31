# Thunder Portal 3-Day Hackathon MVP Checklist

## 🎯 Day 1: Core Infrastructure (8-10 hours)

### Morning (4-5 hours)
- [ ] Fork 1inch Fusion+ and understand codebase (1h)
- [ ] Set up local dev environment with Tenderly fork + Bitcoin regtest (1h)
- [ ] Extend Fusion+ order structure for Bitcoin addresses (2h)
- [ ] Quick test of modified order validation (30m)

### Afternoon (4-5 hours)
- [ ] Deploy basic EscrowFactory contract on Tenderly fork (1h)
- [ ] Test escrow creation and basic flow (1h)
- [ ] Connect Rust HTLC service to Bitcoin regtest (2h)
- [ ] Test HTLC creation and transaction broadcasting (1h)

## 🚀 Day 2: Integration & Basic UI (8-10 hours)

### Morning (4-5 hours)
- [ ] Create minimal resolver service in TypeScript (2h)
- [ ] Implement basic order monitoring (1h)
- [ ] Wire up HTLC service with resolver (1h)
- [ ] Test end-to-end swap flow locally (1h)

### Afternoon (4-5 hours)
- [ ] Fork 1inch UI and strip to essentials (1h)
- [ ] Add Bitcoin wallet connection (MetaMask for ETH, basic input for BTC) (1h)
- [ ] Create swap interface with BTC/ETH pair only (30m)
- [ ] **Mock order chunking visualization** (1h)
  - [ ] Show order split into 100 chunks animation
  - [ ] Display resolver matching process
  - [ ] Visualize partial fulfillment progress bar
- [ ] **Mock full swap process flow** (1.5h)
  - [ ] Step 1: Order creation and chunking animation
  - [ ] Step 2: Resolver discovery and matching
  - [ ] Step 3: HTLC creation on both chains
  - [ ] Step 4: Atomic execution visualization
  - [ ] Step 5: Success confirmation

## 🏁 Day 3: Demo & Presentation (8-10 hours)

### Morning (4-5 hours)
- [ ] Fix critical bugs from Day 2 testing (2h)
- [ ] Create scripted demo flow (1h)
- [ ] Record demo video as backup (30m)
- [ ] Polish UI for demo (remove rough edges) (1.5h)

### Afternoon (4-5 hours)
- [ ] Create pitch deck (max 10 slides) (2h)
- [ ] Prepare live demo script (1h)
- [ ] Practice presentation (1h)
- [ ] Final bug fixes and submission prep (1h)

## 🎯 MVP Features Only

### What We WILL Build
- ✅ Basic Bitcoin-Ethereum atomic swap
- ✅ Simple HTLC generation and execution
- ✅ **UI with full process visualization (mocked)**
  - ✅ Order chunking animation
  - ✅ Resolver matching visualization
  - ✅ Step-by-step swap process
  - ✅ Progress tracking for each phase
- ✅ Local testnet demonstration
- ✅ Basic resolver that auto-executes swaps

### What We WON'T Build (Post-Hackathon)
- ❌ Real order chunking system (backend - just mock in UI)
- ❌ Multiple resolver support
- ❌ Gas optimization
- ❌ Production security features
- ❌ Comprehensive error handling
- ❌ Performance optimization
- ❌ Multiple trading pairs
- ❌ Advanced UI features

## 🔧 Technical Shortcuts for MVP

### Smart Contracts
- Use simple escrow (no proxy pattern)
- Hardcode timeout values (BTC: 2h, ETH: 1h)
- Skip gas optimization
- Minimal events/logging

### Backend
- In-memory order storage (no complex DB)
- Single resolver instance
- Basic error handling only
- No authentication/rate limiting

### Frontend
- Fork 1inch but use only swap component
- Hardcode BTC/ETH pair
- Basic wallet connection
- **Rich animations for demo impact:**
  - Order splitting into chunks
  - Resolver bidding/matching
  - HTLC creation on both chains
  - Atomic execution with locks
  - Success celebration

## 📊 Success Metrics for Judges

### What Judges Care About
1. **Innovation**: First trustless BTC-ETH atomic swaps using Fusion+
2. **Technical Achievement**: Working demo with real atomic swap
3. **Market Potential**: Unlocking Bitcoin's $1.3T liquidity
4. **User Experience**: Simple, clean demo flow
5. **Code Quality**: Focus on core logic being clean

### Demo Flow (5 minutes)
1. **Problem** (30s): Bitcoin locked out of DeFi
2. **Solution** (30s): Thunder Portal bridges without bridges
3. **How it Works** (1m): Show chunking & atomic swap visualization
4. **Live Demo** (2.5m): Execute a swap with full UI flow
   - Show order being split into 100 chunks
   - Visualize resolver matching chunks
   - Display HTLC creation on both chains
   - Show atomic execution completing
5. **Impact** (30s): What this enables

## 🚨 Critical Path Items

### Must Have for Demo
- [ ] One successful BTC→ETH swap
- [ ] **Clean UI with process visualization**
  - [ ] Order chunking animation (even if mocked)
  - [ ] Resolver matching visualization
  - [ ] Step-by-step progress indicators
- [ ] HTLC visible on both chains
- [ ] Atomic execution (both succeed or both fail)

### Nice to Have (If Time)
- [ ] ETH→BTC swap direction
- [ ] Multiple test swaps
- [ ] Error case demonstration
- [ ] Performance metrics

## 🛠️ Tools & Resources

### Quick Setup Commands
```bash
# Start local environment
docker-compose up -d

# Deploy contracts to Tenderly fork
npm run deploy:tenderly

# Start Rust HTLC service
cd backend && cargo run

# Start resolver
cd resolver && npm run dev

# Start UI
cd ui && npm run dev
```

### Testing Shortcuts
- Use hardcoded test wallets
- Pre-fund addresses with test assets
- Skip comprehensive testing
- Focus on happy path only

## 📝 Presentation Tips

### Pitch Structure
1. **Hook**: "What if you could swap Bitcoin for any token without bridges?"
2. **Problem**: Show locked Bitcoin liquidity
3. **Solution**: Thunder Portal concept
4. **Demo**: Show it working
5. **Vision**: Future of cross-chain DeFi

### Key Points to Emphasize
- No custody risk (atomic swaps)
- No new tokens or bridges
- Built on proven tech (1inch Fusion+)
- **Order chunking for better liquidity** (show in UI)
- **Professional resolver network** (visualize matching)
- Massive market opportunity
- Working MVP in 3 days

## 🎯 Final Checklist Before Submission

### 2 Hours Before Deadline
- [ ] Demo video recorded
- [ ] Code pushed to GitHub
- [ ] README with setup instructions
- [ ] Devpost submission drafted
- [ ] Team roles documented

### 1 Hour Before Deadline
- [ ] Final demo test
- [ ] Backup demo ready
- [ ] Presentation uploaded
- [ ] All links working
- [ ] Submission complete

## 💡 Remember

**Focus on the MVP that demos well:**
- It doesn't need to be production-ready
- It needs to clearly show the innovation
- Code quality matters only for core logic
- UI needs to be clean, not complete
- The story matters as much as the code

**Time Boxing is Critical:**
- If something takes >2 hours, find a shortcut
- Skip nice-to-haves ruthlessly
- Always have a working demo
- Better to show 1 thing working perfectly than 5 things broken

---

**Hackathon Strategy**: Build the minimum that proves the concept works
**Not**: Build a production-ready system
**Success**: Judges understand and believe in Thunder Portal's potential