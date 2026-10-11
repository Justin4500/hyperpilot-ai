import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  ShieldCheck, 
  Key, 
  Cpu, 
  Globe, 
  Database, 
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';
import type { SystemHealth } from '../types';

interface SettingsPageProps {
  health: SystemHealth | null;
  onRefreshHealth: () => Promise<void>;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  health,
  onRefreshHealth,
}) => {
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const envSample = `GEMINI_API_KEY=your_gemini_api_key_here
DEFAULT_MODEL=gemini-2.0-flash
BROWSER_HEADLESS=true
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(envSample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshHealth();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#1f2533]">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <SettingsIcon className="w-6 h-6 text-[#d4f828]" />
            System & Engine Settings
          </h1>
          <p className="text-xs text-gray-400">
            Configure Google Gemini AI models, inspect local browser tooling, and verify safety controls.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#141822] hover:bg-[#1a202d] text-gray-300 border border-[#232938] text-xs font-medium transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Grid: Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Gemini AI Status Card */}
        <div className="p-5 rounded-2xl bg-[#12151d] border border-[#212735] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-[#d4f828]" />
              AI Engine
            </span>
            {health?.gemini_configured ? (
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" /> Ready
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                <AlertCircle className="w-3 h-3" /> Unconfigured
              </span>
            )}
          </div>
          <div className="space-y-1">
            <div className="text-base font-semibold text-white">Google Gemini</div>
            <div className="text-xs text-gray-400 font-mono">
              Model: {health?.default_model || 'gemini-2.0-flash'}
            </div>
            {health?.gemini_key_source && (
              <div className="text-[11px] text-gray-500 font-mono">
                Source: {health.gemini_key_source}
              </div>
            )}
          </div>
        </div>

        {/* Browser Tooling Card */}
        <div className="p-5 rounded-2xl bg-[#12151d] border border-[#212735] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-[#d4f828]" />
              Browser Engine
            </span>
            {health?.browser_available ? (
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" /> Detected
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-medium text-gray-400 bg-[#191f2b] px-2 py-0.5 rounded-full">
                CDP Emulation
              </span>
            )}
          </div>
          <div className="space-y-1">
            <div className="text-base font-semibold text-white">Chromium / Chrome</div>
            <div className="text-xs text-gray-400 truncate font-mono">
              {health?.browser_path ? 'System Chrome Path Verified' : 'Standard Chromium CDP'}
            </div>
          </div>
        </div>

        {/* Database Card */}
        <div className="p-5 rounded-2xl bg-[#12151d] border border-[#212735] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-4 h-4 text-[#d4f828]" />
              Persistence
            </span>
            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3" /> Active
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-base font-semibold text-white">SQLite Database</div>
            <div className="text-xs text-gray-400 font-mono">
              Tasks: {health?.tasks_count || 0} recorded
            </div>
          </div>
        </div>
      </div>

      {/* Gemini API Free Tier Setup Instructions */}
      <div className="p-6 rounded-2xl bg-[#12151d] border border-[#212735] space-y-4">
        <div className="flex items-center gap-2.5">
          <Key className="w-5 h-5 text-[#d4f828]" />
          <h2 className="text-base font-semibold text-white">
            Google Gemini API Setup (100% Free Tier)
          </h2>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed">
          HyperPilot AI uses Google AI Studio's free tier. You never have to provide credit card credentials or use paid services. The API key is stored strictly on your local machine in the backend environment file and is never sent to the browser or frontend logs.
        </p>

        <div className="space-y-3 pt-1">
          <div className="flex items-start gap-3 text-xs text-gray-300">
            <span className="w-5 h-5 rounded-full bg-[#1c2230] text-[#d4f828] font-mono flex items-center justify-center shrink-0">1</span>
            <div>
              Visit{' '}
              <a 
                href="https://aistudio.google.com/" 
                target="_blank" 
                rel="noreferrer" 
                className="text-[#d4f828] underline font-medium hover:text-[#e2fb56] inline-flex items-center gap-1"
              >
                aistudio.google.com <ExternalLink className="w-3 h-3 inline" />
              </a>{' '}
              and sign in with your Google account.
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs text-gray-300">
            <span className="w-5 h-5 rounded-full bg-[#1c2230] text-[#d4f828] font-mono flex items-center justify-center shrink-0">2</span>
            <div>
              Click <strong>Get API Key</strong> and generate a new key for Google Gemini.
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs text-gray-300">
            <span className="w-5 h-5 rounded-full bg-[#1c2230] text-[#d4f828] font-mono flex items-center justify-center shrink-0">3</span>
            <div>
              Open your project file <code className="bg-black/50 px-1 py-0.5 rounded text-gray-200">backend/.env</code> (or root <code className="bg-black/50 px-1 py-0.5 rounded text-gray-200">.env</code>) and add:
            </div>
          </div>
        </div>

        {/* Code block with copy */}
        <div className="relative pt-2">
          <pre className="p-4 rounded-xl bg-[#0b0d13] border border-[#1e2330] font-mono text-xs text-gray-200 overflow-x-auto">
            {envSample}
          </pre>
          <button
            onClick={handleCopy}
            className="absolute top-4 right-3 flex items-center gap-1 px-2.5 py-1 rounded bg-[#181d28] hover:bg-[#202735] text-gray-300 text-xs border border-[#2b3345] transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <div className="text-[11px] text-gray-500 pt-1">
          <strong>Free Tier Notice:</strong> The Google Gemini API free tier allows rate limits of 15 Requests Per Minute (RPM) and 1 million Tokens Per Minute (TPM), which is more than enough for autonomous browser tasks.
        </div>
      </div>

      {/* Safety & Sandbox Policies */}
      <div className="p-6 rounded-2xl bg-[#12151d] border border-[#212735] space-y-3">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-[#d4f828]" />
          <h2 className="text-base font-semibold text-white">
            Security & Safe Automation Policies
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-gray-400">
          <div className="p-3.5 rounded-xl bg-[#151922] border border-[#232938] space-y-1">
            <span className="font-semibold text-gray-200 block">SSRF & Loopback Protection</span>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Automated requests to localhost (127.0.0.1), private subnets, and cloud metadata endpoints (169.254.169.254) are permanently blocked.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#151922] border border-[#232938] space-y-1">
            <span className="font-semibold text-gray-200 block">Financial & Consequential Gate</span>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Keywords related to payment checkouts, credit cards, wire transfers, and account deletions require explicit policy confirmation.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#151922] border border-[#232938] space-y-1">
            <span className="font-semibold text-gray-200 block">Zero Secret Leaks</span>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              API keys are never returned across HTTP endpoints, recorded in frontend stores, or included in client bundle outputs.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#151922] border border-[#232938] space-y-1">
            <span className="font-semibold text-gray-200 block">No Shell Command Execution</span>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              The agent interacts solely through standard Chrome DevTools Protocol DOM actions without arbitrary OS subprocess access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
