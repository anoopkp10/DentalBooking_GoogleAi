import React, { useState, useEffect } from 'react';
import { Building2, Phone, Mail, MapPin, Clock, Save, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { ClinicSettings } from '../../types/database';

interface ClinicSettingsTabProps {
  clinicSettings: ClinicSettings;
  onUpdateClinicSettings: (updates: Partial<ClinicSettings>) => Promise<ClinicSettings>;
}

export const ClinicSettingsTab: React.FC<ClinicSettingsTabProps> = ({
  clinicSettings,
  onUpdateClinicSettings,
}) => {
  const [clinicName, setClinicName] = useState(clinicSettings.clinic_name || '');
  const [clinicEmail, setClinicEmail] = useState(clinicSettings.clinic_email || '');
  const [clinicPhone, setClinicPhone] = useState(clinicSettings.clinic_phone || '');
  const [clinicAddress, setClinicAddress] = useState(clinicSettings.clinic_address || '');
  const [slotInterval, setSlotInterval] = useState(clinicSettings.slot_interval_minutes || 30);
  const [noticeHours, setNoticeHours] = useState(clinicSettings.booking_notice_hours || 2);

  const [isSaving, setIsSaving] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync if props update
  useEffect(() => {
    setClinicName(clinicSettings.clinic_name || '');
    setClinicEmail(clinicSettings.clinic_email || '');
    setClinicPhone(clinicSettings.clinic_phone || '');
    setClinicAddress(clinicSettings.clinic_address || '');
    setSlotInterval(clinicSettings.slot_interval_minutes || 30);
    setNoticeHours(clinicSettings.booking_notice_hours || 2);
  }, [clinicSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicName.trim()) {
      setErrorMessage('Clinic Name cannot be empty.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await onUpdateClinicSettings({
        clinic_name: clinicName.trim(),
        clinic_email: clinicEmail.trim(),
        clinic_phone: clinicPhone.trim(),
        clinic_address: clinicAddress.trim(),
        slot_interval_minutes: Number(slotInterval),
        booking_notice_hours: Number(noticeHours),
      });

      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 3000);
    } catch (err: any) {
      console.error('Failed to update clinic settings:', err);
      setErrorMessage(err?.message || 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Clinic Profile & Booking Rules</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure clinic branding, contact credentials, and appointment scheduling parameters.
          </p>
        </div>

        {successToast && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings saved successfully</span>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Business Identity */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-teal-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Clinic Identity & Public Information</h3>
              <p className="text-xs text-slate-500">Displayed in website header, footer, and patient email confirmations.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs sm:text-sm">
            {/* Clinic Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Clinic Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                id="setting-clinic-name"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 font-medium text-xs sm:text-sm focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Clinic Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Clinic Telephone <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  id="setting-clinic-phone"
                  value={clinicPhone}
                  onChange={(e) => setClinicPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 font-medium text-xs sm:text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Clinic Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Front Desk Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  id="setting-clinic-email"
                  value={clinicEmail}
                  onChange={(e) => setClinicEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 font-medium text-xs sm:text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Clinic Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Physical Street Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <textarea
                  rows={2}
                  required
                  id="setting-clinic-address"
                  value={clinicAddress}
                  onChange={(e) => setClinicAddress(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 font-medium text-xs sm:text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Online Booking Algorithm Parameters */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <Clock className="w-5 h-5 text-teal-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Appointment Engine Configuration</h3>
              <p className="text-xs text-slate-500">Controls how slot intervals and advance notices are calculated.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs sm:text-sm">
            {/* Slot Interval */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Slot Interval Frequency (Minutes) <span className="text-rose-500">*</span>
              </label>
              <select
                value={slotInterval}
                onChange={(e) => setSlotInterval(Number(e.target.value))}
                id="setting-slot-interval"
                className="w-full p-3 rounded-xl border border-slate-300 font-medium text-xs sm:text-sm bg-white focus:ring-2 focus:ring-teal-500"
              >
                <option value={15}>Every 15 minutes (09:00, 09:15, 09:30...)</option>
                <option value={30}>Every 30 minutes (09:00, 09:30, 10:00...)</option>
                <option value={45}>Every 45 minutes (09:00, 09:45, 10:30...)</option>
                <option value={60}>Every 60 minutes (09:00, 10:00, 11:00...)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Cadence at which start times appear in patient booking dropdowns.
              </p>
            </div>

            {/* Booking Notice Hours */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Minimum Advance Notice (Hours) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                max={72}
                required
                id="setting-booking-notice"
                value={noticeHours}
                onChange={(e) => setNoticeHours(Number(e.target.value))}
                className="w-full p-3 rounded-xl border border-slate-300 font-medium text-xs sm:text-sm focus:ring-2 focus:ring-teal-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Patients cannot book appointments starting within this many hours from now.
              </p>
            </div>
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            id="save-clinic-settings-btn"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Updates...' : 'Save Clinic Settings'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
