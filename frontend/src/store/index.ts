import { create } from "zustand";
import {
  Note,
  Category,
  Tag,
  Theme,
  ViewMode,
  SidebarView,
  SortBy,
  TextDirection,
} from "../types";
import { api } from "../lib/api";

interface AppState {
  // Auth
  user: { id: string; email: string } | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;

  // Notes
  notes: Note[];
  selectedNoteId: string | null;
  selectedNote: Note | null;
  fetchNotes: (params?: {
    search?: string;
    categoryId?: string;
    tagId?: string;
  }) => Promise<void>;
  createNote: () => Promise<void>;
  updateNote: (
    text: string,
    categoryId?: string | null,
    tagIds?: string[],
  ) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  selectNote: (id: string) => void;

  // Trash
  trashNotes: Note[];
  fetchTrashNotes: () => Promise<void>;
  restoreNote: (id: string) => Promise<void>;
  permanentDeleteNote: (id: string) => Promise<void>;

  // Categories
  categories: Category[];
  selectedCategoryId: string | null;
  fetchCategories: () => Promise<void>;
  createCategory: (name: string, color?: string) => Promise<void>;
  updateCategory: (id: string, name?: string, color?: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Tags
  tags: Tag[];
  selectedTagId: string | null;
  fetchTags: () => Promise<void>;
  createTag: (name: string, color?: string) => Promise<Tag | undefined>;
  updateTag: (id: string, name?: string, color?: string) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;

  // Starred
  starredNoteIds: string[];
  toggleStar: (id: string) => void;

  // UI
  theme: Theme;
  viewMode: ViewMode;
  sidebarView: SidebarView;
  scratchpadView: 'editor' | 'preview';
  searchQuery: string;
  isLoading: boolean;
  setTheme: (theme: Theme) => void;
  setViewMode: (mode: ViewMode) => void;
  setSidebarView: (view: SidebarView) => void;
  setScratchpadView: (view: 'editor' | 'preview') => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategoryId: (id: string | null) => void;
  setSelectedTagId: (id: string | null) => void;

  // Preferences
  lineNumbers: boolean;
  highlightActiveLine: boolean;
  scrollPastEnd: boolean;
  sortBy: SortBy;
  textDirection: TextDirection;
  setLineNumbers: (v: boolean) => void;
  setHighlightActiveLine: (v: boolean) => void;
  setScrollPastEnd: (v: boolean) => void;
  setSortBy: (v: SortBy) => void;
  setTextDirection: (v: TextDirection) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Auth
  user: null,
  isAuthenticated: false,

  login: async (email, password) => {
    const response = await api.login(email, password);
    api.setToken(response.token);
    set({ user: response.user, isAuthenticated: true });
  },

  register: async (email, password) => {
    const response = await api.register(email, password);
    api.setToken(response.token);
    set({ user: response.user, isAuthenticated: true });
  },

  logout: () => {
    api.setToken(null);
    localStorage.removeItem("selectedNoteId");
    set({
      user: null,
      isAuthenticated: false,
      notes: [],
      selectedNoteId: null,
      selectedNote: null,
      starredNoteIds: [],
    });
  },

  checkAuth: async () => {
    const token = api.getToken();
    if (!token) {
      set({ isAuthenticated: false });
      return;
    }
    const savedNoteId = localStorage.getItem("selectedNoteId");
    if (savedNoteId) {
      set({ selectedNoteId: savedNoteId });
    }
    try {
      const user = await api.getMe();
      set({ user, isAuthenticated: true });
      await get().fetchNotes();
      await get().fetchCategories();
      await get().fetchTags();
    } catch {
      api.setToken(null);
      set({ isAuthenticated: false });
    }
  },

  // Notes
  notes: [],
  selectedNoteId: null,
  selectedNote: null,

  fetchNotes: async (params) => {
    set({ isLoading: true });
    try {
      const notes = await api.getNotes(params);
      const { sortBy, selectedNoteId } = get();
      const sorted = [...notes].sort((a: any, b: any) => {
        if (sortBy === "createdAt")
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        if (sortBy === "alphabetical") {
          const aTitle = (a.text.split("\n")[0] || "").replace(/^#+\s*/, "");
          const bTitle = (b.text.split("\n")[0] || "").replace(/^#+\s*/, "");
          return aTitle.localeCompare(bTitle);
        }
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });
      const selectedNote = selectedNoteId
        ? notes.find((n) => n.id === selectedNoteId) || null
        : null;
      set({ notes: sorted, selectedNote, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch notes:", error);
      set({ isLoading: false });
    }
  },

  createNote: async () => {
    try {
      const note = await api.createNote({ text: "" });
      set((state) => ({
        notes: [note, ...state.notes],
        selectedNoteId: note.id,
        selectedNote: note,
      }));
    } catch (error) {
      console.error("Failed to create note:", error);
    }
  },

  updateNote: async (text, categoryId, tagIds) => {
    const { selectedNoteId, sortBy } = get();
    if (!selectedNoteId) return;
    try {
      const payload: {
        text: string;
        categoryIds?: string[];
        tagIds?: string[];
      } = { text };
      if (categoryId !== undefined)
        payload.categoryIds = categoryId ? [categoryId] : [];
      if (tagIds !== undefined) payload.tagIds = tagIds;
      const updated = await api.updateNote(selectedNoteId, payload);
      set((state) => {
        const newNotes = state.notes.map((n) =>
          n.id === selectedNoteId
            ? {
                ...n,
                text,
                ...(payload.categoryIds && {
                  categoryIds: payload.categoryIds,
                }),
                ...(payload.tagIds && { tagIds: payload.tagIds }),
                updatedAt: updated.updatedAt,
              }
            : n,
        );
        const sorted = [...newNotes].sort((a: any, b: any) => {
          if (sortBy === "createdAt")
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          if (sortBy === "alphabetical") {
            const aTitle = (a.text.split("\n")[0] || "").replace(/^#+\s*/, "");
            const bTitle = (b.text.split("\n")[0] || "").replace(/^#+\s*/, "");
            return aTitle.localeCompare(bTitle);
          }
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
        return {
          notes: sorted,
          selectedNote:
            state.selectedNote?.id === selectedNoteId
              ? {
                  ...state.selectedNote,
                  text,
                  ...(payload.categoryIds && {
                    categoryIds: payload.categoryIds,
                  }),
                  ...(payload.tagIds && { tagIds: payload.tagIds }),
                  updatedAt: updated.updatedAt,
                }
              : state.selectedNote,
        };
      });
    } catch (error) {
      console.error("Failed to update note:", error);
    }
  },

  deleteNote: async (id) => {
    try {
      await api.deleteNote(id);
      set((state) => {
        const newStarred = state.starredNoteIds.filter((sid) => sid !== id);
        localStorage.setItem("starredNotes", JSON.stringify(newStarred));
        if (state.selectedNoteId === id) {
          localStorage.removeItem("selectedNoteId");
        }
        return {
          notes: state.notes.filter((n) => n.id !== id),
          selectedNoteId:
            state.selectedNoteId === id ? null : state.selectedNoteId,
          selectedNote: state.selectedNoteId === id ? null : state.selectedNote,
          starredNoteIds: newStarred,
        };
      });
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  },

  // Trash
  trashNotes: [],

  fetchTrashNotes: async () => {
    try {
      const trashNotes = await api.getTrashNotes();
      set({ trashNotes });
    } catch (error) {
      console.error("Failed to fetch trash notes:", error);
    }
  },

  restoreNote: async (id) => {
    try {
      await api.restoreNote(id);
      set((state) => ({
        trashNotes: state.trashNotes.filter((n) => n.id !== id),
      }));
    } catch (error) {
      console.error("Failed to restore note:", error);
    }
  },

  permanentDeleteNote: async (id) => {
    try {
      await api.permanentDeleteNote(id);
      set((state) => ({
        trashNotes: state.trashNotes.filter((n) => n.id !== id),
      }));
    } catch (error) {
      console.error("Failed to permanently delete note:", error);
    }
  },

  selectNote: (id) => {
    const note = get().notes.find((n) => n.id === id) || null;
    localStorage.setItem("selectedNoteId", id);
    set({ selectedNoteId: id, selectedNote: note });
  },

  // Categories
  categories: [],
  selectedCategoryId: null,

  fetchCategories: async () => {
    try {
      const categories = await api.getCategories();
      set({ categories });
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  },

  createCategory: async (name, color) => {
    try {
      const category = await api.createCategory({ name, color });
      set((state) => ({ categories: [...state.categories, category] }));
    } catch (error) {
      console.error("Failed to create category:", error);
    }
  },

  updateCategory: async (id, name, color) => {
    try {
      const updated = await api.updateCategory(id, { name, color });
      set((state) => ({
        categories: state.categories.map((c) =>
          c.id === id ? { ...c, ...updated } : c,
        ),
      }));
    } catch (error) {
      console.error("Failed to update category:", error);
    }
  },

  deleteCategory: async (id) => {
    try {
      await api.deleteCategory(id);
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
        selectedCategoryId:
          state.selectedCategoryId === id ? null : state.selectedCategoryId,
      }));
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  },

  // Tags
  tags: [],
  selectedTagId: null,

  fetchTags: async () => {
    try {
      const tags = await api.getTags();
      set({ tags });
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    }
  },

  createTag: async (name, color) => {
    try {
      const tag = await api.createTag({ name, color });
      set((state) => ({ tags: [...state.tags, tag] }));
      return tag;
    } catch (error) {
      console.error("Failed to create tag:", error);
    }
  },

  updateTag: async (id, name, color) => {
    try {
      const updated = await api.updateTag(id, { name, color });
      set((state) => ({
        tags: state.tags.map((t) => (t.id === id ? { ...t, ...updated } : t)),
      }));
    } catch (error) {
      console.error("Failed to update tag:", error);
    }
  },

  deleteTag: async (id) => {
    try {
      await api.deleteTag(id);
      set((state) => ({
        tags: state.tags.filter((t) => t.id !== id),
        selectedTagId: state.selectedTagId === id ? null : state.selectedTagId,
      }));
    } catch (error) {
      console.error("Failed to delete tag:", error);
    }
  },

  // Starred
  starredNoteIds: JSON.parse(localStorage.getItem("starredNotes") || "[]"),

  toggleStar: (id) => {
    const { starredNoteIds } = get();
    const newStarred = starredNoteIds.includes(id)
      ? starredNoteIds.filter((sid) => sid !== id)
      : [...starredNoteIds, id];
    localStorage.setItem("starredNotes", JSON.stringify(newStarred));
    set({ starredNoteIds: newStarred });
  },

  // UI
  theme: "dark",
  viewMode: "editor",
  sidebarView: "notes",
  scratchpadView: "editor",
  searchQuery: "",
  isLoading: false,

  setTheme: (theme) => set({ theme }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSidebarView: (view) => set({ sidebarView: view }),
  setScratchpadView: (view) => set({ scratchpadView: view }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
  setSelectedTagId: (id) => set({ selectedTagId: id }),

  // Preferences
  lineNumbers: localStorage.getItem("pref_lineNumbers") === "true",
  highlightActiveLine:
    localStorage.getItem("pref_highlightActiveLine") !== "false",
  scrollPastEnd: localStorage.getItem("pref_scrollPastEnd") !== "false",
  sortBy: (localStorage.getItem("pref_sortBy") as SortBy) || "updatedAt",
  textDirection:
    (localStorage.getItem("pref_textDirection") as TextDirection) || "ltr",

  setLineNumbers: (v) => {
    localStorage.setItem("pref_lineNumbers", String(v));
    set({ lineNumbers: v });
  },
  setHighlightActiveLine: (v) => {
    localStorage.setItem("pref_highlightActiveLine", String(v));
    set({ highlightActiveLine: v });
  },
  setScrollPastEnd: (v) => {
    localStorage.setItem("pref_scrollPastEnd", String(v));
    set({ scrollPastEnd: v });
  },
  setSortBy: (v) => {
    localStorage.setItem("pref_sortBy", v);
    const { notes } = get();
    const sorted = [...notes].sort((a: any, b: any) => {
      if (v === "createdAt")
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (v === "alphabetical") {
        const aTitle = (a.text.split("\n")[0] || "").replace(/^#+\s*/, "");
        const bTitle = (b.text.split("\n")[0] || "").replace(/^#+\s*/, "");
        return aTitle.localeCompare(bTitle);
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    set({ sortBy: v, notes: sorted });
  },
  setTextDirection: (v) => {
    localStorage.setItem("pref_textDirection", v);
    set({ textDirection: v });
  },
}));
