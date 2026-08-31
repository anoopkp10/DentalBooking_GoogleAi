export interface DentalService {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  created_at?: string;
  // Enhanced UI properties (optional)
  image_url?: string;
  category?: 'Preventive' | 'Cosmetic' | 'Restorative' | 'Orthodontics' | 'Emergency' | 'General';
  popular?: boolean;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Appointment {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  service_id: string;
  appointment_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS or HH:MM
  end_time: string; // HH:MM:SS or HH:MM
  status: AppointmentStatus;
  notes?: string | null;
  created_at?: string;
  service?: DentalService;
}

export interface BusinessHours {
  id: string | number;
  weekday: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  is_open: boolean;
  start_time: string; // HH:MM:SS or HH:MM
  end_time: string; // HH:MM:SS or HH:MM
}

export interface BlockedDate {
  id: string;
  blocked_date: string; // YYYY-MM-DD
  reason: string;
  created_at?: string;
}

export interface ClinicSettings {
  id: string;
  clinic_name: string;
  clinic_email: string;
  clinic_phone: string;
  clinic_address: string;
  slot_interval_minutes: number;
  booking_notice_hours: number;
  created_at?: string;
}

export interface AdminUser {
  id: string;
  user_id: string;
  created_at?: string;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  label: string;
  startTimeStr: string; // HH:MM:SS
  endTimeStr: string; // HH:MM:SS
  available: boolean;
  reason?: string;
}

export interface BookingFormData {
  service_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  full_name: string;
  email: string;
  phone: string;
  notes?: string;
}
