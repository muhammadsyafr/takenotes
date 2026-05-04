const API_BASE = '/api';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.setToken(null);
      throw new Error('Invalid email or password');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'An error occurred' }));
      throw new Error(error.error || 'An error occurred');
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Auth
  async register(email: string, password: string) {
    return this.request<{ token: string; user: { id: string; email: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async login(email: string, password: string) {
    return this.request<{ token: string; user: { id: string; email: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getMe() {
    return this.request<{ id: string; email: string }>('/auth/me');
  }

  // Notes
  async getNotes(params?: { search?: string; categoryId?: string; tagId?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.categoryId) query.set('categoryId', params.categoryId);
    if (params?.tagId) query.set('tagId', params.tagId);
    const queryString = query.toString();
    return this.request<any[]>(`/notes${queryString ? `?${queryString}` : ''}`);
  }

  async getNote(id: string) {
    return this.request<any>(`/notes/${id}`);
  }

  async createNote(note: { text?: string; categoryIds?: string[]; tagIds?: string[] }) {
    return this.request<any>('/notes', {
      method: 'POST',
      body: JSON.stringify(note),
    });
  }

  async updateNote(id: string, note: { text?: string; categoryIds?: string[]; tagIds?: string[] }) {
    return this.request<any>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(note),
    });
  }

  async deleteNote(id: string) {
    return this.request<void>(`/notes/${id}`, { method: 'DELETE' });
  }

  async getTrashNotes() {
    return this.request<any[]>('/notes/trash');
  }

  async restoreNote(id: string) {
    return this.request<void>(`/notes/${id}/restore`, { method: 'POST' });
  }

  async permanentDeleteNote(id: string) {
    return this.request<void>(`/notes/${id}/permanent`, { method: 'DELETE' });
  }

  // Categories
  async getCategories() {
    return this.request<any[]>('/categories');
  }

  async createCategory(category: { name: string; color?: string }) {
    return this.request<any>('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  }

  async updateCategory(id: string, category: { name?: string; color?: string }) {
    return this.request<any>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    });
  }

  async deleteCategory(id: string) {
    return this.request<void>(`/categories/${id}`, { method: 'DELETE' });
  }

  // Tags
  async getTags() {
    return this.request<any[]>('/tags');
  }

  async createTag(tag: { name: string; color?: string }) {
    return this.request<any>('/tags', {
      method: 'POST',
      body: JSON.stringify(tag),
    });
  }

  async updateTag(id: string, tag: { name?: string; color?: string }) {
    return this.request<any>(`/tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tag),
    });
  }

  async deleteTag(id: string) {
    return this.request<void>(`/tags/${id}`, { method: 'DELETE' });
  }
}

export const api = new ApiClient();