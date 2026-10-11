import type { TaskItem, TaskCreatePayload, SystemHealth } from '../types';

const API_BASE = '/api';

export const api = {
  async getHealth(): Promise<SystemHealth> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) {
      throw new Error(`Failed to fetch health status: ${res.statusText}`);
    }
    return res.json();
  },

  async getTasks(limit = 50): Promise<TaskItem[]> {
    const res = await fetch(`${API_BASE}/tasks?limit=${limit}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch tasks: ${res.statusText}`);
    }
    return res.json();
  },

  async getTask(id: string): Promise<TaskItem> {
    const res = await fetch(`${API_BASE}/tasks/${id}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch task: ${res.statusText}`);
    }
    return res.json();
  },

  async createTask(payload: TaskCreatePayload): Promise<TaskItem> {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.detail || `Failed to create task: ${res.statusText}`);
    }
    return res.json();
  },

  async cancelTask(id: string): Promise<TaskItem> {
    const res = await fetch(`${API_BASE}/tasks/${id}/cancel`, {
      method: 'POST',
    });
    if (!res.ok) {
      throw new Error(`Failed to cancel task: ${res.statusText}`);
    }
    return res.json();
  },

  async deleteTask(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error(`Failed to delete task: ${res.statusText}`);
    }
  },

  async clearAllTasks(): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error(`Failed to clear tasks: ${res.statusText}`);
    }
    return res.json();
  },
};
