import { createClient } from "@supabase/supabase-js";
import type { RequestHandler } from "express";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function getUserIdFromToken(token: string): Promise<string | null> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}

export const supabaseAuthMiddleware: RequestHandler = async (req, _res, next) => {
  const authHeader = req.headers["authorization"];
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const userId = await getUserIdFromToken(token);
    if (userId) {
      (req as any).supabaseUserId = userId;
    }
  }
  next();
};
