import { useEffect, useState } from "react";
import { useStore } from "../store";
import { Sidebar } from "./Sidebar";
import { NoteList } from "./NoteList";
import { Editor } from "./Editor";
import { Scratchpad } from "./Scratchpad";
import { Settings } from "./Settings";
import { BottomBar } from "./BottomBar";

export function Layout() {
  const { sidebarView } = useStore();
  const [showSettings, setShowSettings] = useState(false);

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

  return (
    <div className="h-screen flex bg-white dark:bg-gray-900">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Content area */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {sidebarView === "scratchpad" ? (
            <Scratchpad />
          ) : (
            <>
              <div className="w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-900">
                <NoteList />
              </div>
              <Editor />
            </>
          )}
        </div>

        {/* Bottom action bar */}
        <BottomBar onOpenSettings={() => setShowSettings(true)} />
      </div>

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
}
