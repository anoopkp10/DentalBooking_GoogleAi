import React, { useState } from 'react';
import { Calendar, Trash2, Plus, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { BlockedDate } from '../../types/database';
import { formatFriendlyDate } from '../../utils/availability';

interface BlockedDatesTabProps {
  blockedDates: BlockedDate[];
  onAddBlockedDate: (dateStr: string, reason: string) => Promise<BlockedDate>;
  onRemoveBlockedDate: (id: string) => Promise<void>;
}

export const BlockedDatesTab: React.FC<BlockedDatesTabProps> = ({
  blockedDates,
  onAddBlockedDate,
  onRemoveBlockedDate,
}) => {
  const [newDate, setNewDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [newReason, setNewReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) {
      setErrorMessage('Please select a date.');
      return;
    }
    if (!newReason.trim()) {
      setErrorMessage('Please provide a reason (e.g. Clinic Holiday, Staff Training, Renovation).');
      return;
    }

    // Check duplicate
    if (blockedDates.some((b) => b.blocked_date === newDate)) {
      setErrorMessage('This date is already marked as blocked.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await onAddBlockedDate(newDate, newReason.trim());
      setNewReason('');
    } catch (err: any) {
      console.error('Error adding blocked date:', err);
      setErrorMessage(err?.message || 'Failed to add blocked date.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Blocked Dates & Clinic Holidays</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Specify public holidays, maintenance days, or staff conferences when the clinic is closed.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form: Add Blocked Date (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs h-fit">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Block a Specific Date</h3>
          </div>

          {errorMessage && (
            <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleAdd} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Date to Block <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                id="block-date-input"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-xs focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Closure Reason <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                id="block-reason-input"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                placeholder="e.g. National Holiday / Annual Deep Clean"
                className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-xs focus:ring-2 focus:ring-teal-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                This notice will be displayed to patients if they select this day.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              id="submit-block-date-btn"
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Blocking...' : 'Block Clinic Date'}</span>
            </button>
          </form>
        </div>

        {/* Right List: Currently Blocked Dates (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Scheduled Blocked Dates</h3>
              <p className="text-xs text-slate-500">{blockedDates.length} dates currently closed</p>
            </div>
          </div>

          {blockedDates.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No dates are currently blocked.</p>
              <p className="text-xs text-slate-400 mt-1">
                All business days are open according to weekly operating hours.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 p-2 sm:p-4">
              {blockedDates.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {formatFriendlyDate(item.blocked_date)}
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">{item.reason}</p>
                      <span className="font-mono text-[10px] text-slate-400">
                        Date: {item.blocked_date}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveBlockedDate(item.id)}
                    id={`remove-blocked-date-${item.id}`}
                    title="Unblock date"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
