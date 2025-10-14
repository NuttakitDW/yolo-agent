# coding: utf-8
"""
MusicOracleAgent - User-facing oracle with Chat Protocol
Receives valuation updates from DataCollectorAgent
Responds to user queries on ASI:One

AGENTVERSE DEPLOYMENT:
1. Copy this entire file to Agentverse
2. Deploy with Mailbox enabled
3. Enable "Publish manifest" for ASI:One discoverability
4. Copy this agent's address and update DataCollectorAgent's ORACLE_AGENT_ADDRESS
"""
from datetime import datetime, timezone
from uuid import uuid4
from uagents import Agent, Context, Protocol, Model
from uagents_core.contrib.protocols.chat import (
    ChatAcknowledgement,
    ChatMessage,
    EndSessionContent,
    StartSessionContent,
    TextContent,
    chat_protocol_spec,
)


# ============================================================================
# MESSAGE MODEL (embedded - same in both agents)
# ============================================================================

class ValuationUpdate(Model):
    """Message received from DataCollectorAgent"""
    ticker: str
    artist_name: str
    catalog_value: float
    price_per_token: float
    confidence: float
    monthly_listeners: int
    popularity: int
    followers: int
    annual_revenue: float
    base_valuation: float
    tier: str
    multiple_used: int
    growth_factor: float
    momentum: str
    data_source: str
    last_updated: str
    success: bool


# ============================================================================
# ARTIST DATABASE (embedded - for name matching)
# ============================================================================

ARTIST_DATABASE = {
    "SWIFT": {"name": "Taylor Swift"},
    "DRAKE": {"name": "Drake"},
    "WEEKND": {"name": "The Weeknd"},
    "EDSHEERAN": {"name": "Ed Sheeran"},
    "ARIANA": {"name": "Ariana Grande"},
    "BADBUNNY": {"name": "Bad Bunny"},
    "BILLIE": {"name": "Billie Eilish"},
    "POSTMALONE": {"name": "Post Malone"},
    "DUALIPA": {"name": "Dua Lipa"},
    "HARRYSTYLES": {"name": "Harry Styles"}
}

TOKEN_SUPPLY = 1_000_000_000


# ============================================================================
# AGENT DEFINITION
# ============================================================================

agent = Agent(
    name="music_oracle",
    seed="music_oracle_synthx_2024",
)

# Cache for storing valuations from DataCollector
VALUATION_CACHE = {}


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def extract_artist_ticker(text: str) -> str:
    """Extract artist ticker from user message"""
    text_upper = text.upper()

    # Check for exact ticker match
    for ticker in ARTIST_DATABASE.keys():
        if ticker in text_upper:
            return ticker

    # Check for artist name match
    for ticker, data in ARTIST_DATABASE.items():
        if data["name"].upper() in text_upper:
            return ticker

    return None


def create_text_chat(text: str, end_session: bool = False) -> ChatMessage:
    """Create a ChatMessage with text content"""
    content = [TextContent(type="text", text=text)]
    if end_session:
        content.append(EndSessionContent(type="end_session"))

    return ChatMessage(
        timestamp=datetime.now(timezone.utc),
        msg_id=uuid4(),
        content=content,
    )


def format_valuation_response(val: ValuationUpdate) -> str:
    """Format valuation into user-friendly response"""
    conf_pct = int(val.confidence * 100)

    # Calculate investment examples
    examples = []
    for amount in [100, 1000, 10000]:
        tokens = amount / val.price_per_token
        ownership_pct = (tokens / TOKEN_SUPPLY) * 100
        examples.append(
            f"${amount:,} = {tokens:.0f} tokens ({ownership_pct:.8f}% catalog)"
        )

    # Growth adjustment percentage
    adj_pct = int((val.growth_factor - 1.0) * 100)

    response = f"""${val.ticker} - {val.artist_name} Catalog Token

Catalog Valuation: ${val.catalog_value:,.0f}
Token Price: ${val.price_per_token:.4f}
Token Supply: {TOKEN_SUPPLY:,} (fixed)
Confidence: {conf_pct}%

Valuation Breakdown:
- Monthly Listeners: {val.monthly_listeners:,}
- Annual Revenue: ${val.annual_revenue:,.0f} (streaming)
- Base Valuation: ${val.base_valuation:,.0f} ({val.multiple_used}x {val.tier} tier)
- Momentum: {val.momentum} ({adj_pct:+d}%)
- Final Value: ${val.catalog_value:,.0f}

Investment Examples:
- {examples[0]}
- {examples[1]}
- {examples[2]}

How It Works:
This synthetic token tracks {val.artist_name}'s music catalog value. Like Mirror Protocol for stocks, we enable fractional ownership of billion-dollar music IP that's normally illiquid.

WARNING: Synthetic asset - not actual ownership of music rights
Educational purposes only, not investment advice

Data: {val.data_source}
Last Updated: {val.last_updated[:19]}Z

Built with ASI Alliance Multi-Agent System"""

    return response


def get_help_message() -> str:
    """Return help message"""
    artists_list = "\n".join([f"- {data['name']} (${ticker})" for ticker, data in ARTIST_DATABASE.items()])

    return f"""SynthX Music Catalog Oracle

I provide fair prices for synthetic music catalog tokens using a multi-agent system:

Supported Artists:
{artists_list}

How to use:
Just ask: "What is Taylor Swift catalog worth?" or "Give me Drake price"

Multi-Agent Architecture:
- DataCollectorAgent: Fetches Spotify data every 6 hours
- MusicOracleAgent (me!): Provides instant responses

Making billion-dollar music IP accessible through synthetic tokens.

Built for ETH Online 2025 with ASI Alliance"""


# ============================================================================
# CHAT PROTOCOL (for user interactions)
# ============================================================================

chat_proto = Protocol(spec=chat_protocol_spec)


@chat_proto.on_message(ChatMessage)
async def handle_user_message(ctx: Context, sender: str, msg: ChatMessage):
    """Handle incoming user messages via ASI:One"""
    ctx.logger.info(f"Received message from user: {sender}")

    # Send acknowledgement
    await ctx.send(
        sender,
        ChatAcknowledgement(
            timestamp=datetime.now(timezone.utc),
            acknowledged_msg_id=msg.msg_id
        )
    )

    # Process message content
    for item in msg.content:
        # Session start
        if isinstance(item, StartSessionContent):
            ctx.logger.info("Session started")
            response = create_text_chat(get_help_message())
            await ctx.send(sender, response)

        # Text message
        elif isinstance(item, TextContent):
            user_text = item.text
            ctx.logger.info(f"   Query: {user_text}")

            # Check for help
            if any(word in user_text.lower() for word in ["help", "how", "what can"]):
                response = create_text_chat(get_help_message())
                await ctx.send(sender, response)
                continue

            # Check for greeting
            if any(word in user_text.lower() for word in ["hi", "hello", "hey"]):
                greeting = """Hello! I'm the SynthX Music Catalog Oracle.

I provide fair valuations for synthetic music catalog tokens. Data is updated every 6 hours from Spotify API.

Try asking: "What is Taylor Swift catalog worth?" or type "help" for more info."""
                response = create_text_chat(greeting)
                await ctx.send(sender, response)
                continue

            # Extract artist
            ticker = extract_artist_ticker(user_text)

            if ticker:
                # Check if we have cached valuation
                if ticker in VALUATION_CACHE:
                    valuation = VALUATION_CACHE[ticker]
                    response_text = format_valuation_response(valuation)
                    response = create_text_chat(response_text)
                    await ctx.send(sender, response)
                    ctx.logger.info(f"   Sent cached valuation")
                else:
                    # No data yet
                    no_data = f"""{ARTIST_DATABASE[ticker]['name']} data is being collected.

The DataCollectorAgent updates all artist valuations every 6 hours. If this is your first query, please wait a few moments and try again.

Ask about another artist or type "help" to see all available artists."""
                    response = create_text_chat(no_data)
                    await ctx.send(sender, response)
                    ctx.logger.info(f"   No cached data for {ticker}")
            else:
                # Artist not found
                not_found = f"""I don't recognize that artist.

I currently track these music catalogs:
{", ".join([data['name'] for data in list(ARTIST_DATABASE.values())[:5]])}
...and {len(ARTIST_DATABASE)} total artists

Which catalog would you like to know about?"""
                response = create_text_chat(not_found)
                await ctx.send(sender, response)

        # Session end
        elif isinstance(item, EndSessionContent):
            ctx.logger.info("Session ended")
            goodbye = create_text_chat("Thanks for using SynthX Music Oracle!", end_session=True)
            await ctx.send(sender, goodbye)


@chat_proto.on_message(ChatAcknowledgement)
async def handle_acknowledgement(ctx: Context, sender: str, msg: ChatAcknowledgement):
    """Handle acknowledgements"""
    ctx.logger.info(f"Received acknowledgement from {sender}")


# Include chat protocol with manifest publishing
agent.include(chat_proto, publish_manifest=True)


# ============================================================================
# VALUATION UPDATE HANDLER (for DataCollector messages)
# Register AFTER chat protocol to avoid conflicts
# ============================================================================

@agent.on_message(model=ValuationUpdate)
async def receive_valuation_update(ctx: Context, sender: str, msg: ValuationUpdate):
    """
    Receive and store valuation update from DataCollectorAgent
    Stores in cache for instant user responses
    """
    ctx.logger.info(f"Received valuation update for {msg.ticker}")
    ctx.logger.info(f"   Catalog Value: ${msg.catalog_value:,.0f}")
    ctx.logger.info(f"   Token Price: ${msg.price_per_token:.4f}")
    ctx.logger.info(f"   Last Updated: {msg.last_updated[:19]}")

    # Store in cache
    VALUATION_CACHE[msg.ticker] = msg

    ctx.logger.info(f"   Cached valuation for instant queries")


# ============================================================================
# STARTUP
# ============================================================================

@agent.on_event("startup")
async def startup(ctx: Context):
    """Log startup information"""
    ctx.logger.info("=" * 70)
    ctx.logger.info("MusicOracleAgent Started")
    ctx.logger.info("=" * 70)
    ctx.logger.info(f"Agent Address: {agent.address}")
    ctx.logger.info(f"Supported Artists: {len(ARTIST_DATABASE)}")
    ctx.logger.info(f"Cached Valuations: {len(VALUATION_CACHE)}")
    ctx.logger.info("=" * 70)
    ctx.logger.info("Ready to serve music catalog valuations")
    ctx.logger.info("Discoverable on ASI:One (asi1.ai)")
    ctx.logger.info("=" * 70)


if __name__ == "__main__":
    agent.run()
