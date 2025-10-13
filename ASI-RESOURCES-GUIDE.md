# ASI Alliance Resources Guide - ETH Online 2025

**Project:** SynthX Oracle Agent
**Prize Category:** ASI Alliance ($10,000)
**Last Updated:** 2025-10-13

---

## 📋 Table of Contents

1. [All Official Resources](#all-official-resources)
2. [Priority Reading Order](#priority-reading-order)
3. [Reading Plan (4 Hours)](#reading-plan)
4. [Quick Reference](#quick-reference-for-building)
5. [Resource Priority Matrix](#resource-priority-matrix)

---

## 📚 All Official Resources

### **🔴 CRITICAL RESOURCES (MUST READ)**

#### **1. Hackpack** ⭐⭐⭐ **START HERE**
**URL:** https://fetch.ai/events/hackathons/eth-online-2025/hackpack

**What it contains:**
- Official ETH Online 2025 hackathon guide
- Code examples specifically for this hackathon
- Prize requirements breakdown
- Submission criteria
- Sample projects
- Quick start templates

**Why critical:**
- Tailored for your exact hackathon
- Most up-to-date information
- Includes working examples
- Shows what judges expect

**Time to read:** 30 minutes
**When to read:** **BEFORE ANYTHING ELSE**

**Key takeaways:**
- Prize requirements checklist
- Example agent code
- Submission guidelines
- Demo video requirements

---

#### **2. Agent Creation** ⭐⭐⭐
**URL:** https://innovationlab.fetch.ai/resources/docs/agent-creation

**What it contains:**
- Step-by-step agent creation
- Basic agent structure
- Chat protocol setup
- Message handling
- Event handlers
- Agent lifecycle

**Why critical:**
- Foundation for building any agent
- Chat protocol implementation (REQUIRED for prizes)
- Basic patterns you'll use everywhere

**Time to read:** 1 hour
**When to read:** Before building Oracle Agent

**Key sections to focus on:**
```python
# Basic agent structure
from uagents import Agent, Context, Protocol

agent = Agent(
    name="my_agent",
    port=8000,
    seed="my_seed_phrase",
    mailbox=True  # Required for Agent Verse
)

# Chat protocol
from uagents.models import ChatMessage, ChatAcknowledgement

@protocol.on_message(model=ChatMessage)
async def handle_message(ctx, sender, msg):
    # Your logic here
    pass
```

---

#### **3. Agent to Agent Communication** ⭐⭐⭐
**URL:** https://innovationlab.fetch.ai/resources/docs/agent-communication

**What it contains:**
- Message passing between agents
- Address discovery
- Protocol definitions
- Message models
- Async communication
- Request/response patterns

**Why critical:**
- Essential for multi-agent system
- Shows how Oracle ↔ Risk Monitor communicate
- Demonstrates ASI Alliance capabilities (key for prizes)

**Time to read:** 1 hour
**When to read:** When adding Risk Monitor Agent

**Key patterns:**
```python
# Agent-to-agent messaging
@protocol.on_message(model=PriceUpdate)
async def handle_price_update(ctx, sender, msg):
    # Risk Monitor receives price from Oracle
    risk_score = calculate_risk(msg.price)

    # Send response back
    await ctx.send(sender, RiskAssessment(
        risk_level=risk_score
    ))
```

---

#### **4. Introduction to Agentverse.ai** ⭐⭐
**URL:** https://innovationlab.fetch.ai/resources/docs/agentverse/

**What it contains:**
- Agent Verse marketplace overview
- How to deploy agents
- Mailbox setup
- Manifest publishing
- Agent discovery
- Dashboard features

**Why critical:**
- Where you deploy your agents
- Enables ASI:One discoverability (REQUIRED)
- Mailbox makes agents always available

**Time to read:** 1 hour
**When to read:** Before deploying agents

**Key steps:**
1. Create Agent Verse account
2. Get mailbox key
3. Configure local agent with mailbox
4. Publish manifest
5. Verify on Agent Verse dashboard

---

#### **5. ASI:One Platform** ⭐⭐⭐
**URL:** https://asi1.ai/

**What it is:**
- Agentic LLM interface
- Where users discover agents
- Natural language queries
- Agent search functionality

**Why critical:**
- **THIS IS WHERE JUDGES WILL TEST YOUR AGENT**
- Main demo platform
- Shows discoverability
- User-facing interface

**Time to use:** 30 minutes
**When to use:** During testing phase

**How to test:**
1. Go to https://asi1.ai/
2. Paste your agent address
3. Send test queries
4. Verify responses
5. Test agent search feature

---

### **🟡 HIGH PRIORITY (SHOULD READ)**

#### **6. Agent Remote Communication and Discoverability**
**URL:** https://network.fetch.ai/docs/introduction/almanac/intro

**What it contains:**
- Almanac protocol
- Agent registration
- Discovery mechanisms
- Remote communication
- Address resolution

**Why important:**
- Makes agents searchable
- Understanding discoverability
- Troubleshooting discovery issues

**Time to read:** 30 minutes
**When to read:** If agents aren't discoverable

---

#### **7. Fetch.ai Introduction**
**URL:** https://innovationlab.fetch.ai/resources/docs/intro

**What it contains:**
- Fetch.ai ecosystem overview
- Core concepts
- Platform capabilities
- Use cases

**Why important:**
- General understanding
- Big picture context
- Platform capabilities

**Time to read:** 30 minutes
**When to read:** For background knowledge

---

### **🔵 OPTIONAL (NICE TO HAVE)**

#### **8. Fetch.ai and SingularityNET's MeTTa Integration**
**URL:** https://github.com/fetchai/innovation-lab-examples/tree...

**What it contains:**
- MeTTa + uAgents examples
- Symbolic reasoning integration
- Knowledge graph examples
- Advanced AI patterns

**Why optional:**
- Advanced AI reasoning
- Not required for basic prize
- Adds complexity
- Can win without it

**Time to read:** 2 hours
**When to read:** Only if you want advanced AI

**Note:** You can demonstrate "AI reasoning" with multi-method valuation logic without MeTTa.

---

#### **9. SingularityNET's Metta Knowledge Graph**
**URL:** https://metta-lang.dev/docs/learn/tutorials/python_use/

**What it contains:**
- MeTTa language basics
- Knowledge graph concepts
- Symbolic AI tutorials
- Python integration

**Why optional:**
- Deep MeTTa learning
- Advanced symbolic reasoning
- Not needed for MVP

**Time to read:** 2 hours
**When to use:** Advanced AI implementation

---

#### **10. MCP Integration Example**
**URL:** https://innovationlab.fetch.ai/resources/docs/mcp-integration

**What it contains:**
- Model Context Protocol
- Integration patterns
- Example implementations

**Why optional:**
- Advanced feature
- Not required for hackathon
- Adds complexity

**Time to read:** 1 hour
**When to use:** If needed for specific feature

---

#### **11. Agentverse MCP**
**URL:** https://docs.agentverse.ai/documentation/advanced-usage

**What it contains:**
- Advanced Agent Verse features
- MCP configurations
- Complex deployments

**Why optional:**
- Advanced usage only
- Not needed for basic deployment

**Time to read:** 1 hour
**When to use:** Advanced features needed

---

## 🎯 Priority Reading Order

### **Phase 1: Essential Foundation (3-4 hours)**

**Step 1: Hackpack (30 min)** ⭐⭐⭐
```
✅ URL: https://fetch.ai/events/hackathons/eth-online-2025/hackpack
✅ Action: Read completely
✅ Note: Prize requirements
✅ Download: Example code
✅ Understand: Submission process
```

**Step 2: Agent Creation (1 hour)** ⭐⭐⭐
```
✅ URL: https://innovationlab.fetch.ai/resources/docs/agent-creation
✅ Focus: Basic agent structure
✅ Focus: Chat protocol setup
✅ Focus: Message handling
✅ Practice: Create test agent
```

**Step 3: Agent Communication (1 hour)** ⭐⭐⭐
```
✅ URL: https://innovationlab.fetch.ai/resources/docs/agent-communication
✅ Focus: Message passing
✅ Focus: Protocol definitions
✅ Focus: Async patterns
✅ Practice: Two agents talking
```

**Step 4: Agentverse.ai (1 hour)** ⭐⭐
```
✅ URL: https://innovationlab.fetch.ai/resources/docs/agentverse/
✅ Focus: Deployment process
✅ Focus: Mailbox setup
✅ Focus: Manifest publishing
✅ Action: Deploy test agent
```

---

### **Phase 2: Testing & Validation (30 min)**

**Step 5: ASI:One Testing** ⭐⭐⭐
```
✅ URL: https://asi1.ai/
✅ Action: Create account
✅ Action: Test agent discovery
✅ Action: Send test queries
✅ Verify: Response format
✅ Practice: Demo flow
```

---

### **Phase 3: Troubleshooting (as needed)**

**Step 6: Discovery Issues**
```
✅ URL: Agent Remote Communication docs
✅ When: Agents not discoverable
✅ Check: Almanac registration
✅ Debug: Network issues
```

---

### **Phase 4: Optional (skip for MVP)**

**Step 7: Advanced Features**
```
⏸️  MeTTa integration (only if time permits)
⏸️  MCP features (only if needed)
⏸️  Knowledge graphs (nice to have)
```

---

## 📖 Reading Plan

### **Hour 1: Hackpack Deep Dive**

**URL:** https://fetch.ai/events/hackathons/eth-online-2025/hackpack

**Tasks:**
- [ ] Read overview section
- [ ] Understand prize requirements
- [ ] Review code examples
- [ ] Download example projects
- [ ] Note submission deadlines
- [ ] Check demo requirements

**Key questions to answer:**
- What's required to win $10k?
- What examples exist?
- What's the submission format?
- When is the deadline?

**Output:** Checklist of prize requirements

---

### **Hour 2: Agent Creation Mastery**

**URL:** https://innovationlab.fetch.ai/resources/docs/agent-creation

**Tasks:**
- [ ] Read basic agent structure
- [ ] Study chat protocol section
- [ ] Understand message models
- [ ] Learn event handlers
- [ ] Review lifecycle methods
- [ ] Practice: Create test agent

**Key questions to answer:**
- How do I create an agent?
- How do I handle messages?
- What's the chat protocol?
- How do I publish a manifest?

**Code to write:**
```python
# Create simple test agent
from uagents import Agent, Context

agent = Agent(name="test", port=8000)

@agent.on_event("startup")
async def startup(ctx):
    print(f"Agent address: {agent.address}")

agent.run()
```

**Output:** Working test agent

---

### **Hour 3: Agent Communication Deep Dive**

**URL:** https://innovationlab.fetch.ai/resources/docs/agent-communication

**Tasks:**
- [ ] Read message passing basics
- [ ] Study protocol definitions
- [ ] Understand async patterns
- [ ] Learn address discovery
- [ ] Review request/response
- [ ] Practice: Two-agent system

**Key questions to answer:**
- How do agents find each other?
- How do they send messages?
- What are message models?
- How do I handle responses?

**Code to write:**
```python
# Agent A sends to Agent B
@protocol.on_message(model=Request)
async def handle_request(ctx, sender, msg):
    response = process(msg)
    await ctx.send(sender, Response(data=response))
```

**Output:** Two agents communicating

---

### **Hour 4: Deployment & Publishing**

**URL:** https://innovationlab.fetch.ai/resources/docs/agentverse/

**Tasks:**
- [ ] Create Agent Verse account
- [ ] Get mailbox credentials
- [ ] Configure local agent
- [ ] Deploy test agent
- [ ] Verify on dashboard
- [ ] Test discoverability

**Key questions to answer:**
- How do I deploy agents?
- What's a mailbox?
- How do I publish manifest?
- How do users find my agent?

**Steps to complete:**
1. Sign up at agentverse.ai
2. Create mailbox
3. Add mailbox key to agent
4. Deploy and verify

**Output:** Deployed, discoverable agent

---

## 🔍 Quick Reference for Building

### **When Building Oracle Agent**

**References:**
- Agent Creation docs (basic structure)
- Chat protocol section (message handling)
- Hackpack examples (code templates)

**Key code patterns:**
```python
from uagents import Agent, Protocol
from uagents.models import ChatMessage, ChatAcknowledgement

agent = Agent(
    name="oracle_agent",
    port=8002,
    mailbox=True
)

chat_protocol = Protocol(name="chat_protocol")

@chat_protocol.on_message(model=ChatMessage)
async def handle_chat(ctx, sender, msg):
    # Process query
    response = calculate_valuation(msg.content)

    # Send response
    await ctx.send(sender, ChatMessage(
        content=[TextContent(text=response)]
    ))

agent.include(chat_protocol, publish_manifest=True)
```

---

### **When Building Risk Monitor Agent**

**References:**
- Agent Communication docs (messaging)
- Protocol definitions (message models)
- Multi-agent patterns

**Key code patterns:**
```python
# Define message models
class PriceUpdate(Model):
    asset: str
    price: float
    timestamp: str

class RiskAssessment(Model):
    risk_level: str
    volatility: float

# Risk Monitor receives from Oracle
@protocol.on_message(model=PriceUpdate)
async def handle_price(ctx, sender, msg):
    risk = calculate_risk(msg.price)

    await ctx.send(sender, RiskAssessment(
        risk_level=risk.level,
        volatility=risk.volatility
    ))
```

---

### **When Deploying Agents**

**References:**
- Agentverse.ai docs (deployment)
- Mailbox setup (connectivity)
- Manifest publishing (discovery)

**Deployment checklist:**
- [ ] Agent Verse account created
- [ ] Mailbox key obtained
- [ ] Agent configured with mailbox
- [ ] Manifest set to publish
- [ ] Agent running locally
- [ ] Verified on Agent Verse dashboard
- [ ] Tested on ASI:One

---

### **When Testing on ASI:One**

**References:**
- ASI:One platform (https://asi1.ai/)
- Chat protocol (message format)
- Discovery testing

**Testing checklist:**
- [ ] Agent address ready
- [ ] ASI:One account created
- [ ] Direct address test (paste address)
- [ ] Agent search test (keyword search)
- [ ] Multiple queries tested
- [ ] Response format verified
- [ ] Screenshot for demo

---

## 📊 Resource Priority Matrix

| # | Resource | Priority | Time | Phase | Use Case |
|---|----------|----------|------|-------|----------|
| 1 | **Hackpack** | 🔴 CRITICAL | 30m | Start | Overview & examples |
| 2 | **Agent Creation** | 🔴 CRITICAL | 1h | Build | Create agents |
| 3 | **Agent Communication** | 🔴 CRITICAL | 1h | Build | Multi-agent |
| 4 | **Agentverse.ai** | 🔴 CRITICAL | 1h | Deploy | Host agents |
| 5 | **ASI:One** | 🔴 CRITICAL | 30m | Test | Demo & testing |
| 6 | **Remote Communication** | 🟡 HIGH | 30m | Debug | Discovery issues |
| 7 | **Fetch.ai Intro** | 🟡 MEDIUM | 30m | Context | Background |
| 8 | **MeTTa Integration** | 🔵 OPTIONAL | 2h | Advanced | AI reasoning |
| 9 | **Metta Knowledge Graph** | 🔵 OPTIONAL | 2h | Advanced | Symbolic AI |
| 10 | **MCP Integration** | 🔵 OPTIONAL | 1h | Advanced | Protocol |
| 11 | **Agentverse MCP** | 🟢 LOW | 1h | Advanced | Features |

---

## ⚡ Speed Reading Strategy

### **If you have 2 hours:**
```
✅ Hackpack (30m) - Get examples
✅ Agent Creation (1h) - Learn basics
✅ ASI:One (30m) - Test immediately
→ Start building from examples
```

### **If you have 4 hours (RECOMMENDED):**
```
✅ Hackpack (30m)
✅ Agent Creation (1h)
✅ Agent Communication (1h)
✅ Agentverse.ai (1h)
✅ ASI:One testing (30m)
→ Fully prepared to build
```

### **If you have 8 hours:**
```
✅ All critical resources (4h)
✅ High priority resources (1h)
✅ Build test project (3h)
→ Expert level understanding
```

---

## 🎯 Learning Outcomes

### **After Phase 1 (Foundation):**
- [ ] Can create basic agent
- [ ] Understand chat protocol
- [ ] Know how to handle messages
- [ ] Can make agents communicate
- [ ] Can deploy to Agent Verse

### **After Phase 2 (Testing):**
- [ ] Can test on ASI:One
- [ ] Agent is discoverable
- [ ] Know how to debug issues
- [ ] Can demo effectively

### **After Phase 3 (Optional):**
- [ ] Advanced AI reasoning (if pursued)
- [ ] MCP integration (if needed)
- [ ] Complex multi-agent patterns

---

## 📝 Notes & Tips

### **Reading Strategy**

**Do:**
- ✅ Start with Hackpack
- ✅ Read code examples carefully
- ✅ Practice as you read
- ✅ Take notes on patterns
- ✅ Bookmark important sections

**Don't:**
- ❌ Skip the Hackpack
- ❌ Read linearly without practicing
- ❌ Try to memorize everything
- ❌ Get stuck on advanced topics
- ❌ Spend time on optional features (for MVP)

---

### **Common Questions**

**Q: Do I need to read everything?**
A: No! Focus on Critical resources (1-5). Skip Optional (8-11) for MVP.

**Q: How long will reading take?**
A: 4 hours for critical resources, enough to build.

**Q: What if I'm stuck?**
A: Check Hackpack examples first, then specific doc sections.

**Q: Do I need MeTTa?**
A: No! You can win without it. Multi-method valuation counts as "AI reasoning."

**Q: Where do I test?**
A: ASI:One (https://asi1.ai/) - this is what judges use.

---

## 🏆 Success Checklist

**Before building:**
- [ ] Read Hackpack
- [ ] Read Agent Creation
- [ ] Read Agent Communication
- [ ] Read Agentverse.ai docs
- [ ] Have ASI:One account

**During building:**
- [ ] Reference docs as needed
- [ ] Test incrementally
- [ ] Use Hackpack examples
- [ ] Ask for help if stuck

**Before submitting:**
- [ ] Tested on ASI:One
- [ ] Agent discoverable
- [ ] Demo video prepared
- [ ] All addresses documented

---

## 📞 Support Resources

**If you need help:**
- Fetch.ai Discord
- SingularityNET Discord
- GitHub Issues (tag with "hackathon")
- Innovation Lab documentation

**Quick links:**
- Hackpack: https://fetch.ai/events/hackathons/eth-online-2025/hackpack
- Agent Verse: https://agentverse.ai
- ASI:One: https://asi1.ai
- Innovation Lab: https://innovationlab.fetch.ai

---

## 🎯 Bottom Line

**MUST READ (4 hours):**
1. Hackpack ⭐⭐⭐ (30m)
2. Agent Creation ⭐⭐⭐ (1h)
3. Agent Communication ⭐⭐⭐ (1h)
4. Agentverse.ai ⭐⭐ (1h)
5. ASI:One testing ⭐⭐⭐ (30m)

**CAN SKIP:**
- MeTTa integration (unless you want it)
- MCP features (advanced)
- Knowledge graphs (nice to have)

**START HERE:**
👉 **Hackpack: https://fetch.ai/events/hackathons/eth-online-2025/hackpack**

**TEST HERE:**
👉 **ASI:One: https://asi1.ai/**

---

**Everything you need is in the Hackpack! Read it first, then build! 🚀**

---

**Last Updated:** 2025-10-13
**Status:** Complete Resource Guide
**Ready to Learn:** Yes ✅
