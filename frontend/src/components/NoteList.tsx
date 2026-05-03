import { useStore } from "../store";
import {
  Plus,
  Search,
  Trash2,
  FileText,
  Tag,
  Folder,
  Star,
  ChevronLeft,
} from "lucide-react";

export function NoteList() {
  const {
    notes,
    selectedNoteId,
    selectNote,
    createNote,
    deleteNote,
    searchQuery,
    setSearchQuery,
    fetchNotes,
    tags,
    categories,
    selectedTagId,
    selectedCategoryId,
    setSelectedTagId,
    setSelectedCategoryId,
    starredNoteIds,
    toggleStar,
    setMobilePane,
  } = useStore();

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    fetchNotes({ search: value || undefined });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const getPreview = (text: string) => {
    const lines = text.split("\n").filter((line) => line.trim());
    const firstLine = lines[0] || "";
    return firstLine.length > 40
      ? firstLine.substring(0, 40) + "..."
      : firstLine || "Empty note";
  };

  const getTagsForNote = (tagIds: string[]) => {
    return tags.filter((t) => tagIds.includes(t.id));
  };

  const getCategoryForNote = (categoryIds: string[]) => {
    return categories.find((c) => categoryIds.includes(c.id));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search and Add */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setMobilePane("sidebar")}
          className="md:hidden flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 mb-3 -ml-0.5"
        >
          <ChevronLeft className="w-5 h-5" />
          Folders
        </button>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => createNote()}
          className="mt-2 w-full flex items-center justify-center gap-2 py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Note
        </button>
      </div>

      {/* Active Filters */}
      {(selectedCategoryId || selectedTagId) && (
        <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2 flex-wrap">
          {selectedCategoryId && (() => {
            const cat = categories.find((c) => c.id === selectedCategoryId);
            return cat ? (
              <span
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium"
                style={{
                  backgroundColor: `${cat.color}20`,
                  color: cat.color,
                }}
              >
                <Folder className="w-3 h-3" />
                {cat.name}
                <button
                  onClick={() => {
                    setSelectedCategoryId(null);
                    fetchNotes({ categoryId: undefined });
                  }}
                  className="ml-0.5 opacity-60 hover:opacity-100"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ) : null;
          })()}
          {selectedTagId && (() => {
            const tag = tags.find((t) => t.id === selectedTagId);
            return tag ? (
              <span
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium"
                style={{
                  backgroundColor: `${tag.color}20`,
                  color: tag.color,
                }}
              >
                <Tag className="w-3 h-3" />
                {tag.name}
                <button
                  onClick={() => {
                    setSelectedTagId(null);
                    fetchNotes({ tagId: undefined });
                  }}
                  className="ml-0.5 opacity-60 hover:opacity-100"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ) : null;
          })()}
        </div>
      )}

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto overscroll-contain min-h-0">
        {notes.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No notes yet. Create one to get started!</p>
          </div>
        ) : (
          notes.map((note) => {
            const noteTags = getTagsForNote(note.tagIds || []);
            const noteCategory = getCategoryForNote(note.categoryIds || []);
            return (
              <div
                key={note.id}
                onClick={() => selectNote(note.id)}
                className={`group relative p-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${selectedNoteId === note.id ? "bg-gray-100 dark:bg-gray-800" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {getPreview(note.text)}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(note.updatedAt)}
                      </p>
                      {noteCategory && (
                        <span className="inline-flex items-center gap-1 text-xs">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: noteCategory.color }}
                          />
                          <span className="text-gray-500 dark:text-gray-400">
                            {noteCategory.name}
                          </span>
                        </span>
                      )}
                      {noteTags.slice(0, 2).map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs"
                          style={{
                            backgroundColor: `${tag.color}20`,
                            color: tag.color,
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                          {tag.name}
                        </span>
                      ))}
                      {noteTags.length > 2 && (
                        <span className="text-xs text-gray-400">
                          +{noteTags.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStar(note.id);
                      }}
                      className={`p-1 rounded transition-opacity ${
                        starredNoteIds.includes(note.id)
                          ? "text-amber-400 opacity-100"
                          : "text-gray-400 opacity-0 group-hover:opacity-100 hover:text-amber-400"
                      }`}
                      title={
                        starredNoteIds.includes(note.id)
                          ? "Unstar note"
                          : "Star note"
                      }
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${starredNoteIds.includes(note.id) ? "fill-amber-400" : ""}`}
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                      title="Delete note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Notes Count */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 text-center">
        {notes.length} note{notes.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
