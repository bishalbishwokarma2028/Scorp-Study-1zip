import { Router } from "express";
import { db } from "@workspace/db";
import { notesTable } from "@workspace/db/schema";
import { eq, and, ilike, desc, asc } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  const userId = req.query.userId as string || req.headers["x-user-id"] as string;
  const search = req.query.search as string | undefined;
  const sort = (req.query.sort as string) || "newest";

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  let query = db.select().from(notesTable).where(
    search
      ? and(eq(notesTable.userId, userId), ilike(notesTable.title, `%${search}%`))
      : eq(notesTable.userId, userId)
  );

  const notes = await (sort === "oldest"
    ? query.orderBy(asc(notesTable.createdAt))
    : sort === "title"
    ? query.orderBy(asc(notesTable.title))
    : query.orderBy(desc(notesTable.createdAt)));

  return res.json(
    notes.map((n) => ({
      ...n,
      tags: n.tags || [],
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt.toISOString(),
    }))
  );
});

router.post("/", async (req, res) => {
  const { title, content = "", tags = [], userId } = req.body;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const [note] = await db
    .insert(notesTable)
    .values({ userId, title, content, tags })
    .returning();

  return res.status(201).json({
    ...note,
    tags: note.tags || [],
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  });
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const userId = req.query.userId as string || req.headers["x-user-id"] as string;

  const [note] = await db
    .select()
    .from(notesTable)
    .where(and(eq(notesTable.id, id), eq(notesTable.userId, userId)))
    .limit(1);

  if (!note) return res.status(404).json({ error: "Note not found" });

  return res.json({
    ...note,
    tags: note.tags || [],
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  });
});

router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const userId = req.body.userId || req.headers["x-user-id"] as string;
  const { title, content, tags } = req.body;

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (title !== undefined) updates.title = title;
  if (content !== undefined) updates.content = content;
  if (tags !== undefined) updates.tags = tags;

  const [note] = await db
    .update(notesTable)
    .set(updates)
    .where(and(eq(notesTable.id, id), eq(notesTable.userId, userId)))
    .returning();

  if (!note) return res.status(404).json({ error: "Note not found" });

  return res.json({
    ...note,
    tags: note.tags || [],
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  });
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const userId = req.body.userId || req.headers["x-user-id"] as string;

  await db
    .delete(notesTable)
    .where(and(eq(notesTable.id, id), eq(notesTable.userId, userId)));

  return res.status(204).send();
});

export default router;
