import asyncio
import os
import anthropic
from dotenv import load_dotenv

load_dotenv()

async def test():
    client = anthropic.AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    models = ["claude-3-5-sonnet-20241022", "claude-3-5-sonnet-20240620", "claude-3-sonnet-20240229", "claude-3-haiku-20240307"]
    for model in models:
        try:
            print(f"Testing model: {model}...")
            res = await client.messages.create(
                model=model,
                max_tokens=10,
                messages=[{"role": "user", "content": "Hi"}]
            )
            print(f"✅ Success with {model}: {res.content[0].text}")
            return model
        except Exception as e:
            print(f"❌ Failure with {model}: {e}")
    return None

if __name__ == "__main__":
    asyncio.run(test())
