"""
JobwinResume — Quick AI Test
Run this to test if your Anthropic API key and credits are working.
"""

import os
import anthropic
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("ANTHROPIC_API_KEY")

print("🔍 Checking setup...")
print(f"   API Key found: {'✅ Yes' if api_key else '❌ No — check your .env file'}")

if not api_key:
    print("\n❌ No API key found in .env file.")
    print("Open .env file and make sure this line exists:")
    print("ANTHROPIC_API_KEY=your_actual_key_here")
    exit()

print("\n🤖 Testing Claude AI connection...")

try:
    client = anthropic.Anthropic(api_key=api_key)

    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=100,
        messages=[{
            "role": "user",
            "content": "Reply with exactly this: RESUMEORA_AI_WORKING"
        }]
    )

    reply = response.content[0].text.strip()

    if "RESUMEORA_AI_WORKING" in reply:
        print("✅ Claude AI is connected and working!")
        print("✅ Your credits are active!")
        print("\n🎉 Everything is ready. Run: python3 ai_engine.py")
    else:
        print(f"✅ Connected! Response: {reply}")

except anthropic.AuthenticationError:
    print("❌ API key is wrong or invalid.")
    print("Go to console.anthropic.com → API Keys → copy the key again")

except Exception as e:
    error_msg = str(e)
    if "credit balance is too low" in error_msg or "billing" in error_msg.lower():
        print("❌ Credits not active yet.")
        print("\nDo this:")
        print("1. Go to console.anthropic.com")
        print("2. Click 'Plans & Billing'")
        print("3. Check your balance — should show $5.00")
        print("4. If it shows $0 — the payment may still be processing")
        print("5. Wait 2-3 minutes and run this again")
    else:
        print(f"❌ Error: {error_msg}")
