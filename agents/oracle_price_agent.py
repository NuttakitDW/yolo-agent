# coding: utf-8
"""
SynthX Oracle Price Agent
Calculates fair prices for unlisted companies using multi-method valuation
Built for ETH Online 2025 Hackathon - ASI Alliance Prize
"""
from datetime import datetime
from uuid import uuid4
from uagents import Agent, Context, Protocol
from uagents_core.contrib.protocols.chat import (
    ChatAcknowledgement,
    ChatMessage,
    EndSessionContent,
    StartSessionContent,
    TextContent,
    chat_protocol_spec,
)

# Create agent
agent = Agent(
    name="synthx_oracle",
    seed="synthx_oracle_mainnet_seed_2024",
    port=8004,
    endpoint=["http://localhost:8004/submit"],
)

# Company valuation data (in production, this would come from APIs)
COMPANY_DATA = {
    "OPENAI": {
        "name": "OpenAI",
        "ticker": "OPENAI",
        "funding_round": {"valuation": 157e9, "shares": 1e9},  # $157B valuation, 1B shares
        "revenue": {"arr": 1.7e9, "multiple": 90, "shares": 1e9},  # $1.7B ARR, 90x multiple
        "secondary_market": 165.00,  # Secondary market price
        "confidence": 0.85,
        "description": "AI research company behind ChatGPT"
    },
    "ANTHROPIC": {
        "name": "Anthropic",
        "ticker": "ANTHROPIC",
        "funding_round": {"valuation": 18.4e9, "shares": 500e6},
        "revenue": {"arr": 0.85e9, "multiple": 50, "shares": 500e6},
        "secondary_market": 39.50,
        "confidence": 0.82,
        "description": "AI safety company behind Claude"
    },
    "SPACEX": {
        "name": "SpaceX",
        "ticker": "SPACEX",
        "funding_round": {"valuation": 180e9, "shares": 3e9},
        "revenue": {"arr": 8.7e9, "multiple": 22, "shares": 3e9},
        "secondary_market": 62.00,
        "confidence": 0.88,
        "description": "Aerospace manufacturer and space transportation"
    },
    "STRIPE": {
        "name": "Stripe",
        "ticker": "STRIPE",
        "funding_round": {"valuation": 65e9, "shares": 1.2e9},
        "revenue": {"arr": 14e9, "multiple": 5.5, "shares": 1.2e9},
        "secondary_market": 56.00,
        "confidence": 0.90,
        "description": "Online payment processing platform"
    }
}


def calculate_fair_price(ticker: str) -> dict:
    """
    Calculate fair price using 3-method weighted valuation

    Args:
        ticker: Company ticker (e.g., "OPENAI")

    Returns:
        Dictionary with price, confidence, and breakdown
    """
    if ticker.upper() not in COMPANY_DATA:
        return None

    data = COMPANY_DATA[ticker.upper()]

    # Method 1: Funding Round Valuation (40% weight)
    funding_price = data["funding_round"]["valuation"] / data["funding_round"]["shares"]

    # Method 2: Revenue Multiple (30% weight)
    revenue_price = (data["revenue"]["arr"] * data["revenue"]["multiple"]) / data["revenue"]["shares"]

    # Method 3: Secondary Market (30% weight)
    secondary_price = data["secondary_market"]

    # Calculate weighted average
    fair_price = (funding_price * 0.40) + (revenue_price * 0.30) + (secondary_price * 0.30)

    return {
        "company": data["name"],
        "ticker": data["ticker"],
        "fair_price": round(fair_price, 2),
        "confidence": data["confidence"],
        "breakdown": {
            "funding_round": {"price": round(funding_price, 2), "weight": 0.40},
            "revenue_multiple": {"price": round(revenue_price, 2), "weight": 0.30},
            "secondary_market": {"price": round(secondary_price, 2), "weight": 0.30}
        },
        "description": data["description"],
        "last_updated": datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
    }


def extract_company_ticker(text: str) -> str:
    """
    Extract company ticker from user message

    Args:
        text: User's message

    Returns:
        Ticker symbol or None if not found
    """
    text_upper = text.upper()

    # Check for exact ticker match
    for ticker in COMPANY_DATA.keys():
        if ticker in text_upper:
            return ticker

    # Check for company name match
    for ticker, data in COMPANY_DATA.items():
        if data["name"].upper() in text_upper:
            return ticker

    return None


def format_price_response(price_data: dict) -> str:
    """
    Format price data into readable response

    Args:
        price_data: Price calculation result

    Returns:
        Formatted string response
    """
    conf_pct = int(price_data["confidence"] * 100)

    response = f"""💎 SynthX Oracle - {price_data['company']} Valuation

Fair Price: ${price_data['fair_price']:.2f} per share
Confidence: {conf_pct}%

📊 Valuation Breakdown:
• Funding Round: ${price_data['breakdown']['funding_round']['price']:.2f} (40% weight)
• Revenue Multiple: ${price_data['breakdown']['revenue_multiple']['price']:.2f} (30% weight)
• Secondary Market: ${price_data['breakdown']['secondary_market']['price']:.2f} (30% weight)

About: {price_data['description']}
Last Updated: {price_data['last_updated']}

This is an estimated fair value for educational purposes. Not financial advice.
Built with ASI Alliance for ETH Online 2025 🚀
"""
    return response


def get_help_message() -> str:
    """Return help message with supported companies"""
    companies = []
    for ticker, data in COMPANY_DATA.items():
        companies.append(f"• {data['name']} ({ticker}) - {data['description']}")

    companies_list = "\n".join(companies)

    return f"""💎 SynthX Oracle - Fair Price Discovery for Unlisted Companies

I calculate fair prices using 3-method weighted valuation:
✓ Funding round valuations (40%)
✓ Revenue multiples (30%)
✓ Secondary market prices (30%)

📈 Supported Companies:
{companies_list}

💬 How to use:
Just ask: "What is OpenAI worth?" or "Give me SpaceX price"

Built for ETH Online 2025 with ASI Alliance 🚀
"""


# Utility function to create ChatMessage
def create_text_chat(text: str, end_session: bool = False) -> ChatMessage:
    """Create a ChatMessage with text content"""
    content = [TextContent(type="text", text=text)]
    if end_session:
        content.append(EndSessionContent(type="end_session"))

    return ChatMessage(
        timestamp=datetime.utcnow(),
        msg_id=uuid4(),
        content=content,
    )


# Initialize chat protocol
chat_proto = Protocol(spec=chat_protocol_spec)


@chat_proto.on_message(ChatMessage)
async def handle_message(ctx: Context, sender: str, msg: ChatMessage):
    """Handle incoming chat messages"""
    ctx.logger.info(f"Received message from {sender}")

    # Always send acknowledgement first
    await ctx.send(
        sender,
        ChatAcknowledgement(
            timestamp=datetime.utcnow(),
            acknowledged_msg_id=msg.msg_id
        )
    )

    # Process each content item
    for item in msg.content:
        # Session start
        if isinstance(item, StartSessionContent):
            ctx.logger.info(f"Session started with {sender}")
            welcome_msg = create_text_chat(get_help_message())
            await ctx.send(sender, welcome_msg)

        # Handle text messages
        elif isinstance(item, TextContent):
            user_text = item.text
            ctx.logger.info(f"Processing query: {user_text}")

            # Check for help request
            if any(word in user_text.lower() for word in ["help", "how", "what can"]):
                response = create_text_chat(get_help_message())
                await ctx.send(sender, response)
                continue

            # Check for greeting
            if any(word in user_text.lower() for word in ["hi", "hello", "hey"]):
                greeting = """👋 Hello! I'm the SynthX Oracle Agent.

I provide fair price estimates for unlisted companies like OpenAI, Anthropic, SpaceX, and Stripe.

Try asking: "What is OpenAI worth?" or type "help" for more info.
"""
                response = create_text_chat(greeting)
                await ctx.send(sender, response)
                continue

            # Extract company ticker and calculate price
            ticker = extract_company_ticker(user_text)

            if ticker:
                ctx.logger.info(f"Calculating price for {ticker}")
                price_data = calculate_fair_price(ticker)

                if price_data:
                    response_text = format_price_response(price_data)
                    response = create_text_chat(response_text)
                    await ctx.send(sender, response)
                else:
                    error_msg = create_text_chat("Sorry, I couldn't calculate the price. Please try again.")
                    await ctx.send(sender, error_msg)
            else:
                # Company not found
                not_found = f"""I don't recognize that company.

I currently track these unlisted companies:
• OpenAI (OPENAI) - ChatGPT creator
• Anthropic (ANTHROPIC) - Claude AI
• SpaceX (SPACEX) - Aerospace
• Stripe (STRIPE) - Payments

Which would you like to know about?
"""
                response = create_text_chat(not_found)
                await ctx.send(sender, response)

        # Session end
        elif isinstance(item, EndSessionContent):
            ctx.logger.info(f"Session ended with {sender}")
            goodbye = create_text_chat("Thanks for using SynthX Oracle! 💎", end_session=True)
            await ctx.send(sender, goodbye)

        # Unexpected content type
        else:
            ctx.logger.warning(f"Received unexpected content type from {sender}: {type(item)}")


@chat_proto.on_message(ChatAcknowledgement)
async def handle_acknowledgement(ctx: Context, sender: str, msg: ChatAcknowledgement):
    """Handle acknowledgements for sent messages"""
    ctx.logger.info(f"Received acknowledgement from {sender} for message {msg.acknowledged_msg_id}")


# Include chat protocol and publish manifest
agent.include(chat_proto, publish_manifest=True)


@agent.on_event("startup")
async def startup(ctx: Context):
    """Log startup information"""
    ctx.logger.info("=" * 70)
    ctx.logger.info("💎 SynthX Oracle Price Agent Started")
    ctx.logger.info("=" * 70)
    ctx.logger.info(f"Agent Name: {agent.name}")
    ctx.logger.info(f"Agent Address: {agent.address}")
    ctx.logger.info(f"Port: {agent._port}")
    ctx.logger.info(f"Supported Companies: {', '.join(COMPANY_DATA.keys())}")
    ctx.logger.info("=" * 70)
    ctx.logger.info("Ready to provide fair price estimates! 💎")
    ctx.logger.info("Deploy to Agentverse for ASI:One discoverability")
    ctx.logger.info("=" * 70)


@agent.on_event("shutdown")
async def shutdown(ctx: Context):
    """Log shutdown"""
    ctx.logger.info("💎 SynthX Oracle Agent shutting down...")


if __name__ == "__main__":
    agent.run()
