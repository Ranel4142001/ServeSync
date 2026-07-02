import { GoogleGenerativeAI } from "@google/generative-ai";
import { IAIProvider, TriageResult, DraftResult } from "../../domain/IAIProvider";

export class GeminiProvider implements IAIProvider {
  // gemini-1.5-flash — fast and free-tier friendly
  private readonly model;

  constructor() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

    this.model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });
  }

  // Analyze a ticket and return category, priority, and summary
  async triageTicket(params: {
    title: string;
    body: string;
  }): Promise<TriageResult> {
    // Prompt instructs Gemini to respond in strict JSON only
    const prompt = `
You are a customer service manager for a SaaS helpdesk platform.
Analyze this support ticket and respond with ONLY a JSON object.
Do not include any text outside the JSON.

Ticket Title: ${params.title}
Ticket Body: ${params.body}

Respond with this exact JSON format:
{
  "category": "one of: Billing, Bug, Feature Request, Account, Technical, General",
  "priority": "one of: LOW, MEDIUM, HIGH, URGENT",
  "summary": "one sentence summary of the issue"
}

Rules for priority:
- URGENT: system is down, data loss, security issue
- HIGH: major feature broken, blocking work
- MEDIUM: minor feature issue, workaround exists
- LOW: cosmetic issue, general question
    `.trim();

    try {
      const response = await this.model.generateContent(prompt);
      const text = response.response.text();

      // Strip markdown code fences Gemini sometimes wraps around JSON
      const cleaned = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(cleaned);

      return {
        category: parsed.category ?? "General",
        priority: parsed.priority ?? "MEDIUM",
        summary: parsed.summary ?? "No summary available",
      };
    } catch (error) {
      // Return safe defaults if Gemini fails or returns invalid JSON
      console.error("Gemini triage error:", error);
      return {
        category: "General",
        priority: "MEDIUM",
        summary: "AI triage unavailable",
      };
    }
  }

  // Draft a reply based on the full conversation; agent reviews before sending
  async draftResponse(params: {
    ticketTitle: string;
    ticketCategory: string;
    messages: {
      role: "client" | "agent";
      body: string;
    }[];
  }): Promise<DraftResult> {
    // Format conversation history so Gemini has full context
    const conversation = params.messages
      .map((m) => `${m.role.toUpperCase()}: ${m.body}`)
      .join("\n\n");

    const prompt = `
You are a professional customer support agent for a SaaS platform.
Your tone is helpful, empathetic, and concise.
Draft a response to the latest client message in this support conversation.

Ticket Title: ${params.ticketTitle}
Category: ${params.ticketCategory}

Conversation History:
${conversation}

Write ONLY the response text.
Do not include labels, greetings like "Dear Customer", or sign-offs.
Keep it under 150 words.
Be specific to the issue described.
    `.trim();

    try {
      const response = await this.model.generateContent(prompt);
      const draft = response.response.text().trim();

      return { draft };
    } catch (error) {
      // Return a safe fallback message if Gemini fails
      console.error("Gemini draft error:", error);
      return {
        draft:
          "Thank you for reaching out. We have received your message and will get back to you as soon as possible.",
      };
    }
  }
}
