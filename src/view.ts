import App from './app';
import { Note } from './interfaces/note';

type onNoteSelectFn = ReturnType<App['_handlers']>['onNoteSelect'];
type onNoteAddFn = ReturnType<App['_handlers']>['onNoteAdd'];
type onNoteEditFn = ReturnType<App['_handlers']>['onNoteEdit'];
type onNoteDeleteFn = ReturnType<App['_handlers']>['onNoteDelete'];
type onNoteImportFn = ReturnType<App['_handlers']>['onNoteImport'];
type onNoteExportFn = ReturnType<App['_handlers']>['onNoteExport'];

function noop() {}

export default class NotesView {
  root: HTMLDivElement;
  onNoteSelect: onNoteSelectFn;
  onNoteAdd: onNoteAddFn;
  onNoteEdit: onNoteEditFn;
  onNoteDelete: onNoteDeleteFn;
  onNoteImport: onNoteImportFn;
  onNoteExport: onNoteExportFn;

  constructor(
    root: HTMLDivElement,
    {
      onNoteSelect,
      onNoteAdd,
      onNoteEdit,
      onNoteDelete,
      onNoteImport,
      onNoteExport
    }: {
      onNoteSelect?: onNoteSelectFn;
      onNoteAdd?: onNoteAddFn;
      onNoteEdit?: onNoteEditFn;
      onNoteDelete?: onNoteDeleteFn;
      onNoteImport?: onNoteImportFn;
      onNoteExport?: onNoteExportFn;
    } = {}
  ) {
    const self = this;
    this.root = root;
    this.onNoteSelect = onNoteSelect || noop;
    this.onNoteAdd = onNoteAdd || noop;
    this.onNoteEdit = onNoteEdit || noop;
    this.onNoteDelete = onNoteDelete || noop;
    this.onNoteImport = onNoteImport || noop;
    this.onNoteExport = onNoteExport || noop;
    this.root.innerHTML = `
          <div class="notes__sidebar">
              <button class="notes__add" type="button">添加新的笔记 📒</button>
              <div class="notes__plus__btns">
                <div class="notes__import__Btn">
                  <input class="notes__import__input" type="file"></button>
                  批量导入
                </div>
                <button class="notes__export">批量导出</button>
              </div>
              <div class="notes__list"></div>
          </div>
          <div class="notes__preview">
              <input class="notes__title" type="text" placeholder="新笔记...">
              <textarea class="notes__body">编辑笔记...</textarea>
              <div class="notes__btns">
                <button class="notes__save" type="button">保存</button>
                <button class="notes__delete" type="button">删除</button>
              </div>
          </div>
      `;

    const btnAddNote = this.root.querySelector(
      '.notes__add'
    ) as HTMLButtonElement;
    const btnImportNote = this.root.querySelector(
      '.notes__import__input'
    ) as HTMLInputElement;
    const btnExportNote = this.root.querySelector(
      '.notes__export'
    ) as HTMLInputElement;
    const btnSaveNote = this.root.querySelector(
      '.notes__save'
    ) as HTMLButtonElement;
    const btnDeleteNote = this.root.querySelector(
      '.notes__delete'
    ) as HTMLButtonElement;
    const inpTitle = this.root.querySelector(
      '.notes__title'
    ) as HTMLInputElement;
    const inpBody = this.root.querySelector(
      '.notes__body'
    ) as HTMLTextAreaElement;

    btnAddNote.addEventListener('click', () => {
      this.onNoteAdd();
    });
    btnExportNote.addEventListener('click', () => {
      this.onNoteExport();
    });
    btnImportNote.addEventListener('change', () => {
      const file = btnImportNote.files?.[0];
      const reader = new FileReader();
      reader.onload = function fileReadCompleted() {
        if (reader.result) {
          console.log(typeof reader.result);
          self.onNoteImport(reader.result as string);
          btnImportNote.value = '';
          alert('导入成功');
        }
      };
      if (file) {
        reader.readAsText(file);
      }
    });
    btnSaveNote.addEventListener('click', () => {
      const updatedTitle = inpTitle.value.trim();
      const updatedBody = inpBody.value.trim();

      this.onNoteEdit(updatedTitle, updatedBody);
    });
    btnDeleteNote.addEventListener('click', () => {
      this.removeNote();
    });

    this.updateNotePreviewVisibility(false);
  }

  _createListItemHTML(
    id: Note['id'],
    title: Note['title'],
    body: Note['body'],
    updated: Note['updated']
  ) {
    const MAX_BODY_LENGTH = 60;

    return `
          <div class="notes__list-item" data-note-id="${id}">
              <div class="notes__small-title">${title}</div>
              <div class="notes__small-body">
                  ${body.substring(0, MAX_BODY_LENGTH)}
                  ${body.length > MAX_BODY_LENGTH ? '...' : ''}
              </div>
              <div class="notes__small-updated">
                  ${new Date(updated).toLocaleString(undefined, {
                    dateStyle: 'full',
                    timeStyle: 'short'
                  })}
              </div>
          </div>
      `;
  }

  updateNoteList(notes: Note[]) {
    const notesListContainer = this.root.querySelector(
      '.notes__list'
    ) as HTMLDivElement;

    // Empty list
    notesListContainer.innerHTML = '';

    for (const note of notes) {
      const html = this._createListItemHTML(
        note.id,
        note.title,
        note.body,
        note.updated
      );

      notesListContainer.insertAdjacentHTML('beforeend', html);
    }

    // Add select/delete events for each list item
    (
      notesListContainer.querySelectorAll(
        '.notes__list-item'
      ) as NodeListOf<HTMLDivElement>
    ).forEach((noteListItem) => {
      noteListItem.addEventListener('click', () => {
        if (noteListItem.dataset.noteId) {
          this.onNoteSelect(parseInt(noteListItem.dataset.noteId));
        }
      });

      noteListItem.addEventListener('dblclick', () => {
        if (noteListItem.dataset.noteId) {
          this.removeNote(parseInt(noteListItem.dataset.noteId));
        }
      });
    });
  }

  removeNote(noteId?: Note['id']) {
    const doDelete = confirm('确认要删除该笔记吗?');

    if (doDelete) {
      this.onNoteDelete(noteId);
    }
  }

  updateActiveNote(note: Note) {
    (this.root.querySelector('.notes__title') as HTMLInputElement).value =
      note.title;
    (this.root.querySelector('.notes__body') as HTMLTextAreaElement).value =
      note.body;

    (
      this.root.querySelectorAll(
        '.notes__list-item'
      ) as NodeListOf<HTMLDivElement>
    ).forEach((noteListItem) => {
      noteListItem.classList.remove('notes__list-item--selected');
    });

    (
      this.root.querySelector(
        `.notes__list-item[data-note-id="${note.id}"]`
      ) as HTMLDivElement
    ).classList.add('notes__list-item--selected');
  }

  updateNotePreviewVisibility(visible: boolean) {
    (
      this.root.querySelector('.notes__preview') as HTMLDivElement
    ).style.visibility = visible ? 'visible' : 'hidden';
  }
}
