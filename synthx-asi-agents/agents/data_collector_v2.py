# coding: utf-8
"""
DataCollectorAgent v2 - Clean rewrite
Fetches Spotify data every 6 hours and sends to Oracle
"""
import os
import requests
import base64
from datetime import datetime, timezone
from uagents import Agent, Context, Model


# Message Model
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

# Config
SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID", "")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET", "")
ORACLE_AGENT_ADDRESS = "agent1q0w2a746fgnrsalf2jgjk67aamrk7yquc5mgy9uawuwe858vdhe8k2sn647"


# Spotify API
def get_spotify_token():
    auth_str = f"{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}"
    auth_base64 = base64.b64encode(auth_str.encode()).decode()
    response = requests.post(
        "https://accounts.spotify.com/api/token",
        headers={"Authorization": f"Basic {auth_base64}", "Content-Type": "application/x-www-form-urlencoded"},
        data={"grant_type": "client_credentials"}
    )
    return response.json()["access_token"]


def get_artist_data(spotify_id: str, token: str):
    response = requests.get(
        f"https://api.spotify.com/v1/artists/{spotify_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json()


def calculate_valuation(ticker: str, artist_data: dict, token: str):
    try:
        artist = get_artist_data(artist_data["spotify_id"], token)
        followers = artist['followers']['total']
        popularity = artist['popularity']
        monthly_listeners = int(followers * 0.6)

        monthly_streams = monthly_listeners * AVG_STREAMS_PER_LISTENER
        annual_revenue = monthly_streams * SPOTIFY_PAY_PER_STREAM * 12

        multiple = artist_data["multiple"]
        base_valuation = annual_revenue * multiple

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
        price_per_token = final_valuation / TOKEN_SUPPLY

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
            "data_source": "Spotify Web API",
            "last_updated": datetime.now(timezone.utc).isoformat(),
            "success": True
        }
    except Exception as e:
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


# Agent
agent = Agent(
    name="data_collector_v2",
    seed="data_collector_v2_seed",
)


@agent.on_interval(period=21600.0)
async def collect_and_send(ctx: Context):
    ctx.logger.info("Starting data collection")

    token = get_spotify_token()
    if not token:
        ctx.logger.error("Failed to get Spotify token")
        return

    for ticker, artist_data in ARTIST_DATABASE.items():
        ctx.logger.info(f"Processing {artist_data['name']}")

        valuation = calculate_valuation(ticker, artist_data, token)

        if valuation["success"]:
            ctx.logger.info(f"  Value: ${valuation['catalog_value']:,.0f}")
            ctx.logger.info(f"  Price: ${valuation['price_per_token']:.4f}")

        await ctx.send(ORACLE_AGENT_ADDRESS, ValuationUpdate(**valuation))
        ctx.logger.info(f"  Sent to Oracle")

    ctx.logger.info("Data collection complete")


@agent.on_event("startup")
async def startup(ctx: Context):
    ctx.logger.info(f"DataCollectorAgent v2 Started")
    ctx.logger.info(f"Address: {agent.address}")
    ctx.logger.info(f"Oracle: {ORACLE_AGENT_ADDRESS}")
    ctx.logger.info("Running initial collection...")
    await collect_and_send(ctx)


if __name__ == "__main__":
    agent.run()
