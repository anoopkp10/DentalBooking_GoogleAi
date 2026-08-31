import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, AlertCircle, X, CheckCircle2, KeyRound, Copy, Check, Database } from 'lucide-react';
import { supabase, isSupabaseConfigured, checkIsAdmin, registerLocalAdminUser } from '../../lib/supabase';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDemoHelper, setShowDemoHelper] = useState(!isSupabaseConfigured);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (isSupabaseConfigured) {
        // Step 1: Sign in with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) {
          throw new Error(error.message || 'Invalid email or password.');
        }

        if (!data.user) {
          throw new Error('Authentication succeeded but user record was not returned.');
        }

        // Step 2: Use authenticated user's ID to check admin_users table
        const isAdmin = await checkIsAdmin(data.user.id);

        if (!isAdmin) {
          // Exact required error message from prompt:
          setErrorMessage('You are signed in, but you are not authorized as an admin.');
          // Sign them out of the unauthorized session
          await supabase.auth.signOut();
          setIsLoading(false);
          return;
        }

        // Allowed access
        onLoginSuccess(data.user);
        onClose();
      } else {
        // Dev demo authorization fallback when remote Supabase project is not yet configured
        // Enables preview evaluation out-of-the-box
        if (email.trim() && password.length >= 4) {
          const fakeUserId = `demo-admin-${email.split('@')[0] || '123'}`;
          await registerLocalAdminUser(fakeUserId);
          const demoUser = {
            id: fakeUserId,
            email: email.trim(),
            user_metadata: { role: 'admin', full_name: 'Clinic Administrator' }
          };
          onLoginSuccess(demoUser);
          onClose();
        } else {
          throw new Error('Please enter an admin email and password (at least 4 characters).');
        }
      }
    } catch (err: any) {
      console.error('Admin login error:', err);
      setErrorMessage(err?.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <h3 className="text-xl font-bold font-display">Staff & Admin Access</h3>
          <p className="text-xs text-slate-400 mt-1">
            Secure administrative control portal for Lumina Dental Clinic.
          </p>
        </div>

        {/* Modal Body Form */}
        <div className="p-6 sm:p-8">
          
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-bold">Authentication Notice</p>
                <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {!isSupabaseConfigured && (
            <div className="mb-6 p-3.5 rounded-xl bg-teal-50 border border-teal-200/80 text-teal-900 text-xs">
              <p className="font-bold flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-teal-600" />
                Live Preview Sandbox Mode
              </p>
              <p className="text-[11px] text-teal-800 mt-1">
                You can log in directly with any credentials (e.g. <span className="font-mono font-bold">admin@luminadental.com</span> / <span className="font-mono font-bold">admin123</span>) to test all dashboard features.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Staff Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  id="admin-email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@luminadental.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Staff Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  id="admin-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              id="admin-login-submit-btn"
              className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <span>Checking Authorization...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Sign In to Admin Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Quick autofill helper for fast testing */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Admin Authorization Guard</span>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@luminadental.com');
                setPassword('admin123');
              }}
              className="text-teal-600 hover:text-teal-800 font-semibold cursor-pointer"
            >
              Autofill Test Account
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
