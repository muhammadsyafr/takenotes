import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { githubLight, githubDark } from '@uiw/codemirror-theme-github';
import { Eraser, Download, NotebookPen, Check } from 'lucide-react';

const STORAGE_KEY = 'scratchpad';

export function Scratchpad() {
  const { theme } = useStore();
  const [text, setText] = useState(() => localStorage.getItem(STORAGE_KEY) || '');
  const [isSaved, setIsSaved] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(
    localStorage.getItem(STORAGE_KEY) !== null ? new Date() : null
  );
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback((value: string) => {
    localStorage.setItem(STORAGE_KEY, value);
    setIsSaved(true);
    setLastSaved(new Date());
  }, []);

  const handleChange = useCallback(
    (value: string) => {
      setText(value);
      setIsSaved(false);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => save(value), 600);
    },
    [save]
  );

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const handleClear = () => {
    if (!text.trim()) return;
    if (window.confirm('Clear all scratchpad content?')) {
      setText('');
      save('');
    }
  };

  const handleExport = () => {
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scratchpad.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatLastSaved = () => {
    if (!lastSaved) return 'Not saved yet';
    return `Saved ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <NotebookPen className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Scratchpad</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">— quick notes, no pressure</span>
        </div>
        <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-600 rounded-lg p-0.5">
          <button
            onClick={handleClear}
            disabled={!text.trim()}
            className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Clear scratchpad"
          >
            <Eraser className="w-4 h-4" />
            Clear
          </button>
          <div className="w-px h-5 bg-gray-200 dark:bg-gray-600" />
          <button
            onClick={handleExport}
            disabled={!text.trim()}
            className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Export as .md"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <CodeMirror
          value={text}
          height="100%"
          extensions={[markdown({ base: markdownLanguage, codeLanguages: languages })]}
          theme={theme === 'dark' ? githubDark : githubLight}
          onChange={handleChange}
          className="h-full"
          basicSetup={{
            lineNumbers: false,
            foldGutter: false,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          {isSaved ? (
            <>
              <Check className="w-3 h-3 text-green-500" />
              <span>{formatLastSaved()}</span>
            </>
          ) : (
            <span className="text-amber-500">Saving…</span>
          )}
        </div>
        <span>
          {wordCount} word{wordCount !== 1 ? 's' : ''} · {text.length} chars
        </span>
      </div>
    </div>
  );
}
