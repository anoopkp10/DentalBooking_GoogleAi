import React, { useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Layers,
  Clock,
  CalendarX,
  Settings,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Menu,
  X,
  Database,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import {
  Appointment,
  DentalService,
  BusinessHours,
  BlockedDate,
  ClinicSettings
} from '../../types/database';
import { OverviewTab } from './OverviewTab';
import { AppointmentsTab } from './AppointmentsTab';
import { ServicesTab } from './ServicesTab';
import { BusinessHoursTab } from './BusinessHoursTab';
import { BlockedDatesTab } from './BlockedDatesTab';
import { ClinicSettingsTab } from './ClinicSettingsTab';
import { DatabaseSetupModal } from './DatabaseSetupModal';

interface AdminDashboardProps {
  user: any;
  appointments: Appointment[];
  services: DentalService[];
  businessHours: BusinessHours[];
  blockedDates: BlockedDate[];
  clinicSettings: ClinicSettings;
  onLogout: () => void;
  onViewPublicSite: () => void;
  onUpdateStatus: (id: string, status: Appointment['status']) => Promise<void>;
  onCreateManualAppointment: (data: any) => Promise<void>;
  onCreateService: (service: Omit<DentalService, 'id' | 'created_at'>) => Promise<DentalService>;
  onUpdateService: (id: string, updates: Partial<DentalService>) => Promise<DentalService>;
  onToggleServiceActive: (id: string, current: boolean) => Promise<void>;
  onUpdateBusinessHour: (id: string | number, updates: Partial<BusinessHours>) => Promise<void>;
  onAddBlockedDate: (dateStr: string, reason: string) => Promise<BlockedDate>;
  onRemoveBlockedDate: (id: string) => Promise<void>;
  onUpdateClinicSettings: (updates: Partial<ClinicSettings>) => Promise<ClinicSettings>;
  onRefreshData: () => void;
}

export type AdminTab = 'overview' | 'appointments' | 'services' | 'hours' | 'blocked' | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  appointments,
  services,
  businessHours,
  blockedDates,
  clinicSettings,
  onLogout,
  onViewPublicSite,
  onUpdateStatus,
  onCreateManualAppointment,
  onCreateService,
  onUpdateService,
  onToggleServiceActive,
  onUpdateBusinessHour,
  onAddBlockedDate,
  onRemoveBlockedDate,
  onUpdateClinicSettings,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

  const pendingCount = appointments.filter((a) => a.status === 'pending').length;

  const navigationItems = [
    { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
    {
      id: 'appointments' as const,
      label: 'Appointments',
      icon: Calendar,
      badge: pendingCount > 0 ? pendingCount : undefined
    },
    { id: 'services' as const, label: 'Services & Pricing', icon: Layers },
    { id: 'hours' as const, label: 'Business Hours', icon: Clock },
    { id: 'blocked' as const, label: 'Blocked Dates', icon: CalendarX },
    { id: 'settings' as const, label: 'Clinic Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased">
      
      {/* Top Mobile Bar */}
      <div className="lg:hidden bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-slate-900 font-bold">
            L
          </div>
          <span className="font-display font-bold text-sm tracking-tight">Staff Portal</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 transition-transform duration-300 ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div>
            {/* Brand in Sidebar */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-md">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C8.5 2 6 4.5 6 8c0 3.5 1.5 6.5 2 10 .3 2.1 1.7 3.5 3.5 3.5s2.2-.9 2.5-2.5c.3-1.6.7-3 1.5-4.5.8 1.5 1.2 2.9 1.5 4.5.3 1.6.7 2.5 2.5 2.5s3.2-1.4 3.5-3.5c.5-3.5 2-6.5 2-10 0-3.5-2.5-6-6-6-1.5 0-3 1-4 2-1-1-2.5-2-4-2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="font-display font-extrabold text-white text-base tracking-tight leading-none">
                    Lumina Admin
                  </h1>
                  <p className="text-[11px] text-teal-400 font-semibold mt-1">
                    Dental Practice Portal
                  </p>
                </div>
              </div>
            </div>

            {/* Nav links */}
            <div className="px-3 py-6 space-y-1">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Management
              </span>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`sidebar-tab-${item.id}`}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-teal-600 text-white shadow-sm font-extrabold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-white text-teal-800' : 'bg-amber-400 text-slate-900 animate-pulse'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Sidebar info & actions */}
          <div className="p-4 border-t border-slate-800 space-y-3">
            {/* Database schema trigger */}
            <button
              onClick={() => setIsDbModalOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Database className="w-3.5 h-3.5 text-teal-400" />
                <span>Supabase SQL Setup</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {/* Back to Live Website */}
            <button
              onClick={onViewPublicSite}
              id="admin-view-public-site-btn"
              className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-medium transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>View Public Website</span>
            </button>

            {/* Active User profile & Logout */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="truncate text-left">
                  <p className="text-xs font-bold text-white truncate">
                    {user?.email || 'Authorized Staff'}
                  </p>
                  <p className="text-[10px] text-teal-400 font-semibold">Admin Access</p>
                </div>
              </div>

              <button
                onClick={onLogout}
                id="admin-sign-out-btn"
                title="Sign Out"
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'overview' && (
              <OverviewTab
                appointments={appointments}
                services={services}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onUpdateStatus={onUpdateStatus}
                onRefresh={onRefreshData}
              />
            )}

            {activeTab === 'appointments' && (
              <AppointmentsTab
                appointments={appointments}
                services={services}
                onUpdateStatus={onUpdateStatus}
                onCreateManualAppointment={onCreateManualAppointment}
              />
            )}

            {activeTab === 'services' && (
              <ServicesTab
                services={services}
                onCreateService={onCreateService}
                onUpdateService={onUpdateService}
                onToggleActive={onToggleServiceActive}
              />
            )}

            {activeTab === 'hours' && (
              <BusinessHoursTab
                businessHours={businessHours}
                onUpdateBusinessHour={onUpdateBusinessHour}
              />
            )}

            {activeTab === 'blocked' && (
              <BlockedDatesTab
                blockedDates={blockedDates}
                onAddBlockedDate={onAddBlockedDate}
                onRemoveBlockedDate={onRemoveBlockedDate}
              />
            )}

            {activeTab === 'settings' && (
              <ClinicSettingsTab
                clinicSettings={clinicSettings}
                onUpdateClinicSettings={onUpdateClinicSettings}
              />
            )}
          </div>
        </main>

      </div>

      {/* Database Schema Setup Modal */}
      <DatabaseSetupModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
      />

    </div>
  );
};
