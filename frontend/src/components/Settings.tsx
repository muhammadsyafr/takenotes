import { useRef, useState } from "react";
import { useStore } from "../store";
import { api } from "../lib/api";
import {
  X,
  Settings2,
  Keyboard,
  Database,
  Info,
  Upload,
  FileJson,
  FileArchive,
  FolderOpen,
} from "lucide-react";
import JSZip from "jszip";

type SortBy = "updatedAt" | "createdAt" | "alphabetical";
type TextDirection = "ltr" | "rtl";
type Section = "preferences" | "shortcuts" | "data" | "about";

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none ${
        checked ? "bg-patina-primary" : "bg-patina-tertiary"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-patina-surface shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function SettingRow({
  title,
  description,
  control,
}: {
  title: string;
  description: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-4 border-b border-patina-border/[.06] last:border-0">
      <div className="flex-1 min-w-0 sm:mr-8">
        <p className="text-sm font-semibold text-patina-on-surface">{title}</p>
        <p className="text-xs text-patina-muted mt-0.5">{description}</p>
      </div>
      <div className="flex-shrink-0 sm:self-center">{control}</div>
    </div>
  );
}

function DataRow({
  icon: Icon,
  title,
  description,
  buttonLabel,
  onClick,
  loading,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  buttonLabel: string;
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-4 border-b border-patina-border/[.06] last:border-0">
      <div className="flex items-start gap-3 flex-1 min-w-0 sm:mr-8">
        <Icon className="w-5 h-5 text-patina-muted mt-0.5 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-patina-on-surface">{title}</p>
          <p className="text-xs text-patina-muted mt-0.5">{description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="w-full sm:w-auto flex-shrink-0 px-4 py-2 text-sm font-medium bg-patina-tertiary hover:bg-[#c8d9ea] text-patina-on-surface rounded-patina-sm border border-patina-border/[.06] transition-colors disabled:opacity-50"
      >
        {loading ? "Working…" : buttonLabel}
      </button>
    </div>
  );
}

const SHORTCUTS = [
  { keys: "Ctrl + S", description: "Save current note" },
  { keys: "Ctrl + N", description: "Create new note" },
  { keys: "Ctrl + P", description: "Toggle preview mode" },
  { keys: "Ctrl + ,", description: "Open settings" },
];

export function Settings({ onClose }: { onClose: () => void }) {
  const {
    user,
    logout,
    theme,
    setTheme,
    viewMode,
    setViewMode,
    lineNumbers,
    setLineNumbers,
    highlightActiveLine,
    setHighlightActiveLine,
    scrollPastEnd,
    setScrollPastEnd,
    sortBy,
    setSortBy,
    textDirection,
    setTextDirection,
    notes,
    categories,
    tags,
    fetchNotes,
    fetchCategories,
    fetchTags,
  } = useStore();

  const [section, setSection] = useState<Section>("preferences");
  const [importing, setImporting] = useState(false);
  const [importingFolder, setImportingFolder] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadZip = async () => {
    const zip = new JSZip();
    notes.forEach((note) => {
      const firstLine =
        note.text.split("\n")[0]?.replace(/^#*\s*/, "") || "Untitled";
      zip.file(`${firstLine.slice(0, 50)}.md`, note.text);
    });
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = "takenote-notes.zip";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      notes,
      categories,
      tags,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "takenote-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportStatus(null);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const catIdMap: Record<string, string> = {};
      if (Array.isArray(data.categories)) {
        for (const cat of data.categories) {
          const created = await api.createCategory({ name: cat.name, color: cat.color });
          catIdMap[cat.id] = created.id;
        }
      }

      const tagIdMap: Record<string, string> = {};
      if (Array.isArray(data.tags)) {
        for (const tag of data.tags) {
          const created = await api.createTag({ name: tag.name, color: tag.color });
          tagIdMap[tag.id] = created.id;
        }
      }

      let noteCount = 0;
      if (Array.isArray(data.notes)) {
        for (const note of data.notes) {
          const categoryIds = (note.categoryIds || [])
            .map((id: string) => catIdMap[id])
            .filter(Boolean);
          const tagIds = (note.tagIds || [])
            .map((id: string) => tagIdMap[id])
            .filter(Boolean);
          await api.createNote({ text: note.text, categoryIds, tagIds });
          noteCount++;
        }
      }

      await fetchNotes();
      await fetchCategories();
      await fetchTags();
      setImportStatus({
        type: "success",
        message: `Successfully imported ${noteCount} note${noteCount !== 1 ? "s" : ""}`,
      });
    } catch {
      setImportStatus({
        type: "error",
        message: "Import failed. Please check the file format.",
      });
    }
    setImporting(false);
    e.target.value = "";
  };

  const handleImportFolder = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setImportingFolder(true);
    setImportStatus(null);
    try {
      let noteCount = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (
          file.name.endsWith(".md") ||
          file.name.endsWith(".markdown") ||
          file.name.endsWith(".txt")
        ) {
          const text = await file.text();
          await api.createNote({ text });
          noteCount++;
        }
      }
      await fetchNotes();
      setImportStatus({
        type: "success",
        message: `Successfully imported ${noteCount} note${noteCount !== 1 ? "s" : ""}`,
      });
    } catch {
      setImportStatus({
        type: "error",
        message: "Import failed. Please try again.",
      });
    }
    setImportingFolder(false);
    e.target.value = "";
  };

  const navItems: { id: Section; icon: React.ElementType; label: string }[] = [
    { id: "preferences", icon: Settings2, label: "Preferences" },
    { id: "shortcuts", icon: Keyboard, label: "Keyboard shortcuts" },
    { id: "data", icon: Database, label: "Data management" },
    { id: "about", icon: Info, label: "About TakeNote" },
  ];

  const selectClass =
    "px-3 py-1.5 text-sm bg-patina-elevated text-patina-on-surface border border-patina-border/[.10] rounded-patina-sm focus:outline-none focus:ring-2 focus:ring-patina-primary/20 focus:border-patina-primary transition-colors";

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center md:items-center md:p-4 bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-patina-elevated shadow-2xl w-full h-full max-h-dvh md:rounded-patina-lg md:w-[780px] md:max-w-[95vw] md:h-[560px] md:max-h-[90vh] flex flex-col overflow-hidden min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 md:px-6 py-3 border-b border-patina-border/[.06] bg-patina-elevated flex-shrink-0">
          <div className="flex flex-wrap items-center gap-2 md:gap-3 min-w-0">
            <span className="text-sm font-medium text-patina-secondary truncate max-w-[min(100%,14rem)] md:max-w-none">
              {user?.email}
            </span>
            <button
              type="button"
              onClick={() => {
                logout();
                onClose();
              }}
              className="px-3 py-1.5 text-sm font-medium bg-patina-primary hover:bg-primary-600 text-white rounded-patina-sm transition-colors flex-shrink-0"
            >
              Log out
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-patina-sm hover:bg-patina-tertiary text-patina-muted hover:text-patina-secondary transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">
          {/* Nav */}
          <div className="flex flex-row md:flex-col w-full md:w-52 flex-shrink-0 border-b md:border-b-0 md:border-r border-patina-border/[.06] p-2 md:p-3 gap-1 md:space-y-0.5 overflow-x-auto overscroll-x-contain [scrollbar-width:thin]">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={`flex-shrink-0 whitespace-nowrap flex items-center gap-2 md:gap-3 px-3 py-2.5 rounded-patina-sm text-sm font-medium transition-colors ${
                  section === item.id
                    ? "bg-patina-tertiary text-patina-primary"
                    : "text-patina-secondary hover:bg-patina-tertiary/50"
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </button>
            ))}
          </div>

          {/* Right content */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 md:px-8 py-4 md:py-6 min-h-0">
            {/* Preferences */}
            {section === "preferences" && (
              <div>
                <h2 className="text-base font-semibold text-patina-on-surface font-manrope mb-1">
                  Preferences
                </h2>
                <SettingRow
                  title="Active line highlight"
                  description="Controls whether the editor should highlight the active line"
                  control={
                    <Toggle checked={highlightActiveLine} onChange={setHighlightActiveLine} />
                  }
                />
                <SettingRow
                  title="Display line numbers"
                  description="Controls whether the editor should display line numbers"
                  control={<Toggle checked={lineNumbers} onChange={setLineNumbers} />}
                />
                <SettingRow
                  title="Scroll past end"
                  description="Controls whether the editor will add blank space to the end of all files"
                  control={<Toggle checked={scrollPastEnd} onChange={setScrollPastEnd} />}
                />
                <SettingRow
                  title="Markdown preview"
                  description="Controls whether markdown preview mode is enabled"
                  control={
                    <Toggle
                      checked={viewMode === "preview"}
                      onChange={(v) => setViewMode(v ? "preview" : "editor")}
                    />
                  }
                />
                <SettingRow
                  title="Dark mode"
                  description="Controls the theme of the application and editor"
                  control={
                    <Toggle
                      checked={theme === "dark"}
                      onChange={(v) => setTheme(v ? "dark" : "light")}
                    />
                  }
                />
                <SettingRow
                  title="Sort By"
                  description="Controls the sort strategy of the notes"
                  control={
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortBy)}
                      className={selectClass}
                    >
                      <option value="updatedAt">Last Updated</option>
                      <option value="createdAt">Created At</option>
                      <option value="alphabetical">Alphabetical</option>
                    </select>
                  }
                />
                <SettingRow
                  title="Text direction"
                  description="Controls the direction of the text in the editor"
                  control={
                    <select
                      value={textDirection}
                      onChange={(e) => setTextDirection(e.target.value as TextDirection)}
                      className={selectClass}
                    >
                      <option value="ltr">Left to right</option>
                      <option value="rtl">Right to left</option>
                    </select>
                  }
                />
              </div>
            )}

            {/* Keyboard shortcuts */}
            {section === "shortcuts" && (
              <div>
                <h2 className="text-base font-semibold text-patina-on-surface font-manrope mb-1">
                  Keyboard shortcuts
                </h2>
                <div className="space-y-1">
                  {SHORTCUTS.map((s) => (
                    <div
                      key={s.keys}
                      className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between py-3 border-b border-patina-border/[.06] last:border-0"
                    >
                      <span className="text-sm text-patina-secondary">{s.description}</span>
                      <kbd className="self-start sm:self-auto px-2.5 py-1 text-xs font-mono bg-patina-neutral text-patina-secondary border border-patina-border/[.08] rounded-patina-sm">
                        {s.keys}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Data management */}
            {section === "data" && (
              <div>
                <h2 className="text-base font-semibold text-patina-on-surface font-manrope mb-1">
                  Data management
                </h2>
                <DataRow
                  icon={FileArchive}
                  title="Download all notes"
                  description="Download all notes as Markdown files in a zip."
                  buttonLabel="Download all notes"
                  onClick={handleDownloadZip}
                />
                <DataRow
                  icon={FileJson}
                  title="Export backup"
                  description="Export TakeNote data as JSON."
                  buttonLabel="Export backup"
                  onClick={handleExportJSON}
                />
                <DataRow
                  icon={Upload}
                  title="Import backup"
                  description="Import TakeNote JSON file."
                  buttonLabel="Import backup"
                  onClick={() => fileInputRef.current?.click()}
                  loading={importing}
                />
                <DataRow
                  icon={FolderOpen}
                  title="Import from folder"
                  description="Import all markdown files from a folder."
                  buttonLabel="Import from folder"
                  onClick={() => folderInputRef.current?.click()}
                  loading={importingFolder}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportFile}
                />
                <input
                  ref={folderInputRef}
                  type="file"
                  // @ts-ignore
                  webkitdirectory=""
                  multiple
                  className="hidden"
                  onChange={handleImportFolder}
                />
                {importStatus && (
                  <div
                    className={`mt-4 px-4 py-3 rounded-patina-sm text-sm ${
                      importStatus.type === "success"
                        ? "bg-green-50 text-green-700"
                        : "bg-patina-error/10 text-patina-error"
                    }`}
                  >
                    {importStatus.message}
                  </div>
                )}
              </div>
            )}

            {/* About */}
            {section === "about" && (
              <div>
                <h2 className="text-base font-semibold text-patina-on-surface font-manrope mb-4">
                  About TakeNote
                </h2>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-patina-primary rounded-patina-sm flex items-center justify-center">
                    <Settings2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-patina-on-surface font-manrope">
                      TakeNote
                    </p>
                    <p className="text-sm text-patina-muted">Version 1.0.0</p>
                  </div>
                </div>
                <p className="text-sm text-patina-secondary leading-relaxed">
                  TakeNote is a minimal, fast Markdown note-taking app. Organize your thoughts with
                  folders and tags, write in Markdown, and keep everything in sync.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
