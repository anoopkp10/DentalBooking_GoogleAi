import React from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Users,
  Activity,
  ArrowUpRight,
  Plus,
  RefreshCw
} from 'lucide-react';
import { Appointment, DentalService } from '../../types/database';
import { formatFriendlyDate } from '../../utils/availability';

interface OverviewTabProps {
  appointments: Appointment[];
  services: DentalService[];
  onNavigateTab: (tab: 'appointments' | 'services' | 'hours' | 'blocked' | 'settings') => void;
  onUpdateStatus: (id: string, status: Appointment['status']) => Promise<void>;
  onRefresh: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  appointments,
  services,
  onNavigateTab,
  onUpdateStatus,
  onRefresh,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const totalAppointments = appointments.length;
  const pendingCount = appointments.filter((a) => a.status === 'pending').length;
  const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length;
  const completedCount = appointments.filter((a) => a.status === 'completed').length;
  const activeServicesCount = services.filter((s) => s.is_active).length;

  // Today's appointments
  const todayAppointments = appointments.filter((a) => a.appointment_date === todayStr);

  // Estimated gross revenue
  const totalRevenue = appointments
    .filter((a) => a.status === 'completed' || a.status === 'confirmed')
    .reduce((acc, curr) => {
      const srvPrice = curr.service?.price || 120;
      return acc + Number(srvPrice);
    }, 0);

  // Recent 5 appointments
  const recentAppointments = [...appointments]
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
    .slice(0, 5);

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Confirmed</span>;
      case 'pending':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 animate-pulse">Pending Review</span>;
      case 'completed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800">Completed</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 line-through">Cancelled</span>;
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Top Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Clinical Practice Overview</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time appointment schedule, patient queue, and clinical capacity.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefresh}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => onNavigateTab('services')}
            className="px-3.5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Service</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Appointments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Bookings</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalAppointments}</span>
            <span className="text-xs text-slate-400 ml-2">All time</span>
          </div>
        </div>

        {/* Pending Queue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Pending Review</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-900">{pendingCount}</span>
              <span className="text-xs text-amber-700 ml-2">Awaiting staff</span>
            </div>
            {pendingCount > 0 && (
              <button
                onClick={() => onNavigateTab('appointments')}
                className="text-xs font-bold text-amber-800 hover:underline cursor-pointer"
              >
                Review →
              </button>
            )}
          </div>
        </div>

        {/* Confirmed / Completed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Confirmed / Done</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-900">{confirmedCount + completedCount}</span>
            <span className="text-xs text-slate-400 ml-2">({confirmedCount} upcoming)</span>
          </div>
        </div>

        {/* Projected Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">Service Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">${totalRevenue.toLocaleString()}</span>
            <span className="text-xs text-slate-400 ml-2">Est. bookings</span>
          </div>
        </div>

      </div>

      {/* 2-Column Split: Today's Schedule & Recent Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Today's Schedule (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Today's Clinic Schedule</h3>
              <p className="text-xs text-slate-500">{formatFriendlyDate(todayStr)}</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-teal-50 text-teal-800 rounded-lg">
              {todayAppointments.length} patients booked
            </span>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold">No appointments scheduled for today.</p>
              <p className="text-xs text-slate-400 mt-0.5">Upcoming bookings for future dates will appear in the schedule.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                        {apt.start_time.slice(0, 5)} - {apt.end_time.slice(0, 5)}
                      </span>
                      {getStatusBadge(apt.status)}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{apt.full_name}</h4>
                    <p className="text-xs text-slate-500">{apt.service?.name || 'Dental Consultation'}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {apt.status === 'pending' && (
                      <button
                        onClick={() => onUpdateStatus(apt.id, 'confirmed')}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Confirm
                      </button>
                    )}
                    {apt.status === 'confirmed' && (
                      <button
                        onClick={() => onUpdateStatus(apt.id, 'completed')}
                        className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Mark Done
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions & Recent Queue (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Recent Bookings Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-base font-bold text-slate-900">Recent Online Bookings</h3>
              <button
                onClick={() => onNavigateTab('appointments')}
                className="text-xs font-bold text-teal-600 hover:underline cursor-pointer"
              >
                View All →
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {recentAppointments.map((apt) => (
                <div key={apt.id} className="py-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{apt.full_name}</p>
                    <p className="text-[11px] text-slate-500">
                      {formatFriendlyDate(apt.appointment_date)} at {apt.start_time.slice(0, 5)}
                    </p>
                  </div>
                  <div>{getStatusBadge(apt.status)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Management Shortcuts */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl">
            <h4 className="text-sm font-bold text-teal-400 mb-3">Office Administration</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onNavigateTab('hours')}
                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-left font-semibold transition-colors"
              >
                <Clock className="w-4 h-4 text-teal-400 mb-1" />
                Working Hours
              </button>
              <button
                onClick={() => onNavigateTab('blocked')}
                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-left font-semibold transition-colors"
              >
                <Calendar className="w-4 h-4 text-cyan-400 mb-1" />
                Blocked Dates
              </button>
              <button
                onClick={() => onNavigateTab('services')}
                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-left font-semibold transition-colors"
              >
                <Activity className="w-4 h-4 text-emerald-400 mb-1" />
                Manage Treatments
              </button>
              <button
                onClick={() => onNavigateTab('settings')}
                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-left font-semibold transition-colors"
              >
                <Users className="w-4 h-4 text-amber-400 mb-1" />
                Clinic Settings
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
