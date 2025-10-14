# coding: utf-8
"""
MusicOracleAgent - DEFENSIVE VERSION FOR TESTING
Handles errors more gracefully
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
    name="music_oracle_defensive",
    seed="music_oracle_defensive_test_2024",
)

# Cache for storing valuations
VALUATION_CACHE = {}


# ============================================================================
# MESSAGE HANDLER
# ============================================================================

@agent.on_message(model=ValuationUpdate)
async def receive_valuation_update(ctx: Context, sender: str, msg: ValuationUpdate):
    """Receive and store valuation update from DataCollectorAgent"""
    try:
        ctx.logger.info(f"Received message from {sender}")
        ctx.logger.info(f"Message type: {type(msg)}")
        ctx.logger.info(f"Ticker: {msg.ticker}")
        ctx.logger.info(f"Artist: {msg.artist_name}")
        ctx.logger.info(f"Catalog Value: ${msg.catalog_value:,.0f}")
        ctx.logger.info(f"Token Price: ${msg.price_per_token:.4f}")

        # Store in cache
        VALUATION_CACHE[msg.ticker] = msg

        ctx.logger.info(f"Successfully cached {msg.ticker}")
        ctx.logger.info(f"Cache size: {len(VALUATION_CACHE)}")

    except Exception as e:
        ctx.logger.error(f"Error processing message: {e}")
        ctx.logger.error(f"Error type: {type(e)}")
        import traceback
        ctx.logger.error(f"Traceback: {traceback.format_exc()}")


# ============================================================================
# STARTUP
# ============================================================================

@agent.on_event("startup")
async def startup(ctx: Context):
    """Log startup information"""
    ctx.logger.info("=" * 70)
    ctx.logger.info("MusicOracleAgent DEFENSIVE TEST VERSION Started")
    ctx.logger.info("=" * 70)
    ctx.logger.info(f"Agent Address: {agent.address}")
    ctx.logger.info("=" * 70)


if __name__ == "__main__":
    agent.run()
