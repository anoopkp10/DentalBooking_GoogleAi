/**
 * Curated high-resolution dental & healthcare imagery
 * Clean, modern, calm, non-graphic, professional
 */
export const CLINIC_IMAGES = {
  // Hero & Clinic Environment
  heroMain: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1400&q=80", // Modern bright dental examination room with state-of-the-art dental chair
  heroConsultation: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1000&q=80", // Friendly dentist consulting with patient
  receptionLobby: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80", // Clean calming reception area
  modernEquipment: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=1000&q=80", // Clean precision dental tools and sterile setup
  doctorPortrait: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80", // Lead Dentist Dr. Elena Vance
  doctorAssociate: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80", // Dr. Marcus Hayes (Orthodontist)
  smilePatient: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80", // Confident, natural bright smile

  // Services Photography (Tasteful & Medical)
  services: {
    checkup: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80",
    cleaning: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80",
    whitening: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=800&q=80",
    filling: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=800&q=80",
    aligners: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    emergency: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80",
    implants: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80",
  },

  // About Section Visuals
  tech3DScan: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
  gentleCare: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80",
  hygieneProtocol: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80",
};

export const DEFAULT_SERVICES = [
  {
    id: "srv-001",
    name: "Comprehensive Dental Checkup & Exam",
    description: "Thorough visual examination, low-radiation digital x-rays, periodontal evaluation, and customized oral health roadmap.",
    duration_minutes: 45,
    price: 120,
    is_active: true,
    category: "Preventive" as const,
    image_url: CLINIC_IMAGES.services.checkup,
    popular: true
  },
  {
    id: "srv-002",
    name: "Gentle Ultrasonic Dental Cleaning & Polish",
    description: "Advanced ultrasonic plaque removal, gentle airflow stain lifting, fluoride enamel strengthening, and smooth high-gloss polishing.",
    duration_minutes: 45,
    price: 150,
    is_active: true,
    category: "Preventive" as const,
    image_url: CLINIC_IMAGES.services.cleaning,
    popular: true
  },
  {
    id: "srv-003",
    name: "Professional In-Office Laser Teeth Whitening",
    description: "Medical-grade non-invasive whitening treatment lifting deep stubborn stains up to 8 shades in a single comfortable 60-minute session.",
    duration_minutes: 60,
    price: 320,
    is_active: true,
    category: "Cosmetic" as const,
    image_url: CLINIC_IMAGES.services.whitening,
    popular: true
  },
  {
    id: "srv-004",
    name: "Biomimetic Tooth-Colored Composite Filling",
    description: "Minimally invasive composite resin restoration matched seamlessly to your natural tooth enamel shade and anatomical structure.",
    duration_minutes: 45,
    price: 190,
    is_active: true,
    category: "Restorative" as const,
    image_url: CLINIC_IMAGES.services.filling
  },
  {
    id: "srv-005",
    name: "Clear Invisible Aligner Consultation & 3D Scan",
    description: "Complete 3D intraoral digital mapping, treatment simulation, bite analysis, and clear aligner orthodontic evaluation.",
    duration_minutes: 30,
    price: 80,
    is_active: true,
    category: "Orthodontics" as const,
    image_url: CLINIC_IMAGES.services.aligners
  },
  {
    id: "srv-006",
    name: "Urgent Emergency Dental Consultation",
    description: "Same-day priority assessment and relief for sudden toothache, fractured crowns, trauma, or gum swelling.",
    duration_minutes: 30,
    price: 140,
    is_active: true,
    category: "Emergency" as const,
    image_url: CLINIC_IMAGES.services.emergency
  }
];

export const DEFAULT_BUSINESS_HOURS = [
  { id: "bh-0", weekday: 0, is_open: false, start_time: "09:00:00", end_time: "17:00:00" }, // Sunday: Closed
  { id: "bh-1", weekday: 1, is_open: true, start_time: "08:30:00", end_time: "18:00:00" },  // Monday
  { id: "bh-2", weekday: 2, is_open: true, start_time: "08:30:00", end_time: "18:00:00" },  // Tuesday
  { id: "bh-3", weekday: 3, is_open: true, start_time: "08:30:00", end_time: "18:00:00" },  // Wednesday
  { id: "bh-4", weekday: 4, is_open: true, start_time: "08:30:00", end_time: "18:00:00" },  // Thursday
  { id: "bh-5", weekday: 5, is_open: true, start_time: "08:30:00", end_time: "17:00:00" },  // Friday
  { id: "bh-6", weekday: 6, is_open: true, start_time: "09:00:00", end_time: "14:30:00" },  // Saturday
];

export const DEFAULT_CLINIC_SETTINGS = {
  id: "setting-001",
  clinic_name: "Lumina Dental Studio & Oral Health",
  clinic_email: "care@luminadental.com",
  clinic_phone: "(555) 392-8840",
  clinic_address: "742 Evergreen Medical Way, Suite 300, Metropolitan City",
  slot_interval_minutes: 30,
  booking_notice_hours: 2,
  created_at: new Date().toISOString()
};

export const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];
