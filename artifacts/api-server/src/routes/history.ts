import { Router } from "express";
import { supabase } from "../lib/supabaseAdmin";

const router = Router();

router.get("/quiz-results", async (req, res) => {
  const userId = (req.headers["x-user-id"] as string) || (req.query.userId as string);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { data, error } = await supabase
    .from("quiz_results")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json((data || []).map((r) => ({
    id: r.id, userId: r.user_id, topic: r.topic, score: r.score, total: r.total,
    percentage: r.percentage, difficulty: r.difficulty, questionType: r.question_type,
    createdAt: r.created_at,
  })));
});

router.post("/quiz-results", async (req, res) => {
  const { topic, score, total, percentage, difficulty, questionType, userId } = req.body;

  const { data, error } = await supabase
    .from("quiz_results")
    .insert({ user_id: userId, topic, score, total, percentage, difficulty, question_type: questionType })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({
    id: data.id, userId: data.user_id, topic: data.topic, score: data.score,
    total: data.total, percentage: data.percentage, difficulty: data.difficulty,
    questionType: data.question_type, createdAt: data.created_at,
  });
});

router.get("/flashcard-sets", async (req, res) => {
  const userId = (req.headers["x-user-id"] as string) || (req.query.userId as string);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { data, error } = await supabase
    .from("flashcard_sets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json((data || []).map((s) => ({
    id: s.id, userId: s.user_id, topic: s.topic, cards: s.cards, createdAt: s.created_at,
  })));
});

router.post("/flashcard-sets", async (req, res) => {
  const { topic, cards, userId } = req.body;

  const { data, error } = await supabase
    .from("flashcard_sets")
    .insert({ user_id: userId, topic, cards })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({
    id: data.id, userId: data.user_id, topic: data.topic, cards: data.cards, createdAt: data.created_at,
  });
});

router.delete("/flashcard-sets/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const userId = req.body.userId || (req.headers["x-user-id"] as string);

  const { error } = await supabase.from("flashcard_sets").delete().eq("id", id).eq("user_id", userId);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
});

router.get("/summaries", async (req, res) => {
  const userId = (req.headers["x-user-id"] as string) || (req.query.userId as string);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { data, error } = await supabase
    .from("summaries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json((data || []).map((r) => ({
    id: r.id, userId: r.user_id, sourceType: r.source_type, originalText: r.original_text,
    summary: r.summary, keyPoints: r.key_points || [], examQuestions: r.exam_questions || [],
    createdAt: r.created_at,
  })));
});

router.post("/summaries", async (req, res) => {
  const { sourceType, originalText, summary, keyPoints = [], examQuestions = [], userId } = req.body;

  const { data, error } = await supabase
    .from("summaries")
    .insert({ user_id: userId, source_type: sourceType, original_text: originalText, summary, key_points: keyPoints, exam_questions: examQuestions })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({
    id: data.id, userId: data.user_id, sourceType: data.source_type, originalText: data.original_text,
    summary: data.summary, keyPoints: data.key_points || [], examQuestions: data.exam_questions || [],
    createdAt: data.created_at,
  });
});

router.get("/images", async (req, res) => {
  const userId = (req.headers["x-user-id"] as string) || (req.query.userId as string);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { data, error } = await supabase
    .from("generated_images")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json((data || []).map((i) => ({
    id: i.id, userId: i.user_id, prompt: i.prompt, enhancedPrompt: i.enhanced_prompt,
    imageUrl: i.image_url, style: i.style, createdAt: i.created_at,
  })));
});

router.post("/images", async (req, res) => {
  const { prompt, enhancedPrompt, imageUrl, style, userId } = req.body;

  const { data, error } = await supabase
    .from("generated_images")
    .insert({ user_id: userId, prompt, enhanced_prompt: enhancedPrompt, image_url: imageUrl, style })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({
    id: data.id, userId: data.user_id, prompt: data.prompt, enhancedPrompt: data.enhanced_prompt,
    imageUrl: data.image_url, style: data.style, createdAt: data.created_at,
  });
});

router.delete("/images/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const userId = req.body.userId || (req.headers["x-user-id"] as string);

  const { error } = await supabase.from("generated_images").delete().eq("id", id).eq("user_id", userId);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
});

router.get("/mindmaps", async (req, res) => {
  const userId = (req.headers["x-user-id"] as string) || (req.query.userId as string);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { data, error } = await supabase
    .from("mindmaps")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json((data || []).map((m) => ({
    id: m.id, userId: m.user_id, topic: m.topic, mapData: m.map_data, createdAt: m.created_at,
  })));
});

router.post("/mindmaps", async (req, res) => {
  const { topic, mapData, userId } = req.body;

  const { data, error } = await supabase
    .from("mindmaps")
    .insert({ user_id: userId, topic, map_data: mapData })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({
    id: data.id, userId: data.user_id, topic: data.topic, mapData: data.map_data, createdAt: data.created_at,
  });
});

router.get("/translations", async (req, res) => {
  const userId = (req.headers["x-user-id"] as string) || (req.query.userId as string);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { data, error } = await supabase
    .from("translations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json((data || []).map((t) => ({
    id: t.id, userId: t.user_id, originalText: t.original_text, translatedText: t.translated_text,
    sourceLanguage: t.source_language, targetLanguage: t.target_language, createdAt: t.created_at,
  })));
});

router.post("/translations", async (req, res) => {
  const { originalText, translatedText, sourceLanguage, targetLanguage, userId } = req.body;

  const { data, error } = await supabase
    .from("translations")
    .insert({ user_id: userId, original_text: originalText, translated_text: translatedText, source_language: sourceLanguage, target_language: targetLanguage })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({
    id: data.id, userId: data.user_id, originalText: data.original_text, translatedText: data.translated_text,
    sourceLanguage: data.source_language, targetLanguage: data.target_language, createdAt: data.created_at,
  });
});

router.delete("/translations/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const userId = req.body.userId || (req.headers["x-user-id"] as string);

  const { error } = await supabase.from("translations").delete().eq("id", id).eq("user_id", userId);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
});

router.get("/usage", async (req, res) => {
  const userId = (req.headers["x-user-id"] as string) || (req.query.userId as string);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { getOrCreateUsage, AI_QUERIES_LIMIT, IMAGES_LIMIT } = await import("../lib/usageService");
  const usage = await getOrCreateUsage(userId);

  return res.json({
    userId: usage?.user_id ?? userId,
    aiQueries: usage?.ai_queries ?? 0,
    imagesGenerated: usage?.images_generated ?? 0,
    aiQueriesLimit: AI_QUERIES_LIMIT,
    imagesLimit: IMAGES_LIMIT,
    date: usage?.date ?? new Date().toISOString().slice(0, 10),
  });
});

router.get("/history", async (req, res) => {
  const userId = (req.headers["x-user-id"] as string) || (req.query.userId as string);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const [quizzesRes, summariesRes, imagesRes, mapsRes, translationsRes] = await Promise.all([
    supabase.from("quiz_results").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("summaries").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("generated_images").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("mindmaps").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("translations").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
  ]);

  const quizzes = quizzesRes.data || [];
  const summaries = summariesRes.data || [];
  const images = imagesRes.data || [];
  const maps = mapsRes.data || [];
  const translations = translationsRes.data || [];

  const items = [
    ...quizzes.map((q) => ({ id: `quiz-${q.id}`, type: "quiz", title: q.topic || "Quiz", description: `Score: ${q.score}/${q.total} (${q.percentage}%)`, createdAt: q.created_at })),
    ...summaries.map((s) => ({ id: `summary-${s.id}`, type: "summary", title: s.source_type || "Summary", description: (s.summary || "").slice(0, 100) + "...", createdAt: s.created_at })),
    ...images.map((i) => ({ id: `image-${i.id}`, type: "image", title: (i.prompt || "").slice(0, 50), description: i.style || "AI Image", createdAt: i.created_at })),
    ...maps.map((m) => ({ id: `mindmap-${m.id}`, type: "mindmap", title: m.topic, description: "Mind Map", createdAt: m.created_at })),
    ...translations.map((t) => ({ id: `translation-${t.id}`, type: "translation", title: `→ ${t.target_language}`, description: (t.original_text || "").slice(0, 100), createdAt: t.created_at })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const queriesByDay: Record<string, number> = {};
  const usageByFeature: Record<string, number> = {
    chat: 0,
    quiz: quizzes.filter((q) => new Date(q.created_at) >= oneWeekAgo).length,
    summary: summaries.filter((s) => new Date(s.created_at) >= oneWeekAgo).length,
    image: images.filter((i) => new Date(i.created_at) >= oneWeekAgo).length,
    mindmap: maps.filter((m) => new Date(m.created_at) >= oneWeekAgo).length,
    translation: translations.filter((t) => new Date(t.created_at) >= oneWeekAgo).length,
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
