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
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none ${
        checked ? "bg-primary-600" : "bg-gray-300 dark:bg-gray-600"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
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
    <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className="flex-1 mr-8">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {title}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {description}
        </p>
      </div>
      {control}
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
    <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className="flex items-start gap-3 flex-1 mr-8">
        <Icon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {title}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {description}
          </p>
        </div>
      </div>
      <button
        onClick={onClick}
        disabled={loading}
        className="flex-shrink-0 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors disabled:opacity-50"
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
  const [importStatus, setImportStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadZip = async () => {
    const zip = new JSZip();
    notes.forEach((note) => {
      const firstLine =
        note.text.split("\n")[0]?.replace(/^#*\s*/, "") || "Untitled";
      const filename = `${firstLine.slice(0, 50)}.md`;
      zip.file(filename, note.text);
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
          const created = await api.createCategory({
            name: cat.name,
            color: cat.color,
          });
          catIdMap[cat.id] = created.id;
        }
      }

      const tagIdMap: Record<string, string> = {};
      if (Array.isArray(data.tags)) {
        for (const tag of data.tags) {
          const created = await api.createTag({
            name: tag.name,
            color: tag.color,
          });
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

  const navItems: { id: Section; icon: React.ElementType; label: string }[] = [
    { id: "preferences", icon: Settings2, label: "Preferences" },
    { id: "shortcuts", icon: Keyboard, label: "Keyboard shortcuts" },
    { id: "data", icon: Database, label: "Data management" },
    { id: "about", icon: Info, label: "About TakeNote" },
  ];

  const selectClass =
    "px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-[780px] max-w-[95vw] h-[560px] max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {user?.email}
            </span>
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="px-3 py-1.5 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              Log out
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left nav */}
          <div className="w-52 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 p-3 space-y-0.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  section === item.id
                    ? "bg-gray-900 dark:bg-gray-700 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </button>
            ))}
          </div>

          {/* Right content */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            {/* Preferences */}
            {section === "preferences" && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Preferences
                </h2>
                <SettingRow
                  title="Active line highlight"
                  description="Controls whether the editor should highlight the active line"
                  control={
                    <Toggle
                      checked={highlightActiveLine}
                      onChange={setHighlightActiveLine}
                    />
                  }
                />
                <SettingRow
                  title="Display line numbers"
                  description="Controls whether the editor should display line numbers"
                  control={
                    <Toggle checked={lineNumbers} onChange={setLineNumbers} />
                  }
                />
                <SettingRow
                  title="Scroll past end"
                  description="Controls whether the editor will add blank space to the end of all files"
                  control={
                    <Toggle
                      checked={scrollPastEnd}
                      onChange={setScrollPastEnd}
                    />
                  }
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
                      onChange={(e) => {
                        setSortBy(e.target.value as SortBy);
                        fetchNotes();
                      }}
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
                      onChange={(e) =>
                        setTextDirection(e.target.value as TextDirection)
                      }
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
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Keyboard shortcuts
                </h2>
                <div className="space-y-1">
                  {SHORTCUTS.map((s) => (
                    <div
                      key={s.keys}
                      className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {s.description}
                      </span>
                      <kbd className="px-2.5 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg">
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
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportFile}
                />
                {importStatus && (
                  <div
                    className={`mt-4 px-4 py-3 rounded-lg text-sm ${importStatus.type === "success" ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"}`}
                  >
                    {importStatus.message}
                  </div>
                )}
              </div>
            )}

            {/* About */}
            {section === "about" && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  About TakeNote
                </h2>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
                    <Settings2 className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-gray-900 dark:text-white">
                      TakeNote
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Version 1.0.0
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  TakeNote is a minimal, fast Markdown note-taking app. Organize
                  your thoughts with folders and tags, write in Markdown, and
                  keep everything in sync.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
