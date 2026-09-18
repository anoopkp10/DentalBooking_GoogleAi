import React from 'react';
import { Calendar, ShieldCheck, Sparkles, Star, Award, HeartPulse } from 'lucide-react';
import { ClinicSettings } from '../../types/database';

const HERO_BG_IMAGE =
  'https://images.pexels.com/photos/5355920/pexels-photo-5355920.jpeg?auto=compress&cs=tinysrgb&w=1920';

interface HeroProps {
  clinicSettings: ClinicSettings;
  onBookClick: () => void;
  onExploreServicesClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  clinicSettings,
  onBookClick,
  onExploreServicesClick,
}) => {
  return (
    <section className="relative min-h-[640px] lg:min-h-[760px] flex items-center overflow-hidden">
      {/* Full-width background image */}
      <img
        src={HERO_BG_IMAGE}
        alt="Modern clean dental treatment room with ergonomic chair and medical instruments"
        className="absolute inset-0 w-full h-full object-cover object-center"
        loading="eager"
        referrerPolicy="no-referrer"
      />

      {/* Lightened gradient overlay for a brighter hero */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/55 via-slate-900/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/45 via-transparent to-slate-900/10" />
      {/* Soft white scrim behind the text block for black-text readability */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full lg:w-3/5 h-full bg-white/15 backdrop-blur-[2px]" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 w-full">
        <div className="max-w-2xl">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-semibold mb-6 shadow-xs">
            <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
            <span>Modern Gentle Dentistry • Accepting New Patients</span>
          </div>

          {/* Main Display Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12] mb-6">
            World-class dental care in a{' '}
            <span style={{ color: '#D2B48C' }}>
              calm, modern studio.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-white font-medium leading-relaxed mb-8 max-w-xl drop-shadow-sm">
            Experience stress-free dentistry designed around your comfort. From routine preventative
            cleanings to advanced cosmetic smile transformations, our board-certified team delivers
            precision care using non-invasive technology.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-10">
            <button
              onClick={onBookClick}
              id="hero-book-now-cta"
              className="inline-flex items-center justify-center px-7 py-4 text-base font-bold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 rounded-xl shadow-lg shadow-teal-900/40 hover:shadow-xl hover:shadow-teal-700/50 active:scale-[0.99] transition-all cursor-pointer"
            >
              <Calendar className="w-5 h-5 mr-2.5" />
              Schedule Your Visit Online
            </button>
            <button
              onClick={onExploreServicesClick}
              id="hero-explore-services-cta"
              className="inline-flex items-center justify-center px-6 py-4 text-base font-semibold text-white hover:text-teal-200 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 rounded-xl transition-colors cursor-pointer"
            >
              View Services & Pricing
            </button>
          </div>

          {/* Trust Badges & Clinical Guarantees */}
          <div className="w-full pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-teal-300 shrink-0 border border-white/15">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Zero Pain Focus</p>
                <p className="text-[11px] text-slate-300">Gentle numbing tech</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-cyan-300 shrink-0 border border-white/15">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">3D Digital Scans</p>
                <p className="text-[11px] text-slate-300">No goopy impressions</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 col-span-2 sm:col-span-1">
              <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-300 shrink-0 border border-white/15">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Board Certified</p>
                <p className="text-[11px] text-slate-300">Top 1% Dental Clinicians</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
