# coding: utf-8
"""
DataCollectorAgent - Fetches and calculates music catalog valuations
Runs every 6 hours, sends updates to MusicOracleAgent

AGENTVERSE DEPLOYMENT:
1. Copy this entire file to Agentverse
2. Set environment variables:
   - SPOTIFY_CLIENT_ID
   - SPOTIFY_CLIENT_SECRET
   - ORACLE_AGENT_ADDRESS (get from MusicOracleAgent after deploying it)
3. Deploy with Mailbox enabled
"""
import os
from datetime import datetime, timezone
from uagents import Agent, Context, Model
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials


# ============================================================================
# MESSAGE MODEL (embedded - same in both agents)
# ============================================================================

class ValuationUpdate(Model):
    """Message sent to MusicOracleAgent"""
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
# ARTIST DATABASE (embedded)
# ============================================================================

ARTIST_DATABASE = {
    "SWIFT": {"name": "Taylor Swift", "spotify_id": "06HL4z0CvFAxyc27GXpf02", "tier": "mega", "multiple": 20},
    "DRAKE": {"name": "Drake", "spotify_id": "3TVXtAsR1Inumwj472S9r4", "tier": "mega", "multiple": 18},
    "WEEKND": {"name": "The Weeknd", "spotify_id": "1Xyo4u8uXC1ZmMpatF05PJ", "tier": "mega", "multiple": 17},
    "EDSHEERAN": {"name": "Ed Sheeran", "spotify_id": "6eUKZXaKkcviH0Ku9w2n3V", "tier": "mega", "multiple": 16},
    "ARIANA": {"name": "Ariana Grande", "spotify_id": "66CXWjxzNUsdJxJ2JdwvnR", "tier": "mega", "multiple": 15},
    "BADBUNNY": {"name": "Bad Bunny", "spotify_id": "4q3ewBCX7sLwd24euuV69X", "tier": "mega", "multiple": 14},
    "BILLIE": {"name": "Billie Eilish", "spotify_id": "6qqNVTkY8uBg9cP3Jd7DAH", "tier": "established", "multiple": 12},
    "POSTMALONE": {"name": "Post Malone", "spotify_id": "246dkjvS1zLTtiykXe5h60", "tier": "established", "multiple": 13},
    "DUALIPA": {"name": "Dua Lipa", "spotify_id": "6M2wZ9GZgrQXHCFfjv46we", "tier": "established", "multiple": 11},
    "HARRYSTYLES": {"name": "Harry Styles", "spotify_id": "6KImCVD70vtIoJWnq6nGn3", "tier": "established", "multiple": 10}
}

# Constants
SPOTIFY_PAY_PER_STREAM = 0.003
AVG_STREAMS_PER_LISTENER = 15
TOKEN_SUPPLY = 1_000_000_000


# ============================================================================
# CONFIGURATION
# ============================================================================

# Spotify API credentials
# If using Agentverse Secret Vault, set these variables there
# Otherwise, hardcode them here (already included as defaults)
SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID") or os.getenv("CLIENT_ID") or "e7fb6398ef064425a66afa2cfbb2496c"
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET") or os.getenv("CLIENT_SECRET") or "566099d7acde40caaaa56f129988de42"

# Oracle agent address - IMPORTANT: Update this with your MusicOracleAgent address!
ORACLE_AGENT_ADDRESS = os.getenv("ORACLE_AGENT_ADDRESS") or "agent1qv63jjejsm99zd9jfyf4nfapt0hd7yx9dlr4lfylj53a6p35m4cmv0vf7jy"


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_spotify_client():
    """Initialize Spotify API client"""
    try:
        auth_manager = SpotifyClientCredentials(
            client_id=SPOTIFY_CLIENT_ID,
            client_secret=SPOTIFY_CLIENT_SECRET
        )
        return spotipy.Spotify(auth_manager=auth_manager)
    except Exception as e:
        print(f"Error initializing Spotify: {e}")
        return None


def calculate_valuation(ticker: str, artist_data: dict, sp) -> dict:
    """
    Calculate complete valuation for one artist

    Steps:
    1. Fetch Spotify data (listeners, popularity)
    2. Calculate annual revenue
    3. Apply valuation multiple
    4. Apply growth factor
    5. Calculate token price
    """
    try:
        # Step 1: Fetch Spotify data
        artist = sp.artist(artist_data["spotify_id"])
        followers = artist['followers']['total']
        popularity = artist['popularity']

        # Estimate monthly listeners (60% of followers)
        monthly_listeners = int(followers * 0.6)

        # Step 2: Calculate annual revenue
        monthly_streams = monthly_listeners * AVG_STREAMS_PER_LISTENER
        annual_revenue = monthly_streams * SPOTIFY_PAY_PER_STREAM * 12

        # Step 3: Apply valuation multiple
        multiple = artist_data["multiple"]
        base_valuation = annual_revenue * multiple

        # Step 4: Apply growth factor based on popularity
        if popularity >= 95:
            momentum = "MEGA TRENDING"
            growth_factor = 1.20
        elif popularity >= 85:
            momentum = "HIGH MOMENTUM"
            growth_factor = 1.10
        elif popularity >= 70:
            momentum = "STABLE"
            growth_factor = 1.00
        else:
            momentum = "DECLINING"
            growth_factor = 0.90

        final_valuation = base_valuation * growth_factor

        # Step 5: Calculate token price
        price_per_token = final_valuation / TOKEN_SUPPLY

        # Calculate confidence
        confidence = 0.85
        if artist_data["tier"] == "mega":
            confidence += 0.05
        if popularity >= 85:
            confidence += 0.05
        confidence = min(confidence, 0.95)

        return {
            "ticker": ticker,
            "artist_name": artist_data["name"],
            "catalog_value": final_valuation,
            "price_per_token": price_per_token,
            "confidence": confidence,
            "monthly_listeners": monthly_listeners,
            "popularity": popularity,
            "followers": followers,
            "annual_revenue": annual_revenue,
            "base_valuation": base_valuation,
            "tier": artist_data["tier"],
            "multiple_used": multiple,
            "growth_factor": growth_factor,
            "momentum": momentum,
            "data_source": "Spotify Web API (followers-based estimate)",
            "last_updated": datetime.now(timezone.utc).isoformat(),
            "success": True
        }

    except Exception as e:
        print(f"Error calculating valuation for {ticker}: {e}")
        return {
            "ticker": ticker,
            "artist_name": artist_data["name"],
            "catalog_value": 0,
            "price_per_token": 0,
            "confidence": 0,
            "monthly_listeners": 0,
            "popularity": 0,
            "followers": 0,
            "annual_revenue": 0,
            "base_valuation": 0,
            "tier": artist_data["tier"],
            "multiple_used": 0,
            "growth_factor": 1.0,
            "momentum": "ERROR",
            "data_source": "",
            "last_updated": datetime.now(timezone.utc).isoformat(),
            "success": False
        }


# ============================================================================
# AGENT DEFINITION
# ============================================================================

agent = Agent(
    name="data_collector",
    seed="data_collector_synthx_2024",
    port=8010,
    endpoint=["http://localhost:8010/submit"],
)


@agent.on_interval(period=21600.0)  # Every 6 hours (21600 seconds)
async def collect_and_send_valuations(ctx: Context):
    """
    Periodic task: Fetch Spotify data and calculate valuations for all artists
    Sends ValuationUpdate message to MusicOracleAgent for each artist
    """
    ctx.logger.info("=" * 70)
    ctx.logger.info("Starting data collection cycle")
    ctx.logger.info("=" * 70)

    # Initialize Spotify client
    sp = get_spotify_client()
    if not sp:
        ctx.logger.error("Failed to initialize Spotify client")
        return

    # Process each artist
    for ticker, artist_data in ARTIST_DATABASE.items():
        ctx.logger.info(f"\nProcessing {artist_data['name']} (${ticker})...")

        # Calculate valuation
        valuation = calculate_valuation(ticker, artist_data, sp)

        if valuation["success"]:
            ctx.logger.info(f"   Catalog Value: ${valuation['catalog_value']:,.0f}")
            ctx.logger.info(f"   Token Price: ${valuation['price_per_token']:.4f}")
            ctx.logger.info(f"   Listeners: {valuation['monthly_listeners']:,}")
            ctx.logger.info(f"   Popularity: {valuation['popularity']}/100")
            ctx.logger.info(f"   Momentum: {valuation['momentum']}")
        else:
            ctx.logger.error(f"   Failed to calculate valuation")

        # Send to Oracle
        try:
            await ctx.send(
                ORACLE_AGENT_ADDRESS,
                ValuationUpdate(**valuation)
            )
            ctx.logger.info(f"   Sent update to Oracle")
        except Exception as e:
            ctx.logger.error(f"   Failed to send to Oracle: {e}")

    ctx.logger.info("\n" + "=" * 70)
    ctx.logger.info(f"Data collection cycle complete - processed {len(ARTIST_DATABASE)} artists")
    ctx.logger.info("=" * 70)


@agent.on_event("startup")
async def startup(ctx: Context):
    """Log startup and run first collection immediately"""
    ctx.logger.info("=" * 70)
    ctx.logger.info("DataCollectorAgent Started")
    ctx.logger.info("=" * 70)
    ctx.logger.info(f"Agent Address: {agent.address}")
    ctx.logger.info(f"Sends to Oracle: {ORACLE_AGENT_ADDRESS}")
    ctx.logger.info(f"Artists tracked: {len(ARTIST_DATABASE)}")
    ctx.logger.info(f"Update frequency: Every 6 hours")
    ctx.logger.info("=" * 70)

    # Run first collection immediately
    ctx.logger.info("\nRunning initial data collection...")
    await collect_and_send_valuations(ctx)


if __name__ == "__main__":
    agent.run()
