"""
AI Service — Gemini 2.5 Flash
- Mood classification (structured JSON output)
- Conversational wellness responses
- Journal AI insights
- Weekly analytics summary
"""
import json
import re
from google import genai
from loguru import logger

from app.config import get_settings
from app.schemas.schemas import MoodAnalysis
from app.core.exceptions import AIServiceError

settings = get_settings()

# ─── Versioned Prompts ──────────────────────────────────────
MOOD_CLASSIFIER_PROMPT = """You are an empathetic mental wellness analyst.

Analyse the user's message and return ONLY a valid JSON object — no markdown, no explanation, JSON only.

Required JSON structure:
{
  "mood": "<one of: happy | sad | stressed | relaxed | neutral>",
  "emotion": "<fine-grained label e.g. anxious, melancholic, joyful, content, frustrated, calm>",
  "confidence": <float 0.0-1.0>,
  "mood_score": <integer 1-10 where 1=very negative, 10=very positive>,
  "reasoning": "<one sentence explanation>"
}

Scoring guide: happy=8-10, relaxed=6-8, neutral=5, stressed=3-5, sad=1-3
"""

WELLNESS_ASSISTANT_PROMPT = """You are EchoMind, a warm and empathetic AI mental wellness assistant.

Guidelines:
- Be supportive, non-judgmental, and evidence-based
- Keep responses concise (2-4 sentences) unless user asks for more
- Acknowledge the user's feelings before offering suggestions
- Never diagnose or replace professional mental health care
- If user shows signs of crisis, gently suggest professional resources
- Detected user mood: {mood} (confidence: {confidence:.0%})
- Conversation context: {context}
"""

JOURNAL_INSIGHT_PROMPT = """You are a compassionate wellness coach reviewing a user's journal entry.

Provide a brief, empathetic insight (2-3 sentences) about the themes or emotions in this entry.
Be warm, specific to their words, and offer one gentle positive reflection.
Do not be generic. Do not start with "I".

Journal entry:
{content}
"""

WEEKLY_SUMMARY_PROMPT = """You are EchoMind reviewing a user's wellness data for the past week.

Mood data: {mood_data}
Total entries: {total}
Dominant mood: {dominant_mood}

Write a warm, personalised weekly wellness summary (3-4 sentences). 
Highlight one positive pattern and one gentle suggestion for improvement.
Be specific to the data, not generic.
"""


class AIService:
    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model = "gemini-2.5-flash"

    async def classify_mood(self, message: str) -> MoodAnalysis:
        """Run structured mood classification on a user message."""
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=f"{MOOD_CLASSIFIER_PROMPT}\n\nUser message: {message}",
            )
            raw = response.text.strip()
            # Strip any accidental markdown fences
            raw = re.sub(r"^```(?:json)?\s*", "", raw)
            raw = re.sub(r"\s*```$", "", raw)
            data = json.loads(raw)
            return MoodAnalysis(**data)
        except (json.JSONDecodeError, KeyError) as e:
            logger.warning(f"Mood classification parse error: {e} | raw={response.text[:200]}")
            # Graceful fallback
            return MoodAnalysis(
                mood="neutral", emotion="uncertain", confidence=0.3,
                mood_score=5, reasoning="Could not parse mood"
            )
        except Exception as e:
            logger.exception(f"Gemini mood classification failed: {e}")
            raise AIServiceError("Gemini", str(e))

    async def generate_response(
        self,
        user_message: str,
        mood_analysis: MoodAnalysis,
        conversation_history: list[dict],
    ) -> str:
        """Generate a contextual wellness response."""
        try:
            # Build context from last 6 messages
            context = "\n".join(
                f"{m['role'].capitalize()}: {m['content']}"
                for m in conversation_history[-6:]
            ) or "No prior context."

            system = WELLNESS_ASSISTANT_PROMPT.format(
                mood=mood_analysis.mood,
                confidence=mood_analysis.confidence,
                context=context,
            )
            prompt = f"{system}\n\nUser: {user_message}\nEchoMind:"

            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
            )
            return response.text.strip()
        except Exception as e:
            logger.exception(f"Gemini response generation failed: {e}")
            raise AIServiceError("Gemini", str(e))

    async def generate_journal_insight(self, content: str) -> str:
        """Generate AI insight for a journal entry."""
        try:
            prompt = JOURNAL_INSIGHT_PROMPT.format(content=content[:2000])
            response = self.client.models.generate_content(model=self.model, contents=prompt)
            return response.text.strip()
        except Exception as e:
            logger.exception(f"Journal insight generation failed: {e}")
            return "Keep writing — every entry is a step toward self-understanding."

    async def generate_weekly_summary(
        self, mood_entries: list[dict], dominant_mood: str
    ) -> str:
        """Generate a personalised weekly wellness summary."""
        try:
            mood_data = json.dumps([
                {"mood": e["mood"], "score": e["mood_score"]} for e in mood_entries[:20]
            ])
            prompt = WEEKLY_SUMMARY_PROMPT.format(
                mood_data=mood_data,
                total=len(mood_entries),
                dominant_mood=dominant_mood,
            )
            response = self.client.models.generate_content(model=self.model, contents=prompt)
            return response.text.strip()
        except Exception as e:
            logger.exception(f"Weekly summary generation failed: {e}")
            return "You showed up this week. That matters most."


# Singleton
ai_service = AIService()
