# coding: utf-8
"""
MusicOracleAgent - SIMPLIFIED VERSION FOR TESTING
Only receives ValuationUpdate messages (no Chat Protocol)
Use this to test if agent-to-agent messaging works
"""
from datetime import datetime, timezone
from uagents import Agent, Context, Model


# ============================================================================
# MESSAGE MODEL
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
# AGENT DEFINITION
# ============================================================================

agent = Agent(
    name="music_oracle_simple",
    seed="music_oracle_simple_test_2024",
)

# Cache for storing valuations
VALUATION_CACHE = {}


# ============================================================================
# MESSAGE HANDLER
# ============================================================================

@agent.on_message(model=ValuationUpdate)
async def receive_valuation_update(ctx: Context, sender: str, msg: ValuationUpdate):
    """Receive and store valuation update from DataCollectorAgent"""
    ctx.logger.info(f"Received valuation update for {msg.ticker}")
    ctx.logger.info(f"   Catalog Value: ${msg.catalog_value:,.0f}")
    ctx.logger.info(f"   Token Price: ${msg.price_per_token:.4f}")
    ctx.logger.info(f"   Last Updated: {msg.last_updated[:19]}")

    # Store in cache
    VALUATION_CACHE[msg.ticker] = msg

    ctx.logger.info(f"   Cached valuation for instant queries")
    ctx.logger.info(f"   Cache now has {len(VALUATION_CACHE)} artists")


# ============================================================================
# STARTUP
# ============================================================================

@agent.on_event("startup")
async def startup(ctx: Context):
    """Log startup information"""
    ctx.logger.info("=" * 70)
    ctx.logger.info("MusicOracleAgent SIMPLE TEST VERSION Started")
    ctx.logger.info("=" * 70)
    ctx.logger.info(f"Agent Address: {agent.address}")
    ctx.logger.info(f"Cached Valuations: {len(VALUATION_CACHE)}")
    ctx.logger.info("=" * 70)
    ctx.logger.info("Waiting for ValuationUpdate messages...")
    ctx.logger.info("=" * 70)


if __name__ == "__main__":
    agent.run()
