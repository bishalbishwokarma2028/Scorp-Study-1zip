import { Router } from "express";
import { supabase } from "../lib/supabaseAdmin";

const router = Router();

router.get("/", async (req, res) => {
  const userId = (req.query.userId as string) || (req.headers["x-user-id"] as string);
  const search = req.query.search as string | undefined;
  const sort = (req.query.sort as string) || "newest";

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  let query = supabase.from("notes").select("*").eq("user_id", userId);

  if (search) query = query.ilike("title", `%${search}%`);

  if (sort === "oldest") query = query.order("created_at", { ascending: true });
  else if (sort === "title") query = query.order("title", { ascending: true });
  else query = query.order("created_at", { ascending: false });

  const { data: notes, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  return res.json(
    (notes || []).map((n) => ({
      id: n.id,
      userId: n.user_id,
      title: n.title,
      content: n.content,
      tags: n.tags || [],
      createdAt: n.created_at,
      updatedAt: n.updated_at,
    }))
  );
});

router.post("/", async (req, res) => {
  const { title, content = "", tags = [], userId } = req.body;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { data: note, error } = await supabase
    .from("notes")
    .insert({ user_id: userId, title, content, tags })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  return res.status(201).json({
    id: note.id,
    userId: note.user_id,
    title: note.title,
    content: note.content,
    tags: note.tags || [],
    createdAt: note.created_at,
    updatedAt: note.updated_at,
  });
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const userId = (req.query.userId as string) || (req.headers["x-user-id"] as string);

  const { data: note, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!note) return res.status(404).json({ error: "Note not found" });

  return res.json({
    id: note.id,
    userId: note.user_id,
    title: note.title,
    content: note.content,
    tags: note.tags || [],
    createdAt: note.created_at,
    updatedAt: note.updated_at,
  });
});

router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const userId = req.body.userId || (req.headers["x-user-id"] as string);
  const { title, content, tags } = req.body;

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (title !== undefined) updates.title = title;
  if (content !== undefined) updates.content = content;
  if (tags !== undefined) updates.tags = tags;

  const { data: note, error } = await supabase
    .from("notes")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!note) return res.status(404).json({ error: "Note not found" });

  return res.json({
    id: note.id,
    userId: note.user_id,
    title: note.title,
    content: note.content,
    tags: note.tags || [],
    createdAt: note.created_at,
    updatedAt: note.updated_at,
  });
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const userId = req.body.userId || (req.headers["x-user-id"] as string);

  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
});

export default router;
