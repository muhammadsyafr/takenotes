export interface User {
  id: string;
  email: string;
  createdAt?: string;
}

export interface Note {
  id: string;
  userId?: string;
  text: string;
  categoryIds: string[];
  tagIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  userId?: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  userId?: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type Theme = "light" | "dark";
export type ViewMode = "editor" | "preview";
export type SidebarView = "notes" | "categories" | "tags" | "scratchpad";
export type SortBy = "updatedAt" | "createdAt" | "alphabetical";
export type TextDirection = "ltr" | "rtl";
