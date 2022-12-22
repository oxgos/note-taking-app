import { useCallback, useEffect, useState } from 'react';
import NotesAPI from './apis/api';
import { Note } from './interfaces/note';
import NoteView from './pages/NoteView';

export type onNoteSelect = (noteId: Note['id']) => void;
export type onNoteAdd = () => void;
export type onNoteImport = (importXmlText: string) => void;
export type onNoteExport = () => void;
export type onNoteEdit = (title: Note['title'], body: Note['body']) => void;
export type onNoteDelete = (noteId?: Note['id']) => void;

const App = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);

  const refreshNotes = () => {
    const notes = NotesAPI.getAllNotes();

    setNotes(notes);

    if (notes.length > 0) {
      setActiveNote(notes[0]);
    } else {
      setActiveNote(null);
    }
  };

  const onNoteSelect: onNoteSelect = useCallback(
    (noteId: Note['id']) => {
      const selectedNote = notes.find((note) => note.id === noteId);

      if (selectedNote) {
        setActiveNote(selectedNote);
      }
    },
    [notes]
  );

  const onNoteAdd: onNoteAdd = () => {
    const newNote = {
      title: '新建笔记',
      body: '开始记录...'
    };

    NotesAPI.saveNote(newNote as Note);
    refreshNotes();
  };

  const onNoteImport: onNoteImport = (importXmlText: string) => {
    NotesAPI.importNote(importXmlText);
    refreshNotes();
  };

  const onNoteExport: onNoteExport = () => {
    NotesAPI.exportNote();
  };

  const onNoteEdit: onNoteEdit = useCallback(
    (title: Note['title'], body: Note['body']) => {
      if (!title || !body) {
        alert('标题或者内容不能为空');
        return;
      }
      if (!activeNote) {
        NotesAPI.saveNote({
          title,
          body
        });
      } else {
        NotesAPI.saveNote({
          id: activeNote.id,
          title,
          body
        });
      }

      refreshNotes();
    },
    [activeNote]
  );

  const onNoteDelete: onNoteDelete = useCallback(
    (noteId?: Note['id']) => {
      if (!noteId) {
        if (!activeNote) {
          return;
        }
        noteId = activeNote.id;
      }
      NotesAPI.deleteNote(noteId);
      refreshNotes();
    },
    [activeNote]
  );

  useEffect(() => {
    refreshNotes();
  }, []);

  return (
    <div className='notes'>
      <NoteView
        notes={notes}
        activeNote={activeNote}
        onNoteSelect={onNoteSelect}
        onNoteAdd={onNoteAdd}
        onNoteImport={onNoteImport}
        onNoteExport={onNoteExport}
        onNoteEdit={onNoteEdit}
        onNoteDelete={onNoteDelete}
      />
    </div>
  );
};

export default App;
