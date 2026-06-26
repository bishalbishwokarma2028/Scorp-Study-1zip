import { supabase } from "./supabaseAdmin";
import { logger } from "./logger";

export const AI_QUERIES_LIMIT = 30;
export const IMAGES_LIMIT = 3;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getOrCreateUsage(userId: string) {
  if (!userId) return null;

  try {
    const date = today();

    const { data: existing, error: selectError } = await supabase
      .from("daily_usage")
      .select("*")
      .eq("user_id", userId)
      .eq("date", date)
      .maybeSingle();

    if (selectError) {
      logger.warn({ err: selectError }, "usageService: failed to select usage");
      return null;
    }

    if (existing) return existing;

    const { data: created, error: insertError } = await supabase
      .from("daily_usage")
      .insert({ user_id: userId, date, ai_queries: 0, images_generated: 0 })
      .select()
      .single();

    if (insertError) {
      logger.warn({ err: insertError }, "usageService: failed to insert usage");
      return null;
    }

    return created;
  } catch (err) {
    logger.warn({ err }, "usageService: unexpected error");
    return null;
  }
}

export async function checkAiLimit(userId: string): Promise<boolean> {
  if (!userId) return true;
  const usage = await getOrCreateUsage(userId);
  if (!usage) return true; // DB unreachable → allow request
  return usage.ai_queries < AI_QUERIES_LIMIT;
}

export async function checkImageLimit(userId: string): Promise<boolean> {
  if (!userId) return true;
  const usage = await getOrCreateUsage(userId);
  if (!usage) return true;
  return usage.images_generated < IMAGES_LIMIT;
}

export async function incrementAiQueries(userId: string) {
  if (!userId) return;
  const usage = await getOrCreateUsage(userId);
  if (!usage) return;
  await supabase
    .from("daily_usage")
    .update({ ai_queries: usage.ai_queries + 1 })
    .eq("user_id", userId)
    .eq("date", today());
}

export async function incrementImages(userId: string) {
  if (!userId) return;
  const usage = await getOrCreateUsage(userId);
  if (!usage) return;
  await supabase
    .from("daily_usage")
    .update({ images_generated: usage.images_generated + 1 })
    .eq("user_id", userId)
    .eq("date", today());
}
