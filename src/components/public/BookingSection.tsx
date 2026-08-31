import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Mail,
  Phone,
  FileText,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  CalendarCheck,
  Download,
  ArrowRight,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  Appointment,
  BlockedDate,
  BusinessHours,
  ClinicSettings,
  DentalService,
  TimeSlot,
  BookingFormData
} from '../../types/database';
import {
  generateAvailableSlots,
  formatFriendlyDate,
  combineDateAndTime
} from '../../utils/availability';

interface BookingSectionProps {
  services: DentalService[];
  businessHours: BusinessHours[];
  blockedDates: BlockedDate[];
  existingAppointments: Appointment[];
  clinicSettings: ClinicSettings;
  preSelectedService?: DentalService | null;
  onBookingSuccess: (newAppointment: Appointment) => void;
  onSubmitBooking: (formData: BookingFormData) => Promise<Appointment>;
}

export const BookingSection: React.FC<BookingSectionProps> = ({
  services,
  businessHours,
  blockedDates,
  existingAppointments,
  clinicSettings,
  preSelectedService,
  onBookingSuccess,
  onSubmitBooking,
}) => {
  // Step State: 1 = Service, 2 = Date & Time, 3 = Patient Details, 4 = Success
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Active Services
  const activeServices = useMemo(() => services.filter((s) => s.is_active), [services]);

  // Form selections
  const [selectedService, setSelectedService] = useState<DentalService | null>(
    preSelectedService || activeServices[0] || null
  );

  // Sync preSelectedService from outside if passed
  useEffect(() => {
    if (preSelectedService) {
      setSelectedService(preSelectedService);
      setCurrentStep(2); // Jump directly to date & time
    }
  }, [preSelectedService]);

  // Date selection (default to tomorrow or first open business day)
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });

  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Patient inputs
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Month navigation for calendar preview
  const [calendarViewMonth, setCalendarViewMonth] = useState<Date>(() => new Date());

  // Generate Slots when service or date changes
  const slotData = useMemo(() => {
    if (!selectedService || !selectedDateStr) {
      return { isClosed: false, isBlocked: false, slots: [] };
    }
    return generateAvailableSlots({
      selectedDateStr,
      service: selectedService,
      businessHoursList: businessHours,
      blockedDates,
      existingAppointments,
      clinicSettings,
      now: new Date()
    });
  }, [selectedService, selectedDateStr, businessHours, blockedDates, existingAppointments, clinicSettings]);

  // Separate slots into Morning and Afternoon
  const morningSlots = useMemo(() => {
    return slotData.slots.filter((s) => s.start.getHours() < 12);
  }, [slotData.slots]);

  const afternoonSlots = useMemo(() => {
    return slotData.slots.filter((s) => s.start.getHours() >= 12);
  }, [slotData.slots]);

  // Auto clear slot when date or service changes
  useEffect(() => {
    setSelectedSlot(null);
  }, [selectedDateStr, selectedService]);

  // Validate step 3
  const validatePatientForm = () => {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.fullName = 'Please enter your full legal name.';
    if (!email.trim() || !email.includes('@')) errors.email = 'Please enter a valid email address.';
    if (!phone.trim() || phone.trim().length < 7) errors.phone = 'Please enter a valid phone number.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePatientForm()) return;
    if (!selectedService || !selectedDateStr || !selectedSlot) {
      setSubmitError('Missing appointment selection. Please go back and select a service, date, and time.');
      return;
    }

    if (typeof onSubmitBooking !== 'function') {
      setSubmitError('Booking is temporarily unavailable due to a configuration issue. Please refresh the page and try again.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const created = await onSubmitBooking({
        service_id: selectedService.id,
        appointment_date: selectedDateStr,
        start_time: selectedSlot.startTimeStr,
        end_time: selectedSlot.endTimeStr,
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        notes: notes.trim() || undefined,
      });

      setConfirmedAppointment(created);
      if (typeof onBookingSuccess === 'function') {
        onBookingSuccess(created);
      }
      setCurrentStep(4);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0d9488', '#06b6d4', '#14b8a6', '#0ea5e9']
        });
      } catch (e) {
        // ignore if not supported
      }
    } catch (err: any) {
      console.error('Booking submission failed:', err);
      setSubmitError(err?.message || 'Unable to confirm appointment. Please try again or call our front desk.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Calendar Generator
  const calendarDays = useMemo(() => {
    const year = calendarViewMonth.getFullYear();
    const month = calendarViewMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay(); // 0 for Sunday
    const totalDays = lastDay.getDate();

    const days: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isPast: boolean;
      isBlocked: boolean;
      isClosed: boolean;
    }> = [];

    const todayStr = new Date().toISOString().split('T')[0];

    // Previous month filler
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({
        dateStr: '',
        dayNumber: 0,
        isCurrentMonth: false,
        isPast: true,
        isBlocked: false,
        isClosed: false
      });
    }

    // Days of current month
    for (let day = 1; day <= totalDays; day++) {
      const dayDate = new Date(year, month, day);
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(day).padStart(2, '0');
      const dateStr = `${year}-${mStr}-${dStr}`;

      const weekday = dayDate.getDay();
      const bh = businessHours.find((b) => Number(b.weekday) === weekday);
      const isClosed = !bh || !bh.is_open;
      const isBlocked = blockedDates.some((b) => b.blocked_date === dateStr);
      const isPast = dateStr < todayStr;

      days.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: true,
        isPast,
        isBlocked,
        isClosed
      });
    }

    return days;
  }, [calendarViewMonth, businessHours, blockedDates]);

  // Calendar iCal download helper
  const handleDownloadCalendarInvite = () => {
    if (!confirmedAppointment || !selectedService) return;

    const startDt = combineDateAndTime(confirmedAppointment.appointment_date, confirmedAppointment.start_time);
    const endDt = combineDateAndTime(confirmedAppointment.appointment_date, confirmedAppointment.end_time);

    const formatICSDate = (d: Date) => {
      return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Lumina Dental Clinic//Appointment//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:lumina-${confirmedAppointment.id}@luminadental.com`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${formatICSDate(startDt)}`,
      `DTEND:${formatICSDate(endDt)}`,
      `SUMMARY:Dental Appointment: ${selectedService.name}`,
      `DESCRIPTION:Patient: ${confirmedAppointment.full_name}\\nClinic: ${clinicSettings.clinic_name}\\nPhone: ${clinicSettings.clinic_phone}\\nAddress: ${clinicSettings.clinic_address}`,
      `LOCATION:${clinicSettings.clinic_address}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `lumina-dental-appointment-${confirmedAppointment.appointment_date}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetBooking = () => {
    setCurrentStep(1);
    setSelectedSlot(null);
    setConfirmedAppointment(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setNotes('');
  };

  return (
    <section id="booking-section" className="py-20 bg-slate-100/70 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title & Badge */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100/80 text-teal-900 text-xs font-bold tracking-wide uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-teal-700" />
            Online Scheduling Portal
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Schedule your appointment in 60 seconds.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Real-time availability directly synced with our clinic schedule. No waiting on hold.
          </p>
        </div>

        {/* Main Card Container */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/5 overflow-hidden">
          
          {/* Step Indicator Header (Only on steps 1, 2, 3) */}
          {currentStep < 4 && (
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80">
              <div className="flex items-center justify-between max-w-2xl mx-auto">
                
                {/* Step 1 */}
                <button
                  onClick={() => setCurrentStep(1)}
                  className={`flex items-center gap-2.5 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                    currentStep === 1 ? 'text-teal-700' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                    currentStep === 1
                      ? 'bg-teal-600 text-white shadow-sm'
                      : currentStep > 1
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {currentStep > 1 ? '✓' : '1'}
                  </span>
                  <span className="hidden sm:inline">Select Treatment</span>
                </button>

                <div className="h-0.5 w-8 sm:w-16 bg-slate-200" />

                {/* Step 2 */}
                <button
                  onClick={() => selectedService && setCurrentStep(2)}
                  disabled={!selectedService}
                  className={`flex items-center gap-2.5 text-xs sm:text-sm font-bold transition-colors ${
                    currentStep === 2 ? 'text-teal-700' : 'text-slate-500 hover:text-slate-800'
                  } ${!selectedService ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                    currentStep === 2
                      ? 'bg-teal-600 text-white shadow-sm'
                      : currentStep > 2
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {currentStep > 2 ? '✓' : '2'}
                  </span>
                  <span className="hidden sm:inline">Date & Time</span>
                </button>

                <div className="h-0.5 w-8 sm:w-16 bg-slate-200" />

                {/* Step 3 */}
                <button
                  onClick={() => selectedSlot && setCurrentStep(3)}
                  disabled={!selectedSlot}
                  className={`flex items-center gap-2.5 text-xs sm:text-sm font-bold transition-colors ${
                    currentStep === 3 ? 'text-teal-700' : 'text-slate-500 hover:text-slate-800'
                  } ${!selectedSlot ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                    currentStep === 3
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    3
                  </span>
                  <span className="hidden sm:inline">Your Details</span>
                </button>

              </div>
            </div>
          )}

          {/* Card Body */}
          <div className="p-6 sm:p-8 lg:p-10">
            
            {/* STEP 1: SELECT DENTAL SERVICE */}
            {currentStep === 1 && (
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Choose Dental Service</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Select the service you wish to book. Pricing and duration will be reserved for your visit.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {activeServices.map((service) => {
                    const isSelected = selectedService?.id === service.id;
                    return (
                      <div
                        key={service.id}
                        id={`select-service-${service.id}`}
                        onClick={() => setSelectedService(service)}
                        className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-teal-600 bg-teal-50/40 shadow-md ring-2 ring-teal-600/20'
                            : 'border-slate-200/90 bg-white hover:border-teal-300 hover:bg-slate-50/60'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 px-2 py-0.5 rounded-md bg-teal-100/70">
                              {service.category || 'Dental'}
                            </span>
                            <div className="flex items-center text-xs font-semibold text-slate-500">
                              <Clock className="w-3.5 h-3.5 mr-1 text-teal-600" />
                              {service.duration_minutes} min
                            </div>
                          </div>

                          <h4 className="text-base font-bold text-slate-900 leading-snug mb-1.5">
                            {service.name}
                          </h4>

                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {service.description}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                          <span className="text-base font-extrabold text-slate-900">
                            ${Number(service.price).toFixed(0)}
                          </span>
                          <span className={`text-xs font-bold ${isSelected ? 'text-teal-700' : 'text-slate-400'}`}>
                            {isSelected ? '✓ Selected' : 'Click to select'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end">
                  <button
                    disabled={!selectedService}
                    onClick={() => setCurrentStep(2)}
                    id="step1-continue-btn"
                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md transition-all cursor-pointer"
                  >
                    <span>Continue to Date & Time</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: SELECT DATE & TIME SLOT */}
            {currentStep === 2 && selectedService && (
              <div>
                {/* Header with selected service reminder */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-200 gap-3">
                  <div>
                    <span className="text-xs text-teal-700 font-bold uppercase tracking-wider">Step 2 of 3</span>
                    <h3 className="text-xl font-bold text-slate-900">Select Date & Time</h3>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{selectedService.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {selectedService.duration_minutes} mins • ${Number(selectedService.price).toFixed(0)}
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-xs font-semibold text-teal-600 hover:text-teal-800 underline ml-2 cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                </div>

                {/* Date & Time Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                  
                  {/* Left Calendar Widget (5 cols) */}
                  <div className="lg:col-span-5 bg-slate-50/80 p-5 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-slate-900">
                        {calendarViewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </h4>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            const prev = new Date(calendarViewMonth);
                            prev.setMonth(prev.getMonth() - 1);
                            setCalendarViewMonth(prev);
                          }}
                          className="p-1 rounded-lg hover:bg-slate-200 text-slate-600"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const next = new Date(calendarViewMonth);
                            next.setMonth(next.getMonth() + 1);
                            setCalendarViewMonth(next);
                          }}
                          className="p-1 rounded-lg hover:bg-slate-200 text-slate-600"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Day Names */}
                    <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-500 mb-2">
                      <span>Su</span>
                      <span>Mo</span>
                      <span>Tu</span>
                      <span>We</span>
                      <span>Th</span>
                      <span>Fr</span>
                      <span>Sa</span>
                    </div>

                    {/* Calendar Day Cells */}
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {calendarDays.map((day, idx) => {
                        if (!day.isCurrentMonth) {
                          return <div key={idx} className="h-8" />;
                        }

                        const isSelected = selectedDateStr === day.dateStr;
                        const isUnavailable = day.isPast || day.isBlocked || day.isClosed;

                        return (
                          <button
                            key={idx}
                            disabled={isUnavailable}
                            onClick={() => setSelectedDateStr(day.dateStr)}
                            className={`h-9 w-full rounded-xl text-xs font-semibold flex items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-teal-600 text-white font-bold shadow-sm'
                                : isUnavailable
                                ? 'text-slate-300 bg-transparent cursor-not-allowed line-through'
                                : 'text-slate-700 hover:bg-teal-100/70 hover:text-teal-900 cursor-pointer'
                            }`}
                          >
                            {day.dayNumber}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                        <span>Selected date</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                        <span>Closed / Holiday</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Available Time Slots (7 cols) */}
                  <div className="lg:col-span-7">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          Available Slots for {formatFriendlyDate(selectedDateStr)}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {slotData.slots.filter((s) => s.available).length} time slots currently open
                        </p>
                      </div>
                    </div>

                    {slotData.isBlocked ? (
                      <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 shrink-0 text-amber-700 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold">Clinic is closed on this date</p>
                          <p className="text-xs mt-1 text-amber-800">{slotData.closedReason}</p>
                          <p className="text-xs mt-2 font-semibold">Please choose another day on the calendar.</p>
                        </div>
                      </div>
                    ) : slotData.isClosed ? (
                      <div className="p-6 bg-slate-100 rounded-2xl border border-slate-200 text-slate-700 flex items-start gap-3">
                        <Info className="w-5 h-5 shrink-0 text-slate-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold">No clinic hours on this day</p>
                          <p className="text-xs mt-1 text-slate-600">{slotData.closedReason}</p>
                          <p className="text-xs mt-2 font-semibold text-teal-700">Please select Monday through Saturday.</p>
                        </div>
                      </div>
                    ) : slotData.slots.length === 0 ? (
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center py-10">
                        <p className="text-sm font-bold text-slate-800">No remaining open slots for this date</p>
                        <p className="text-xs text-slate-500 mt-1">Please select an upcoming day with open appointments.</p>
                      </div>
                    ) : (
                      <div className="space-y-6 max-h-96 overflow-y-auto pr-1">
                        {/* Morning Slots */}
                        {morningSlots.length > 0 && (
                          <div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
                              Morning
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                              {morningSlots.map((slot, idx) => {
                                const isSelected = selectedSlot?.startTimeStr === slot.startTimeStr;
                                return (
                                  <button
                                    key={idx}
                                    id={`slot-${slot.startTimeStr}`}
                                    disabled={!slot.available}
                                    onClick={() => setSelectedSlot(slot)}
                                    className={`p-3 rounded-xl text-xs font-bold border transition-all text-center ${
                                      isSelected
                                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                                        : slot.available
                                        ? 'bg-white border-slate-200 text-slate-800 hover:border-teal-400 hover:bg-teal-50/50 cursor-pointer'
                                        : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                                    }`}
                                  >
                                    <span>{slot.label}</span>
                                    {!slot.available && (
                                      <span className="block text-[10px] font-normal text-slate-400 mt-0.5">
                                        Booked
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Afternoon Slots */}
                        {afternoonSlots.length > 0 && (
                          <div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
                              Afternoon & Evening
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                              {afternoonSlots.map((slot, idx) => {
                                const isSelected = selectedSlot?.startTimeStr === slot.startTimeStr;
                                return (
                                  <button
                                    key={idx}
                                    id={`slot-${slot.startTimeStr}`}
                                    disabled={!slot.available}
                                    onClick={() => setSelectedSlot(slot)}
                                    className={`p-3 rounded-xl text-xs font-bold border transition-all text-center ${
                                      isSelected
                                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                                        : slot.available
                                        ? 'bg-white border-slate-200 text-slate-800 hover:border-teal-400 hover:bg-teal-50/50 cursor-pointer'
                                        : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                                    }`}
                                  >
                                    <span>{slot.label}</span>
                                    {!slot.available && (
                                      <span className="block text-[10px] font-normal text-slate-400 mt-0.5">
                                        Booked
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  </div>

                </div>

                {/* Step 2 Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    ← Back to Services
                  </button>

                  <button
                    disabled={!selectedSlot}
                    onClick={() => setCurrentStep(3)}
                    id="step2-continue-btn"
                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md transition-all cursor-pointer"
                  >
                    <span>Enter Patient Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PATIENT INFORMATION FORM */}
            {currentStep === 3 && selectedService && selectedSlot && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-200 gap-3">
                  <div>
                    <span className="text-xs text-teal-700 font-bold uppercase tracking-wider">Step 3 of 3</span>
                    <h3 className="text-xl font-bold text-slate-900">Patient Details & Confirmation</h3>
                  </div>
                  <div className="bg-teal-50/80 px-4 py-2 rounded-xl border border-teal-200 text-xs">
                    <p className="font-bold text-teal-900">{selectedService.name}</p>
                    <p className="text-teal-700 font-medium">
                      {formatFriendlyDate(selectedDateStr)} at {selectedSlot.label}
                    </p>
                  </div>
                </div>

                {submitError && (
                  <div className="p-4 mb-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{submitError}</span>
                  </div>
                )}

                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                        Full Legal Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          id="patient-full-name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Alex Morgan"
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                            formErrors.fullName ? 'border-rose-400' : 'border-slate-300'
                          }`}
                        />
                      </div>
                      {formErrors.fullName && (
                        <p className="text-[11px] text-rose-600 mt-1 font-semibold">{formErrors.fullName}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                        Email Address (For Confirmation) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          required
                          id="patient-email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="alex@example.com"
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                            formErrors.email ? 'border-rose-400' : 'border-slate-300'
                          }`}
                        />
                      </div>
                      {formErrors.email && (
                        <p className="text-[11px] text-rose-600 mt-1 font-semibold">{formErrors.email}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                        Mobile Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input
                          type="tel"
                          required
                          id="patient-phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="(555) 000-0000"
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                            formErrors.phone ? 'border-rose-400' : 'border-slate-300'
                          }`}
                        />
                      </div>
                      {formErrors.phone && (
                        <p className="text-[11px] text-rose-600 mt-1 font-semibold">{formErrors.phone}</p>
                      )}
                    </div>

                    {/* Service & Price Summary Card */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-center">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>Duration: {selectedService.duration_minutes} minutes</span>
                        <span className="font-bold text-teal-700">Estimated Total: ${Number(selectedService.price).toFixed(0)}</span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Payment is processed at the clinic during your visit. We accept all major cards & dental insurance.
                      </p>
                    </div>

                  </div>

                  {/* Notes / Concerns */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                      Dental Notes or Symptoms (Optional)
                    </label>
                    <div className="relative">
                      <textarea
                        rows={3}
                        id="patient-notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Please mention any tooth sensitivity, dental anxiety, or specific goals for your visit..."
                        className="w-full p-3.5 rounded-xl border border-slate-300 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  {/* Privacy and cancellation notice */}
                  <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-100 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-600 leading-relaxed">
                      By booking, you agree to our 24-hour courtesy cancellation policy. Your personal health information is protected under strict HIPAA-compliant clinical protocols.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      ← Back to Calendar
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      id="submit-booking-btn"
                      className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-lg shadow-teal-700/20 transition-all cursor-pointer"
                    >
                      {isSubmitting ? (
                        <span>Reserving Slot...</span>
                      ) : (
                        <>
                          <CalendarCheck className="w-4 h-4" />
                          <span>Confirm & Book Appointment</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 4: SUCCESS CONFIRMATION SCREEN */}
            {currentStep === 4 && confirmedAppointment && (
              <div className="text-center py-6 max-w-xl mx-auto animate-in zoom-in-95 duration-300">
                
                {/* Checkmark badge */}
                <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto mb-5 shadow-sm">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 px-3 py-1 bg-teal-50 rounded-full border border-teal-200">
                  Appointment Confirmed
                </span>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3 mb-2">
                  We look forward to seeing you, {confirmedAppointment.full_name}!
                </h3>

                <p className="text-sm text-slate-600 mb-8">
                  A confirmation email with clinic directions has been sent to <span className="font-semibold text-slate-900">{confirmedAppointment.email}</span>.
                </p>

                {/* Appointment Card Summary */}
                <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 text-left mb-8 shadow-xs">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase">Booking Ref</p>
                      <p className="font-mono text-sm font-bold text-slate-800">#{confirmedAppointment.id.slice(-8).toUpperCase()}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      Confirmed in System
                    </span>
                  </div>

                  <div className="py-4 space-y-3 text-sm">
                    <div className="flex items-start justify-between">
                      <span className="text-slate-500">Treatment:</span>
                      <span className="font-bold text-slate-900 text-right">{selectedService?.name}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Date:</span>
                      <span className="font-semibold text-slate-900">{formatFriendlyDate(confirmedAppointment.appointment_date)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Time:</span>
                      <span className="font-semibold text-slate-900">
                        {confirmedAppointment.start_time.slice(0, 5)} – {confirmedAppointment.end_time.slice(0, 5)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Location:</span>
                      <span className="font-medium text-slate-900 text-right text-xs max-w-[240px]">
                        {clinicSettings.clinic_address}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                    <span>Direct Front Desk: {clinicSettings.clinic_phone}</span>
                    <span>Free Parking Available</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
                  <button
                    onClick={handleDownloadCalendarInvite}
                    id="download-calendar-invite-btn"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-teal-600" />
                    <span>Add to Calendar (.ics)</span>
                  </button>

                  <button
                    onClick={handleResetBooking}
                    id="book-another-appointment-btn"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                  >
                    <span>Book Another Appointment</span>
                  </button>
                </div>

              </div>
            )}

          </div>

        </div>
      </div>
    </section>
  );
};
