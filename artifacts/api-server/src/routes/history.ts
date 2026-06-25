import { Router } from "express";
import { db } from "@workspace/db";
import {
  quizResultsTable,
  flashcardSetsTable,
  summariesTable,
  generatedImagesTable,
  mindmapsTable,
  translationsTable,
} from "@workspace/db/schema";
import { eq, desc, gte, and } from "drizzle-orm";

const router = Router();

router.get("/quiz-results", async (req, res) => {
  const userId = req.headers["x-user-id"] as string || req.query.userId as string;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const results = await db
    .select()
    .from(quizResultsTable)
    .where(eq(quizResultsTable.userId, userId))
    .orderBy(desc(quizResultsTable.createdAt));

  return res.json(results.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
});

router.post("/quiz-results", async (req, res) => {
  const { topic, score, total, percentage, difficulty, questionType, userId } = req.body;

  const [result] = await db
    .insert(quizResultsTable)
    .values({ userId, topic, score, total, percentage, difficulty, questionType })
    .returning();

  return res.status(201).json({ ...result, createdAt: result.createdAt.toISOString() });
});

router.get("/flashcard-sets", async (req, res) => {
  const userId = req.headers["x-user-id"] as string || req.query.userId as string;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const sets = await db
    .select()
    .from(flashcardSetsTable)
    .where(eq(flashcardSetsTable.userId, userId))
    .orderBy(desc(flashcardSetsTable.createdAt));

  return res.json(sets.map((s) => ({ ...s, createdAt: s.createdAt.toISOString() })));
});

router.post("/flashcard-sets", async (req, res) => {
  const { topic, cards, userId } = req.body;

  const [set] = await db
    .insert(flashcardSetsTable)
    .values({ userId, topic, cards })
    .returning();

  return res.status(201).json({ ...set, createdAt: set.createdAt.toISOString() });
});

router.delete("/flashcard-sets/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const userId = req.body.userId || req.headers["x-user-id"] as string;

  await db
    .delete(flashcardSetsTable)
    .where(and(eq(flashcardSetsTable.id, id), eq(flashcardSetsTable.userId, userId)));

  return res.status(204).send();
});

router.get("/summaries", async (req, res) => {
  const userId = req.headers["x-user-id"] as string || req.query.userId as string;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const results = await db
    .select()
    .from(summariesTable)
    .where(eq(summariesTable.userId, userId))
    .orderBy(desc(summariesTable.createdAt));

  return res.json(results.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
});

router.post("/summaries", async (req, res) => {
  const { sourceType, originalText, summary, keyPoints = [], examQuestions = [], userId } = req.body;

  const [result] = await db
    .insert(summariesTable)
    .values({ userId, sourceType, originalText, summary, keyPoints, examQuestions })
    .returning();

  return res.status(201).json({ ...result, createdAt: result.createdAt.toISOString() });
});

router.get("/images", async (req, res) => {
  const userId = req.headers["x-user-id"] as string || req.query.userId as string;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const images = await db
    .select()
    .from(generatedImagesTable)
    .where(eq(generatedImagesTable.userId, userId))
    .orderBy(desc(generatedImagesTable.createdAt));

  return res.json(images.map((i) => ({ ...i, createdAt: i.createdAt.toISOString() })));
});

router.post("/images", async (req, res) => {
  const { prompt, enhancedPrompt, imageUrl, style, userId } = req.body;

  const [image] = await db
    .insert(generatedImagesTable)
    .values({ userId, prompt, enhancedPrompt, imageUrl, style })
    .returning();

  return res.status(201).json({ ...image, createdAt: image.createdAt.toISOString() });
});

router.delete("/images/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const userId = req.body.userId || req.headers["x-user-id"] as string;

  await db
    .delete(generatedImagesTable)
    .where(and(eq(generatedImagesTable.id, id), eq(generatedImagesTable.userId, userId)));

  return res.status(204).send();
});

router.get("/mindmaps", async (req, res) => {
  const userId = req.headers["x-user-id"] as string || req.query.userId as string;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const maps = await db
    .select()
    .from(mindmapsTable)
    .where(eq(mindmapsTable.userId, userId))
    .orderBy(desc(mindmapsTable.createdAt));

  return res.json(maps.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() })));
});

router.post("/mindmaps", async (req, res) => {
  const { topic, mapData, userId } = req.body;

  const [map] = await db
    .insert(mindmapsTable)
    .values({ userId, topic, mapData })
    .returning();

  return res.status(201).json({ ...map, createdAt: map.createdAt.toISOString() });
});

router.get("/translations", async (req, res) => {
  const userId = req.headers["x-user-id"] as string || req.query.userId as string;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const translations = await db
    .select()
    .from(translationsTable)
    .where(eq(translationsTable.userId, userId))
    .orderBy(desc(translationsTable.createdAt));

  return res.json(translations.map((t) => ({ ...t, createdAt: t.createdAt.toISOString() })));
});

router.post("/translations", async (req, res) => {
  const { originalText, translatedText, sourceLanguage, targetLanguage, userId } = req.body;

  const [translation] = await db
    .insert(translationsTable)
    .values({ userId, originalText, translatedText, sourceLanguage, targetLanguage })
    .returning();

  return res.status(201).json({ ...translation, createdAt: translation.createdAt.toISOString() });
});

router.delete("/translations/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const userId = req.body.userId || req.headers["x-user-id"] as string;

  await db
    .delete(translationsTable)
    .where(and(eq(translationsTable.id, id), eq(translationsTable.userId, userId)));

  return res.status(204).send();
});

router.get("/usage", async (req, res) => {
  const userId = req.headers["x-user-id"] as string || req.query.userId as string;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { getOrCreateUsage, AI_QUERIES_LIMIT, IMAGES_LIMIT } = await import("../lib/usageService");
  const usage = await getOrCreateUsage(userId);

  return res.json({
    userId: usage.userId,
    aiQueries: usage.aiQueries,
    imagesGenerated: usage.imagesGenerated,
    aiQueriesLimit: AI_QUERIES_LIMIT,
    imagesLimit: IMAGES_LIMIT,
    date: usage.date,
  });
});

router.get("/history", async (req, res) => {
  const userId = req.headers["x-user-id"] as string || req.query.userId as string;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const [quizzes, summaries, images, maps, translations] = await Promise.all([
    db.select().from(quizResultsTable).where(eq(quizResultsTable.userId, userId)).orderBy(desc(quizResultsTable.createdAt)),
    db.select().from(summariesTable).where(eq(summariesTable.userId, userId)).orderBy(desc(summariesTable.createdAt)),
    db.select().from(generatedImagesTable).where(eq(generatedImagesTable.userId, userId)).orderBy(desc(generatedImagesTable.createdAt)),
    db.select().from(mindmapsTable).where(eq(mindmapsTable.userId, userId)).orderBy(desc(mindmapsTable.createdAt)),
    db.select().from(translationsTable).where(eq(translationsTable.userId, userId)).orderBy(desc(translationsTable.createdAt)),
  ]);

  const items = [
    ...quizzes.map((q) => ({ id: `quiz-${q.id}`, type: "quiz", title: q.topic || "Quiz", description: `Score: ${q.score}/${q.total} (${q.percentage}%)`, createdAt: q.createdAt.toISOString() })),
    ...summaries.map((s) => ({ id: `summary-${s.id}`, type: "summary", title: s.sourceType || "Summary", description: s.summary.slice(0, 100) + "...", createdAt: s.createdAt.toISOString() })),
    ...images.map((i) => ({ id: `image-${i.id}`, type: "image", title: i.prompt.slice(0, 50), description: i.style || "AI Image", createdAt: i.createdAt.toISOString() })),
    ...maps.map((m) => ({ id: `mindmap-${m.id}`, type: "mindmap", title: m.topic, description: "Mind Map", createdAt: m.createdAt.toISOString() })),
    ...translations.map((t) => ({ id: `translation-${t.id}`, type: "translation", title: `→ ${t.targetLanguage}`, description: t.originalText.slice(0, 100), createdAt: t.createdAt.toISOString() })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const queriesByDay: Record<string, number> = {};
  const usageByFeature: Record<string, number> = {
    chat: 0,
    quiz: quizzes.filter((q) => new Date(q.createdAt) >= oneWeekAgo).length,
    summary: summaries.filter((s) => new Date(s.createdAt) >= oneWeekAgo).length,
    image: images.filter((i) => new Date(i.createdAt) >= oneWeekAgo).length,
    mindmap: maps.filter((m) => new Date(m.createdAt) >= oneWeekAgo).length,
    translation: translations.filter((t) => new Date(t.createdAt) >= oneWeekAgo).length,
  };

  items
    .filter((item) => new Date(item.createdAt) >= oneWeekAgo)
    .forEach((item) => {
      const day = item.createdAt.slice(0, 10);
      queriesByDay[day] = (queriesByDay[day] || 0) + 1;
    });

  const totalQueriesThisWeek = Object.values(queriesByDay).reduce((a, b) => a + b, 0);
  const mostUsedFeature = Object.entries(usageByFeature).sort((a, b) => b[1] - a[1])[0]?.[0] || "chat";

  return res.json({
    items,
    analytics: {
      totalQueriesThisWeek,
      totalQueriesSavedByCache: 0,
      studyStreakDays: Math.min(7, Object.keys(queriesByDay).length),
      mostUsedFeature,
      queriesByDay: Object.entries(queriesByDay).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date)),
      usageByFeature: Object.entries(usageByFeature).map(([feature, count]) => ({ feature, count })),
    },
  });
});

export default router;
