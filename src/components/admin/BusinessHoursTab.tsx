import React, { useState } from 'react';
import { Clock, CheckCircle2, AlertCircle, Save, Calendar, Check } from 'lucide-react';
import { BusinessHours } from '../../types/database';
import { WEEKDAY_NAMES } from '../../data/imagery';

interface BusinessHoursTabProps {
  businessHours: BusinessHours[];
  onUpdateBusinessHour: (id: string | number, updates: Partial<BusinessHours>) => Promise<void>;
}

export const BusinessHoursTab: React.FC<BusinessHoursTabProps> = ({
  businessHours,
  onUpdateBusinessHour,
}) => {
  // Local state for editing
  const [hoursList, setHoursList] = useState<BusinessHours[]>(businessHours);
  const [savingId, setSavingId] = useState<string | number | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Sync if props change
  React.useEffect(() => {
    setHoursList(businessHours);
  }, [businessHours]);

  const handleToggleOpen = async (bh: BusinessHours) => {
    const newIsOpen = !bh.is_open;
    setSavingId(bh.id);

    try {
      await onUpdateBusinessHour(bh.id, { is_open: newIsOpen });
      setHoursList((prev) =>
        prev.map((item) => (String(item.id) === String(bh.id) ? { ...item, is_open: newIsOpen } : item))
      );
      setSuccessToast(`Updated ${WEEKDAY_NAMES[bh.weekday]} status`);
      setTimeout(() => setSuccessToast(null), 2500);
    } catch (err) {
      console.error('Error toggling open status:', err);
    } finally {
      setSavingId(null);
    }
  };

  const handleTimeChange = (id: string | number, field: 'start_time' | 'end_time', value: string) => {
    const formatted = value.length === 5 ? `${value}:00` : value;
    setHoursList((prev) =>
      prev.map((item) => (String(item.id) === String(id) ? { ...item, [field]: formatted } : item))
    );
  };

  const handleSaveRow = async (bh: BusinessHours) => {
    setSavingId(bh.id);
    try {
      await onUpdateBusinessHour(bh.id, {
        is_open: bh.is_open,
        start_time: bh.start_time,
        end_time: bh.end_time,
      });
      setSuccessToast(`Saved business hours for ${WEEKDAY_NAMES[bh.weekday]}`);
      setTimeout(() => setSuccessToast(null), 2500);
    } catch (err) {
      console.error('Error saving business hours:', err);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Clinic Operating Hours</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Define daily clinic schedules. The online booking system dynamically generates time slots strictly within these hours.
          </p>
        </div>

        {successToast && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successToast}</span>
          </div>
        )}
      </div>

      {/* Weekday Schedule Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-800">Weekly Schedule Editor</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Toggle days open/closed and adjust opening/closing times.
          </p>
        </div>

        <div className="divide-y divide-slate-100 p-2 sm:p-4">
          {hoursList.map((bh) => {
            const dayName = WEEKDAY_NAMES[bh.weekday] || `Day ${bh.weekday}`;
            const isSaving = savingId === bh.id;

            return (
              <div
                key={bh.id}
                id={`business-hour-row-${bh.weekday}`}
                className={`p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                  bh.is_open ? 'bg-white hover:bg-slate-50/70' : 'bg-slate-50/50 opacity-80'
                }`}
              >
                {/* Day name & Open/Closed toggle */}
                <div className="flex items-center gap-4 min-w-[200px]">
                  <button
                    onClick={() => handleToggleOpen(bh)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      bh.is_open ? 'bg-teal-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        bh.is_open ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{dayName}</h4>
                    <span className={`text-xs font-semibold ${bh.is_open ? 'text-teal-700' : 'text-slate-400'}`}>
                      {bh.is_open ? 'Open for appointments' : 'Closed'}
                    </span>
                  </div>
                </div>

                {/* Time Range Pickers */}
                {bh.is_open ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-medium">Opens:</span>
                      <input
                        type="time"
                        value={bh.start_time.slice(0, 5)}
                        onChange={(e) => handleTimeChange(bh.id, 'start_time', e.target.value)}
                        className="p-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 bg-white"
                      />
                    </div>

                    <span className="text-slate-400 text-xs">to</span>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-medium">Closes:</span>
                      <input
                        type="time"
                        value={bh.end_time.slice(0, 5)}
                        onChange={(e) => handleTimeChange(bh.id, 'end_time', e.target.value)}
                        className="p-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 bg-white"
                      />
                    </div>

                    <button
                      onClick={() => handleSaveRow(bh)}
                      disabled={isSaving}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSaving ? 'Saving...' : 'Save'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic">
                    Clinic is closed all day. No booking slots will be generated.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
