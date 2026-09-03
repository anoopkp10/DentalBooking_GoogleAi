import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchServices,
  fetchAppointments,
  fetchBusinessHours,
  fetchBlockedDates,
  fetchClinicSettings,
  createAppointment,
  updateAppointmentStatus,
  createService,
  updateService,
  updateBusinessHour,
  addBlockedDate,
  removeBlockedDate,
  updateClinicSettings,
  supabase,
  isSupabaseConfigured,
  checkIsAdmin
} from './lib/supabase';
import {
  DentalService,
  Appointment,
  BusinessHours,
  BlockedDate,
  ClinicSettings
} from './types/database';
import { DEFAULT_CLINIC_SETTINGS } from './data/imagery';

// Public Components
import { Navbar } from './components/public/Navbar';
import { Hero } from './components/public/Hero';
import { ServicesSection } from './components/public/ServicesSection';
import { AboutSection } from './components/public/AboutSection';
import { DoctorsTeam } from './components/public/DoctorsTeam';
import { BookingSection } from './components/public/BookingSection';
import { TestimonialsSection } from './components/public/TestimonialsSection';
import { Footer } from './components/public/Footer';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLoginModal } from './components/admin/AdminLoginModal';

export default function App() {
  // Navigation View: 'public' | 'admin'
  const [currentView, setCurrentView] = useState<'public' | 'admin'>('public');

  // Auth State
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // App Data States
  const [services, setServices] = useState<DentalService[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings>(DEFAULT_CLINIC_SETTINGS);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Quick pre-selected service when user clicks "Book This Service" on a card
  const [selectedServiceIdForBooking, setSelectedServiceIdForBooking] = useState<string | null>(null);

  // Load all initial data
  const loadAllData = useCallback(async () => {
    try {
      setIsLoadingData(true);
      const [srv, apts, hours, blocked, settings] = await Promise.all([
        fetchServices(),
        fetchAppointments(),
        fetchBusinessHours(),
        fetchBlockedDates(),
        fetchClinicSettings(),
      ]);

      setServices(srv);
      setAppointments(apts);
      setBusinessHours(hours);
      setBlockedDates(blocked);
      if (settings) {
        setClinicSettings(settings);
      }
    } catch (err) {
      console.error('Failed to load clinic data:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  // Initial Auth & Data Session bootstrap
  useEffect(() => {
    loadAllData();

    // Check existing Supabase session & admin authorization
    const checkInitialSession = async () => {
      try {
        if (isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const isAdmin = await checkIsAdmin(session.user.id);
            if (isAdmin) {
              setAdminUser(session.user);
            } else {
              setAdminUser(null);
            }
          }
        }
      } catch (err) {
        console.error('Auth verification error:', err);
      } finally {
        setIsAuthChecking(false);
      }
    };

    checkInitialSession();

    // Listen to Supabase auth state change
    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const isAdmin = await checkIsAdmin(session.user.id);
          if (isAdmin) {
            setAdminUser(session.user);
          } else {
            setAdminUser(null);
          }
        } else {
          setAdminUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [loadAllData]);

  // Handler: Scroll to booking section smoothly
  const handleScrollToBooking = (serviceId?: string) => {
    if (serviceId) {
      setSelectedServiceIdForBooking(serviceId);
    }
    const bookingElement = document.getElementById('booking-section');
    if (bookingElement) {
      bookingElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handler: Create public appointment
  const handleCreateAppointment = async (bookingData: any): Promise<Appointment> => {
    const newApt = await createAppointment(bookingData);
    // Optimistically update list
    setAppointments((prev) => [newApt, ...prev]);
    return newApt;
  };

  // Handler: Update appointment status (Admin)
  const handleUpdateStatus = async (id: string, status: Appointment['status']) => {
    await updateAppointmentStatus(id, status);
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status } : apt))
    );
  };

  // Handler: Create manual appointment (Admin)
  const handleCreateManualAppointment = async (data: any) => {
    const newApt = await createAppointment(data);
    setAppointments((prev) => [newApt, ...prev]);
  };

  // Handler: Create service (Admin)
  const handleCreateService = async (serviceData: Omit<DentalService, 'id' | 'created_at'>) => {
    const created = await createService(serviceData);
    setServices((prev) => [...prev, created]);
    return created;
  };

  // Handler: Update service (Admin)
  const handleUpdateService = async (id: string, updates: Partial<DentalService>) => {
    const updated = await updateService(id, updates);
    setServices((prev) => prev.map((s) => (s.id === id ? updated : s)));
    return updated;
  };

  // Handler: Toggle service active (Admin)
  const handleToggleServiceActive = async (id: string, currentStatus: boolean) => {
    const updated = await updateService(id, { is_active: !currentStatus });
    setServices((prev) => prev.map((s) => (s.id === id ? updated : s)));
  };

  // Handler: Update business hour (Admin)
  const handleUpdateBusinessHour = async (id: string | number, updates: Partial<BusinessHours>) => {
    await updateBusinessHour(id, updates);
    setBusinessHours((prev) =>
      prev.map((bh) => (String(bh.id) === String(id) ? { ...bh, ...updates } : bh))
    );
  };

  // Handler: Add blocked date (Admin)
  const handleAddBlockedDate = async (dateStr: string, reason: string) => {
    const created = await addBlockedDate(dateStr, reason);
    setBlockedDates((prev) => [...prev, created]);
    return created;
  };

  // Handler: Remove blocked date (Admin)
  const handleRemoveBlockedDate = async (id: string) => {
    await removeBlockedDate(id);
    setBlockedDates((prev) => prev.filter((b) => b.id !== id));
  };

  // Handler: Update clinic settings (Admin)
  const handleUpdateClinicSettings = async (updates: Partial<ClinicSettings>) => {
    const updated = await updateClinicSettings(updates);
    setClinicSettings(updated);
    return updated;
  };

  // Handler: Logout Admin
  const handleAdminLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setAdminUser(null);
    setCurrentView('public');
  };

  // If in Admin Dashboard view and authenticated
  if (currentView === 'admin' && adminUser) {
    return (
      <AdminDashboard
        user={adminUser}
        appointments={appointments}
        services={services}
        businessHours={businessHours}
        blockedDates={blockedDates}
        clinicSettings={clinicSettings}
        onLogout={handleAdminLogout}
        onViewPublicSite={() => setCurrentView('public')}
        onUpdateStatus={handleUpdateStatus}
        onCreateManualAppointment={handleCreateManualAppointment}
        onCreateService={handleCreateService}
        onUpdateService={handleUpdateService}
        onToggleServiceActive={handleToggleServiceActive}
        onUpdateBusinessHour={handleUpdateBusinessHour}
        onAddBlockedDate={handleAddBlockedDate}
        onRemoveBlockedDate={handleRemoveBlockedDate}
        onUpdateClinicSettings={handleUpdateClinicSettings}
        onRefreshData={loadAllData}
      />
    );
  }

  // Public Facing Website View
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-teal-500 selection:text-white flex flex-col antialiased">
      
      {/* Fixed Sticky Header */}
      <Navbar
        clinicSettings={clinicSettings}
        isAdminLoggedIn={Boolean(adminUser)}
        onAdminClick={() => {
          if (adminUser) {
            setCurrentView('admin');
          } else {
            setIsAdminModalOpen(true);
          }
        }}
        onBookClick={() => handleScrollToBooking()}
      />

      {/* Main Public Content */}
      <main className="flex-1">
        {/* Hero Banner with CTAs & Quick Highlights */}
        <Hero
          clinicSettings={clinicSettings}
          onBookClick={() => handleScrollToBooking()}
        />

        {/* Clinical Services with dynamic pricing & duration */}
        <ServicesSection
          services={services}
          onSelectService={(serviceId) => handleScrollToBooking(serviceId)}
        />

        {/* About Studio & Technology Value Proposition */}
        <AboutSection
          onBookClick={() => handleScrollToBooking()}
        />

        {/* Real-time Multi-step Booking System */}
        <BookingSection
          services={services}
          businessHours={businessHours}
          blockedDates={blockedDates}
          existingAppointments={appointments}
          clinicSettings={clinicSettings}
          preSelectedService={
            selectedServiceIdForBooking
              ? services.find((s) => s.id === selectedServiceIdForBooking) || null
              : null
          }
          onSubmitBooking={handleCreateAppointment}
          onBookingSuccess={() => {}}
        />

        {/* Dental Clinicians Team */}
        <DoctorsTeam
          onBookWithDoctor={() => handleScrollToBooking()}
        />

        {/* Patient Testimonials & FAQs */}
        <TestimonialsSection />
      </main>

      {/* Footer */}
      <Footer
        clinicSettings={clinicSettings}
        businessHours={businessHours}
        onAdminClick={() => {
          if (adminUser) {
            setCurrentView('admin');
          } else {
            setIsAdminModalOpen(true);
          }
        }}
        onBookClick={() => handleScrollToBooking()}
      />

      {/* Staff Login Modal */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onLoginSuccess={(user) => {
          setAdminUser(user);
          setCurrentView('admin');
        }}
      />

    </div>
  );
}
