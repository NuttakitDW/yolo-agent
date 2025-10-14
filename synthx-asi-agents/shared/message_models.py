# coding: utf-8
"""
Message Models for SynthX Multi-Agent Communication
Used between DataCollectorAgent and MusicOracleAgent
"""
from uagents import Model


class ValuationUpdate(Model):
    """
    Message sent from DataCollectorAgent to MusicOracleAgent
    Contains complete valuation data for one artist
    """
    ticker: str                  # "SWIFT"
    artist_name: str             # "Taylor Swift"

    # Final results
    catalog_value: float         # $1,124,258,992
    price_per_token: float       # $1.1243
    confidence: float            # 0.90 (90%)

    # Breakdown data
    monthly_listeners: int       # 86,748,379
    popularity: int              # 98 (0-100)
    followers: int               # 144,000,000
    annual_revenue: float        # $46,844,125
    base_valuation: float        # $936,882,500

    # Valuation parameters
    tier: str                    # "mega" / "established" / "rising"
    multiple_used: int           # 20x
    growth_factor: float         # 1.20 (+20%)
    momentum: str                # "MEGA TRENDING"

    # Metadata
    data_source: str             # "Spotify Web API"
    last_updated: str            # ISO timestamp
    success: bool                # True if no errors
