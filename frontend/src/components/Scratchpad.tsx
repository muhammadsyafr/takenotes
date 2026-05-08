import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { githubLight, githubDark } from '@uiw/codemirror-theme-github';
import ReactMarkdown from 'react-markdown';
import { Eraser, Download, NotebookPen, Check, Eye } from 'lucide-react';

export function Scratchpad() {
  const { theme, scratchpadView, setScratchpadView, scratchpadText, scratchpadUpdatedAt, updateScratchpad } = useStore();
  const [text, setText] = useState(scratchpadText);
  const [isSaved, setIsSaved] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setText(scratchpadText);
  }, [scratchpadText]);

  const handleSave = useCallback(async (value: string) => {
    setIsSaved(true);
    await updateScratchpad(value);
  }, [updateScratchpad]);

  const handleChange = useCallback(
    (value: string) => {
      setText(value);
      setIsSaved(false);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => handleSave(value), 600);
    },
    [handleSave]
  );

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave(text);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [text, handleSave]);

  const handleClear = () => {
    if (!text.trim()) return;
    if (window.confirm('Clear all scratchpad content?')) {
      setText('');
      handleSave('');
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
    if (!scratchpadUpdatedAt) return 'Not saved yet';
    return `Saved ${new Date(scratchpadUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-1.5">
          <NotebookPen className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Scratchpad</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">— quick notes</span>
        </div>
        <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-600 rounded p-0.5">
          <button
            onClick={() => setScratchpadView(scratchpadView === 'preview' ? 'editor' : 'preview')}
            className={`flex items-center gap-1 px-1.5 py-1 text-xs rounded transition-colors ${
              scratchpadView === 'preview'
                ? 'text-primary-500 dark:text-primary-400 bg-gray-200 dark:bg-gray-700'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            title={scratchpadView === 'preview' ? 'Switch to editor' : 'Markdown preview'}
          >
            <Eye className="w-3 h-3" />
            Preview
          </button>
          <div className="w-px h-4 bg-gray-200 dark:bg-gray-600" />
          <button
            onClick={handleClear}
            disabled={!text.trim()}
            className="flex items-center gap-1 px-1.5 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Clear scratchpad"
          >
            <Eraser className="w-3 h-3" />
            Clear
          </button>
          <div className="w-px h-4 bg-gray-200 dark:bg-gray-600" />
          <button
            onClick={handleExport}
            disabled={!text.trim()}
            className="flex items-center gap-1 px-1.5 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Export as .md"
          >
            <Download className="w-3 h-3" />
            Export
          </button>
        </div>
      </div>

      {/* Editor/Preview */}
      <div className="flex-1 overflow-hidden min-h-0">
        {scratchpadView === 'preview' ? (
          <div className="h-full overflow-y-auto overscroll-contain bg-white dark:bg-gray-900 min-h-0">
            <div className="max-w-3xl mx-auto markdown-preview">
              <ReactMarkdown>{text}</ReactMarkdown>
            </div>
          </div>
        ) : (
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
        )}
      </div>

      {/* Status Bar */}
      <div className="px-2 py-1 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
        <div className="flex items-center gap-1">
          {isSaved ? (
            <>
              <Check className="w-2.5 h-2.5 text-green-500" />
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
