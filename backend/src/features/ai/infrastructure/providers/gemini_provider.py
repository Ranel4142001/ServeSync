import json
import re
from typing import Dict, Any, List
import google.generativeai as genai
from src.config import settings
from src.features.ai.domain.ai_provider import IAIProvider

class GeminiProvider(IAIProvider):
    """
    Gemini implementation of the AI Provider using official Google Generative AI SDK.
    """
    def __init__(self) -> None:
        api_key = settings.GEMINI_API_KEY or ""
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel("gemini-1.5-flash")

    def triage_ticket(self, title: str, body: str) -> Dict[str, Any]:
        prompt = f"""
You are a customer service manager for a SaaS helpdesk platform.
Analyze this support ticket and respond with ONLY a JSON object.
Do not include any text outside the JSON.

Ticket Title: {title}
Ticket Body: {body}

Respond with this exact JSON format:
{{
  "category": "one of: Billing, Bug, Feature Request, Account, Technical, General",
  "priority": "one of: LOW, MEDIUM, HIGH, URGENT",
  "summary": "one sentence summary of the issue"
}}

Rules for priority:
- URGENT: system is down, data loss, security issue
- HIGH: major feature broken, blocking work
- MEDIUM: minor feature issue, workaround exists
- LOW: cosmetic issue, general question
""".strip()

        try:
            response = self.model.generate_content(prompt)
            text = response.text
            # Strip markdown code blocks
            cleaned = re.sub(r'^```json\s*|```$', '', text.strip(), flags=re.MULTILINE).strip()
            parsed = json.loads(cleaned)
            return {
                "category": parsed.get("category", "General"),
                "priority": parsed.get("priority", "MEDIUM"),
                "summary": parsed.get("summary", "No summary available")
            }
        except Exception as e:
            print(f"Gemini triage error: {e}")
            return {
                "category": "General",
                "priority": "MEDIUM",
                "summary": "AI triage unavailable"
            }

    def draft_response(
        self, 
        ticket_title: str, 
        ticket_category: str, 
        messages: List[Dict[str, str]]
    ) -> Dict[str, str]:
        conversation_history = "\n\n".join(
            [f"{m['role'].upper()}: {m['body']}" for m in messages]
        )

        prompt = f"""
You are a professional customer support agent for a SaaS platform.
Your tone is helpful, empathetic, and concise.
Draft a response to the latest client message in this support conversation.

Ticket Title: {ticket_title}
Category: {ticket_category}

Conversation History:
{conversation_history}

Write ONLY the response text.
Do not include labels, greetings like "Dear Customer", or sign-offs.
Keep it under 150 words.
Be specific to the issue described.
""".strip()

        try:
            response = self.model.generate_content(prompt)
            draft_text = response.text.strip()
            return {"draft": draft_text}
        except Exception as e:
            print(f"Gemini draft error: {e}")
            return {
                "draft": "Thank you for reaching out. We have received your message and will get back to you as soon as possible."
            }
