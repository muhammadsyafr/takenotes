import { useState } from "react";
import { useStore } from "../store";
import {
  Plus,
  Trash2,
  Edit2,
  X,
  NotebookPen,
  Star,
  Folder,
  Tag,
  ChevronRight,
  ChevronLeft,
  Trash,
} from "lucide-react";

const TAG_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
  "#F97316",
  "#6366F1",
];

const FOLDER_COLORS = [
  "#6B7280",
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
  "#F97316",
];

export function Sidebar() {
  const {
    sidebarView,
    setSidebarView,
    categories,
    tags,
    notes,
    selectedCategoryId,
    setSelectedCategoryId,
    selectedTagId,
    setSelectedTagId,
    createCategory,
    updateCategory,
    deleteCategory,
    createTag,
    updateTag,
    deleteTag,
    fetchNotes,
    starredNoteIds,
    toggleStar,
    selectNote,
    selectedNoteId,
  } = useStore();

  // Collapse state: isPinned = sidebar stays open; hover temporarily opens it
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isOpen = isPinned || isHovered;

  const [newItemName, setNewItemName] = useState("");
  const [newItemColor, setNewItemColor] = useState(TAG_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [expandedFolder, setExpandedFolder] = useState<string | null>(null);
  const [expandedTag, setExpandedTag] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newItemName.trim()) return;
    if (sidebarView === "categories") {
      await createCategory(newItemName, newItemColor);
    } else if (sidebarView === "tags") {
      await createTag(newItemName, newItemColor);
    }
    setNewItemName("");
    setNewItemColor(
      sidebarView === "categories" ? FOLDER_COLORS[0] : TAG_COLORS[0],
    );
    setIsAddingNew(false);
  };

  const handleEdit = async (id: string) => {
    if (!editName.trim()) return;
    if (sidebarView === "categories") {
      await updateCategory(id, editName, editColor);
    } else if (sidebarView === "tags") {
      await updateTag(id, editName, editColor);
    }
    setEditingId(null);
    setEditName("");
    setEditColor("");
  };

  const handleSelect = (id: string) => {
    if (sidebarView === "categories") {
      const newId = selectedCategoryId === id ? null : id;
      setSelectedCategoryId(newId);
      fetchNotes({ categoryId: newId || undefined });
    } else if (sidebarView === "tags") {
      const newId = selectedTagId === id ? null : id;
      setSelectedTagId(newId);
      fetchNotes({ tagId: newId || undefined });
    }
  };

  const startEdit = (id: string, name: string, color: string) => {
    setEditingId(id);
    setEditName(name);
    setEditColor(color);
  };

  const colors = sidebarView === "categories" ? FOLDER_COLORS : TAG_COLORS;

  const navItems = [
    {
      view: "notes" as const,
      icon: (
        <Star
          className={`w-4 h-4 flex-shrink-0 ${sidebarView === "notes" ? "fill-current" : ""}`}
        />
      ),
      label: "Star",
      onClick: () => {
        setSidebarView("notes");
        setSelectedCategoryId(null);
        setSelectedTagId(null);
        fetchNotes();
      },
    },
    {
      view: "categories" as const,
      icon: <Folder className="w-4 h-4 flex-shrink-0" />,
      label: "Folders",
      onClick: () => setSidebarView("categories"),
    },
    {
      view: "tags" as const,
      icon: <Tag className="w-4 h-4 flex-shrink-0" />,
      label: "Tags",
      onClick: () => setSidebarView("tags"),
    },
    {
      view: "trash" as const,
      icon: <Trash className="w-4 h-4 flex-shrink-0" />,
      label: "Trash",
      onClick: () => {
        setSidebarView("trash");
      },
    },
  ];

  return (
    <div
      className={`relative flex-shrink-0 flex flex-col bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-200 overflow-hidden ${isOpen ? "w-52" : "w-14"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (!isPinned) setIsAddingNew(false);
      }}
    >
      {/* Scratchpad button */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-2">
        <button
          onClick={() => setSidebarView("scratchpad")}
          title={!isOpen ? "Scratchpad" : undefined}
          className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
            sidebarView === "scratchpad"
              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          } ${!isOpen ? "justify-center" : ""}`}
        >
          <NotebookPen className="w-4 h-4 flex-shrink-0" />
          {isOpen && <span className="truncate">Scratchpad</span>}
        </button>
      </div>

      {/* Nav items */}
      <div className="p-2 space-y-0.5 border-b border-gray-200 dark:border-gray-700">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={item.onClick}
            title={!isOpen ? item.label : undefined}
            className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
              sidebarView === item.view
                ? "bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            } ${!isOpen ? "justify-center" : ""}`}
          >
            {item.icon}
            {isOpen && <span className="truncate">{item.label}</span>}
          </button>
        ))}
      </div>

      {/* Content (only when expanded and not on scratchpad) */}
      {isOpen && sidebarView !== "scratchpad" && sidebarView !== "trash" && (
        <>
          {/* Section header */}
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {sidebarView === "notes"
                ? "Starred"
                : sidebarView === "categories"
                  ? "Folders"
                  : "Tags"}
            </span>
            {sidebarView !== "notes" && (
              <button
                onClick={() => setIsAddingNew(true)}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-primary-600"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* New Item Form */}
          {isAddingNew && (
            <div className="px-3 pb-2">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder={`New ${sidebarView === "categories" ? "folder" : "tag"}`}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-2"
                autoFocus
              />
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewItemColor(color)}
                    className={`w-5 h-5 rounded-full transition-transform ${newItemColor === color ? "scale-110 ring-2 ring-gray-400" : "hover:scale-105"}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsAddingNew(false);
                    setNewItemName("");
                  }}
                  className="flex-1 py-1.5 text-xs text-gray-500 hover:text-gray-700 bg-gray-100 dark:bg-gray-700 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="flex-1 py-1.5 text-xs text-white bg-primary-600 hover:bg-primary-700 rounded"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* List */}
          <div className="flex-1 overflow-y-auto px-2 pb-2">
            {sidebarView === "notes" && (
              <div className="space-y-0.5">
                {starredNoteIds.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-6 text-center">
                    <Star className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                    <p className="text-xs text-gray-400 dark:text-gray-500 px-2">
                      Star notes to pin them here for quick access
                    </p>
                  </div>
                ) : (
                  notes
                    .filter((n) => starredNoteIds.includes(n.id))
                    .map((note) => {
                      const isSelected = selectedNoteId === note.id;
                      const firstLine =
                        note.text.split("\n").find((l) => l.trim()) ||
                        "Empty note";
                      const title = firstLine
                        .replace(/^#+\s*/, "")
                        .substring(0, 30);
                      return (
                        <div
                          key={note.id}
                          onClick={() => selectNote(note.id)}
                          className={`group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-sm transition-colors ${
                            isSelected
                              ? "bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300"
                              : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
                          <span className="flex-1 truncate text-xs">
                            {title}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStar(note.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-red-400 transition-opacity"
                            title="Unstar"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })
                )}
              </div>
            )}

            {sidebarView !== "notes" && (
              <div className="space-y-0.5">
                {sidebarView === "categories" && categories.length === 0 && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">
                    No folders yet
                  </p>
                )}
                {sidebarView === "tags" && tags.length === 0 && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">
                    No tags yet
                  </p>
                )}

                {sidebarView === "categories" &&
                  categories.map((cat) => {
                    const folderNotes = notes.filter((n) => (n.categoryIds || []).includes(cat.id));
                    const isExpanded = expandedFolder === cat.id;
                    return (
                      <div key={cat.id}>
                        <div
                          className={`group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-sm transition-colors ${
                            selectedCategoryId === cat.id
                              ? "bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300"
                              : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {editingId === cat.id ? (
                            <div className="flex-1 space-y-1.5">
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                autoFocus
                              />
                              <div className="flex gap-1 flex-wrap">
                                {FOLDER_COLORS.map((color) => (
                                  <button
                                    key={color}
                                    onClick={() => setEditColor(color)}
                                    className={`w-4 h-4 rounded-full ${editColor === color ? "ring-1 ring-gray-400" : ""}`}
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEdit(cat.id)}
                                  className="text-xs text-primary-600"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="text-xs text-gray-500"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setExpandedFolder(isExpanded ? null : cat.id);
                                  handleSelect(cat.id);
                                }}
                                className="flex-shrink-0"
                              >
                                <span
                                  className="w-2.5 h-2.5 rounded-full block"
                                  style={{ backgroundColor: cat.color }}
                                />
                              </button>
                              <span
                                className="flex-1 truncate"
                                onClick={() => handleSelect(cat.id)}
                              >
                                {cat.name}
                              </span>
                              <span className="text-xs text-gray-400">{folderNotes.length}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEdit(cat.id, cat.name, cat.color);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteCategory(cat.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>
                        {isExpanded && folderNotes.length > 0 && (
                          <div className="ml-4 mt-1 space-y-0.5">
                            {folderNotes.map((note) => (
                              <div
                                key={note.id}
                                onClick={() => selectNote(note.id)}
                                className={`flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer text-xs transition-colors ${
                                  selectedNoteId === note.id
                                    ? "bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300"
                                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                                }`}
                              >
                                <span className="flex-1 truncate">
                                  {(note.text.split("\n")[0] || "").replace(/^#+\s*/, "") || "Empty note"}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        {isExpanded && folderNotes.length === 0 && (
                          <div className="ml-4 mt-1 text-xs text-gray-400 dark:text-gray-500 px-2 py-1">
                            No notes in this folder
                          </div>
                        )}
                      </div>
                    );
                  })}

                {sidebarView === "tags" &&
                  tags.map((tag) => {
                    const tagNotes = notes.filter((n) => (n.tagIds || []).includes(tag.id));
                    const isExpanded = expandedTag === tag.id;
                    return (
                      <div key={tag.id}>
                        <div
                          className={`group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-sm transition-colors ${
                            selectedTagId === tag.id
                              ? "bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300"
                              : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {editingId === tag.id ? (
                            <div className="flex-1 space-y-1.5">
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                autoFocus
                              />
                              <div className="flex gap-1 flex-wrap">
                                {TAG_COLORS.map((color) => (
                                  <button
                                    key={color}
                                    onClick={() => setEditColor(color)}
                                    className={`w-4 h-4 rounded-full ${editColor === color ? "ring-1 ring-gray-400" : ""}`}
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEdit(tag.id)}
                                  className="text-xs text-primary-600"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="text-xs text-gray-500"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setExpandedTag(isExpanded ? null : tag.id);
                                  handleSelect(tag.id);
                                }}
                                className="flex-shrink-0"
                              >
                                <span
                                  className="w-2.5 h-2.5 rounded-full block"
                                  style={{ backgroundColor: tag.color }}
                                />
                              </button>
                              <span
                                className="flex-1 truncate"
                                onClick={() => handleSelect(tag.id)}
                              >
                                {tag.name}
                              </span>
                              <span className="text-xs text-gray-400">{tagNotes.length}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEdit(tag.id, tag.name, tag.color);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteTag(tag.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>
                        {isExpanded && tagNotes.length > 0 && (
                          <div className="ml-4 mt-1 space-y-0.5">
                            {tagNotes.map((note) => (
                              <div
                                key={note.id}
                                onClick={() => selectNote(note.id)}
                                className={`flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer text-xs transition-colors ${
                                  selectedNoteId === note.id
                                    ? "bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300"
                                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                                }`}
                              >
                                <span className="flex-1 truncate">
                                  {(note.text.split("\n")[0] || "").replace(/^#+\s*/, "") || "Empty note"}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        {isExpanded && tagNotes.length === 0 && (
                          <div className="ml-4 mt-1 text-xs text-gray-400 dark:text-gray-500 px-2 py-1">
                            No notes with this tag
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Spacer to keep toggle at bottom */}
      <div className="flex-1" />

      {/* Toggle / Pin button */}
      <div
        className={`flex items-center border-t border-gray-200 dark:border-gray-700 px-2 py-2 ${isOpen ? "justify-end" : "justify-center"}`}
      >
        <button
          onClick={() => setIsPinned(!isPinned)}
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          title={isPinned ? "Collapse sidebar" : "Pin sidebar open"}
        >
          {isPinned ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
