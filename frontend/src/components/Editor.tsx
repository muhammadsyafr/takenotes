import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "../store";
import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { scrollPastEnd as scrollPastEndExt } from "@codemirror/view";
import { githubLight, githubDark } from "@uiw/codemirror-theme-github";
import ReactMarkdown from "react-markdown";
import {
  Folder,
  Tag,
  ChevronDown,
  Check,
  Save,
  Loader2,
  ChevronLeft,
} from "lucide-react";

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
    setMobilePane,
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
      <div className="hidden md:flex flex-1 items-center justify-center bg-patina-neutral">
        <div className="text-center text-patina-muted">
          <svg
            className="w-14 h-14 mx-auto mb-4 opacity-30"
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
          <p className="text-base font-medium text-patina-secondary">Select a note to start editing</p>
          <p className="text-sm mt-1 text-patina-muted">Or create a new note from the list</p>
        </div>
      </div>
    );
  }

  const selectedFolder = categories.find((c) => noteCategoryIds.includes(c.id));

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-patina-surface">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-patina-border/[.06] bg-patina-surface gap-1 md:gap-2 min-w-0 flex-shrink-0">
        <div className="flex items-center gap-1 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setMobilePane("list")}
            className="md:hidden flex items-center gap-0.5 flex-shrink-0 text-sm font-medium text-patina-primary py-1 pr-1"
          >
            <ChevronLeft className="w-5 h-5" />
            Notes
          </button>

          {/* Folder Selector */}
          <div className="relative" ref={folderRef}>
            <button
              onClick={() => setShowFolderMenu(!showFolderMenu)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-patina-sm text-sm transition-colors ${
                selectedFolder
                  ? "text-patina-primary bg-patina-tertiary/50 hover:bg-patina-tertiary"
                  : "text-patina-muted hover:bg-patina-tertiary/50"
              }`}
            >
              <Folder className="w-3.5 h-3.5 flex-shrink-0" />
              {selectedFolder ? (
                <>
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: selectedFolder.color }}
                  />
                  <span className="text-xs truncate max-w-[6rem]">{selectedFolder.name}</span>
                </>
              ) : (
                <span className="text-xs">No folder</span>
              )}
              <ChevronDown className="w-3 h-3 opacity-60 flex-shrink-0" />
            </button>
            {showFolderMenu && (
              <div className="absolute top-full left-0 mt-1 w-48 max-w-[calc(100vw-1rem)] bg-patina-elevated border border-patina-border/[.12] rounded-patina-sm shadow-lg z-10">
                <div className="p-1">
                  <button
                    onClick={() => handleSelectFolder(null)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-patina-sm hover:bg-patina-tertiary/50 ${
                      !selectedFolder ? "text-patina-primary font-medium" : "text-patina-secondary"
                    }`}
                  >
                    No Folder
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleSelectFolder(cat.id)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-patina-sm hover:bg-patina-tertiary/50 flex items-center gap-2 ${
                        noteCategoryIds.includes(cat.id)
                          ? "text-patina-primary font-medium"
                          : "text-patina-secondary"
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </button>
                  ))}
                  {categories.length === 0 && (
                    <div className="px-3 py-2 text-sm text-patina-muted">
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
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-patina-sm text-sm transition-colors ${
                noteTagIds.length > 0
                  ? "text-patina-primary bg-patina-tertiary/50 hover:bg-patina-tertiary"
                  : "text-patina-muted hover:bg-patina-tertiary/50"
              }`}
            >
              <Tag className="w-3.5 h-3.5 flex-shrink-0" />
              {noteTagIds.length > 0 ? (
                <span className="text-xs font-medium">{noteTagIds.length} tag{noteTagIds.length !== 1 ? "s" : ""}</span>
              ) : (
                <span className="text-xs">Tags</span>
              )}
              <ChevronDown className="w-3 h-3 opacity-60 flex-shrink-0" />
            </button>
            {showTagMenu && (
              <div className="absolute top-full left-0 mt-1 w-56 max-w-[calc(100vw-1rem)] bg-patina-elevated border border-patina-border/[.12] rounded-patina-sm shadow-lg z-10">
                <div className="p-2 border-b border-patina-border/[.06]">
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleCreateAndAddTag()}
                      placeholder="New tag..."
                      className="flex-1 px-2 py-1.5 text-sm border border-patina-border/[.10] rounded-patina-sm bg-patina-surface/50 text-patina-on-surface placeholder-patina-muted outline-none focus:border-patina-primary"
                    />
                    <button
                      onClick={handleCreateAndAddTag}
                      className="p-1.5 text-patina-primary hover:bg-patina-tertiary rounded-patina-sm transition-colors"
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
                      className="w-full text-left px-3 py-2 text-sm rounded-patina-sm hover:bg-patina-tertiary/50 flex items-center gap-2"
                    >
                      <span
                        className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                          noteTagIds.includes(tag.id)
                            ? "bg-patina-primary border-patina-primary"
                            : "border-patina-border/[.15]"
                        }`}
                      >
                        {noteTagIds.includes(tag.id) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </span>
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-patina-secondary">{tag.name}</span>
                    </button>
                  ))}
                  {tags.length === 0 && (
                    <div className="px-3 py-2 text-sm text-patina-muted">
                      No tags yet
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={`flex-shrink-0 p-1.5 rounded-patina-sm transition-colors ${
            hasChanges
              ? "text-patina-primary hover:bg-patina-tertiary"
              : "text-patina-muted/40 cursor-not-allowed"
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
      <div className="flex-1 overflow-hidden min-h-0">
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
          <div className="h-full overflow-y-auto overscroll-contain bg-patina-surface min-h-0">
            <div className="max-w-3xl mx-auto markdown-preview" dir={textDirection}>
              <ReactMarkdown>{localText}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
