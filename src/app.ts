import NotesView from './view';
import NotesAPI from './api';
import { Note } from './interfaces/note';

export default class App {
  notes: Note[];
  activeNote: Note | null;
  view: NotesView;

  constructor(root: HTMLDivElement) {
    this.notes = [];
    this.activeNote = null;
    this.view = new NotesView(root, this._handlers());

    this._refreshNotes();
  }

  _refreshNotes() {
    const notes = NotesAPI.getAllNotes();

    this._setNotes(notes);

    if (notes.length > 0) {
      this._setActiveNote(notes[0]);
    }
  }

  _setNotes(notes: Note[]) {
    this.notes = notes;
    this.view.updateNoteList(notes);
    this.view.updateNotePreviewVisibility(notes.length > 0);
  }

  _setActiveNote(note: Note) {
    this.activeNote = note;
    this.view.updateActiveNote(note);
  }

  _handlers() {
    return {
      onNoteSelect: (noteId: Note['id']) => {
        const selectedNote = this.notes.find((note) => note.id === noteId);

        if (selectedNote) {
          this._setActiveNote(selectedNote);
        }
      },
      onNoteAdd: () => {
        const newNote = {
          title: '新建笔记',
          body: '开始记录...'
        };

        NotesAPI.saveNote(newNote as Note);
        this._refreshNotes();
      },
      onNoteEdit: (title: Note['title'], body: Note['body']) => {
        if (!this.activeNote) {
          return;
        }
        NotesAPI.saveNote({
          id: this.activeNote.id,
          title,
          body
        } as Note);

        this._refreshNotes();
      },
      onNoteDelete: (noteId?: Note['id']) => {
        if (!noteId) {
          if (!this.activeNote) {
            return;
          }
          noteId = this.activeNote.id;
        }
        NotesAPI.deleteNote(noteId);
        this._refreshNotes();
      }
    };
  }
}
