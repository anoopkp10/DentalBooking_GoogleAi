import React from 'react';
import { Phone, Mail, MapPin, Clock, ShieldCheck, Heart, ArrowUp } from 'lucide-react';
import { ClinicSettings, BusinessHours } from '../../types/database';
import { WEEKDAY_NAMES } from '../../data/imagery';

interface FooterProps {
  clinicSettings: ClinicSettings;
  businessHours: BusinessHours[];
  onAdminClick: () => void;
  onBookClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  clinicSettings,
  businessHours,
  onAdminClick,
  onBookClick,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-Column Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-slate-800">
          
          {/* Col 1: Brand & Bio (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-md">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C8.5 2 6 4.5 6 8c0 3.5 1.5 6.5 2 10 .3 2.1 1.7 3.5 3.5 3.5s2.2-.9 2.5-2.5c.3-1.6.7-3 1.5-4.5.8 1.5 1.2 2.9 1.5 4.5.3 1.6.7 2.5 2.5 2.5s3.2-1.4 3.5-3.5c.5-3.5 2-6.5 2-10 0-3.5-2.5-6-6-6-1.5 0-3 1-4 2-1-1-2.5-2-4-2z" />
                </svg>
              </div>
              <span className="font-display font-extrabold text-xl text-white tracking-tight">
                {clinicSettings.clinic_name || 'Lumina Dental Studio'}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pr-4">
              Providing gentle, patient-focused preventative, cosmetic, and restorative dentistry with state-of-the-art non-invasive technology.
            </p>

            <div className="pt-2">
              <button
                onClick={onBookClick}
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-slate-900 bg-teal-400 hover:bg-teal-300 rounded-xl transition-all shadow-sm"
              >
                Schedule Appointment Online
              </button>
            </div>
          </div>

          {/* Col 2: Clinic Location & Contact (3 cols) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Clinic Contact & Location
            </h4>
            
            <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{clinicSettings.clinic_address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <a href={`tel:${clinicSettings.clinic_phone}`} className="hover:text-white font-semibold">
                  {clinicSettings.clinic_phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <a href={`mailto:${clinicSettings.clinic_email}`} className="hover:text-white">
                  {clinicSettings.clinic_email}
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Hours of Operation (3 cols) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Working Hours
            </h4>

            <div className="space-y-1.5 text-xs text-slate-300">
              {businessHours.map((bh) => {
                const dayName = WEEKDAY_NAMES[bh.weekday] || `Day ${bh.weekday}`;
                return (
                  <div key={bh.id} className="flex items-center justify-between py-0.5 border-b border-slate-800/80">
                    <span className="text-slate-400">{dayName}</span>
                    <span className={bh.is_open ? 'font-medium text-slate-200' : 'text-slate-500 italic'}>
                      {bh.is_open ? `${bh.start_time.slice(0, 5)} - ${bh.end_time.slice(0, 5)}` : 'Closed'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Col 4: Quick Links & Staff Access (2 cols) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Navigation
            </h4>

            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="#services-section" className="hover:text-white transition-colors">
                  Dental Services
                </a>
              </li>
              <li>
                <a href="#about-section" className="hover:text-white transition-colors">
                  About Our Studio
                </a>
              </li>
              <li>
                <a href="#doctors-section" className="hover:text-white transition-colors">
                  Dental Clinicians
                </a>
              </li>
              <li>
                <a href="#testimonials-section" className="hover:text-white transition-colors">
                  Patient Reviews
                </a>
              </li>
              <li className="pt-2">
                <button
                  onClick={onAdminClick}
                  id="footer-staff-login-btn"
                  className="flex items-center gap-1.5 text-slate-300 hover:text-teal-400 font-semibold cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <span>Admin / Staff Portal</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright & back to top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} {clinicSettings.clinic_name}. All clinical rights reserved.</p>
          <div className="flex items-center space-x-6">
            <span className="text-slate-500">HIPAA Compliant Practice</span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 text-slate-400 hover:text-white cursor-pointer"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
