import React, { useState } from 'react';
import { 
  History, 
  Trash2, 
  Search, 
  Clock, 
  AlertCircle,
  ChevronRight,
  Filter
} from 'lucide-react';
import type { TaskItem } from '../types';

interface HistoryPageProps {
  tasks: TaskItem[];
  onSelectTask: (task: TaskItem) => void;
  onDeleteTask: (id: string) => Promise<void>;
  onClearAll: () => Promise<void>;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  tasks,
  onSelectTask,
  onDeleteTask,
  onClearAll,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleClear = async () => {
    if (window.confirm('Are you sure you want to delete all automation history? This action cannot be undone.')) {
      setIsDeleting(true);
      try {
        await onClearAll();
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1f2533]">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <History className="w-6 h-6 text-[#d4f828]" />
            Automation History
          </h1>
          <p className="text-xs text-gray-400">
            Audit logs and executions stored persistently in your local SQLite database.
          </p>
        </div>

        {tasks.length > 0 && (
          <button
            onClick={handleClear}
            disabled={isDeleting}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-medium transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Entire History</span>
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks by prompt or category..."
            className="w-full bg-[#12151d] border border-[#212735] focus:border-[#d4f828]/50 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-200 placeholder-gray-500 outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#12151d] border border-[#212735] rounded-xl px-3 py-2.5 text-xs text-gray-300 outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="running">Running</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((t) => (
            <div
              key={t.id}
              className="p-5 rounded-2xl bg-[#12151d] hover:bg-[#161b25] border border-[#212735] hover:border-[#2f384c] transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div 
                onClick={() => onSelectTask(t)}
                className="space-y-1.5 flex-1 min-w-0 cursor-pointer"
              >
                <div className="flex items-center gap-2 text-xs font-medium">
                  <span className="capitalize px-2 py-0.5 rounded bg-[#1c2230] text-[#d4f828] text-[10px] font-mono border border-[#293246]">
                    {t.category}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400 text-xs font-mono">
                    {t.model}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400 text-xs flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {new Date(t.created_at).toLocaleString()}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-gray-100 group-hover:text-white leading-relaxed truncate">
                  {t.prompt}
                </h3>
                {t.result_text && (
                  <p className="text-xs text-gray-400 line-clamp-1 font-sans">
                    {t.result_text}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                <span className={`text-[11px] px-2.5 py-1 rounded-full capitalize font-medium ${
                  t.status === 'completed'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : t.status === 'running'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : t.status === 'failed'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                    : 'bg-gray-500/10 text-gray-400 border border-gray-500/30'
                }`}>
                  {t.status}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTask(t.id);
                  }}
                  title="Delete task"
                  className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onSelectTask(t)}
                  title="View details"
                  className="p-1.5 rounded-lg text-gray-500 hover:text-[#d4f828] hover:bg-[#1f2635] transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 rounded-2xl bg-[#12151d] border border-[#212735] text-center text-gray-500 text-xs space-y-2">
            <AlertCircle className="w-6 h-6 text-gray-600 mx-auto" />
            <p className="text-gray-400 font-medium">No tasks found</p>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search query or filters.'
                : 'Automations run from the dashboard will appear here.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
