import React, { useState } from 'react';
import { 
  Play, 
  Search, 
  ShoppingBag, 
  Plane, 
  Briefcase, 
  SlidersHorizontal, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  ChevronRight,
  Loader2
} from 'lucide-react';
import type { SystemHealth, TaskItem } from '../types';

interface DashboardProps {
  health: SystemHealth | null;
  recentTasks: TaskItem[];
  onSubmitTask: (prompt: string, category: string, model: string) => Promise<void>;
  onSelectTask: (task: TaskItem) => void;
  isSubmitting: boolean;
}

const CATEGORIES = [
  { id: 'research', label: 'Research', icon: Search },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
  { id: 'travel', label: 'Travel', icon: Plane },
  { id: 'productivity', label: 'Productivity', icon: Briefcase },
  { id: 'custom', label: 'Custom', icon: SlidersHorizontal },
];

const EXAMPLE_PROMPTS = [
  {
    category: 'research',
    title: 'Python Courses Research',
    prompt: 'Search for top-rated Python courses online and summarize the top 3 with pricing.',
  },
  {
    category: 'shopping',
    title: 'Laptop Comparison',
    prompt: 'Research three lightweight laptops under $1000 and compare their RAM, CPU, and battery.',
  },
  {
    category: 'productivity',
    title: 'Extract Contact Information',
    prompt: 'Open the official Python website and find community resources and contact links.',
  },
  {
    category: 'travel',
    title: 'Weekend Itinerary',
    prompt: 'Look up top attractions and weekend destinations in Kyoto with approximate visiting times.',
  },
];

export const Dashboard: React.FC<DashboardProps> = ({
  health,
  recentTasks,
  onSubmitTask,
  onSelectTask,
  isSubmitting,
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('research');
  const [selectedModel, setSelectedModel] = useState('gemini-3.5-flash-lite');
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setErrorText('Please enter a natural language task description.');
      return;
    }
    setErrorText(null);
    try {
      await onSubmitTask(prompt, selectedCategory, selectedModel);
      setPrompt('');
    } catch (err: any) {
      setErrorText(err.message || 'Failed to submit task');
    }
  };

  const handleSelectExample = (examplePrompt: string, category: string) => {
    setPrompt(examplePrompt);
    setSelectedCategory(category);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Missing Gemini API Key Warning Banner */}
      {health && !health.gemini_configured && (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-700/40 flex items-start gap-3.5 text-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-sm">
            <div className="font-semibold text-amber-300">
              Google Gemini Free Tier Key Not Detected
            </div>
            <p className="text-amber-200/80 leading-relaxed text-xs">
              All UI views and history are fully operational. To execute live AI browser tasks, generate a free API key at{' '}
              <a 
                href="https://aistudio.google.com/" 
                target="_blank" 
                rel="noreferrer" 
                className="underline font-semibold hover:text-white"
              >
                Google AI Studio
              </a>{' '}
              and place it in your <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">backend/.env</code> as <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">GEMINI_API_KEY=your_key</code>.
            </p>
          </div>
        </div>
      )}

      {/* Hero Welcome Header */}
      <div className="text-center space-y-2 pt-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Welcome to <span className="text-[#d4f828]">HyperPilot AI</span>
        </h1>
        <p className="text-base text-gray-400 max-w-lg mx-auto">
          What do you want to automate today?
        </p>
      </div>

      {/* Main Prompt Card */}
      <div className="bg-[#12151d] border border-[#212735] rounded-3xl p-5 sm:p-6 shadow-xl shadow-black/30 space-y-4">
        {/* Category Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-[#d4f828] text-black font-semibold shadow-sm shadow-[#d4f828]/20'
                    : 'bg-[#181d27] text-gray-400 hover:text-white hover:bg-[#202735] border border-[#232b3c]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}

          {/* Model Selector Pill */}
          <div className="ml-auto flex items-center gap-2 text-xs">
            <span className="text-gray-500 font-medium">Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-[#181d27] text-gray-200 border border-[#262f42] rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#d4f828] cursor-pointer"
            >
              <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash Lite (Fastest & Stable Free Tier)</option>
              <option value="gemini-3.5-flash">Gemini 3.5 Flash (Standard)</option>
              <option value="gemini-3.8-flash">Gemini 3.8 Flash</option>
            </select>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your browser task in natural language... (e.g., 'Search for the top 3 open-source vector databases and compare their GitHub stars and license')"
              className="w-full bg-[#0d0f15] border border-[#212736] focus:border-[#d4f828]/60 focus:ring-1 focus:ring-[#d4f828]/40 rounded-2xl p-4 text-sm text-gray-100 placeholder-gray-500 transition-colors resize-none outline-none font-sans leading-relaxed"
            />
          </div>

          {errorText && (
            <div className="text-xs text-red-400 flex items-center gap-1.5 px-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorText}</span>
            </div>
          )}

          {/* Card Footer: Safety notice & Run button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <ShieldCheck className="w-4 h-4 text-[#d4f828]" />
              <span>Safe browser sandbox • Guardrails active</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#d4f828] hover:bg-[#e2fb56] text-black font-semibold text-sm transition-all duration-150 shadow-md shadow-[#d4f828]/15 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Initializing Task...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Run Automation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Suggested / Example Automation Prompts */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
          Suggested Automations
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {EXAMPLE_PROMPTS.map((ex, idx) => (
            <div
              key={idx}
              onClick={() => handleSelectExample(ex.prompt, ex.category)}
              className="p-4 rounded-2xl bg-[#12151d] hover:bg-[#181d28] border border-[#212735] hover:border-[#2f384c] transition-all duration-150 cursor-pointer group space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-gray-200 group-hover:text-[#d4f828] transition-colors">
                  {ex.title}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#d4f828] group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                {ex.prompt}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Tasks Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Recent Automations
          </div>
          {recentTasks.length > 0 && (
            <span className="text-xs text-gray-500 font-mono">
              {recentTasks.length} recorded
            </span>
          )}
        </div>

        {recentTasks.length > 0 ? (
          <div className="space-y-2.5">
            {recentTasks.slice(0, 4).map((t) => (
              <div
                key={t.id}
                onClick={() => onSelectTask(t)}
                className="p-4 rounded-2xl bg-[#12151d] hover:bg-[#171b26] border border-[#212735] hover:border-[#2e374b] transition-all duration-150 cursor-pointer flex items-center justify-between gap-4 group"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <span className="capitalize px-2 py-0.5 rounded bg-[#1c2230] text-[#d4f828] text-[10px] font-mono border border-[#2a3449]">
                      {t.category}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400 text-xs flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {new Date(t.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-200 group-hover:text-white truncate">
                    {t.prompt}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
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
                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-[#d4f828] group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-[#12151d] border border-[#212735] text-center text-gray-500 text-xs space-y-1">
            <p>No recent automations recorded yet.</p>
            <p className="text-gray-600">Enter a prompt above to launch your first task.</p>
          </div>
        )}
      </div>
    </div>
  );
};
