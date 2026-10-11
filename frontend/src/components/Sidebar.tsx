import React from 'react';
import { 
  PlusCircle, 
  History, 
  Settings as SettingsIcon, 
  Compass, 
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';
import type { SystemHealth } from '../types';

interface SidebarProps {
  currentTab: 'dashboard' | 'history' | 'settings';
  setCurrentTab: (tab: 'dashboard' | 'history' | 'settings') => void;
  health: SystemHealth | null;
  onNewTaskClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  health,
  onNewTaskClick,
}) => {
  return (
    <aside className="w-64 bg-[#10131a] border-r border-[#202532] flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none">
      {/* Top Header & Navigation */}
      <div>
        {/* Brand / Logo */}
        <div className="p-5 border-b border-[#1b202c] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#d4f828] flex items-center justify-center text-black font-extrabold shadow-sm shadow-[#d4f828]/20">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="font-bold text-white text-base tracking-tight flex items-center gap-1.5">
                HyperPilot <span className="text-[#d4f828] text-xs px-1.5 py-0.5 rounded bg-[#d4f828]/10 border border-[#d4f828]/30">AI</span>
              </div>
              <div className="text-[11px] text-gray-400 font-medium tracking-wide">
                Autonomous Browser
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4">
          <button
            onClick={() => {
              setCurrentTab('dashboard');
              onNewTaskClick();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#d4f828] hover:bg-[#e2fb56] text-black font-semibold text-sm transition-all duration-150 shadow-md shadow-[#d4f828]/10 cursor-pointer active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            New Automation
          </button>
        </div>

        {/* Nav Links */}
        <nav className="px-3 space-y-1">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              currentTab === 'dashboard'
                ? 'bg-[#181d28] text-white border border-[#2a3142]'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#151922]'
            }`}
          >
            <Compass className={`w-4 h-4 ${currentTab === 'dashboard' ? 'text-[#d4f828]' : ''}`} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setCurrentTab('history')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              currentTab === 'history'
                ? 'bg-[#181d28] text-white border border-[#2a3142]'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#151922]'
            }`}
          >
            <History className={`w-4 h-4 ${currentTab === 'history' ? 'text-[#d4f828]' : ''}`} />
            <span>Task History</span>
            {health?.tasks_count !== undefined && health.tasks_count > 0 && (
              <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full bg-[#1e2433] text-gray-300 font-mono">
                {health.tasks_count}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              currentTab === 'settings'
                ? 'bg-[#181d28] text-white border border-[#2a3142]'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#151922]'
            }`}
          >
            <SettingsIcon className={`w-4 h-4 ${currentTab === 'settings' ? 'text-[#d4f828]' : ''}`} />
            <span>Settings</span>
          </button>
        </nav>
      </div>

      {/* Bottom Profile / System Diagnostics */}
      <div className="p-4 border-t border-[#1b202c] space-y-3">
        {/* Engine Status indicator */}
        <div className="p-3 rounded-xl bg-[#141822] border border-[#222838] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Gemini Engine</span>
            <span className={`inline-flex items-center gap-1.5 font-medium ${
              health?.gemini_configured ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                health?.gemini_configured ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
              }`} />
              {health?.gemini_configured ? 'Ready' : 'Setup Required'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Browser</span>
            <span className={`inline-flex items-center gap-1 font-medium ${
              health?.browser_available ? 'text-emerald-400' : 'text-gray-400'
            }`}>
              <Globe className="w-3 h-3" />
              {health?.browser_available ? 'Chrome Detected' : 'Local Chromium'}
            </span>
          </div>
        </div>

        {/* Free Tier Info */}
        <div className="flex items-center justify-between px-1 text-[11px] text-gray-500">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
            <span>100% Free Development</span>
          </div>
          <span className="text-[10px] bg-[#1a1f2b] px-1.5 py-0.5 rounded text-gray-400 font-mono">v1.0</span>
        </div>
      </div>
    </aside>
  );
};
