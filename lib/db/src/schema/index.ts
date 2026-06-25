import { pgTable, serial, text, integer, real, timestamp, jsonb } from "drizzle-orm/pg-core";

export const notesTable = pgTable("notes", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  tags: text("tags").array().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const quizResultsTable = pgTable("quiz_results", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  topic: text("topic"),
  score: integer("score").notNull(),
  total: integer("total").notNull(),
  percentage: real("percentage").notNull(),
  difficulty: text("difficulty"),
  questionType: text("question_type"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const flashcardSetsTable = pgTable("flashcard_sets", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  topic: text("topic").notNull(),
  cards: jsonb("cards").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const summariesTable = pgTable("summaries", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  sourceType: text("source_type"),
  originalText: text("original_text"),
  summary: text("summary").notNull(),
  keyPoints: text("key_points").array().notNull().default([]),
  examQuestions: text("exam_questions").array().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const generatedImagesTable = pgTable("generated_images", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  prompt: text("prompt").notNull(),
  enhancedPrompt: text("enhanced_prompt"),
  imageUrl: text("image_url").notNull(),
  style: text("style"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const mindmapsTable = pgTable("mindmaps", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  topic: text("topic").notNull(),
  mapData: jsonb("map_data").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const translationsTable = pgTable("translations", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  originalText: text("original_text").notNull(),
  translatedText: text("translated_text").notNull(),
  sourceLanguage: text("source_language"),
  targetLanguage: text("target_language").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const dailyUsageTable = pgTable("daily_usage", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: text("date").notNull(),
  aiQueries: integer("ai_queries").notNull().default(0),
  imagesGenerated: integer("images_generated").notNull().default(0),
});

export type Note = typeof notesTable.$inferSelect;
export type InsertNote = typeof notesTable.$inferInsert;
export type QuizResult = typeof quizResultsTable.$inferSelect;
export type InsertQuizResult = typeof quizResultsTable.$inferInsert;
export type FlashcardSet = typeof flashcardSetsTable.$inferSelect;
export type InsertFlashcardSet = typeof flashcardSetsTable.$inferInsert;
export type Summary = typeof summariesTable.$inferSelect;
export type InsertSummary = typeof summariesTable.$inferInsert;
export type GeneratedImage = typeof generatedImagesTable.$inferSelect;
export type InsertGeneratedImage = typeof generatedImagesTable.$inferInsert;
export type Mindmap = typeof mindmapsTable.$inferSelect;
export type InsertMindmap = typeof mindmapsTable.$inferInsert;
export type Translation = typeof translationsTable.$inferSelect;
export type InsertTranslation = typeof translationsTable.$inferInsert;
export type DailyUsage = typeof dailyUsageTable.$inferSelect;
export type InsertDailyUsage = typeof dailyUsageTable.$inferInsert;
