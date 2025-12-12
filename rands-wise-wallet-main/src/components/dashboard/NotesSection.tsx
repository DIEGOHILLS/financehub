import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Plus, Edit2, Trash2, StickyNote, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useFinanceStore } from '@/lib/store';

export function NotesSection() {
  const { notes, addNote, updateNote, deleteNote } = useFinanceStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newContent, setNewContent] = useState('');
  const [editContent, setEditContent] = useState('');

  const handleAddNote = () => {
    if (newContent.trim()) {
      addNote(newContent.trim());
      setNewContent('');
      setIsAdding(false);
    }
  };

  const handleUpdateNote = (id: string) => {
    if (editContent.trim()) {
      updateNote(id, editContent.trim());
      setEditingId(null);
      setEditContent('');
    }
  };

  const startEditing = (id: string, content: string) => {
    setEditingId(id);
    setEditContent(content);
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <StickyNote className="h-5 w-5 text-warning" />
          Notes
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="h-8 gap-1 text-primary hover:text-primary"
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {isAdding && (
          <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
            <Textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Write your note..."
              className="min-h-[80px] resize-none border-none bg-transparent focus-visible:ring-0"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAdding(false);
                  setNewContent('');
                }}
              >
                <X className="mr-1 h-4 w-4" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleAddNote}>
                <Check className="mr-1 h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        )}

        {notes.length > 0 ? (
          <div className="space-y-2">
            {notes.map((note) => (
              <div
                key={note.id}
                className="group rounded-lg border bg-card p-3 transition-colors hover:bg-muted/30"
              >
                {editingId === note.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[80px] resize-none"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => handleUpdateNote(note.id)}>
                        <Check className="mr-1 h-4 w-4" />
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="whitespace-pre-wrap text-sm">{note.content}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {format(parseISO(note.createdAt), 'MMM d, yyyy h:mm a')}
                      </span>
                      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => startEditing(note.id, note.content)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => deleteNote(note.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          !isAdding && (
            <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
              No notes yet. Add one to get started!
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}
