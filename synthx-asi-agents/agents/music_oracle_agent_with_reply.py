# coding: utf-8
"""
MusicOracleAgent - WITH ACKNOWLEDGEMENT REPLY
Tests if Agentverse requires a reply to avoid "Unable to determine message model" error
"""
from datetime import datetime, timezone
from uagents import Agent, Context, Model


# ============================================================================
# MESSAGE MODELS
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


class Acknowledgement(Model):
    """Simple acknowledgement reply"""
    ticker: str
    received: bool
    cached: bool


# ============================================================================
# AGENT DEFINITION
# ============================================================================

agent = Agent(
    name="music_oracle_with_reply",
    seed="music_oracle_reply_test_2024",
)

# Cache for storing valuations
VALUATION_CACHE = {}


# ============================================================================
# MESSAGE HANDLER
# ============================================================================

@agent.on_message(model=ValuationUpdate, replies={Acknowledgement})
async def receive_valuation_update(ctx: Context, sender: str, msg: ValuationUpdate):
    """Receive and store valuation update from DataCollectorAgent"""
    ctx.logger.info(f"Received valuation update for {msg.ticker}")
    ctx.logger.info(f"   Catalog Value: ${msg.catalog_value:,.0f}")
    ctx.logger.info(f"   Token Price: ${msg.price_per_token:.4f}")

    # Store in cache
    VALUATION_CACHE[msg.ticker] = msg

    ctx.logger.info(f"   Cached valuation for {msg.ticker}")

    # Send acknowledgement back to DataCollector
    await ctx.send(
        sender,
        Acknowledgement(
            ticker=msg.ticker,
            received=True,
            cached=True
        )
    )
    ctx.logger.info(f"   Sent acknowledgement to {sender}")


# ============================================================================
# STARTUP
# ============================================================================

@agent.on_event("startup")
async def startup(ctx: Context):
    """Log startup information"""
    ctx.logger.info("=" * 70)
    ctx.logger.info("MusicOracleAgent WITH REPLY TEST VERSION Started")
    ctx.logger.info("=" * 70)
    ctx.logger.info(f"Agent Address: {agent.address}")
    ctx.logger.info("=" * 70)


if __name__ == "__main__":
    agent.run()
