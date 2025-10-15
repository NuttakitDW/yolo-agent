# coding: utf-8
"""
MusicOracleAgent v2 - Clean rewrite
Receives valuation updates and responds to user queries
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


# Message Model - MUST match DataCollector exactly
class ValuationUpdate(Model):
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


# Artist Database
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


# Agent
agent = Agent(
    name="music_oracle_v2",
    seed="music_oracle_v2_seed",
)

VALUATION_CACHE = {}


# Helper Functions
def extract_ticker(text: str):
    text_upper = text.upper()
    for ticker in ARTIST_DATABASE.keys():
        if ticker in text_upper:
            return ticker
    for ticker, data in ARTIST_DATABASE.items():
        if data["name"].upper() in text_upper:
            return ticker
    return None


def create_chat_message(text: str, end_session: bool = False):
    content = [TextContent(type="text", text=text)]
    if end_session:
        content.append(EndSessionContent(type="end_session"))
    return ChatMessage(
        timestamp=datetime.now(timezone.utc),
        msg_id=uuid4(),
        content=content,
    )


def format_response(val: ValuationUpdate):
    conf_pct = int(val.confidence * 100)
    adj_pct = int((val.growth_factor - 1.0) * 100)

    examples = []
    for amount in [100, 1000, 10000]:
        tokens = amount / val.price_per_token
        ownership = (tokens / TOKEN_SUPPLY) * 100
        examples.append(f"${amount:,} = {tokens:.0f} tokens ({ownership:.8f}% catalog)")

    return f"""${val.ticker} - {val.artist_name} Catalog Token

Catalog Valuation: ${val.catalog_value:,.0f}
Token Price: ${val.price_per_token:.4f}
Token Supply: {TOKEN_SUPPLY:,} (fixed)
Confidence: {conf_pct}%

Valuation Breakdown:
- Monthly Listeners: {val.monthly_listeners:,}
- Annual Revenue: ${val.annual_revenue:,.0f}
- Base Valuation: ${val.base_valuation:,.0f} ({val.multiple_used}x {val.tier} tier)
- Momentum: {val.momentum} ({adj_pct:+d}%)
- Final Value: ${val.catalog_value:,.0f}

Investment Examples:
- {examples[0]}
- {examples[1]}
- {examples[2]}

How It Works:
This synthetic token tracks {val.artist_name}'s music catalog value.

WARNING: Synthetic asset - not actual ownership
Educational purposes only, not investment advice

Data: {val.data_source}
Last Updated: {val.last_updated[:19]}Z

Built with ASI Alliance Multi-Agent System"""


def get_help():
    artists = "\n".join([f"- {data['name']} (${ticker})" for ticker, data in ARTIST_DATABASE.items()])
    return f"""SynthX Music Catalog Oracle

I provide fair prices for synthetic music catalog tokens.

Supported Artists:
{artists}

How to use:
Ask: "What is Taylor Swift catalog worth?" or "Give me Drake price"

Multi-Agent Architecture:
- DataCollectorAgent: Fetches Spotify data every 6 hours
- MusicOracleAgent: Provides instant responses

Built for ETH Online 2025 with ASI Alliance"""


# Message Handler for DataCollector
@agent.on_message(model=ValuationUpdate)
async def handle_valuation_update(ctx: Context, sender: str, msg: ValuationUpdate):
    ctx.logger.info(f"Received valuation for {msg.ticker}")
    ctx.logger.info(f"  Value: ${msg.catalog_value:,.0f}")
    ctx.logger.info(f"  Price: ${msg.price_per_token:.4f}")
    ctx.logger.info(f"  Cache before: {list(VALUATION_CACHE.keys())}")

    # Store in memory cache
    VALUATION_CACHE[msg.ticker] = msg

    # Store in persistent storage
    ctx.storage.set(f"valuation_{msg.ticker}", msg.dict())

    ctx.logger.info(f"  Cache after: {list(VALUATION_CACHE.keys())}")
    ctx.logger.info(f"  Cached (total: {len(VALUATION_CACHE)})")


# Chat Protocol for Users
chat_proto = Protocol(spec=chat_protocol_spec)


@chat_proto.on_message(ChatMessage)
async def handle_chat(ctx: Context, sender: str, msg: ChatMessage):
    ctx.logger.info(f"Chat from {sender}")

    await ctx.send(sender, ChatAcknowledgement(
        timestamp=datetime.now(timezone.utc),
        acknowledged_msg_id=msg.msg_id
    ))

    for item in msg.content:
        if isinstance(item, StartSessionContent):
            await ctx.send(sender, create_chat_message(get_help()))

        elif isinstance(item, TextContent):
            text = item.text
            ctx.logger.info(f"  Query: {text}")

            if any(word in text.lower() for word in ["help", "how", "what can"]):
                await ctx.send(sender, create_chat_message(get_help()))
                continue

            if any(word in text.lower() for word in ["hi", "hello", "hey"]):
                greeting = """Hello! I'm the SynthX Music Catalog Oracle.

I provide valuations for synthetic music catalog tokens.

Try asking: "What is Taylor Swift catalog worth?" or type "help"."""
                await ctx.send(sender, create_chat_message(greeting))
                continue

            ticker = extract_ticker(text)

            if ticker:
                # Try memory cache first
                valuation = VALUATION_CACHE.get(ticker)

                # If not in memory, try persistent storage
                if not valuation:
                    stored_data = ctx.storage.get(f"valuation_{ticker}")
                    if stored_data:
                        valuation = ValuationUpdate(**stored_data)
                        VALUATION_CACHE[ticker] = valuation

                if valuation:
                    response = format_response(valuation)
                    await ctx.send(sender, create_chat_message(response))
                    ctx.logger.info(f"  Sent valuation")
                else:
                    no_data = f"""{ARTIST_DATABASE[ticker]['name']} data is being collected.

DataCollectorAgent updates every 6 hours. Please wait and try again.

Ask about another artist or type "help"."""
                    await ctx.send(sender, create_chat_message(no_data))
            else:
                not_found = f"""I don't recognize that artist.

I track: {", ".join([data['name'] for data in list(ARTIST_DATABASE.values())[:5]])}
...and {len(ARTIST_DATABASE)} total artists

Which catalog would you like to know about?"""
                await ctx.send(sender, create_chat_message(not_found))

        elif isinstance(item, EndSessionContent):
            await ctx.send(sender, create_chat_message("Thanks for using SynthX Music Oracle!", end_session=True))


@chat_proto.on_message(ChatAcknowledgement)
async def handle_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
    ctx.logger.info(f"Ack from {sender}")


agent.include(chat_proto, publish_manifest=True)


@agent.on_event("startup")
async def startup(ctx: Context):
    ctx.logger.info("MusicOracleAgent v2 Started")
    ctx.logger.info(f"Address: {agent.address}")
    ctx.logger.info(f"Cached: {len(VALUATION_CACHE)}")
    ctx.logger.info("Ready for messages")


if __name__ == "__main__":
    agent.run()
