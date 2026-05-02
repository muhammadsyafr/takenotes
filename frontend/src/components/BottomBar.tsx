import { useStore } from '../store';
import {
  Eye, Star, Trash2, Download, Clipboard,
  RefreshCw, Sun, Moon, Settings as SettingsIcon,
} from 'lucide-react';
import JSZip from 'jszip';

interface BottomBarProps {
  onOpenSettings: () => void;
}

export function BottomBar({ onOpenSettings }: BottomBarProps) {
  const {
    selectedNote,
    viewMode, setViewMode,
    scratchpadView, setScratchpadView,
    starredNoteIds, toggleStar,
    deleteNote,
    theme, setTheme,
    fetchNotes,
    notes,
    sidebarView,
  } = useStore();

  const isStarred = selectedNote ? starredNoteIds.includes(selectedNote.id) : false;
  const isScratchpad = sidebarView === 'scratchpad';

  const handleExportZip = async () => {
    const zip = new JSZip();
    notes.forEach((note) => {
      const firstLine = note.text.split('\n')[0]?.replace(/^#*\s*/, '') || 'Untitled';
      zip.file(`${firstLine.slice(0, 50)}.md`, note.text);
    });
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'takenote-notes.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportScratchpad = () => {
    const text = localStorage.getItem('scratchpad') || '';
    if (!text) return;
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scratchpad.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (selectedNote) {
      await navigator.clipboard.writeText(selectedNote.text);
    }
  };

  const handleDelete = () => {
    if (selectedNote && window.confirm('Delete this note?')) {
      deleteNote(selectedNote.id);
    }
  };

  const formatTimestamp = (dateStr: string) => {
    const d = new Date(dateStr);
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = d.toLocaleDateString([], { month: '2-digit', day: '2-digit', year: 'numeric' });
    return `${time} on ${date}`;
  };

  const btn = (active = false, danger = false) =>
    `p-1.5 rounded transition-colors text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 ${
      active ? 'text-primary-500 dark:text-primary-400' : ''
    } ${danger ? 'hover:text-red-500 dark:hover:text-red-400' : 'hover:text-gray-700 dark:hover:text-gray-200'}`;

  const disabledIfNoNote = !selectedNote ? 'opacity-30 cursor-not-allowed pointer-events-none' : '';

  return (
    <div className="h-8 flex-shrink-0 flex items-center justify-between px-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      {/* Left — note/scratchpad actions */}
      <div className="flex items-center gap-0.5">
        {isScratchpad ? (
          <>
            <button
              onClick={() => {
                const scratchpadText = localStorage.getItem('scratchpad') || '';
                if (scratchpadText) {
                  setScratchpadView(scratchpadView === 'preview' ? 'editor' : 'preview');
                }
              }}
              className={btn(scratchpadView === 'preview')}
              title={scratchpadView === 'preview' ? 'Switch to editor' : 'Markdown preview'}
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleExportScratchpad}
              className={btn()}
              title="Export scratchpad as .md"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleExportZip}
              className={btn()}
              title="Export all notes as zip"
            >
              <Clipboard className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setViewMode(viewMode === 'preview' ? 'editor' : 'preview')}
              className={btn(viewMode === 'preview')}
              title={viewMode === 'preview' ? 'Switch to editor' : 'Switch to preview'}
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => selectedNote && toggleStar(selectedNote.id)}
              className={`${btn(isStarred)} ${disabledIfNoNote}`}
              title={isStarred ? 'Unstar note' : 'Star note'}
            >
              <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
            <button
              onClick={handleDelete}
              className={`${btn(false, true)} ${disabledIfNoNote}`}
              title="Delete note"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleExportZip}
              className={btn()}
              title="Export all notes as zip"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleCopy}
              className={`${btn()} ${disabledIfNoNote}`}
              title="Copy note to clipboard"
            >
              <Clipboard className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Right — global controls */}
      <div className="flex items-center gap-2">
        {selectedNote && (
          <span className="text-xs font-mono text-gray-400 dark:text-gray-500 select-none">
            {formatTimestamp(selectedNote.updatedAt)}
          </span>
        )}
        <div className="flex items-center gap-0.5">
          <button onClick={() => fetchNotes()} className={btn()} title="Refresh notes">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={btn()}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          <button onClick={onOpenSettings} className={btn()} title="Settings (Ctrl+,)">
            <SettingsIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
