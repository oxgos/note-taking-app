import { Note } from '../interfaces/note';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

type PartialSpecific<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export default class NotesAPI {
  static getAllNotes() {
    const notes: Note[] = JSON.parse(
      localStorage.getItem('notesapp-notes') || '[]'
    );

    return notes.sort((a, b) => {
      return new Date(a.updated) > new Date(b.updated) ? -1 : 1;
    });
  }

  static saveNote(noteToSave: PartialSpecific<Note, 'id' | 'updated'>) {
    const notes = NotesAPI.getAllNotes();
    const existing = notes.find((note) => note.id === noteToSave.id);
    // Edit/Update
    if (existing) {
      existing.title = noteToSave.title;
      existing.body = noteToSave.body;
      existing.updated = new Date().toISOString();
    } else {
      const newNote: Note = {
        ...noteToSave,
        id: Math.floor(Math.random() * 1000000),
        updated: new Date().toISOString()
      };
      notes.push(newNote);
    }
    localStorage.setItem('notesapp-notes', JSON.stringify(notes));
  }

  static importNote(importXmlText: string) {
    const parser = new XMLParser();
    const jObj = parser.parse(importXmlText);
    const newNotes: Note[] = jObj.notes.note;
    if (newNotes.length > 0) {
      const notes = NotesAPI.getAllNotes();
      newNotes.forEach((noteToSave) => {
        const existing = notes.find((note) => note.id === noteToSave.id);
        // Add/Update
        if (existing) {
          existing.title = noteToSave.title;
          existing.body = noteToSave.body;
          existing.updated = noteToSave.updated;
        } else {
          notes.push(noteToSave);
        }
      });
      localStorage.setItem('notesapp-notes', JSON.stringify(notes));
    }
  }

  static exportNote() {
    const notes = NotesAPI.getAllNotes();
    if (notes.length > 0) {
      const builder = new XMLBuilder({
        format: true
      });
      const xmlContent = builder.build({
        notes: {
          note: notes
        }
      });
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href =
        'data:text/xml;charset=utf-8,' + encodeURIComponent(xmlContent);
      const row = { fileName: `note_${+new Date()}.xml` };
      link.setAttribute('download', row.fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('没有任何笔记');
    }
  }

  static deleteNote(id: Note['id']) {
    const notes = NotesAPI.getAllNotes();
    const newNotes = notes.filter((note) => note.id != id);

    localStorage.setItem('notesapp-notes', JSON.stringify(newNotes));
  }
}
