import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { TaskExecutionView } from './components/TaskExecutionView';
import { api } from './services/api';
import type { TaskItem, SystemHealth } from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'history' | 'settings'>('dashboard');
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [activeTask, setActiveTask] = useState<TaskItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load initial health and tasks
  const loadHealth = async () => {
    try {
      const data = await api.getHealth();
      setHealth(data);
    } catch (err) {
      console.error('Failed to load system health:', err);
    }
  };

  const loadTasks = async () => {
    try {
      const list = await api.getTasks();
      setTasks(list);

      // If active task is currently open, refresh its data
      if (activeTask) {
        const updated = list.find((t) => t.id === activeTask.id);
        if (updated) {
          setActiveTask(updated);
        }
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  };

  useEffect(() => {
    loadHealth();
    loadTasks();
  }, []);

  // Poll tasks if there is an active running task
  useEffect(() => {
    const hasRunningTask = tasks.some(
      (t) => t.status === 'running' || t.status === 'pending'
    );
    if (!hasRunningTask && (!activeTask || (activeTask.status !== 'running' && activeTask.status !== 'pending'))) {
      return;
    }

    const interval = setInterval(() => {
      loadTasks();
      loadHealth();
    }, 2000);

    return () => clearInterval(interval);
  }, [tasks, activeTask]);

  // Create new task
  const handleCreateTask = async (prompt: string, category: string, model: string) => {
    setIsSubmitting(true);
    try {
      const created = await api.createTask({
        prompt,
        category,
        model,
      });
      setTasks((prev) => [created, ...prev]);
      setActiveTask(created);
      setCurrentTab('dashboard');
      loadHealth();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel running task
  const handleCancelTask = async (id: string) => {
    try {
      const cancelled = await api.cancelTask(id);
      setActiveTask(cancelled);
      loadTasks();
    } catch (err) {
      console.error('Failed to cancel task:', err);
    }
  };

  // Delete task
  const handleDeleteTask = async (id: string) => {
    try {
      await api.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      if (activeTask && activeTask.id === id) {
        setActiveTask(null);
      }
      loadHealth();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  // Clear all history
  const handleClearAll = async () => {
    try {
      await api.clearAllTasks();
      setTasks([]);
      setActiveTask(null);
      loadHealth();
    } catch (err) {
      console.error('Failed to clear tasks:', err);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0b0d12] text-[#f8fafc]">
      {/* Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'dashboard') {
            setActiveTask(null);
          }
        }}
        health={health}
        onNewTaskClick={() => {
          setActiveTask(null);
          setCurrentTab('dashboard');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-6 py-8">
        {currentTab === 'dashboard' && (
          activeTask ? (
            <TaskExecutionView
              task={activeTask}
              onCancel={handleCancelTask}
              onBack={() => setActiveTask(null)}
            />
          ) : (
            <Dashboard
              health={health}
              recentTasks={tasks}
              onSubmitTask={handleCreateTask}
              onSelectTask={(task) => setActiveTask(task)}
              isSubmitting={isSubmitting}
            />
          )
        )}

        {currentTab === 'history' && (
          activeTask ? (
            <TaskExecutionView
              task={activeTask}
              onCancel={handleCancelTask}
              onBack={() => setActiveTask(null)}
            />
          ) : (
            <HistoryPage
              tasks={tasks}
              onSelectTask={(task) => setActiveTask(task)}
              onDeleteTask={handleDeleteTask}
              onClearAll={handleClearAll}
            />
          )
        )}

        {currentTab === 'settings' && (
          <SettingsPage
            health={health}
            onRefreshHealth={loadHealth}
          />
        )}
      </main>
    </div>
  );
}

export default App;

