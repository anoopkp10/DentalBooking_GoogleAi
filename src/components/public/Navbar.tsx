import React, { useState, useEffect } from 'react';
import { Sparkles, Phone, Clock, Calendar, ShieldCheck, UserCheck, Menu, X, ChevronRight } from 'lucide-react';
import { ClinicSettings } from '../../types/database';

interface NavbarProps {
  clinicSettings: ClinicSettings;
  onBookClick: () => void;
  onAdminClick: () => void;
  isAdminLoggedIn?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  clinicSettings,
  onBookClick,
  onAdminClick,
  isAdminLoggedIn = false,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* Top micro-bar for clinical trust and quick contact */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-teal-400 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-teal-400 animate-pulse mr-1.5" />
              Accepting New Patients This Month
            </span>
            <span className="hidden md:inline-flex items-center text-slate-400">
              <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Mon–Fri: 8:30 AM – 6:00 PM • Sat: 9:00 AM – 2:30 PM
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <a
              href={`tel:${clinicSettings.clinic_phone.replace(/\D/g, '')}`}
              className="flex items-center text-slate-200 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 mr-1.5 text-teal-400" />
              <span className="font-semibold">{clinicSettings.clinic_phone}</span>
            </a>
            <button
              onClick={onAdminClick}
              id="staff-portal-top-btn"
              className="hidden sm:inline-flex items-center text-slate-400 hover:text-teal-300 transition-colors text-xs font-medium pl-3 border-l border-slate-700"
            >
              {isAdminLoggedIn ? (
                <span className="flex items-center text-emerald-400">
                  <UserCheck className="w-3.5 h-3.5 mr-1" />
                  Admin Portal
                </span>
              ) : (
                <span className="flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  Staff Login
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <nav
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm shadow-slate-900/5 py-3.5 border-b border-slate-200/80'
            : 'bg-white py-4 border-b border-slate-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center space-x-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-cyan-700 flex items-center justify-center text-white shadow-md shadow-teal-700/20 group-hover:scale-105 transition-transform duration-200">
              {/* Dental Tooth / Sparkle clean geometry icon */}
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8.5 2 6 4.5 6 8c0 3.5 1.5 6.5 2 10 .3 2.1 1.7 3.5 3.5 3.5s2.2-.9 2.5-2.5c.3-1.6.7-3 1.5-4.5.8 1.5 1.2 2.9 1.5 4.5.3 1.6.7 2.5 2.5 2.5s3.2-1.4 3.5-3.5c.5-3.5 2-6.5 2-10 0-3.5-2.5-6-6-6-1.5 0-3 1-4 2-1-1-2.5-2-4-2z" />
              </svg>
            </div>
            <div>
              <span className="font-display font-extrabold text-xl tracking-tight text-slate-900 flex items-center gap-1.5">
                Lumina <span className="text-teal-600 font-semibold text-lg">Dental</span>
              </span>
              <p className="text-[11px] tracking-wide text-slate-500 uppercase font-medium">
                Modern Care & Aesthetics
              </p>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-7 text-sm font-semibold text-slate-600">
            <button
              onClick={() => scrollToSection('services-section')}
              className="hover:text-teal-600 transition-colors cursor-pointer py-1"
            >
              Services & Pricing
            </button>
            <button
              onClick={() => scrollToSection('about-section')}
              className="hover:text-teal-600 transition-colors cursor-pointer py-1"
            >
              Why Lumina
            </button>
            <button
              onClick={() => scrollToSection('doctors-section')}
              className="hover:text-teal-600 transition-colors cursor-pointer py-1"
            >
              Our Specialists
            </button>
            <button
              onClick={() => scrollToSection('testimonials-section')}
              className="hover:text-teal-600 transition-colors cursor-pointer py-1"
            >
              Patient Stories
            </button>
            <button
              onClick={() => scrollToSection('faq-section')}
              className="hover:text-teal-600 transition-colors cursor-pointer py-1"
            >
              FAQ
            </button>
          </div>

          {/* Right Action Button */}
          <div className="hidden sm:flex items-center space-x-3">
            <button
              onClick={onBookClick}
              id="nav-book-appointment-btn"
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 rounded-xl shadow-sm shadow-teal-600/30 hover:shadow-md hover:shadow-teal-600/40 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book Appointment
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center space-x-2 lg:hidden">
            <button
              onClick={onBookClick}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 rounded-lg sm:hidden cursor-pointer"
            >
              Book Now
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden px-4 pt-3 pb-6 bg-white border-b border-slate-200 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col space-y-3 font-medium text-slate-700">
              <button
                onClick={() => scrollToSection('services-section')}
                className="flex items-center justify-between py-2 text-left hover:text-teal-600 border-b border-slate-100"
              >
                <span>Services & Pricing</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                onClick={() => scrollToSection('about-section')}
                className="flex items-center justify-between py-2 text-left hover:text-teal-600 border-b border-slate-100"
              >
                <span>Why Lumina</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                onClick={() => scrollToSection('doctors-section')}
                className="flex items-center justify-between py-2 text-left hover:text-teal-600 border-b border-slate-100"
              >
                <span>Our Specialists</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                onClick={() => scrollToSection('testimonials-section')}
                className="flex items-center justify-between py-2 text-left hover:text-teal-600 border-b border-slate-100"
              >
                <span>Patient Reviews</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                onClick={() => scrollToSection('faq-section')}
                className="flex items-center justify-between py-2 text-left hover:text-teal-600 border-b border-slate-100"
              >
                <span>Frequently Asked Questions</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              
              <div className="pt-2 flex flex-col space-y-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onBookClick();
                  }}
                  className="w-full py-3 text-center text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl"
                >
                  Schedule Your Visit Online
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onAdminClick();
                  }}
                  className="w-full py-2.5 text-center text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  {isAdminLoggedIn ? 'Open Admin Portal' : 'Staff Login'}
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
