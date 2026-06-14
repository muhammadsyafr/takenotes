import { useEffect, useState } from "react";
import { useStore } from "../store";
import { Sidebar } from "./Sidebar";
import { NoteList } from "./NoteList";
import { Editor } from "./Editor";
import { Scratchpad } from "./Scratchpad";
import { Settings } from "./Settings";
import { BottomBar } from "./BottomBar";
import { Trash, RotateCcw, Trash2, ChevronLeft } from "lucide-react";

export function Layout() {
  const {
    sidebarView,
    trashNotes,
    restoreNote,
    permanentDeleteNote,
    fetchTrashNotes,
    mobilePane,
    setMobilePane,
  } = useStore();
  const [showSettings, setShowSettings] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === ",") {
        e.preventDefault();
        setShowSettings(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (sidebarView === "trash") {
      fetchTrashNotes();
    }
  }, [sidebarView, fetchTrashNotes]);

  const isNotesFlow =
    sidebarView === "notes" ||
    sidebarView === "categories" ||
    sidebarView === "tags";

  return (
    <div className="h-dvh flex bg-patina-neutral min-h-0">
      <div
        className={`${
          mobilePane === "sidebar" ? "flex" : "hidden"
        } md:flex min-h-0 min-w-0 flex-shrink-0 w-full md:w-auto`}
      >
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <div className="flex-1 flex overflow-hidden min-h-0">
          {isNotesFlow ? (
            <>
              <div
                className={`${
                  mobilePane === "list" ? "flex" : "hidden"
                } md:flex w-full md:w-72 flex-shrink-0 border-r border-patina-border/[.06] flex-col bg-patina-surface min-h-0`}
              >
                <NoteList />
              </div>
              <div
                className={`${
                  mobilePane === "editor" ? "flex" : "hidden"
                } md:flex flex-1 flex-col min-w-0 min-h-0`}
              >
                <Editor />
              </div>
            </>
          ) : sidebarView === "scratchpad" ? (
            <div
              className={`${
                mobilePane === "list" ? "flex" : "hidden"
              } md:flex flex-1 flex-col overflow-hidden min-h-0 w-full bg-patina-surface`}
            >
              <div className="md:hidden flex items-center gap-2 px-3 py-2 border-b border-patina-border/[.06] bg-patina-surface flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setMobilePane("sidebar")}
                  className="flex items-center gap-1 text-sm font-medium text-patina-primary -ml-1"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Folders
                </button>
              </div>
              <Scratchpad />
            </div>
          ) : sidebarView === "trash" ? (
            <div
              className={`${
                mobilePane === "list" ? "flex" : "hidden"
              } md:flex flex-1 flex-col bg-patina-surface min-h-0 w-full`}
            >
              <div className="md:hidden flex items-center gap-2 px-3 py-2 border-b border-patina-border/[.06] flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setMobilePane("sidebar")}
                  className="flex items-center gap-1 text-sm font-medium text-patina-primary -ml-1"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Folders
                </button>
              </div>
              <div className="p-5 border-b border-patina-border/[.06]">
                <h2 className="text-base font-semibold text-patina-on-surface font-manrope flex items-center gap-2">
                  <Trash className="w-4 h-4" />
                  Trash
                </h2>
                <p className="text-xs text-patina-muted mt-1">
                  {trashNotes.length} item{trashNotes.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto overscroll-contain min-h-0">
                {trashNotes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-patina-muted">
                    <Trash className="w-10 h-10 mb-3 opacity-40" />
                    <p className="text-sm">Trash is empty</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {trashNotes.map((note) => {
                      const firstLine =
                        (note.text.split("\n")[0] || "").replace(/^#+\s*/, "") ||
                        "Empty note";
                      const title = firstLine.substring(0, 50);
                      const trashedDate = note.trashedAt
                        ? new Date(note.trashedAt).toLocaleDateString()
                        : "";
                      return (
                        <div
                          key={note.id}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-patina-sm hover:bg-patina-tertiary/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-patina-on-surface truncate">
                              {title}
                            </p>
                            <p className="text-xs text-patina-muted mt-0.5">
                              Deleted {trashedDate}
                            </p>
                          </div>
                          <button
                            onClick={() => restoreNote(note.id)}
                            className="p-1.5 text-patina-muted hover:text-green-600 hover:bg-green-50 rounded-patina-sm transition-colors"
                            title="Restore"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(note.id)}
                            className="p-1.5 text-patina-muted hover:text-patina-error hover:bg-patina-error/10 rounded-patina-sm transition-colors"
                            title="Delete permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-patina-elevated rounded-patina-lg shadow-xl p-7 max-w-sm w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-patina-error/10 rounded-patina-sm">
                  <Trash2 className="w-5 h-5 text-patina-error" />
                </div>
                <h3 className="text-base font-semibold text-patina-on-surface font-manrope">
                  Delete Permanently?
                </h3>
              </div>
              <p className="text-sm text-patina-secondary mb-6 leading-relaxed">
                This action cannot be undone. The note will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-patina-on-surface bg-patina-neutral hover:bg-patina-tertiary rounded-patina-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    permanentDeleteNote(deleteConfirm);
                    setDeleteConfirm(null);
                  }}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-patina-error hover:bg-[#cc4444] rounded-patina-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <BottomBar onOpenSettings={() => setShowSettings(true)} />
      </div>

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
}
