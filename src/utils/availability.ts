import {
  Appointment,
  BlockedDate,
  BusinessHours,
  ClinicSettings,
  DentalService,
  TimeSlot
} from '../types/database';

/**
 * Parses time string (e.g., "08:30:00" or "08:30") and combines with a date (YYYY-MM-DD)
 * to return a valid Date object in local time.
 */
export function combineDateAndTime(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const cleanTime = timeStr.trim();
  const parts = cleanTime.split(':').map(Number);
  const hours = parts[0] || 0;
  const minutes = parts[1] || 0;
  const seconds = parts[2] || 0;

  return new Date(year, month - 1, day, hours, minutes, seconds);
}

/**
 * Formats a Date object to "HH:MM:SS" string for database persistence
 */
export function formatToTimeStr(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

/**
 * Formats a Date object to user-friendly "h:mm A" (e.g. "9:30 AM")
 */
export function formatSlotLabel(start: Date, end: Date): string {
  const formatTime = (d: Date) => {
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  };
  return `${formatTime(start)} – ${formatTime(end)}`;
}

/**
 * Checks if a date string is in blocked_dates
 */
export function isDateBlocked(dateStr: string, blockedDates: BlockedDate[]): { blocked: boolean; reason?: string } {
  const match = blockedDates.find((b) => b.blocked_date === dateStr);
  if (match) {
    return { blocked: true, reason: match.reason };
  }
  return { blocked: false };
}

/**
 * Main availability generator for a specific service and date
 */
export function generateAvailableSlots(params: {
  selectedDateStr: string; // "YYYY-MM-DD"
  service: DentalService;
  businessHoursList: BusinessHours[];
  blockedDates: BlockedDate[];
  existingAppointments: Appointment[];
  clinicSettings: ClinicSettings;
  now?: Date;
}): {
  isClosed: boolean;
  isBlocked: boolean;
  closedReason?: string;
  slots: TimeSlot[];
} {
  const {
    selectedDateStr,
    service,
    businessHoursList,
    blockedDates,
    existingAppointments,
    clinicSettings,
    now = new Date()
  } = params;

  // 1. Check if the date is blocked
  const blockedCheck = isDateBlocked(selectedDateStr, blockedDates);
  if (blockedCheck.blocked) {
    return {
      isClosed: false,
      isBlocked: true,
      closedReason: blockedCheck.reason || 'Clinic closed for scheduled holiday / maintenance.',
      slots: []
    };
  }

  // 2. Parse selected day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const [y, m, d] = selectedDateStr.split('-').map(Number);
  const targetDateObj = new Date(y, m - 1, d);
  const weekday = targetDateObj.getDay();

  // Find business hours for this weekday
  const daySchedule = businessHoursList.find((bh) => Number(bh.weekday) === weekday);

  if (!daySchedule || !daySchedule.is_open) {
    return {
      isClosed: true,
      isBlocked: false,
      closedReason: 'The clinic is closed on this day of the week.',
      slots: []
    };
  }

  // 3. Setup Start & End of Working Day
  const dayOpeningDate = combineDateAndTime(selectedDateStr, daySchedule.start_time);
  const dayClosingDate = combineDateAndTime(selectedDateStr, daySchedule.end_time);

  const slotIntervalMinutes = clinicSettings.slot_interval_minutes || 30;
  const bookingNoticeHours = clinicSettings.booking_notice_hours || 2;
  const serviceDurationMinutes = service.duration_minutes || 45;

  // Minimum booking time threshold
  const earliestAllowedBookingTime = new Date(now.getTime() + bookingNoticeHours * 60 * 60 * 1000);

  // 4. Parse Existing Active Appointments for this Day (Ignore 'cancelled')
  const activeDayAppointments = (existingAppointments || [])
    .filter((apt) => apt.appointment_date === selectedDateStr && apt.status !== 'cancelled')
    .map((apt) => {
      const start = combineDateAndTime(apt.appointment_date, apt.start_time);
      const end = combineDateAndTime(apt.appointment_date, apt.end_time);
      return { start, end };
    });

  // 5. Generate candidate time slots at each interval
  const generatedSlots: TimeSlot[] = [];
  let currentSlotStart = new Date(dayOpeningDate.getTime());

  while (true) {
    const currentSlotEnd = new Date(currentSlotStart.getTime() + serviceDurationMinutes * 60 * 1000);

    // Slot must finish before or at closing time
    if (currentSlotEnd.getTime() > dayClosingDate.getTime()) {
      break;
    }

    let isAvailable = true;
    let reason = '';

    // Check notice period: slot start must be after notice threshold if booking for today
    if (currentSlotStart.getTime() < earliestAllowedBookingTime.getTime()) {
      isAvailable = false;
      reason = 'Within minimum notice window';
    }

    // Check Overlap Rule: new_start < existing_end AND new_end > existing_start
    if (isAvailable) {
      for (const apt of activeDayAppointments) {
        const overlaps = (currentSlotStart.getTime() < apt.end.getTime()) && (currentSlotEnd.getTime() > apt.start.getTime());
        if (overlaps) {
          isAvailable = false;
          reason = 'Time slot is already booked';
          break;
        }
      }
    }

    generatedSlots.push({
      start: currentSlotStart,
      end: currentSlotEnd,
      label: formatSlotLabel(currentSlotStart, currentSlotEnd),
      startTimeStr: formatToTimeStr(currentSlotStart),
      endTimeStr: formatToTimeStr(currentSlotEnd),
      available: isAvailable,
      reason
    });

    // Advance by slot interval
    currentSlotStart = new Date(currentSlotStart.getTime() + slotIntervalMinutes * 60 * 1000);
  }

  return {
    isClosed: false,
    isBlocked: false,
    slots: generatedSlots
  };
}

/**
 * Formats a date string 'YYYY-MM-DD' into a friendly readable format e.g. "Thursday, Oct 24, 2026"
 */
export function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
