# ASI Alliance Workshop Notes - Building AI Agents
**Speaker:** Kshipra Dhame (Fetch.ai Devrel Team)
**Source:** How to build with ASI tech stack Workshop

---

## Table of Contents

1. [ASI Alliance Overview](#asi-alliance-overview)
2. [What Are AI Agents](#what-are-ai-agents)
3. [Fetch.ai Tech Stack](#fetchai-tech-stack)
4. [Building Your First Agent](#building-your-first-agent)
5. [Agent Communication](#agent-communication)
6. [Chat Protocol (CRITICAL FOR HACKATHON)](#chat-protocol)
7. [Agent Deployment Options](#agent-deployment-options)
8. [SingularityNET MeTTa Integration](#singularitynet-metta-integration)
9. [Important Resources](#important-resources)
10. [Hackathon Tips](#hackathon-tips)

---

## ASI Alliance Overview

### What is ASI Alliance?

**Goal:** Decentralize the entire AI ecosystem

**Partners:**
- Fetch.ai
- SingularityNET
- Ocean Protocol
- Cudos

**For Hackathon:** Primarily use Fetch.ai + SingularityNET tech stack

---

## What Are AI Agents?

### Definition
AI agents are pieces of code that can:
- Understand goals
- Make decisions
- Take actions on behalf of users

### Examples
1. **Flight Booking Agent**
   - User: "Please book me the cheapest flight from London to SF on [date]"
   - Agent: Searches flights → Decides cheapest → Books flight

2. **Simple API Agent**
   - Makes API calls to get information

3. **Complex ML Agent**
   - Runs machine learning models
   - Performs predictive analysis

---

## Fetch.ai Tech Stack

### Core Components

#### 1. **uAgents**
- Lightweight Python package
- Build and deploy agents
- Simple agent creation

#### 2. **Agent Verse** (agentverse.ai)
- Marketplace for AI agents
- Every uAgent automatically registered
- Public discovery platform
- 2.68 million+ agents listed

#### 3. **ASI:One** (asi1.ai)
- First Agentic LLM by Fetch.ai
- Can perform standard LLM tasks (web search, image creation)
- **KEY FEATURE:** Can connect with ANY agent on Agent Verse to get tasks done

### How ASI:One Works with Agents

```
User Query → ASI:One
    ↓
ASI:One searches Agent Verse for best agent
    ↓
Sends query to specialized agent
    ↓
Agent executes task
    ↓
Returns response to ASI:One
    ↓
User receives result
```

**Example:**
- User: "Create an anime character with [description]"
- ASI:One finds anime generation agent on Agent Verse
- Agent generates image
- User receives anime character

---

## Building Your First Agent

### Step 1: Go to agentverse.ai
1. Log in with Google account
2. Click "Launch an Agent"
3. Select "Create a hosted agent"
4. Choose template (or blank agent)

### Step 2: Basic Agent Code

```python
from uagents import Agent, Context

# Initialize agent
agent = Agent(
    name="my_first_agent",
    seed="unique_seed_phrase"
)

# On startup handler
@agent.on_event("startup")
async def startup(ctx: Context):
    print("Hello, I'm an agent!")
    print(f"My address is {ctx.agent.address}")

# Start agent
if __name__ == "__main__":
    agent.run()
```

### Agent Address
- Every agent has unique address
- **CRITICAL:** Needed for agent-to-agent communication
- Think of it like a postal address for sending messages
- Find in Overview section of Agent Verse

---

## Agent Communication

### Two Agents Communicating (Alice → Bob)

#### Alice's Code (Sender)
```python
from uagents import Agent, Context, Model

# Define message data model
class Request(Model):
    message: str

# Initialize Alice
alice = Agent(name="alice", seed="alice_seed")

@alice.on_event("startup")
async def send_message(ctx: Context):
    print("Just about to send a message to Bob")

    # Send message to Bob
    await ctx.send(
        "BOB_ADDRESS_HERE",  # Bob's address
        Request(message="Hello there Bob")
    )

# Handler to receive Bob's response
@alice.on_message(model=Request)
async def handle_response(ctx: Context, sender: str, msg: Request):
    print(f"Received message from {sender}: {msg.message}")
```

#### Bob's Code (Receiver)
```python
from uagents import Agent, Context, Model

# Same data model as Alice
class Request(Model):
    message: str

# Initialize Bob
bob = Agent(name="bob", seed="bob_seed")

# Message handler
@bob.on_message(model=Request)
async def handle_message(ctx: Context, sender: str, msg: Request):
    print(f"Received message from {sender}: {msg.message}")

    # Check if sender is Alice
    if sender == "ALICE_ADDRESS_HERE":
        await ctx.send(sender, Request(message="Hello there Alice"))
    else:
        await ctx.send(sender, Request(message="Hello there friend"))
```

### Key Points for Communication
1. **Data Models:** Both agents need same Pydantic model definition
2. **`on_message` Handler:** Required to receive messages
3. **`ctx.send()`:** Used to send messages
4. **Agent Address:** Must have recipient's address

---

## Chat Protocol (CRITICAL FOR HACKATHON)

### ⚠️ MANDATORY FOR PRIZES
**ALL agents MUST have chat protocol enabled to be eligible for hackathon prizes**

### What is Chat Protocol?

Chat protocol allows agents to:
- Receive queries from ASI:One
- Send responses back to ASI:One
- Be discoverable by users

### How Chat Protocol Works

```
User Query in ASI:One
    ↓
"What's the weather like in London?"
    ↓
ASI:One finds Weather Agent
    ↓
Sends as ChatMessage to Weather Agent
    ↓
Agent receives message via on_message(ChatMessage)
    ↓
Agent processes query
    ↓
Agent sends back ChatMessage response
    ↓
ASI:One displays to user
```

### Chat Protocol Messages

1. **ChatMessage**: User query or agent response
2. **ChatAcknowledgement**: Confirms message received
3. **TextContent**: Text response
4. **ResourceContent**: Image/video/audio response
5. **SessionContent**: End session message

### Complete Chat Protocol Agent Example

```python
from uagents import Agent, Context, Protocol
from uagents.core import ChatMessage, ChatAcknowledgement, TextContent, SessionContent
import openai
import time

# Initialize agent
agent = Agent(
    name="bird_expert",
    seed="bird_expert_seed",
    mailbox=True  # Enable mailbox for discoverability
)

# ASI:One API configuration
openai.api_base = "https://api.asi1.ai/v1"
openai.api_key = "YOUR_ASI1_API_KEY"  # Get from asi1.ai

# Initialize chat protocol
chat_protocol = Protocol(name="chat_protocol")

# Handler 1: Receive ChatMessage
@chat_protocol.on_message(model=ChatMessage)
async def handle_chat_message(ctx: Context, sender: str, msg: ChatMessage):
    # Send acknowledgement
    await ctx.send(
        sender,
        ChatAcknowledgement(
            timestamp=int(time.time()),
            message_id=msg.message_id
        )
    )

    # Extract text from message
    user_query = msg.content[0].text

    # Call ASI:One LLM
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {
                "role": "system",
                "content": "You are a subject matter expert about birds. Answer only bird-related questions."
            },
            {
                "role": "user",
                "content": user_query
            }
        ]
    )

    llm_response = response.choices[0].message.content

    # Send response back as ChatMessage
    await ctx.send(
        sender,
        ChatMessage(
            timestamp=int(time.time()),
            message_id=f"msg_{int(time.time())}",
            content=[
                TextContent(type="text", text=llm_response)
            ]
        )
    )

    # End session
    await ctx.send(
        sender,
        ChatMessage(
            timestamp=int(time.time()),
            message_id=f"end_{int(time.time())}",
            content=[
                SessionContent(type="end_session")
            ]
        )
    )

# Handler 2: Receive ChatAcknowledgement
@chat_protocol.on_message(model=ChatAcknowledgement)
async def handle_acknowledgement(ctx: Context, sender: str, msg: ChatAcknowledgement):
    # Just continue (could log or store)
    pass

# Include protocol and publish manifest
agent.include(chat_protocol, publish_manifest=True)

if __name__ == "__main__":
    agent.run()
```

### Sending Different Content Types

**Text Response:**
```python
TextContent(type="text", text="Your response here")
```

**Image Response:**
```python
ResourceContent(
    type="image/png",
    url="https://example.com/image.png"
)
```

**Video Response:**
```python
ResourceContent(
    type="video/mp4",
    url="https://example.com/video.mp4"
)
```

**Audio Response:**
```python
ResourceContent(
    type="audio/mpeg",
    url="https://example.com/audio.mp3"
)
```

### Getting ASI:One API Key

1. Go to asi1.ai
2. Log in with Google account
3. Create new API key
4. Copy and use in your agent

---

## Agent Deployment Options

### Option 1: Hosted Agent ⭐ RECOMMENDED

**When to Use:**
- Agent uses packages supported by Agent Verse
- Don't want to manage infrastructure
- Want 24/7 uptime automatically

**How:**
1. Create agent on agentverse.ai
2. Write code in web editor
3. Click "Start Agent"
4. Agent runs automatically 24/7

**Pros:**
- No infrastructure management
- Always running
- Easy deployment

**Cons:**
- Limited to supported Python packages

**Supported Packages:** Check Agent Verse documentation for current list

---

### Option 2: Local Agent

**When to Use:**
- Need packages NOT supported by Agent Verse
- Want full control
- Testing locally

**Code:**
```python
from uagents import Agent

agent = Agent(
    name="my_local_agent",
    port=8000,  # Port to listen on
    seed="unique_seed_phrase",  # Generates unique address
    endpoint=["http://localhost:8000/submit"]  # Where agent listens
)

# ... rest of agent code

if __name__ == "__main__":
    agent.run()
```

**Run:**
```bash
python agent.py
```

**Pros:**
- Use any Python package
- Full control

**Cons:**
- NOT connected to Agent Verse
- NOT discoverable via ASI:One
- Must manage infrastructure yourself

---

### Option 3: Mailbox Agent ⭐ BEST FOR HACKATHON

**When to Use:**
- Need unsupported packages BUT want Agent Verse integration
- Want discoverability via ASI:One
- Have chat protocol enabled

**Code:**
```python
from uagents import Agent

agent = Agent(
    name="my_mailbox_agent",
    port=8000,
    seed="unique_seed_phrase",
    mailbox=True  # 🔑 KEY: Enables Agent Verse connection
)

# ... rest of agent code (with chat protocol)

if __name__ == "__main__":
    agent.run()
```

**Setup Steps:**
1. Run agent locally: `python agent.py`
2. Copy "Agent Inspector Link" from logs
3. Open link in Google Chrome
4. Click "Connect" → Select "Mailbox" → "Got it"
5. Agent now connected to Agent Verse!

**Result:**
- Local agent with any packages
- Connected to Agent Verse
- Discoverable via ASI:One (if chat protocol enabled)

**⭐ This is likely what you'll use most for hackathon**

---

### Option 4: Langchain/CrewAI Adapter

**When to Use:**
- Already built agent with Langchain or CrewAI
- Want to connect to Agent Verse

**Code:**
```python
# Your existing Langchain agent
from langchain import ...

# Add uAgents adapter (literally one line)
from uagents_adapter import LangchainAdapter

langchain_agent = # ... your langchain agent

# Convert to uAgent
uagent = LangchainAdapter(langchain_agent)
uagent.run()
```

**Resources:**
- GitHub: `github.com/fetchai/uagents-adapter`
- Examples for Langchain, CrewAI, MCP servers

---

## SingularityNET MeTTa Integration

### What is MeTTa?

**MeTTa = Multi-paradigm Language for Knowledge Graphs**

- Declarative and functional computations
- Structured knowledge representation
- Symbolic reasoning
- Pattern matching and unification

**Think of it as:** Knowledge Graph (KG) for your agent

### Why Use MeTTa?

Make your agents smarter by:
- Adding structured knowledge
- Enabling reasoning over knowledge
- Remembering information
- Querying complex relationships

### MeTTa + Fetch.ai Integration Example

**Use Case:** Medical RAG Agent

#### Step 1: Define Knowledge Base (`knowledge.py`)

```python
# Atoms = pieces of information in knowledge graph

# Symptom → Disease mappings
(symptom fever flu)
(symptom cough flu)
(symptom headache migraine)
(symptom fatigue depression)

# Disease → Treatment mappings
(treatment flu rest)
(treatment flu fluids)
(treatment flu antiviral-drugs)
(treatment migraine painkillers)
(treatment depression anti-depressants)

# Treatment → Side Effects
(side-effect antiviral-drugs nausea)
(side-effect painkillers drowsiness)
(side-effect anti-depressants insomnia)

# FAQs
(faq "How long does flu last?" "7-10 days with rest")
(faq "When to see a doctor?" "If fever >103F or symptoms worsen")
```

#### Step 2: Query Functions (`medical_rag.py`)

```python
from hyperon import MeTTa

metta = MeTTa()
metta.load("knowledge.py")  # Load knowledge base

def query_symptoms(symptom: str):
    """
    Given symptom, find possible diseases
    """
    query = f"(symptom {symptom} $disease)"
    results = metta.run(query)

    # Extract unique diseases
    diseases = set()
    for result in results:
        diseases.add(result[0])

    return list(diseases)

def query_treatment(disease: str):
    """
    Given disease, find treatments
    """
    query = f"(treatment {disease} $treatment)"
    results = metta.run(query)

    treatments = []
    for result in results:
        treatments.append(result[0])

    return treatments

def query_side_effects(treatment: str):
    """
    Given treatment, find side effects
    """
    query = f"(side-effect {treatment} $effect)"
    results = metta.run(query)

    effects = []
    for result in results:
        effects.append(result[0])

    return effects
```

#### Step 3: Agent with MeTTa (`agent.py`)

```python
from uagents import Agent, Context, Protocol
from uagents.core import ChatMessage, ChatAcknowledgement, TextContent
import medical_rag
import openai

agent = Agent(name="medical_assistant", mailbox=True)

# ASI:One for intent classification
openai.api_key = "YOUR_ASI1_API_KEY"

chat_protocol = Protocol(name="chat_protocol")

@chat_protocol.on_message(model=ChatMessage)
async def handle_query(ctx: Context, sender: str, msg: ChatMessage):
    # Send acknowledgement
    await ctx.send(sender, ChatAcknowledgement(...))

    # Extract user query
    user_query = msg.content[0].text

    # Use ASI:One to classify intent
    intent_response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{
            "role": "system",
            "content": "Classify if user is asking about: symptoms, treatment, or FAQ. Return only one word."
        }, {
            "role": "user",
            "content": user_query
        }]
    )

    intent = intent_response.choices[0].message.content.lower()

    # Query MeTTa knowledge base
    if "symptom" in intent:
        # Extract symptom from query (using LLM or regex)
        symptom = extract_symptom(user_query)
        diseases = medical_rag.query_symptoms(symptom)
        response = f"Based on your symptom ({symptom}), you might have: {', '.join(diseases)}"

    elif "treatment" in intent:
        disease = extract_disease(user_query)
        treatments = medical_rag.query_treatment(disease)
        response = f"Treatment for {disease}: {', '.join(treatments)}"

    else:
        # FAQ query
        response = medical_rag.query_faq(user_query)

    # Send response back
    await ctx.send(
        sender,
        ChatMessage(
            content=[TextContent(type="text", text=response)]
        )
    )

agent.include(chat_protocol, publish_manifest=True)
```

### MeTTa Benefits

1. **Structured Knowledge:** Store relationships explicitly
2. **Fast Queries:** Pattern matching is efficient
3. **Symbolic Reasoning:** Complex logical operations
4. **Scalable:** Can grow knowledge base without changing code

### More Complex MeTTa Examples

**Financial Advisor Agent:**
- Store stock relationships
- Company fundamentals
- Market trends
- Portfolio strategies

**Document RAG:**
- Store document embeddings
- Relationships between concepts
- Citation tracking

---

## Important Resources

### 🔥 ONE-STOP DOCUMENTATION (USE THIS)
**Innovation Lab:** All you need for hackathon in one place

Key sections:
1. **Agent Creation**
   - Hosted agents
   - Local agents
   - Mailbox agents
   - Langchain/CrewAI adapters

2. **Agent Communication**
   - on_message handlers
   - on_event handlers (startup, shutdown)
   - Data models

3. **Chat Protocol** ⭐ MOST IMPORTANT
   - Creating ASI:One compatible agents
   - Passing images (ResourceContent)
   - Generating images from agents

4. **Advanced Topics**
   - REST endpoints for agents
   - Frontend integration
   - On-chain integrations
   - Payment protocol
   - MCP integrations

### GitHub Resources

**Fetch.ai Examples:**
```
github.com/fetchai/uagents-examples
```

**uAgents Adapters:**
```
github.com/fetchai/uagents-adapter
```

**MeTTa + Fetch.ai Integration:**
```
github.com/fetchai/metta-uagents-integration
```
- Medical RAG example
- Financial advisor example
- Document RAG example

### Agent Verse MCP

**For No-Code/Low-Code Development:**

**Agent Verse MCP Light** (recommended for hackathon):
- 100+ tools for building/deploying agents
- Works with Cursor, Claude, OpenAI Playground
- Can create agents with chat protocol via prompts

**Setup:**
1. Get MCP URL from documentation
2. Add to Cursor config or Claude
3. Copy VIP coding rules (improves agent generation)
4. Start building via natural language!

---

## Agent Ranking & Discoverability

### How to Get Your Agent Ranked Higher

Agent Verse has 2.68 million agents. To rank higher:

1. **Enable Chat Protocol** ⭐ REQUIRED
   - Must have chat protocol to be discoverable

2. **Write Excellent README**
   - Explain what agent does
   - **Sample prompts** (VERY IMPORTANT)
   - Sample outputs
   - Use cases
   - Limitations

3. **Add Custom Avatar**
   - Makes agent more appealing

4. **Add Agent Handle**
   - Easier to find

5. **Add Domain** (if applicable)

6. **Add "About" Section**
   - Detailed description

7. **Get Interactions**
   - More people use it → Higher ranking

### README Example (Anime Generation Agent)

```markdown
# Anime Character Generator Agent 🎨

The best anime image generation agent on Agent Verse!

## Features
- High-quality anime-style character generation
- Customizable features (hair, eyes, clothing, pose)
- Multiple art styles (manga, chibi, realistic anime)
- Fast generation (< 30 seconds)

## How It Works
1. Describe your desired anime character
2. Agent generates image using specialized model
3. Receive high-resolution PNG image

## Sample Prompts ⭐

"Create an anime character with blue hair, green eyes, wearing a school uniform"

"Generate a chibi-style character with pink hair in twin tails, holding a magic wand"

"Draw a realistic anime girl with long black hair, red kimono, standing in cherry blossom garden"

## Technical Details
- Model: Stable Diffusion Anime
- Resolution: 1024x1024
- Format: PNG
- Average generation time: 25 seconds

## Limitations
- Cannot generate copyrighted characters
- Works best with detailed descriptions
- May take longer during peak hours
```

### Testing Your Agent

**Option 1: Chat with Agent Button**
- Click "Chat with Agent" on Agent Verse
- Type query
- See response

**Option 2: Test via ASI:One**
- Go to asi1.ai
- Type query
- Enable "Agent Search"
- ASI:One will find and use your agent

**Option 3: Direct Query (for debugging)**
- Copy agent address
- Go to asi1.ai
- Paste agent address
- Type query
- Sends directly to your agent (bypasses search)

---

## Hackathon Tips & Tricks

### 🏆 How to Win

#### 1. **More Agents = Better Chances**
- Create MULTIPLE agents with chat protocol
- Each agent increases discovery
- More interactions = higher ranking

#### 2. **Excellent Documentation**
- **GitHub Repo:** Well-documented code
- **Agent README:** Sample prompts, use cases
- **Setup Instructions:** API keys, dependencies
- **Agent Addresses:** List all agent addresses

#### 3. **Use Both Technologies**
- Fetch.ai for agent framework
- MeTTa for knowledge/reasoning
- Demonstrates deep integration

#### 4. **Focus on Chat Protocol**
- Every agent MUST have it
- Test thoroughly via ASI:One
- Provide clear sample prompts

#### 5. **Practical Use Cases**
- Solve real problems
- Not just "hello world" agents
- Show innovation

### 🛠️ Technical Checklist

**Before Submission:**
- ✅ Chat protocol enabled
- ✅ Agent discoverable on Agent Verse
- ✅ Tested via ASI:One
- ✅ Excellent README (sample prompts!)
- ✅ GitHub repo with clear instructions
- ✅ Agent addresses listed
- ✅ API keys documented (how to get them)

**For Hosted Agents:**
- ✅ Use only supported packages
- ✅ No infrastructure worries
- ✅ 24/7 uptime automatic

**For Mailbox Agents:**
- ✅ Any Python package works
- ✅ Connected to Agent Verse
- ✅ Discoverable via ASI:One

### 💡 Pro Tips

1. **Start Simple:** Get one agent working with chat protocol first
2. **Test Early:** Test via ASI:One before building more
3. **Sample Prompts:** Write 5-10 example queries in README
4. **Error Handling:** Handle edge cases gracefully
5. **Clear Responses:** Make agent responses user-friendly
6. **Document Everything:** Assume judges know nothing about your project

### 🎯 What Judges Look For

1. **Innovation:** Novel use case or approach
2. **Technical Depth:** Proper use of ASI tech stack
3. **Chat Protocol:** Correctly implemented
4. **Documentation:** Can they understand and run it?
5. **Multi-Agent:** Multiple agents working together
6. **MeTTa Integration:** Using knowledge graphs smartly
7. **Real-World Value:** Solves actual problem

---

## Quick Start Checklist

### Day 1: Setup
- ✅ Create Agent Verse account
- ✅ Get ASI:One API key
- ✅ Build first hosted agent (hello world)
- ✅ Test agent communication (Alice/Bob example)

### Day 2: Chat Protocol
- ✅ Implement chat protocol on agent
- ✅ Test via "Chat with Agent"
- ✅ Test via ASI:One direct query
- ✅ Write excellent README with sample prompts

### Day 3: Advanced Features
- ✅ Add MeTTa knowledge base (if applicable)
- ✅ Create mailbox agent (if need special packages)
- ✅ Multi-agent communication
- ✅ Test edge cases

### Day 4: Polish & Submit
- ✅ Create GitHub repo
- ✅ Write comprehensive README
- ✅ Document all API keys needed
- ✅ List agent addresses
- ✅ Record demo video
- ✅ Submit!

---

## Common Issues & Solutions

### Issue 1: Agent Not Discoverable on ASI:One
**Solution:**
- Verify chat protocol enabled
- Check `publish_manifest=True`
- Verify agent started successfully
- Check logs for errors
- Wait 5-10 minutes for indexing

### Issue 2: Chat Protocol Not Working
**Solution:**
- Verify both handlers: `ChatMessage` and `ChatAcknowledgement`
- Check data model imports from `uagents.core`
- Verify message format (timestamp, message_id, content)
- Test with direct query (paste agent address)

### Issue 3: Mailbox Agent Not Connecting
**Solution:**
- Use Google Chrome browser
- Copy Agent Inspector Link exactly
- Click Connect → Mailbox → Got it
- Check agent is running locally
- Verify `mailbox=True` in agent initialization

### Issue 4: Package Not Supported on Hosted Agent
**Solution:**
- Switch to mailbox agent
- Keep agent running on local machine/server
- Connect via Agent Inspector
- Full package support

### Issue 5: ASI:One Picks Wrong Agent
**Solution:**
- Improve README (more specific)
- Add detailed sample prompts
- Increase agent interactions (get people to use it)
- Use direct query method (paste address) for testing

---

## Support

### Discord
- Fetch.ai Discord: Join for real-time help
- SingularityNET Discord: MeTTa questions

### GitHub
- Report issues
- Check examples
- See other projects

### Documentation
- Innovation Lab (one-stop docs)
- Agent Verse docs
- ASI:One docs
- uAgents docs

---

## Final Notes

**Key Takeaways:**

1. **Chat Protocol is MANDATORY** for prizes
2. Use **mailbox agents** for maximum flexibility
3. **README with sample prompts** is crucial
4. Test via ASI:One early and often
5. More agents = better chances
6. Combine Fetch.ai + MeTTa for best results

**Good luck with your hackathon! 🚀**

---

**Document Version:** 1.0
**Last Updated:** Based on workshop transcript
**Workshop by:** Kshipra Dhame, Fetch.ai Devrel Team
