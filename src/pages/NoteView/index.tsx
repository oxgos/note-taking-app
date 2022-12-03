import {
  FC,
  SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import {
  onNoteAdd,
  onNoteDelete,
  onNoteEdit,
  onNoteExport,
  onNoteImport,
  onNoteSelect
} from '../../App';
import { Note } from '../../interfaces/note';

interface NoteViewProps {
  notes: Note[];
  activeNote: Note | null;
  onNoteSelect: onNoteSelect;
  onNoteAdd: onNoteAdd;
  onNoteEdit: onNoteEdit;
  onNoteDelete: onNoteDelete;
  onNoteImport: onNoteImport;
  onNoteExport: onNoteExport;
}

const MAX_BODY_LENGTH = 60;

const NoteView: FC<NoteViewProps> = ({
  notes,
  activeNote,
  onNoteAdd,
  onNoteSelect,
  onNoteDelete,
  onNoteEdit,
  onNoteExport,
  onNoteImport
}) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      setBody(activeNote.body);
    } else {
      setTitle('');
      setBody('');
    }
  }, [activeNote]);

  const handleInputFileChange = useCallback(
    (e: SyntheticEvent<HTMLInputElement>) => {
      const file = e.currentTarget?.files?.[0];
      const reader = new FileReader();
      reader.onload = function fileReadCompleted() {
        if (reader.result) {
          console.log(typeof reader.result);
          onNoteImport(reader.result as string);
          if (inputRef.current) {
            inputRef.current.value = '';
          }
          alert('导入成功');
        }
      };
      if (file) {
        reader.readAsText(file);
      }
    },
    []
  );

  const handleInputTitleChange = (e: SyntheticEvent<HTMLInputElement>) => {
    setTitle(e.currentTarget.value);
  };

  const handleTextareaBodyChange = (e: SyntheticEvent<HTMLTextAreaElement>) => {
    setBody(e.currentTarget.value);
  };

  const handleRemoveNote = useCallback(
    (noteId?: Note['id']) => {
      const doDelete = confirm('确认要删除该笔记吗?');

      if (doDelete) {
        onNoteDelete(noteId);
      }
    },
    [onNoteDelete]
  );

  return (
    <>
      <div className='notes__sidebar'>
        <button
          className='notes__add'
          type='button'
          onClick={() => onNoteAdd()}
        >
          添加新的笔记 📒
        </button>
        <div className='notes__plus__btns'>
          <div className='notes__import__Btn'>
            <input
              className='notes__import__input'
              type='file'
              onChange={handleInputFileChange}
              ref={inputRef}
            />
            批量导入
          </div>
          <button className='notes__export' onClick={() => onNoteExport()}>
            批量导出
          </button>
        </div>
        <div className='notes__list'>
          {notes.map((note) => (
            <div
              className='notes__list-item'
              data-note-id={note.id}
              key={note.id}
              onClick={() => onNoteSelect(note.id)}
              onDoubleClick={() => handleRemoveNote(note.id)}
            >
              <div className='notes__small-title'>{note.title}</div>
              <div className='notes__small-body'>
                {note.body.substring(0, MAX_BODY_LENGTH)}
                {note.body.length > MAX_BODY_LENGTH ? '...' : ''}
              </div>
              <div className='notes__small-updated'>
                {new Date(note.updated).toLocaleString(undefined, {
                  dateStyle: 'full',
                  timeStyle: 'short'
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className='notes__preview'>
        <input
          className='notes__title'
          type='text'
          placeholder='新笔记...'
          value={title}
          onChange={handleInputTitleChange}
        />
        <textarea
          className='notes__body'
          value={body}
          onChange={handleTextareaBodyChange}
        ></textarea>
        <div className='notes__btns'>
          <button
            className='notes__save'
            type='button'
            onClick={() => onNoteEdit(title, body)}
          >
            保存
          </button>
          <button
            className='notes__delete'
            type='button'
            onClick={() => handleRemoveNote()}
          >
            删除
          </button>
        </div>
      </div>
    </>
  );
};

export default NoteView;
