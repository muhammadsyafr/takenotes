import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "../store";
import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { scrollPastEnd as scrollPastEndExt } from "@codemirror/view";
import { githubLight, githubDark } from "@uiw/codemirror-theme-github";
import ReactMarkdown from "react-markdown";
import { Folder, Tag, ChevronDown, Check, Save, Loader2 } from "lucide-react";

export function Editor() {
  const {
    selectedNote,
    updateNote,
    viewMode,
    theme,
    categories,
    tags,
    createTag,
    notes,
    lineNumbers,
    highlightActiveLine,
    scrollPastEnd,
    textDirection,
  } = useStore();

  const [localText, setLocalText] = useState("");
  const [showFolderMenu, setShowFolderMenu] = useState(false);
  const [showTagMenu, setShowTagMenu] = useState(false);
  const folderRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (folderRef.current && !folderRef.current.contains(e.target as Node)) {
        setShowFolderMenu(false);
      }
      if (tagRef.current && !tagRef.current.contains(e.target as Node)) {
        setShowTagMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const [newTagName, setNewTagName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (selectedNote) {
      setLocalText(selectedNote.text);
    }
  }, [selectedNote?.id]);

  const currentNote =
    notes.find((n) => n.id === selectedNote?.id) || selectedNote;
  const noteCategoryIds = currentNote?.categoryIds || [];
  const noteTagIds = currentNote?.tagIds || [];

  const handleChange = useCallback(
    (value: string) => {
      setLocalText(value);
      if (selectedNote && value !== selectedNote.text) {
        setHasChanges(true);
      }
    },
    [selectedNote],
  );

  const handleSave = useCallback(async () => {
    if (!selectedNote || !hasChanges) return;
    setIsSaving(true);
    await updateNote(localText);
    setHasChanges(false);
    setIsSaving(false);
  }, [selectedNote, hasChanges, localText, updateNote]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  const handleBlur = useCallback(() => {
    if (selectedNote && localText !== selectedNote.text) {
      updateNote(localText);
    }
  }, [localText, selectedNote, updateNote]);

  const handleSelectFolder = async (categoryId: string | null) => {
    if (!selectedNote) return;
    await updateNote(localText, categoryId);
    setShowFolderMenu(false);
  };

  const handleToggleTag = async (tagId: string) => {
    if (!selectedNote) return;
    const newTagIds = noteTagIds.includes(tagId)
      ? noteTagIds.filter((id) => id !== tagId)
      : [...noteTagIds, tagId];
    await updateNote(localText, undefined, newTagIds);
  };

  const handleCreateAndAddTag = async () => {
    if (!newTagName.trim()) return;
    const tag = await createTag(newTagName.trim());
    if (tag) {
      await handleToggleTag(tag.id);
    }
    setNewTagName("");
  };

  if (!selectedNote) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <svg
            className="w-16 h-16 mx-auto mb-4 opacity-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-lg">Select a note to start editing</p>
          <p className="text-sm mt-2">Or create a new note from the sidebar</p>
        </div>
      </div>
    );
  }

  const selectedFolder = categories.find((c) => noteCategoryIds.includes(c.id));

  return (
    <div className="flex-1 flex flex-col overflow-hidden border-l border-r border-gray-200 dark:border-gray-700">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 gap-2">
        <div className="flex items-center gap-0.5">
          {/* Folder Selector */}
          <div className="relative" ref={folderRef}>
            <button
              onClick={() => setShowFolderMenu(!showFolderMenu)}
              title={selectedFolder ? selectedFolder.name : "Select folder"}
              className={`flex items-center gap-1 px-2 py-1.5 rounded text-sm transition-colors ${
                selectedFolder
                  ? "text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <Folder className="w-4 h-4" />
              {selectedFolder && (
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: selectedFolder.color }}
                />
              )}
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>
            {showFolderMenu && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                <div className="p-1">
                  <button
                    onClick={() => handleSelectFolder(null)}
                    className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${!selectedFolder ? "text-primary-600" : "text-gray-700 dark:text-gray-300"}`}
                  >
                    No Folder
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleSelectFolder(cat.id)}
                      className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${noteCategoryIds.includes(cat.id) ? "text-primary-600" : "text-gray-700 dark:text-gray-300"}`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </button>
                  ))}
                  {categories.length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-400">
                      No folders yet
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tags Selector */}
          <div className="relative" ref={tagRef}>
            <button
              onClick={() => setShowTagMenu(!showTagMenu)}
              title={
                noteTagIds.length > 0
                  ? `${noteTagIds.length} tag${noteTagIds.length !== 1 ? "s" : ""}`
                  : "Select tags"
              }
              className={`flex items-center gap-1 px-2 py-1.5 rounded text-sm transition-colors ${
                noteTagIds.length > 0
                  ? "text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <Tag className="w-4 h-4" />
              {noteTagIds.length > 0 && (
                <span className="text-xs font-medium">{noteTagIds.length}</span>
              )}
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>
            {showTagMenu && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleCreateAndAddTag()
                      }
                      placeholder="New tag..."
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    />
                    <button
                      onClick={handleCreateAndAddTag}
                      className="p-1 text-primary-600 hover:text-primary-700"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-1 max-h-48 overflow-y-auto">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleToggleTag(tag.id)}
                      className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <span
                        className={`w-4 h-4 rounded border ${noteTagIds.includes(tag.id) ? "bg-primary-500 border-primary-500" : "border-gray-300"}`}
                      >
                        {noteTagIds.includes(tag.id) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </span>
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-gray-700 dark:text-gray-300">
                        {tag.name}
                      </span>
                    </button>
                  ))}
                  {tags.length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-400">
                      No tags yet
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={`p-1.5 rounded transition-colors ${
            hasChanges
              ? "text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900"
              : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
          }`}
          title="Save note (Ctrl+S)"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Editor/Preview */}
      <div className="flex-1 overflow-hidden">
        {viewMode === "editor" ? (
          <CodeMirror
            value={localText}
            height="100%"
            extensions={[
              markdown({ base: markdownLanguage, codeLanguages: languages }),
              ...(scrollPastEnd ? [scrollPastEndExt()] : []),
            ]}
            theme={theme === "dark" ? githubDark : githubLight}
            onChange={handleChange}
            onBlur={handleBlur}
            className="h-full"
            basicSetup={{
              lineNumbers: lineNumbers,
              foldGutter: false,
              highlightActiveLine: highlightActiveLine,
              highlightSelectionMatches: true,
            }}
          />
        ) : (
          <div className="h-full overflow-y-auto bg-white dark:bg-gray-900">
            <div
              className="max-w-3xl mx-auto markdown-preview"
              dir={textDirection}
            >
              <ReactMarkdown>{localText}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
