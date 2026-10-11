export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface TaskAction {
  step: number;
  action: string;
  description?: string;
  timestamp?: string;
}

export interface TaskItem {
  id: string;
  prompt: string;
  category: string;
  model: string;
  status: TaskStatus;
  result_text?: string | null;
  error_message?: string | null;
  steps_count: number;
  duration_seconds: number;
  actions: TaskAction[];
  logs: string[];
  visited_urls: string[];
  screenshot_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskCreatePayload {
  prompt: string;
  category: string;
  model: string;
  require_confirmation?: boolean;
}

export interface SystemHealth {
  status: string;
  gemini_configured: boolean;
  gemini_key_source?: string | null;
  browser_available: boolean;
  browser_path?: string | null;
  default_model: string;
  available_models: string[];
  tasks_count: number;
}
