import axios from "axios";
import { logger } from "./logger";

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ProviderConfig {
  name: string;
  type: "groq" | "gemini" | "openai" | "huggingface";
  apiKey: string;
  model: string;
}

const IDENTITY_QUESTIONS = [
  "who are you",
  "what are you",
  "who made you",
  "who created you",
  "who built you",
  "are you chatgpt",
  "are you gpt",
  "are you gemini",
  "are you claude",
  "are you ai",
  "your name",
  "what is your name",
  "who is bishal",
  "tell me about yourself",
  "introduce yourself",
];

function isIdentityQuestion(message: string): boolean {
  const lower = message.toLowerCase();
  return IDENTITY_QUESTIONS.some((q) => lower.includes(q));
}

const IDENTITY_RESPONSE = `I'm **Bishal's Assistant** — an AI study companion built into ScorpStudy by Bishal. I'm here to help you study smarter with features like quiz generation, flashcard creation, text summarization, mind maps, translations, and much more. 

I was crafted by **Bishal** as part of ScorpStudy, an AI-powered study platform for college students. How can I help you study today? 📚`;

function getProviders(): ProviderConfig[] {
  const providers: ProviderConfig[] = [];

  for (let i = 1; i <= 5; i++) {
    const key = process.env[`GROQ_API_KEY_${i}`];
    if (key) {
      providers.push({
        name: `Groq-${i}`,
        type: "groq",
        apiKey: key,
        model: "llama-3.3-70b-versatile",
      });
    }
  }

  for (let i = 1; i <= 5; i++) {
    const key = process.env[`GEMINI_API_KEY_${i}`];
    if (key) {
      providers.push({
        name: `Gemini-${i}`,
        type: "gemini",
        apiKey: key,
        model: "gemini-2.0-flash",
      });
    }
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    providers.push({
      name: "OpenAI",
      type: "openai",
      apiKey: openaiKey,
      model: "gpt-4o-mini",
    });
  }

  const hfKey = process.env.HUGGINGFACE_API_KEY;
  if (hfKey) {
    providers.push({
      name: "HuggingFace",
      type: "huggingface",
      apiKey: hfKey,
      model: "mistralai/Mistral-7B-Instruct-v0.2",
    });
  }

  return providers;
}

async function callGroq(
  provider: ProviderConfig,
  messages: AIMessage[],
  systemPrompt?: string
): Promise<string> {
  const msgs = systemPrompt
    ? [{ role: "system", content: systemPrompt }, ...messages]
    : messages;

  const resp = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    { model: provider.model, messages: msgs, max_tokens: 4096, temperature: 0.7 },
    {
      headers: { Authorization: `Bearer ${provider.apiKey}`, "Content-Type": "application/json" },
      timeout: 30000,
    }
  );
  return resp.data.choices[0].message.content as string;
}

async function callGemini(
  provider: ProviderConfig,
  messages: AIMessage[],
  systemPrompt?: string
): Promise<string> {
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const body: Record<string, unknown> = { contents };
  if (systemPrompt) {
    body.systemInstruction = { parts: [{ text: systemPrompt }] };
  }

  const resp = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${provider.model}:generateContent?key=${provider.apiKey}`,
    body,
    { headers: { "Content-Type": "application/json" }, timeout: 30000 }
  );
  return resp.data.candidates[0].content.parts[0].text as string;
}

async function callOpenAI(
  provider: ProviderConfig,
  messages: AIMessage[],
  systemPrompt?: string
): Promise<string> {
  const msgs = systemPrompt
    ? [{ role: "system", content: systemPrompt }, ...messages]
    : messages;

  const resp = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    { model: provider.model, messages: msgs, max_tokens: 4096, temperature: 0.7 },
    {
      headers: { Authorization: `Bearer ${provider.apiKey}`, "Content-Type": "application/json" },
      timeout: 30000,
    }
  );
  return resp.data.choices[0].message.content as string;
}

async function callHuggingFace(
  provider: ProviderConfig,
  messages: AIMessage[],
  systemPrompt?: string
): Promise<string> {
  const prompt = [
    systemPrompt ? `[INST] ${systemPrompt} [/INST]` : "",
    ...messages.map((m) =>
      m.role === "user" ? `[INST] ${m.content} [/INST]` : m.content
    ),
  ]
    .filter(Boolean)
    .join("\n");

  const resp = await axios.post(
    `https://api-inference.huggingface.co/models/${provider.model}`,
    { inputs: prompt, parameters: { max_new_tokens: 1024, temperature: 0.7 } },
    {
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 60000,
    }
  );

  if (Array.isArray(resp.data)) {
    return (resp.data[0]?.generated_text || "").replace(prompt, "").trim();
  }
  return String(resp.data?.generated_text || "").replace(prompt, "").trim();
}

async function callProvider(
  provider: ProviderConfig,
  messages: AIMessage[],
  systemPrompt?: string
): Promise<string> {
  switch (provider.type) {
    case "groq":
      return callGroq(provider, messages, systemPrompt);
    case "gemini":
      return callGemini(provider, messages, systemPrompt);
    case "openai":
      return callOpenAI(provider, messages, systemPrompt);
    case "huggingface":
      return callHuggingFace(provider, messages, systemPrompt);
  }
}

export async function generateText(
  messages: AIMessage[],
  systemPrompt?: string
): Promise<{ text: string; provider: string }> {
  const lastMessage = messages[messages.length - 1]?.content || "";
  if (isIdentityQuestion(lastMessage)) {
    return { text: IDENTITY_RESPONSE, provider: "static" };
  }

  const providers = getProviders();
  const errors: string[] = [];

  for (const provider of providers) {
    try {
      const text = await callProvider(provider, messages, systemPrompt);
      if (text && text.trim()) {
        return { text: text.trim(), provider: provider.name };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.warn({ provider: provider.name, error: msg }, "AI provider failed, trying next");
      errors.push(`${provider.name}: ${msg}`);
    }
  }

  throw new Error(`All AI providers failed: ${errors.join("; ")}`);
}

export async function generateJSON<T>(
  messages: AIMessage[],
  systemPrompt?: string
): Promise<{ data: T; provider: string }> {
  const result = await generateText(messages, (systemPrompt || "") + "\n\nIMPORTANT: Respond ONLY with valid JSON, no markdown, no explanation.");

  let jsonText = result.text.trim();
  const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonText = jsonMatch[1].trim();
  }
  const firstBrace = jsonText.search(/[\[{]/);
  if (firstBrace > 0) {
    jsonText = jsonText.slice(firstBrace);
  }

  const data = JSON.parse(jsonText) as T;
  return { data, provider: result.provider };
}
