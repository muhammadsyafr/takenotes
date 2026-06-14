import { useEffect, useState } from "react";
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
    setMobilePane,
  } = useStore();

  const [isMdUp, setIsMdUp] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsMdUp(mq.matches);
    const onChange = () => setIsMdUp(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isOpen = !isMdUp || isPinned || isHovered;

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
    setMobilePane("list");
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
        setMobilePane("list");
      },
    },
    {
      view: "categories" as const,
      icon: <Folder className="w-4 h-4 flex-shrink-0" />,
      label: "Folders",
      onClick: () => {
        setSidebarView("categories");
        setMobilePane("list");
      },
    },
    {
      view: "tags" as const,
      icon: <Tag className="w-4 h-4 flex-shrink-0" />,
      label: "Tags",
      onClick: () => {
        setSidebarView("tags");
        setMobilePane("list");
      },
    },
    {
      view: "trash" as const,
      icon: <Trash className="w-4 h-4 flex-shrink-0" />,
      label: "Trash",
      onClick: () => {
        setSidebarView("trash");
        setMobilePane("list");
      },
    },
  ];

  return (
    <div
      className={`relative flex-shrink-0 flex flex-col bg-patina-surface border-r border-patina-border/[.06] transition-all duration-200 overflow-hidden min-h-0 w-full ${
        isMdUp ? (isOpen ? "md:w-52" : "md:w-14") : ""
      }`}
      onMouseEnter={() => isMdUp && setIsHovered(true)}
      onMouseLeave={() => {
        if (!isMdUp) return;
        setIsHovered(false);
        if (!isPinned) setIsAddingNew(false);
      }}
    >
      {/* Scratchpad button */}
      <div className="border-b border-patina-border/[.06] p-2">
        <button
          onClick={() => {
            setSidebarView("scratchpad");
            setMobilePane("list");
          }}
          title={!isOpen ? "Scratchpad" : undefined}
          className={`w-full flex items-center gap-2 px-2 py-2 rounded-patina-sm text-sm font-medium transition-colors ${
            sidebarView === "scratchpad"
              ? "bg-amber-50 text-amber-600"
              : "text-patina-secondary hover:bg-patina-tertiary"
          } ${!isOpen ? "justify-center" : ""}`}
        >
          <NotebookPen className="w-4 h-4 flex-shrink-0" />
          {isOpen && <span className="truncate">Scratchpad</span>}
        </button>
      </div>

      {/* Nav items */}
      <div className="p-2 space-y-0.5 border-b border-patina-border/[.06]">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={item.onClick}
            title={!isOpen ? item.label : undefined}
            className={`w-full flex items-center gap-2 px-2 py-2 rounded-patina-sm text-sm font-medium transition-colors ${
              sidebarView === item.view
                ? "bg-patina-tertiary text-patina-primary"
                : "text-patina-secondary hover:bg-patina-tertiary/60"
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
          <div className="flex items-center justify-between px-3 py-2.5">
            <span className="text-xs font-semibold text-patina-muted uppercase tracking-wider">
              {sidebarView === "notes"
                ? "Starred"
                : sidebarView === "categories"
                  ? "Folders"
                  : "Tags"}
            </span>
            {sidebarView !== "notes" && (
              <button
                onClick={() => setIsAddingNew(true)}
                className="p-1 rounded-patina-sm hover:bg-patina-tertiary text-patina-muted hover:text-patina-primary transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* New Item Form */}
          {isAddingNew && (
            <div className="px-3 pb-3">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder={`New ${sidebarView === "categories" ? "folder" : "tag"}`}
                className="w-full px-3 py-2 text-sm border border-patina-border/[.10] rounded-patina-sm bg-patina-surface text-patina-on-surface placeholder-patina-muted mb-2 outline-none focus:border-patina-primary"
                autoFocus
              />
              <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewItemColor(color)}
                    className={`w-4 h-4 rounded-full transition-transform ${newItemColor === color ? "scale-110 ring-2 ring-black/20" : "hover:scale-105"}`}
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
                  className="flex-1 py-1.5 text-xs text-patina-secondary hover:text-patina-on-surface bg-patina-neutral hover:bg-patina-tertiary rounded-patina-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="flex-1 py-1.5 text-xs text-white bg-patina-primary hover:bg-primary-600 rounded-patina-sm transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* List */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-2 pb-2 min-h-0">
            {sidebarView === "notes" && (
              <div className="space-y-0.5">
                {starredNoteIds.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-6 text-center">
                    <Star className="w-6 h-6 text-patina-muted/40" />
                    <p className="text-xs text-patina-muted px-2">
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
                          className={`group flex items-center gap-2 px-2 py-1.5 rounded-patina-sm cursor-pointer text-sm transition-colors ${
                            isSelected
                              ? "bg-patina-tertiary text-patina-primary"
                              : "hover:bg-patina-tertiary/50 text-patina-secondary"
                          }`}
                        >
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
                          <span className="flex-1 truncate text-xs">{title}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStar(note.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-patina-muted hover:text-patina-error transition-opacity"
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
                  <p className="text-xs text-patina-muted text-center py-4">
                    No folders yet
                  </p>
                )}
                {sidebarView === "tags" && tags.length === 0 && (
                  <p className="text-xs text-patina-muted text-center py-4">
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
                          className={`group flex items-center gap-2 px-2 py-1.5 rounded-patina-sm cursor-pointer text-sm transition-colors ${
                            selectedCategoryId === cat.id
                              ? "bg-patina-tertiary text-patina-primary"
                              : "hover:bg-patina-tertiary/50 text-patina-secondary"
                          }`}
                        >
                          {editingId === cat.id ? (
                            <div className="flex-1 space-y-1.5">
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-patina-border/[.10] rounded-patina-sm bg-patina-surface text-patina-on-surface outline-none focus:border-patina-primary"
                                autoFocus
                              />
                              <div className="flex gap-1 flex-wrap">
                                {FOLDER_COLORS.map((color) => (
                                  <button
                                    key={color}
                                    onClick={() => setEditColor(color)}
                                    className={`w-4 h-4 rounded-full ${editColor === color ? "ring-1 ring-black/30" : ""}`}
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEdit(cat.id)}
                                  className="text-xs text-patina-primary font-medium"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="text-xs text-patina-muted"
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
                              <span className="text-xs text-patina-muted">{folderNotes.length}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEdit(cat.id, cat.name, cat.color);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-patina-muted hover:text-patina-secondary transition-opacity"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteCategory(cat.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-patina-muted hover:text-patina-error transition-opacity"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>
                        {isExpanded && folderNotes.length > 0 && (
                          <div className="ml-4 mt-0.5 space-y-0.5">
                            {folderNotes.map((note) => (
                              <div
                                key={note.id}
                                onClick={() => selectNote(note.id)}
                                className={`flex items-center gap-2 px-2 py-1 rounded-patina-sm cursor-pointer text-xs transition-colors ${
                                  selectedNoteId === note.id
                                    ? "bg-patina-tertiary text-patina-primary"
                                    : "hover:bg-patina-tertiary/50 text-patina-secondary"
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
                          <div className="ml-4 mt-0.5 text-xs text-patina-muted px-2 py-1">
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
                          className={`group flex items-center gap-2 px-2 py-1.5 rounded-patina-sm cursor-pointer text-sm transition-colors ${
                            selectedTagId === tag.id
                              ? "bg-patina-tertiary text-patina-primary"
                              : "hover:bg-patina-tertiary/50 text-patina-secondary"
                          }`}
                        >
                          {editingId === tag.id ? (
                            <div className="flex-1 space-y-1.5">
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-patina-border/[.10] rounded-patina-sm bg-patina-surface text-patina-on-surface outline-none focus:border-patina-primary"
                                autoFocus
                              />
                              <div className="flex gap-1 flex-wrap">
                                {TAG_COLORS.map((color) => (
                                  <button
                                    key={color}
                                    onClick={() => setEditColor(color)}
                                    className={`w-4 h-4 rounded-full ${editColor === color ? "ring-1 ring-black/30" : ""}`}
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEdit(tag.id)}
                                  className="text-xs text-patina-primary font-medium"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="text-xs text-patina-muted"
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
                              <span className="text-xs text-patina-muted">{tagNotes.length}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEdit(tag.id, tag.name, tag.color);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-patina-muted hover:text-patina-secondary transition-opacity"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteTag(tag.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-patina-muted hover:text-patina-error transition-opacity"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>
                        {isExpanded && tagNotes.length > 0 && (
                          <div className="ml-4 mt-0.5 space-y-0.5">
                            {tagNotes.map((note) => (
                              <div
                                key={note.id}
                                onClick={() => selectNote(note.id)}
                                className={`flex items-center gap-2 px-2 py-1 rounded-patina-sm cursor-pointer text-xs transition-colors ${
                                  selectedNoteId === note.id
                                    ? "bg-patina-tertiary text-patina-primary"
                                    : "hover:bg-patina-tertiary/50 text-patina-secondary"
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
                          <div className="ml-4 mt-0.5 text-xs text-patina-muted px-2 py-1">
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

      <div className="flex-1" />

      {/* Toggle / Pin button (desktop) */}
      <div
        className={`hidden md:flex items-center border-t border-patina-border/[.06] px-2 py-2 ${
          isOpen ? "justify-end" : "justify-center"
        }`}
      >
        <button
          type="button"
          onClick={() => setIsPinned(!isPinned)}
          className="p-1.5 rounded-patina-sm hover:bg-patina-tertiary text-patina-muted hover:text-patina-secondary transition-colors"
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
