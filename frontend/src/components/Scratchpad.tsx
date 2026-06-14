import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { githubLight, githubDark } from '@uiw/codemirror-theme-github';
import ReactMarkdown from 'react-markdown';
import { Eraser, Download, NotebookPen, Check, Eye } from 'lucide-react';

const STORAGE_KEY = 'scratchpad';

export function Scratchpad() {
  const { theme, scratchpadView, setScratchpadView } = useStore();
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

  const toolBtn = 'flex items-center gap-1 px-2 py-1 text-xs rounded-patina-sm transition-colors';

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-patina-surface">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-patina-border/[.06] bg-patina-surface flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-amber-100 rounded-[10px] flex items-center justify-center flex-shrink-0">
            <NotebookPen className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-semibold text-patina-on-surface font-manrope">Scratchpad</span>
            <span className="text-xs text-patina-muted">quick notes</span>
          </div>
        </div>
        <div className="flex items-center gap-0.5 border border-patina-border/[.08] rounded-patina-sm p-0.5">
          <button
            onClick={() => setScratchpadView(scratchpadView === 'preview' ? 'editor' : 'preview')}
            className={`${toolBtn} ${
              scratchpadView === 'preview'
                ? 'text-patina-primary bg-patina-tertiary'
                : 'text-patina-secondary hover:bg-patina-tertiary/50'
            }`}
            title={scratchpadView === 'preview' ? 'Switch to editor' : 'Markdown preview'}
          >
            <Eye className="w-3 h-3" />
            Preview
          </button>
          <div className="w-px h-4 bg-patina-border/[.06]" />
          <button
            onClick={handleClear}
            disabled={!text.trim()}
            className={`${toolBtn} text-patina-secondary hover:bg-patina-tertiary/50 disabled:opacity-40 disabled:cursor-not-allowed`}
            title="Clear scratchpad"
          >
            <Eraser className="w-3 h-3" />
            Clear
          </button>
          <div className="w-px h-4 bg-patina-border/[.06]" />
          <button
            onClick={handleExport}
            disabled={!text.trim()}
            className={`${toolBtn} text-patina-secondary hover:bg-patina-tertiary/50 disabled:opacity-40 disabled:cursor-not-allowed`}
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
          <div className="h-full overflow-y-auto overscroll-contain bg-patina-surface min-h-0">
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
      <div className="px-4 py-1.5 bg-patina-surface border-t border-patina-border/[.06] text-xs text-patina-muted flex justify-between items-center flex-shrink-0">
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
