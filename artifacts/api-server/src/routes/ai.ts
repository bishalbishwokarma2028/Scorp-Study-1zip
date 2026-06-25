import { Router } from "express";
import { generateText, generateJSON } from "../lib/aiProvider";
import {
  checkAiLimit,
  checkImageLimit,
  incrementAiQueries,
  incrementImages,
  AI_QUERIES_LIMIT,
  IMAGES_LIMIT,
} from "../lib/usageService";

const router = Router();

const LIMIT_ERROR = { error: "limit_reached", message: "Daily AI query limit reached (30/day). Come back tomorrow!" };
const IMAGE_LIMIT_ERROR = { error: "limit_reached", message: "Daily image limit reached (3/day). Come back tomorrow!" };

const BISHAL_SYSTEM = `You are Bishal's Assistant, an AI study companion embedded in ScorpStudy — a study platform for college students built by Bishal. You are helpful, encouraging, and knowledgeable. You specialize in helping students understand complex topics, create study materials, and ace their exams. Keep responses concise but thorough. Use markdown formatting where appropriate.`;

router.post("/chat", async (req, res) => {
  const { message, subject, conversationHistory = [], userId } = req.body;

  const canQuery = await checkAiLimit(userId);
  if (!canQuery) return res.status(429).json(LIMIT_ERROR);

  const msgs = [
    ...(conversationHistory || []),
    { role: "user" as const, content: message },
  ];
  const systemPrompt = subject
    ? `${BISHAL_SYSTEM}\n\nCurrent subject context: ${subject}`
    : BISHAL_SYSTEM;

  const { text, provider } = await generateText(msgs, systemPrompt);
  if (provider !== "static") await incrementAiQueries(userId);

  return res.json({ response: text, fromCache: false, provider });
});

router.post("/quiz", async (req, res) => {
  const { topic, notes, numQuestions = 5, difficulty = "medium", questionType = "multiple_choice", userId } = req.body;

  const canQuery = await checkAiLimit(userId);
  if (!canQuery) return res.status(429).json(LIMIT_ERROR);

  const prompt = `Generate ${numQuestions} ${questionType.replace("_", " ")} quiz questions about "${topic || "the provided notes"}" at ${difficulty} difficulty level.
${notes ? `Notes/Context:\n${notes}` : ""}

Return JSON: { "questions": [ { "question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "A", "explanation": "...", "type": "${questionType}" } ], "topic": "..." }
For true_false questions, options should be ["True", "False"].
For short_answer questions, options can be empty [].`;

  const { data, provider } = await generateJSON<{ questions: unknown[]; topic: string }>(
    [{ role: "user", content: prompt }],
    BISHAL_SYSTEM
  );
  await incrementAiQueries(userId);

  return res.json({ ...data, provider });
});

router.post("/flashcards", async (req, res) => {
  const { topic, notes, numCards = 10, userId } = req.body;

  const canQuery = await checkAiLimit(userId);
  if (!canQuery) return res.status(429).json(LIMIT_ERROR);

  const prompt = `Generate ${numCards} flashcards for studying "${topic || "the provided notes"}".
${notes ? `Notes/Context:\n${notes}` : ""}

Return JSON: { "cards": [ { "front": "Question or term", "back": "Answer or definition" } ], "topic": "..." }`;

  const { data, provider } = await generateJSON<{ cards: unknown[]; topic: string }>(
    [{ role: "user", content: prompt }],
    BISHAL_SYSTEM
  );
  await incrementAiQueries(userId);

  return res.json({ ...data, provider });
});

router.post("/summarize", async (req, res) => {
  const { text, url, length = "standard", userId } = req.body;

  const canQuery = await checkAiLimit(userId);
  if (!canQuery) return res.status(429).json(LIMIT_ERROR);

  const lengthInstruction = length === "brief" ? "2-3 sentences" : length === "detailed" ? "5-7 paragraphs" : "3-4 paragraphs";
  const content = text || `Please summarize the content from: ${url}`;

  const prompt = `Summarize the following text in ${lengthInstruction}. Then extract 5-8 key points, generate 3-5 potential exam questions, and identify 3-5 important vocabulary words with definitions.

Text to summarize:
${content}

Return JSON: { "summary": "...", "keyPoints": ["...", "..."], "examQuestions": ["...", "..."], "vocabulary": [{ "word": "...", "definition": "..." }] }`;

  const { data, provider } = await generateJSON<{
    summary: string;
    keyPoints: string[];
    examQuestions: string[];
    vocabulary: { word: string; definition: string }[];
  }>([{ role: "user", content: prompt }], BISHAL_SYSTEM);
  await incrementAiQueries(userId);

  return res.json({ ...data, provider });
});

router.post("/translate", async (req, res) => {
  const { text, targetLanguage, sourceLanguage, userId } = req.body;

  const canQuery = await checkAiLimit(userId);
  if (!canQuery) return res.status(429).json(LIMIT_ERROR);

  const prompt = `Translate the following text${sourceLanguage ? ` from ${sourceLanguage}` : ""} to ${targetLanguage}. 
If source language was not specified, detect it automatically.

Text: ${text}

Return JSON: { "translation": "...", "detectedLanguage": "..." }`;

  const { data, provider } = await generateJSON<{ translation: string; detectedLanguage?: string }>(
    [{ role: "user", content: prompt }],
    BISHAL_SYSTEM
  );
  await incrementAiQueries(userId);

  return res.json({ ...data, provider });
});

router.post("/mindmap", async (req, res) => {
  const { topic, notes, userId } = req.body;

  const canQuery = await checkAiLimit(userId);
  if (!canQuery) return res.status(429).json(LIMIT_ERROR);

  const prompt = `Create a comprehensive mind map for the topic: "${topic || "the provided notes"}".
${notes ? `Context/Notes:\n${notes}` : ""}

Return JSON: { "center": "Main Topic", "branches": [ { "label": "Branch 1", "children": ["subtopic 1", "subtopic 2"] }, ... ] }
Include 5-8 branches, each with 2-5 children.`;

  const { data, provider } = await generateJSON<{ center: string; branches: { label: string; children: string[] }[] }>(
    [{ role: "user", content: prompt }],
    BISHAL_SYSTEM
  );
  await incrementAiQueries(userId);

  return res.json({ ...data, provider });
});

router.post("/enhance-prompt", async (req, res) => {
  const { prompt, userId } = req.body;

  const canQuery = await checkAiLimit(userId);
  if (!canQuery) return res.status(429).json(LIMIT_ERROR);

  const enhancePrompt = `Enhance this image generation prompt to be more detailed, vivid, and suitable for AI art generation. Keep it under 200 words.

Original prompt: ${prompt}

Return JSON: { "enhancedPrompt": "..." }`;

  const { data, provider } = await generateJSON<{ enhancedPrompt: string }>(
    [{ role: "user", content: enhancePrompt }]
  );
  await incrementAiQueries(userId);

  return res.json({ ...data, provider });
});

router.post("/formula", async (req, res) => {
  const { question, userId } = req.body;

  const canQuery = await checkAiLimit(userId);
  if (!canQuery) return res.status(429).json(LIMIT_ERROR);

  const systemPrompt = `${BISHAL_SYSTEM}\n\nYou are a math and science formula expert. Explain formulas clearly with examples.`;
  const { text, provider } = await generateText(
    [{ role: "user", content: question }],
    systemPrompt
  );
  if (provider !== "static") await incrementAiQueries(userId);

  return res.json({ response: text, fromCache: false, provider });
});

router.post("/enhance-note", async (req, res) => {
  const { content, userId } = req.body;

  const canQuery = await checkAiLimit(userId);
  if (!canQuery) return res.status(429).json(LIMIT_ERROR);

  const prompt = `Enhance the following study note for clarity, structure, and completeness. Improve organization, fix grammar, add helpful context where needed.

Note:
${content}`;

  const { text, provider } = await generateText([{ role: "user", content: prompt }], BISHAL_SYSTEM);
  await incrementAiQueries(userId);

  return res.json({ response: text, fromCache: false, provider });
});

router.post("/summarize-note", async (req, res) => {
  const { content, userId } = req.body;

  const canQuery = await checkAiLimit(userId);
  if (!canQuery) return res.status(429).json(LIMIT_ERROR);

  const prompt = `Create a concise summary of this study note, highlighting the most important concepts and key takeaways.

Note:
${content}`;

  const { text, provider } = await generateText([{ role: "user", content: prompt }], BISHAL_SYSTEM);
  await incrementAiQueries(userId);

  return res.json({ response: text, fromCache: false, provider });
});

export default router;
