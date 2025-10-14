# coding: utf-8
"""
MusicOracleAgent - ABSOLUTE MINIMAL TEST
Testing with smallest possible Model
"""
from uagents import Agent, Context, Model


# ============================================================================
# MESSAGE MODEL - MINIMAL
# ============================================================================

class TestMessage(Model):
    """Minimal test message"""
    text: str


# ============================================================================
# AGENT DEFINITION
# ============================================================================

agent = Agent()


# ============================================================================
# MESSAGE HANDLER
# ============================================================================

@agent.on_message(model=TestMessage)
async def receive_test(ctx: Context, sender: str, msg: TestMessage):
    """Receive test message"""
    ctx.logger.info(f"Received: {msg.text} from {sender}")


# ============================================================================
# STARTUP
# ============================================================================

@agent.on_event("startup")
async def startup(ctx: Context):
    ctx.logger.info(f"Minimal Test Agent Started: {agent.address}")


if __name__ == "__main__":
    agent.run()
