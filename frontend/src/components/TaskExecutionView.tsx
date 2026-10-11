import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Clock, 
  Terminal, 
  Image as ImageIcon, 
  Ban, 
  Sparkles, 
  Layers, 
  ArrowLeft 
} from 'lucide-react';
import type { TaskItem } from '../types';

interface TaskExecutionViewProps {
  task: TaskItem;
  onCancel: (id: string) => void;
  onBack: () => void;
}

export const TaskExecutionView: React.FC<TaskExecutionViewProps> = ({
  task,
  onCancel,
  onBack,
}) => {
  const isRunning = task.status === 'running' || task.status === 'pending';
  const isCompleted = task.status === 'completed';
  const isFailed = task.status === 'failed';
  const isCancelled = task.status === 'cancelled';

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-[#1f2533]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="flex items-center gap-3">
          {isRunning && (
            <button
              onClick={() => onCancel(task.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium transition-colors cursor-pointer"
            >
              <Ban className="w-3.5 h-3.5" />
              Cancel Task
            </button>
          )}

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141822] border border-[#232938] text-xs font-mono text-gray-400">
            <span>ID: {task.id.slice(0, 8)}...</span>
          </div>
        </div>
      </div>

      {/* Main Task Header Card */}
      <div className="p-6 rounded-2xl bg-[#12151d] border border-[#212735] shadow-lg shadow-black/20 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="capitalize px-2 py-0.5 rounded bg-[#1c2230] text-[#d4f828] border border-[#2c354a]">
                {task.category}
              </span>
              <span className="text-gray-400 flex items-center gap-1 font-mono">
                <Sparkles className="w-3 h-3 text-[#d4f828]" />
                {task.model}
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(task.created_at).toLocaleTimeString()}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-white leading-relaxed">
              {task.prompt}
            </h2>
          </div>

          {/* Status Badge */}
          <div className="shrink-0">
            {isRunning && (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Executing Browser Action...</span>
              </div>
            )}
            {isCompleted && (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Completed</span>
              </div>
            )}
            {isFailed && (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
                <XCircle className="w-3.5 h-3.5" />
                <span>Failed</span>
              </div>
            )}
            {isCancelled && (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-500/10 border border-gray-500/30 text-gray-400 text-xs font-medium">
                <Ban className="w-3.5 h-3.5" />
                <span>Cancelled</span>
              </div>
            )}
          </div>
        </div>

        {/* Execution Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#1d222e] text-xs">
          <div className="p-2.5 rounded-lg bg-[#161a24] border border-[#232938]">
            <span className="text-gray-500 block">Duration</span>
            <span className="text-gray-200 font-mono font-medium">
              {task.duration_seconds > 0 ? `${task.duration_seconds}s` : isRunning ? 'In progress...' : '0s'}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#161a24] border border-[#232938]">
            <span className="text-gray-500 block">Total Steps</span>
            <span className="text-gray-200 font-mono font-medium">
              {task.steps_count}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#161a24] border border-[#232938]">
            <span className="text-gray-500 block">Visited URLs</span>
            <span className="text-gray-200 font-mono font-medium">
              {task.visited_urls?.length || 0}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#161a24] border border-[#232938]">
            <span className="text-gray-500 block">Execution Mode</span>
            <span className="text-[#d4f828] font-mono font-medium">
              CDP Automation
            </span>
          </div>
        </div>
      </div>

      {/* Error Message Alert (if any) */}
      {task.error_message && (
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-800/40 text-red-300 text-sm space-y-1">
          <div className="font-semibold flex items-center gap-2 text-red-200">
            <XCircle className="w-4 h-4 text-red-400" />
            Execution Failure
          </div>
          <p className="text-red-300/90 leading-relaxed font-sans text-xs">
            {task.error_message}
          </p>
        </div>
      )}

      {/* Extracted Output / Results Panel */}
      {task.result_text && (
        <div className="p-5 rounded-2xl bg-[#12151d] border border-[#212735] space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Sparkles className="w-4 h-4 text-[#d4f828]" />
            Extracted Result
          </div>
          <div className="p-4 rounded-xl bg-[#0e1017] border border-[#1d222e] text-gray-200 text-sm whitespace-pre-wrap leading-relaxed font-sans">
            {task.result_text}
          </div>
        </div>
      )}

      {/* Grid: Actions Timeline & Browser Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actions Timeline */}
        <div className="p-5 rounded-2xl bg-[#12151d] border border-[#212735] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Layers className="w-4 h-4 text-[#d4f828]" />
              Action Timeline
            </div>
            <span className="text-xs text-gray-500 font-mono">
              {task.actions?.length || 0} events
            </span>
          </div>

          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
            {task.actions && task.actions.length > 0 ? (
              task.actions.map((act: any, idx: number) => (
                <div 
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-[#161a24] border border-[#232938] text-xs"
                >
                  <div className="w-5 h-5 rounded-full bg-[#1e2433] text-gray-400 flex items-center justify-center font-mono font-medium shrink-0 mt-0.5">
                    {act.step || idx + 1}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="font-semibold text-gray-200 font-mono">
                      {act.action || 'Browser Action'}
                    </div>
                    {act.description && (
                      <div className="text-gray-400">
                        {act.description}
                      </div>
                    )}
                  </div>
                  {act.timestamp && (
                    <span className="text-gray-500 font-mono text-[10px]">
                      {act.timestamp}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500 text-xs">
                {isRunning ? 'Actions are being streamed as steps occur...' : 'No actions recorded.'}
              </div>
            )}
          </div>
        </div>

        {/* Console / Execution Logs */}
        <div className="p-5 rounded-2xl bg-[#12151d] border border-[#212735] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Terminal className="w-4 h-4 text-[#d4f828]" />
              Execution Logs
            </div>
            <span className="text-xs text-gray-500 font-mono">Live Stream</span>
          </div>

          <div className="p-3 rounded-xl bg-[#0c0e14] border border-[#1a1f2b] font-mono text-xs text-gray-300 max-h-[320px] overflow-y-auto space-y-1.5 leading-relaxed">
            {task.logs && task.logs.length > 0 ? (
              task.logs.map((log: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-gray-600 select-none">{idx + 1}</span>
                  <span className={log.startsWith('ERROR') ? 'text-red-400' : log.startsWith('SAFETY') ? 'text-amber-400' : 'text-gray-300'}>
                    {log}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-gray-600 italic">No logs yet...</div>
            )}
          </div>
        </div>
      </div>

      {/* Browser Screenshot (if available) */}
      {task.screenshot_url && (
        <div className="p-5 rounded-2xl bg-[#12151d] border border-[#212735] space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <ImageIcon className="w-4 h-4 text-[#d4f828]" />
            Browser Viewport Capture
          </div>
          <div className="rounded-xl overflow-hidden border border-[#222838] bg-black">
            <img 
              src={task.screenshot_url} 
              alt="Browser automation screenshot" 
              className="w-full h-auto object-contain max-h-[500px]"
            />
          </div>
        </div>
      )}
    </div>
  );
};
