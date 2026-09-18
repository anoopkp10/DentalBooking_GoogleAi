import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Calendar,
  Clock,
  Phone,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock3,
  FileText,
  Plus,
  X,
  ExternalLink,
  ChevronDown,
  Download,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Appointment, DentalService } from '../../types/database';
import { formatFriendlyDate } from '../../utils/availability';

/** Formats a Date to a local YYYY-MM-DD string (timezone-safe, unlike toISOString). */
const toLocalDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

interface AppointmentsTabProps {
  appointments: Appointment[];
  services: DentalService[];
  onUpdateStatus: (id: string, status: Appointment['status']) => Promise<void>;
  onCreateManualAppointment: (data: any) => Promise<void>;
}

export const AppointmentsTab: React.FC<AppointmentsTabProps> = ({
  appointments,
  services,
  onUpdateStatus,
  onCreateManualAppointment,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  // Date scope: 'all' shows everything, 'month' a single month, 'range' a start/end window
  const [dateFilterMode, setDateFilterMode] = useState<'all' | 'month' | 'range'>('all');
  const [filterMonth, setFilterMonth] = useState(() => toLocalDateStr(new Date()).slice(0, 7));
  const [filterStartDate, setFilterStartDate] = useState(() => {
    const now = new Date();
    return toLocalDateStr(new Date(now.getFullYear(), now.getMonth(), 1));
  });
  const [filterEndDate, setFilterEndDate] = useState(() => toLocalDateStr(new Date()));
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New appointment form state
  const [newPatientName, setNewPatientName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newServiceId, setNewServiceId] = useState(services[0]?.id || '');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newNotes, setNewNotes] = useState('');
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  // Filtering
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      // Status filter
      if (statusFilter !== 'all' && apt.status !== statusFilter) {
        return false;
      }

      // Date scope filter (appointment_date is stored as YYYY-MM-DD, so a
      // lexical string comparison is a chronological comparison)
      if (dateFilterMode === 'month' && filterMonth && apt.appointment_date.slice(0, 7) !== filterMonth) {
        return false;
      }
      if (dateFilterMode === 'range') {
        if (filterStartDate && apt.appointment_date < filterStartDate) return false;
        if (filterEndDate && apt.appointment_date > filterEndDate) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = apt.full_name.toLowerCase().includes(q);
        const matchesEmail = apt.email.toLowerCase().includes(q);
        const matchesPhone = apt.phone.toLowerCase().includes(q);
        const matchesService = apt.service?.name.toLowerCase().includes(q);
        const matchesNotes = apt.notes?.toLowerCase().includes(q);
        return matchesName || matchesEmail || matchesPhone || matchesService || matchesNotes;
      }

      return true;
    });
  }, [appointments, statusFilter, searchQuery, dateFilterMode, filterMonth, filterStartDate, filterEndDate]);

  // Sort direction for the Date & Time column (asc = oldest first, desc = newest first)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const sortedAppointments = useMemo(() => {
    const sorted = [...filteredAppointments].sort((a, b) =>
      `${a.appointment_date} ${a.start_time}`.localeCompare(`${b.appointment_date} ${b.start_time}`)
    );
    return sortDir === 'desc' ? sorted.reverse() : sorted;
  }, [filteredAppointments, sortDir]);

  // Totals for the filtered set (cancelled bookings carry no revenue)
  const activeAppointments = useMemo(
    () => filteredAppointments.filter((apt) => apt.status !== 'cancelled'),
    [filteredAppointments]
  );
  const totalAmount = useMemo(
    () => activeAppointments.reduce((sum, apt) => sum + Number(apt.service?.price ?? 0), 0),
    [activeAppointments]
  );

  // File name reflects the active date scope
  const exportFileStamp = dateFilterMode === 'month'
    ? filterMonth
    : dateFilterMode === 'range'
      ? `${filterStartDate || 'start'}_to_${filterEndDate || 'today'}`
      : 'all';

  const handleExportExcel = () => {
    if (filteredAppointments.length === 0) return;

    const rows = sortedAppointments
      .map((apt) => ({
        'Date': apt.appointment_date,
        'Time': `${apt.start_time.slice(0, 5)} - ${apt.end_time.slice(0, 5)}`,
        'Patient Name': apt.full_name,
        'Email': apt.email,
        'Phone': apt.phone,
        'Treatment': apt.service?.name || 'General Dental Service',
        'Duration (mins)': apt.service?.duration_minutes ?? '',
        'Amount (USD)': Number(apt.service?.price ?? 0),
        'Status': apt.status,
        'Notes': apt.notes || '',
      }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = [
      { wch: 12 }, { wch: 14 }, { wch: 24 }, { wch: 28 }, { wch: 18 },
      { wch: 28 }, { wch: 14 }, { wch: 13 }, { wch: 12 }, { wch: 34 },
    ];

    // Total row appended under the data (excludes cancelled bookings)
    XLSX.utils.sheet_add_aoa(worksheet, [
      [],
      ['', '', '', '', '', '', 'Total (excl. cancelled)', totalAmount],
    ], { origin: -1 });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Appointments');
    XLSX.writeFile(workbook, `appointments_${exportFileStamp}.xlsx`);
  };

  // Keep the range valid while the admin picks dates
  const handleRangeStartChange = (value: string) => {
    setFilterStartDate(value);
    if (value && filterEndDate && value > filterEndDate) setFilterEndDate(value);
  };
  const handleRangeEndChange = (value: string) => {
    setFilterEndDate(value);
    if (value && filterStartDate && value < filterStartDate) setFilterStartDate(value);
  };

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    const service = services.find((s) => s.id === newServiceId);
    const duration = service?.duration_minutes || 45;

    // Calculate end time
    const [h, m] = newStartTime.split(':').map(Number);
    const startDate = new Date(2000, 0, 1, h, m);
    const endDate = new Date(startDate.getTime() + duration * 60 * 1000);
    const endH = String(endDate.getHours()).padStart(2, '0');
    const endM = String(endDate.getMinutes()).padStart(2, '0');
    const endTimeStr = `${endH}:${endM}:00`;

    setIsSubmittingNew(true);
    try {
      await onCreateManualAppointment({
        full_name: newPatientName.trim(),
        email: newEmail.trim() || 'walkin@luminadental.com',
        phone: newPhone.trim(),
        service_id: newServiceId,
        appointment_date: newDate,
        start_time: `${newStartTime}:00`,
        end_time: endTimeStr,
        status: 'confirmed',
        notes: newNotes.trim() || 'Manual booking via staff portal',
      });

      setIsNewModalOpen(false);
      setNewPatientName('');
      setNewEmail('');
      setNewPhone('');
      setNewNotes('');
    } catch (err) {
      console.error('Failed to create appointment:', err);
    } finally {
      setIsSubmittingNew(false);
    }
  };

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock3 className="w-3.5 h-3.5" />
            Pending Review
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 line-through">
            <XCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Tab Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Patient Appointments</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage all upcoming, pending, and past clinical reservations.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          id="admin-create-appointment-btn"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Appointment / Walk-In</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-3">
        
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient, phone, notes..."
            className="w-full pl-10 pr-4 py-2 text-xs font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Status Filter Group */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mr-1">
            <Filter className="w-3.5 h-3.5 text-teal-600" />
            Status
          </span>
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
              {st === 'pending' && appointments.filter((a) => a.status === 'pending').length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-amber-400 text-slate-900 rounded-full text-[10px] font-bold">
                  {appointments.filter((a) => a.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Date Scope Filter & Excel Export Group */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              View
            </span>
            {([
              ['all', 'All Dates'],
              ['month', 'By Month'],
              ['range', 'Date Range'],
            ] as const).map(([mode, label]) => (
              <button
                key={mode}
                onClick={() => setDateFilterMode(mode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  dateFilterMode === mode
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            ))}

            {dateFilterMode === 'month' && (
              <input
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
              />
            )}

            {dateFilterMode === 'range' && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={filterStartDate}
                  max={filterEndDate || undefined}
                  onChange={(e) => handleRangeStartChange(e.target.value)}
                  className="px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                />
                <span className="text-xs text-slate-400 font-semibold">to</span>
                <input
                  type="date"
                  value={filterEndDate}
                  min={filterStartDate || undefined}
                  onChange={(e) => handleRangeEndChange(e.target.value)}
                  className="px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                />
              </div>
            )}
          </div>

          <div className="flex items-center">
            <button
              onClick={handleExportExcel}
              disabled={filteredAppointments.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Appointments Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No appointments found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search, status, or date filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Treatment</th>
                  <th className="px-6 py-4">
                    <button
                      onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                      title={sortDir === 'asc' ? 'Sorted oldest first — click for newest first' : 'Sorted newest first — click for oldest first'}
                      className="inline-flex items-center gap-1 uppercase tracking-wider hover:text-teal-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500 rounded"
                    >
                      <span>Date &amp; Time</span>
                      {sortDir === 'asc' ? (
                        <ArrowUp className="w-3 h-3 text-teal-600" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-teal-600" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {sortedAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Patient info */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{apt.full_name}</p>
                        <div className="flex items-center gap-3 text-slate-500 text-[11px] mt-0.5">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {apt.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {apt.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Service */}
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{apt.service?.name || 'General Dental Service'}</p>
                      <p className="text-slate-400 text-[11px]">
                        {apt.service?.duration_minutes || 45} mins • ${Number(apt.service?.price || 120).toFixed(0)}
                      </p>
                    </td>

                    {/* Date & Time */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-900 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-teal-600" />
                        <span>{formatFriendlyDate(apt.appointment_date)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{apt.start_time.slice(0, 5)} – {apt.end_time.slice(0, 5)}</span>
                      </div>
                    </td>

                    {/* Status badge */}
                    <td className="px-6 py-4">
                      {getStatusBadge(apt.status)}
                    </td>

                    {/* Action Dropdown / Buttons */}
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {apt.status === 'pending' && (
                          <button
                            onClick={() => onUpdateStatus(apt.id, 'confirmed')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                          >
                            Accept
                          </button>
                        )}
                        {apt.status === 'confirmed' && (
                          <button
                            onClick={() => onUpdateStatus(apt.id, 'completed')}
                            className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                          >
                            Complete
                          </button>
                        )}
                        {apt.status !== 'cancelled' && (
                          <button
                            onClick={() => onUpdateStatus(apt.id, 'cancelled')}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold text-[11px] cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedAppointment(apt)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] cursor-pointer"
                        >
                          Details
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs text-teal-400 font-bold uppercase">Appointment Details</span>
                <h3 className="text-xl font-bold font-display">{selectedAppointment.full_name}</h3>
              </div>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Status:</span>
                <div>{getStatusBadge(selectedAppointment.status)}</div>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Procedure:</span>
                <span className="font-bold text-slate-900">{selectedAppointment.service?.name}</span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Scheduled Date:</span>
                <span className="font-semibold text-slate-900">{formatFriendlyDate(selectedAppointment.appointment_date)}</span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Time Window:</span>
                <span className="font-semibold text-slate-900">
                  {selectedAppointment.start_time.slice(0, 5)} – {selectedAppointment.end_time.slice(0, 5)}
                </span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Contact Phone:</span>
                <a href={`tel:${selectedAppointment.phone}`} className="font-semibold text-teal-600 hover:underline">
                  {selectedAppointment.phone}
                </a>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Contact Email:</span>
                <a href={`mailto:${selectedAppointment.email}`} className="font-semibold text-teal-600 hover:underline">
                  {selectedAppointment.email}
                </a>
              </div>

              {selectedAppointment.notes && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-800 mb-1">Patient Clinical Notes:</p>
                  <p className="text-slate-600 text-xs leading-relaxed">{selectedAppointment.notes}</p>
                </div>
              )}

              {/* Status change actions inside modal */}
              <div className="pt-4 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-500">Update Status:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={async () => {
                      await onUpdateStatus(selectedAppointment.id, 'confirmed');
                      setSelectedAppointment((prev) => prev ? { ...prev, status: 'confirmed' } : null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold cursor-pointer"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={async () => {
                      await onUpdateStatus(selectedAppointment.id, 'completed');
                      setSelectedAppointment((prev) => prev ? { ...prev, status: 'completed' } : null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-teal-100 hover:bg-teal-200 text-teal-800 text-xs font-bold cursor-pointer"
                  >
                    Complete
                  </button>
                  <button
                    onClick={async () => {
                      await onUpdateStatus(selectedAppointment.id, 'cancelled');
                      setSelectedAppointment((prev) => prev ? { ...prev, status: 'cancelled' } : null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* New Manual Appointment Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs text-teal-400 font-bold uppercase">Front Desk Booking</span>
                <h3 className="text-xl font-bold font-display">New Appointment / Walk-In</h3>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManual} className="p-6 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Patient Full Name</label>
                <input
                  type="text"
                  required
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  placeholder="Patient Name"
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="patient@example.com"
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dental Service</label>
                <select
                  value={newServiceId}
                  onChange={(e) => setNewServiceId(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-medium bg-white"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.duration_minutes} min - ${Number(s.price).toFixed(0)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Staff Notes</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Optional clinic notes or insurance remarks..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNew}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  {isSubmittingNew ? 'Saving...' : 'Create Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
