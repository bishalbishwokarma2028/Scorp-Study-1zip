import { supabase } from "./supabaseAdmin";

export const AI_QUERIES_LIMIT = 30;
export const IMAGES_LIMIT = 3;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getOrCreateUsage(userId: string) {
  const date = today();

  const { data: existing } = await supabase
    .from("daily_usage")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date)
    .maybeSingle();

  if (existing) return existing;

  const { data: created } = await supabase
    .from("daily_usage")
    .insert({ user_id: userId, date, ai_queries: 0, images_generated: 0 })
    .select()
    .single();

  return created!;
}

export async function checkAiLimit(userId: string): Promise<boolean> {
  const usage = await getOrCreateUsage(userId);
  return usage.ai_queries < AI_QUERIES_LIMIT;
}

export async function checkImageLimit(userId: string): Promise<boolean> {
  const usage = await getOrCreateUsage(userId);
  return usage.images_generated < IMAGES_LIMIT;
}

export async function incrementAiQueries(userId: string) {
  const usage = await getOrCreateUsage(userId);
  await supabase
    .from("daily_usage")
    .update({ ai_queries: usage.ai_queries + 1 })
    .eq("user_id", userId)
    .eq("date", today());
}

export async function incrementImages(userId: string) {
  const usage = await getOrCreateUsage(userId);
  await supabase
    .from("daily_usage")
    .update({ images_generated: usage.images_generated + 1 })
    .eq("user_id", userId)
    .eq("date", today());
}
