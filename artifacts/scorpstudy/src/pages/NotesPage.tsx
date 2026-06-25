import { useState } from "react";
import { useUser } from "@clerk/react";
import { useListNotes, useCreateNote, useUpdateNote, useDeleteNote, useEnhanceNote, useSummarizeNote, getListNotesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { StickyNote, Plus, Trash2, Wand2, FileText, Search, Save, Loader2, X, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Note {
  id: number;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export default function NotesPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Note | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [aiResult, setAiResult] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: notes = [], isLoading } = useListNotes(
    { search: search || undefined },
    { query: { queryKey: getListNotesQueryKey({ search: search || undefined }), enabled: !!user } }
  );

  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const enhanceNote = useEnhanceNote();
  const summarizeNote = useSummarizeNote();

  const invalidate = () => qc.invalidateQueries({ queryKey: getListNotesQueryKey() });

  const openNew = () => {
    setSelected(null);
    setIsNew(true);
    setTitle("");
    setContent("");
    setTags([]);
    setAiResult("");
  };

  const openNote = (note: Note) => {
    setSelected(note);
    setIsNew(false);
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags || []);
    setAiResult("");
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) { setTags([...tags, t]); }
    setTagInput("");
  };

  const handleSave = async () => {
    if (!user || !title.trim()) return;
    setSaving(true);
    try {
      if (isNew) {
        const note = await createNote.mutateAsync({ data: { title, content, tags, userId: user.id } });
        setSelected(note as unknown as Note);
        setIsNew(false);
      } else if (selected) {
        const note = await updateNote.mutateAsync({ id: selected.id, data: { title, content, tags } });
        setSelected(note as unknown as Note);
      }
      await invalidate();
      toast({ title: "Saved!" });
    } catch {
      toast({ title: "Error", description: "Failed to save note.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!user) return;
    await deleteNote.mutateAsync({ id });
    await invalidate();
    if (selected?.id === id) { setSelected(null); setIsNew(false); }
    toast({ title: "Deleted" });
  };

  const handleEnhance = async () => {
    if (!user || !content.trim()) return;
    try {
      const result = await enhanceNote.mutateAsync({ data: { content, userId: user.id } });
      setAiResult(result.response);
    } catch { /* silent */ }
  };

  const handleSummarize = async () => {
    if (!user || !content.trim()) return;
    try {
      const result = await summarizeNote.mutateAsync({ data: { content, userId: user.id } });
      setAiResult(result.response);
    } catch { /* silent */ }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-72 border-r border-border bg-sidebar flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <StickyNote className="w-5 h-5 text-yellow-500" />
            <span className="font-bold text-sidebar-foreground">Smart Notes</span>
          </div>
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search notes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 text-sm" data-testid="input-search" />
          </div>
          <Button size="sm" className="w-full" onClick={openNew} data-testid="btn-new-note">
            <Plus className="w-4 h-4 mr-1" /> New Note
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : (notes as Note[]).length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No notes yet. Create one!</p>
          ) : (
            (notes as Note[]).map((note) => (
              <div
                key={note.id}
                onClick={() => openNote(note)}
                data-testid={`note-${note.id}`}
                className={cn("p-3 rounded-lg cursor-pointer mb-1 group transition-colors", selected?.id === note.id ? "bg-primary/10 border border-primary/20" : "hover:bg-sidebar-accent")}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-sm text-sidebar-foreground truncate">{note.title}</p>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 w-6 h-6 flex-shrink-0"
                    onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }} data-testid={`btn-delete-${note.id}`}>
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{note.content || "Empty note"}</p>
                {note.tags?.length > 0 && (
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {note.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">{tag}</Badge>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {isNew || selected ? (
          <>
            <div className="border-b border-border p-4 flex items-center justify-between bg-card">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title..." className="text-lg font-semibold border-none shadow-none focus-visible:ring-0 px-0 flex-1 bg-transparent" data-testid="input-title" />
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleSummarize} disabled={!content.trim() || summarizeNote.isPending} data-testid="btn-summarize">
                  {summarizeNote.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleEnhance} disabled={!content.trim() || enhanceNote.isPending} data-testid="btn-enhance">
                  {enhanceNote.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                </Button>
                <Button size="sm" onClick={handleSave} disabled={!title.trim() || saving} data-testid="btn-save">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-1" /> Save</>}
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex gap-2 mb-3 flex-wrap">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    <Tag className="w-3 h-3" /> {tag}
                    <button onClick={() => setTags(tags.filter((t) => t !== tag))} data-testid={`remove-tag-${tag}`}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                <div className="flex gap-1">
                  <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTag()} placeholder="Add tag..." className="h-7 text-xs w-28" data-testid="input-tag" />
                  <Button variant="ghost" size="sm" onClick={addTag} className="h-7 px-2 text-xs">+</Button>
                </div>
              </div>

              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing your note..."
                className="min-h-80 border-none shadow-none focus-visible:ring-0 resize-none text-sm leading-relaxed p-0 bg-transparent"
                data-testid="input-content"
              />

              {aiResult && (
                <Card className="mt-4 border-primary/20 bg-blue-50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm text-primary">AI Result</CardTitle>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setContent(aiResult)}>Apply to Note</Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setAiResult("")}><X className="w-3 h-3" /></Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{aiResult}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <StickyNote className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Select a note or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
