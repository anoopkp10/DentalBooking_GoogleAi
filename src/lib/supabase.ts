import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  DentalService,
  Appointment,
  BusinessHours,
  BlockedDate,
  ClinicSettings,
  AdminUser
} from '../types/database';
import {
  DEFAULT_SERVICES,
  DEFAULT_BUSINESS_HOURS,
  DEFAULT_CLINIC_SETTINGS
} from '../data/imagery';

// Environment variables
const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  rawSupabaseUrl &&
  rawSupabaseAnonKey &&
  rawSupabaseUrl !== 'PASTE_YOUR_SUPABASE_URL_HERE' &&
  !rawSupabaseUrl.includes('your-supabase-project')
);

// Instantiate real Supabase client
export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured ? rawSupabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? rawSupabaseAnonKey : 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

/* =========================================================================
   LOCAL STORAGE PERSISTENCE LAYER (Fallback for interactive preview/dev)
   Ensures the app works 100% out of the box even before remote DB setup,
   and synchronizes with real Supabase immediately when tables are populated.
   ========================================================================= */

const STORAGE_KEYS = {
  SERVICES: 'lumina_dental_services_v2',
  APPOINTMENTS: 'lumina_dental_appointments_v2',
  BUSINESS_HOURS: 'lumina_dental_business_hours_v2',
  BLOCKED_DATES: 'lumina_dental_blocked_dates_v2',
  SETTINGS: 'lumina_dental_clinic_settings_v2',
  ADMIN_USERS: 'lumina_dental_admin_users_v2',
};

// Initial Seed data for storage fallback
function initLocalStore() {
  if (!localStorage.getItem(STORAGE_KEYS.SERVICES)) {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(DEFAULT_SERVICES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BUSINESS_HOURS)) {
    localStorage.setItem(STORAGE_KEYS.BUSINESS_HOURS, JSON.stringify(DEFAULT_BUSINESS_HOURS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_CLINIC_SETTINGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BLOCKED_DATES)) {
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 18);
    const dateStr = nextMonth.toISOString().split('T')[0];
    localStorage.setItem(
      STORAGE_KEYS.BLOCKED_DATES,
      JSON.stringify([
        {
          id: 'blk-001',
          blocked_date: dateStr,
          reason: 'Staff Annual Continuing Education & Clinic Maintenance',
          created_at: new Date().toISOString(),
        },
      ])
    );
  }
  if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
    // Generate 2 sample upcoming appointments for preview realism
    const today = new Date();
    const tmr = new Date(today);
    tmr.setDate(today.getDate() + 1);
    const tmrStr = tmr.toISOString().split('T')[0];

    const dayAfter = new Date(today);
    dayAfter.setDate(today.getDate() + 2);
    const dayAfterStr = dayAfter.toISOString().split('T')[0];

    const sampleAppointments: Appointment[] = [
      {
        id: 'apt-001',
        full_name: 'Sarah Jenkins',
        email: 'sarah.j@example.com',
        phone: '(555) 234-5678',
        service_id: 'srv-002',
        appointment_date: tmrStr,
        start_time: '10:00:00',
        end_time: '10:45:00',
        status: 'confirmed',
        notes: 'Routine 6-month cleaning. Mild sensitivity on upper right molar.',
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'apt-002',
        full_name: 'David Chen',
        email: 'david.chen@example.com',
        phone: '(555) 876-5432',
        service_id: 'srv-003',
        appointment_date: dayAfterStr,
        start_time: '14:00:00',
        end_time: '15:00:00',
        status: 'pending',
        notes: 'Interested in teeth whitening before wedding next month.',
        created_at: new Date(Date.now() - 43200000).toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(sampleAppointments));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ADMIN_USERS)) {
    localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify([]));
  }
}

if (typeof window !== 'undefined') {
  initLocalStore();
}

/* =========================================================================
   DATA ACCESS LAYER - SUPABASE WITH RESILIENT FALLBACK
   ========================================================================= */

// 1. SERVICES
export async function getServices(onlyActive = false): Promise<DentalService[]> {
  if (isSupabaseConfigured) {
    try {
      let query = supabase.from('services').select('*').order('name');
      if (onlyActive) {
        query = query.eq('is_active', true);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as DentalService[];
      }
    } catch (err) {
      console.warn('Supabase query failed, falling back to local state:', err);
    }
  }

  // Local fallback
  const raw = localStorage.getItem(STORAGE_KEYS.SERVICES);
  const list: DentalService[] = raw ? JSON.parse(raw) : DEFAULT_SERVICES;
  return onlyActive ? list.filter((s) => s.is_active) : list;
}

export async function createService(service: Omit<DentalService, 'id' | 'created_at'>): Promise<DentalService> {
  const newId = `srv-${Date.now()}`;
  const newRecord: DentalService = {
    ...service,
    id: newId,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert([{
          name: service.name,
          description: service.description,
          duration_minutes: service.duration_minutes,
          price: service.price,
          is_active: service.is_active,
        }])
        .select()
        .single();

      if (!error && data) {
        return data as DentalService;
      }
    } catch (err) {
      console.warn('Supabase insert failed, storing locally:', err);
    }
  }

  const list = await getServices(false);
  list.push(newRecord);
  localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(list));
  return newRecord;
}

export async function updateService(id: string, updates: Partial<DentalService>): Promise<DentalService> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return data as DentalService;
      }
    } catch (err) {
      console.warn('Supabase update failed, updating locally:', err);
    }
  }

  const list = await getServices(false);
  const index = list.findIndex((s) => s.id === id);
  if (index !== -1) {
    list[index] = { ...list[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(list));
    return list[index];
  }
  throw new Error('Service not found');
}

export async function deleteService(id: string): Promise<void> {
  // Rather than hard delete, prompt specifies deactivating, but support both if needed
  if (isSupabaseConfigured) {
    try {
      await supabase.from('services').update({ is_active: false }).eq('id', id);
    } catch (err) {
      console.warn('Supabase deactivate failed:', err);
    }
  }

  const list = await getServices(false);
  const index = list.findIndex((s) => s.id === id);
  if (index !== -1) {
    list[index].is_active = false;
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(list));
  }
}

// 2. APPOINTMENTS
export async function getAppointments(status?: string): Promise<Appointment[]> {
  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          service:service_id (id, name, duration_minutes, price, is_active)
        `)
        .order('appointment_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (!error && data) {
        return data as Appointment[];
      }
    } catch (err) {
      console.warn('Supabase getAppointments failed, falling back:', err);
    }
  }

  const raw = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
  let list: Appointment[] = raw ? JSON.parse(raw) : [];
  const services = await getServices(false);

  // Attach service
  list = list.map((a) => ({
    ...a,
    service: services.find((s) => s.id === a.service_id),
  }));

  if (status && status !== 'all') {
    list = list.filter((a) => a.status === status);
  }

  return list.sort((a, b) => `${a.appointment_date} ${a.start_time}`.localeCompare(`${b.appointment_date} ${b.start_time}`));
}

export async function createAppointment(
  data: Omit<Appointment, 'id' | 'created_at' | 'status' | 'service'> & { status?: Appointment['status'] }
): Promise<Appointment> {
  const newId = `apt-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const status = data.status || 'pending';
  const newAppointment: Appointment = {
    ...data,
    id: newId,
    status,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const { data: inserted, error } = await supabase
        .from('appointments')
        .insert([{
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          service_id: data.service_id,
          appointment_date: data.appointment_date,
          start_time: data.start_time,
          end_time: data.end_time,
          status,
          notes: data.notes || null,
        }])
        .select(`
          *,
          service:service_id (id, name, duration_minutes, price, is_active)
        `)
        .single();

      if (!error && inserted) {
        return inserted as Appointment;
      }
    } catch (err) {
      console.warn('Supabase createAppointment failed, storing locally:', err);
    }
  }

  const list = await getAppointments();
  list.push(newAppointment);
  localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(list));
  return newAppointment;
}

export async function updateAppointmentStatus(id: string, status: Appointment['status']): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id);
      if (!error) return;
    } catch (err) {
      console.warn('Supabase update status failed:', err);
    }
  }

  const raw = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
  const list: Appointment[] = raw ? JSON.parse(raw) : [];
  const index = list.findIndex((a) => a.id === id);
  if (index !== -1) {
    list[index].status = status;
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(list));
  }
}

// 3. BUSINESS HOURS
export async function getBusinessHours(): Promise<BusinessHours[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('business_hours')
        .select('*')
        .order('weekday');

      if (!error && data && data.length > 0) {
        return data as BusinessHours[];
      }
    } catch (err) {
      console.warn('Supabase getBusinessHours failed:', err);
    }
  }

  const raw = localStorage.getItem(STORAGE_KEYS.BUSINESS_HOURS);
  return raw ? JSON.parse(raw) : DEFAULT_BUSINESS_HOURS;
}

export async function updateBusinessHour(id: string | number, updates: Partial<BusinessHours>): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      await supabase.from('business_hours').update(updates).eq('id', id);
    } catch (err) {
      console.warn('Supabase updateBusinessHour failed:', err);
    }
  }

  const list = await getBusinessHours();
  const index = list.findIndex((b) => String(b.id) === String(id));
  if (index !== -1) {
    list[index] = { ...list[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.BUSINESS_HOURS, JSON.stringify(list));
  }
}

// 4. BLOCKED DATES
export async function getBlockedDates(): Promise<BlockedDate[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('blocked_dates')
        .select('*')
        .order('blocked_date');

      if (!error && data) {
        return data as BlockedDate[];
      }
    } catch (err) {
      console.warn('Supabase getBlockedDates failed:', err);
    }
  }

  const raw = localStorage.getItem(STORAGE_KEYS.BLOCKED_DATES);
  return raw ? JSON.parse(raw) : [];
}

export async function addBlockedDate(blocked_date: string, reason: string): Promise<BlockedDate> {
  const newBlocked: BlockedDate = {
    id: `blk-${Date.now()}`,
    blocked_date,
    reason,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('blocked_dates')
        .insert([{ blocked_date, reason }])
        .select()
        .single();

      if (!error && data) {
        return data as BlockedDate;
      }
    } catch (err) {
      console.warn('Supabase addBlockedDate failed:', err);
    }
  }

  const list = await getBlockedDates();
  list.push(newBlocked);
  localStorage.setItem(STORAGE_KEYS.BLOCKED_DATES, JSON.stringify(list));
  return newBlocked;
}

export async function removeBlockedDate(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      await supabase.from('blocked_dates').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase removeBlockedDate failed:', err);
    }
  }

  const list = await getBlockedDates();
  const filtered = list.filter((b) => b.id !== id);
  localStorage.setItem(STORAGE_KEYS.BLOCKED_DATES, JSON.stringify(filtered));
}

// 5. CLINIC SETTINGS
export async function getClinicSettings(): Promise<ClinicSettings> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('clinic_settings')
        .select('*')
        .limit(1)
        .single();

      if (!error && data) {
        return data as ClinicSettings;
      }
    } catch (err) {
      console.warn('Supabase getClinicSettings failed:', err);
    }
  }

  const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return raw ? JSON.parse(raw) : DEFAULT_CLINIC_SETTINGS;
}

export async function updateClinicSettings(updates: Partial<ClinicSettings>): Promise<ClinicSettings> {
  const current = await getClinicSettings();
  const updated: ClinicSettings = { ...current, ...updates };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('clinic_settings')
        .update({
          clinic_name: updated.clinic_name,
          clinic_email: updated.clinic_email,
          clinic_phone: updated.clinic_phone,
          clinic_address: updated.clinic_address,
          slot_interval_minutes: updated.slot_interval_minutes,
          booking_notice_hours: updated.booking_notice_hours,
        })
        .eq('id', current.id)
        .select()
        .single();

      if (!error && data) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data));
        return data as ClinicSettings;
      }
    } catch (err) {
      console.warn('Supabase updateClinicSettings failed:', err);
    }
  }

  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  return updated;
}

// 6. ADMIN AUTHORIZATION VERIFICATION
export async function checkIsAdmin(userId: string): Promise<boolean> {
  if (!userId) return false;

  if (isSupabaseConfigured) {
    try {
      // Check admin_users where user_id = userId
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, user_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data) {
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Supabase admin check query failed:', err);
    }
  }

  // Dev demo support when Supabase isn't connected yet: check local admin list
  const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_USERS);
  const list: AdminUser[] = raw ? JSON.parse(raw) : [];
  return list.some((a) => a.user_id === userId);
}

export async function registerLocalAdminUser(userId: string): Promise<void> {
  const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_USERS);
  const list: AdminUser[] = raw ? JSON.parse(raw) : [];
  if (!list.some((a) => a.user_id === userId)) {
    list.push({ id: `adm-${Date.now()}`, user_id: userId, created_at: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(list));
  }
}

// Aliases for convenience
export const fetchServices = getServices;
export const fetchAppointments = getAppointments;
export const fetchBusinessHours = getBusinessHours;
export const fetchBlockedDates = getBlockedDates;
export const fetchClinicSettings = getClinicSettings;

// SQL Schema for direct Supabase copy-paste
export const SUPABASE_SQL_SCHEMA = `-- ============================================================
-- LUMINA DENTAL CLINIC - SUPABASE PRODUCTION DATABASE SCHEMA
-- Run this in your Supabase SQL Editor to initialize all tables
-- ============================================================

-- 1. Services Table
CREATE TABLE IF NOT EXISTS public.services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 45,
  price NUMERIC(10, 2) NOT NULL DEFAULT 100.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Appointments Table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE RESTRICT,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Business Hours Table (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
CREATE TABLE IF NOT EXISTS public.business_hours (
  id SERIAL PRIMARY KEY,
  weekday INTEGER NOT NULL UNIQUE CHECK (weekday >= 0 AND weekday <= 6),
  is_open BOOLEAN NOT NULL DEFAULT true,
  start_time TIME NOT NULL DEFAULT '08:30:00',
  end_time TIME NOT NULL DEFAULT '18:00:00'
);

-- 4. Blocked Dates Table (Holidays, Clinic Closures)
CREATE TABLE IF NOT EXISTS public.blocked_dates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blocked_date DATE NOT NULL UNIQUE,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Clinic Settings Table
CREATE TABLE IF NOT EXISTS public.clinic_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_name TEXT NOT NULL DEFAULT 'Lumina Dental Studio',
  clinic_email TEXT NOT NULL DEFAULT 'care@luminadental.com',
  clinic_phone TEXT NOT NULL DEFAULT '(555) 392-8840',
  clinic_address TEXT NOT NULL DEFAULT '742 Evergreen Medical Way, Suite 300',
  slot_interval_minutes INTEGER NOT NULL DEFAULT 30,
  booking_notice_hours INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Admin Users Table (Links to Supabase auth.users.id)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Public read policies for booking flow
CREATE POLICY "Public read active services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Public insert appointments" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read appointments for slot checking" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Public read business hours" ON public.business_hours FOR SELECT USING (true);
CREATE POLICY "Public read blocked dates" ON public.blocked_dates FOR SELECT USING (true);
CREATE POLICY "Public read clinic settings" ON public.clinic_settings FOR SELECT USING (true);
CREATE POLICY "Admin read admin users" ON public.admin_users FOR SELECT USING (true);

-- Admin full access policies
CREATE POLICY "Admin manage services" ON public.services FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.admin_users));
CREATE POLICY "Admin manage appointments" ON public.appointments FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.admin_users));
CREATE POLICY "Admin manage business hours" ON public.business_hours FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.admin_users));
CREATE POLICY "Admin manage blocked dates" ON public.blocked_dates FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.admin_users));
CREATE POLICY "Admin manage clinic settings" ON public.clinic_settings FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- SEED INITIAL DATA
INSERT INTO public.services (name, description, duration_minutes, price, is_active) VALUES
  ('Comprehensive Dental Checkup & Exam', 'Thorough visual examination, low-radiation digital x-rays, periodontal evaluation, and customized oral health roadmap.', 45, 120.00, true),
  ('Gentle Ultrasonic Dental Cleaning & Polish', 'Advanced ultrasonic plaque removal, gentle airflow stain lifting, fluoride enamel strengthening, and smooth high-gloss polishing.', 45, 150.00, true),
  ('Professional In-Office Laser Teeth Whitening', 'Medical-grade non-invasive whitening treatment lifting deep stubborn stains up to 8 shades in a single comfortable 60-minute session.', 60, 320.00, true),
  ('Biomimetic Tooth-Colored Composite Filling', 'Minimally invasive composite resin restoration matched seamlessly to your natural tooth enamel shade and anatomical structure.', 45, 190.00, true),
  ('Clear Invisible Aligner Consultation & 3D Scan', 'Complete 3D intraoral digital mapping, treatment simulation, bite analysis, and clear aligner orthodontic evaluation.', 30, 80.00, true),
  ('Urgent Emergency Dental Consultation', 'Same-day priority assessment and relief for sudden toothache, fractured crowns, trauma, or gum swelling.', 30, 140.00, true)
ON CONFLICT DO NOTHING;

INSERT INTO public.business_hours (weekday, is_open, start_time, end_time) VALUES
  (0, false, '09:00:00', '17:00:00'),
  (1, true, '08:30:00', '18:00:00'),
  (2, true, '08:30:00', '18:00:00'),
  (3, true, '08:30:00', '18:00:00'),
  (4, true, '08:30:00', '18:00:00'),
  (5, true, '08:30:00', '17:00:00'),
  (6, true, '09:00:00', '14:30:00')
ON CONFLICT (weekday) DO NOTHING;

INSERT INTO public.clinic_settings (clinic_name, clinic_email, clinic_phone, clinic_address, slot_interval_minutes, booking_notice_hours) VALUES
  ('Lumina Dental Studio & Oral Health', 'care@luminadental.com', '(555) 392-8840', '742 Evergreen Medical Way, Suite 300, Metropolitan City', 30, 2)
ON CONFLICT DO NOTHING;
`;
