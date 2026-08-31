import React, { useState } from 'react';
import { Database, Copy, Check, X, CheckCircle2, ExternalLink, Code } from 'lucide-react';
import { SUPABASE_SQL_SCHEMA, isSupabaseConfigured } from '../../lib/supabase';

interface DatabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseSetupModal: React.FC<DatabaseSetupModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display">Supabase SQL Schema & Setup Guide</h3>
              <p className="text-xs text-slate-400">
                Production-ready database tables, security policies, and initial seeds.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          
          {/* Status banner */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
            isSupabaseConfigured
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                {isSupabaseConfigured ? 'Supabase Credentials Detected' : 'Interactive Sandbox Mode Active'}
              </p>
              <p className="text-xs mt-0.5 leading-relaxed">
                {isSupabaseConfigured
                  ? 'Your app is configured with Supabase URL & Anon Key. Run the SQL script below in your Supabase SQL Editor to initialize all tables.'
                  : 'To link your live database, paste your Supabase URL & Anon Key into .env.example, then run the SQL script below in the Supabase Dashboard SQL Editor.'}
              </p>
            </div>
          </div>

          {/* Quick Steps */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Quick 3-Step Setup</h4>
            <ol className="list-decimal list-inside space-y-1 text-xs text-slate-600 font-medium">
              <li>Open your project in the Supabase Dashboard and navigate to the <b>SQL Editor</b>.</li>
              <li>Click <b>New Query</b> and paste the exact SQL script below.</li>
              <li>Click <b>Run</b> to create the 6 tables (<code className="bg-slate-100 px-1 py-0.5 rounded text-teal-800">services</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-teal-800">appointments</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-teal-800">business_hours</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-teal-800">blocked_dates</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-teal-800">clinic_settings</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-teal-800">admin_users</code>) and RLS security policies.</li>
            </ol>
          </div>

          {/* Code block with copy */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
              <span className="font-mono flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-teal-400" />
                schema.sql
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy SQL'}</span>
              </button>
            </div>

            <pre className="p-4 text-[11px] font-mono text-teal-300 overflow-x-auto max-h-72 leading-relaxed">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-medium">Lumina Dental Database Schema v2.0</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
