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
    <div className="h-dvh flex bg-white dark:bg-gray-900 min-h-0">
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
                } md:flex w-full md:w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 flex-col bg-white dark:bg-gray-900 min-h-0`}
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
              } md:flex flex-1 flex-col overflow-hidden min-h-0 w-full`}
            >
              <div className="md:hidden flex items-center gap-2 px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setMobilePane("sidebar")}
                  className="flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 -ml-1"
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
              } md:flex flex-1 flex-col bg-white dark:bg-gray-900 min-h-0 w-full`}
            >
              <div className="md:hidden flex items-center gap-2 px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setMobilePane("sidebar")}
                  className="flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 -ml-1"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Folders
                </button>
              </div>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Trash className="w-5 h-5" />
                  Trash
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {trashNotes.length} item{trashNotes.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto overscroll-contain min-h-0">
                {trashNotes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
                    <Trash className="w-12 h-12 mb-4 opacity-50" />
                    <p>Trash is empty</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
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
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              Deleted on {trashedDate}
                            </p>
                          </div>
                          <button
                            onClick={() => restoreNote(note.id)}
                            className="p-2 text-gray-400 hover:text-green-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            title="Restore"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(note.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            title="Delete permanently"
                          >
                            <Trash2 className="w-4 h-4" />
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Delete Permanently?
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                This action cannot be undone. The note will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    permanentDeleteNote(deleteConfirm);
                    setDeleteConfirm(null);
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
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
