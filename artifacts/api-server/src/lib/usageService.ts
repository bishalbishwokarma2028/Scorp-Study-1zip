import { db } from "@workspace/db";
import { dailyUsageTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const AI_QUERIES_LIMIT = 30;
const IMAGES_LIMIT = 3;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getOrCreateUsage(userId: string) {
  const date = today();
  const existing = await db
    .select()
    .from(dailyUsageTable)
    .where(and(eq(dailyUsageTable.userId, userId), eq(dailyUsageTable.date, date)))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const [created] = await db
    .insert(dailyUsageTable)
    .values({ userId, date, aiQueries: 0, imagesGenerated: 0 })
    .returning();
  return created;
}

export async function checkAiLimit(userId: string): Promise<boolean> {
  const usage = await getOrCreateUsage(userId);
  return usage.aiQueries < AI_QUERIES_LIMIT;
}

export async function checkImageLimit(userId: string): Promise<boolean> {
  const usage = await getOrCreateUsage(userId);
  return usage.imagesGenerated < IMAGES_LIMIT;
}

export async function incrementAiQueries(userId: string) {
  const date = today();
  const usage = await getOrCreateUsage(userId);
  await db
    .update(dailyUsageTable)
    .set({ aiQueries: usage.aiQueries + 1 })
    .where(and(eq(dailyUsageTable.userId, userId), eq(dailyUsageTable.date, date)));
}

export async function incrementImages(userId: string) {
  const date = today();
  const usage = await getOrCreateUsage(userId);
  await db
    .update(dailyUsageTable)
    .set({ imagesGenerated: usage.imagesGenerated + 1 })
    .where(and(eq(dailyUsageTable.userId, userId), eq(dailyUsageTable.date, date)));
}

export { AI_QUERIES_LIMIT, IMAGES_LIMIT };
