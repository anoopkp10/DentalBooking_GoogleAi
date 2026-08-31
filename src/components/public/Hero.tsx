import React from 'react';
import { Calendar, ShieldCheck, Sparkles, Star, Clock, CheckCircle2, Award, HeartPulse } from 'lucide-react';
import { CLINIC_IMAGES } from '../../data/imagery';
import { ClinicSettings } from '../../types/database';

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
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-teal-50/20 to-white pt-8 pb-16 lg:pt-14 lg:pb-24">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-cyan-200/25 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline & Value Proposition */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs sm:text-sm font-semibold mb-6 shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
              <span>Modern Gentle Dentistry • Accepting New Patients</span>
            </div>

            {/* Main Display Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12] mb-6">
              World-class dental care in a{' '}
              <span className="bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                calm, modern studio.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed mb-8 max-w-2xl">
              Experience stress-free dentistry designed around your comfort. From routine preventative cleanings to advanced cosmetic smile transformations, our board-certified team delivers precision care using non-invasive technology.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-10">
              <button
                onClick={onBookClick}
                id="hero-book-now-cta"
                className="inline-flex items-center justify-center px-7 py-4 text-base font-bold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 rounded-xl shadow-lg shadow-teal-700/25 hover:shadow-xl hover:shadow-teal-700/35 active:scale-[0.99] transition-all cursor-pointer"
              >
                <Calendar className="w-5 h-5 mr-2.5" />
                Schedule Your Visit Online
              </button>
              <button
                onClick={onExploreServicesClick}
                id="hero-explore-services-cta"
                className="inline-flex items-center justify-center px-6 py-4 text-base font-semibold text-slate-700 hover:text-teal-700 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                View Services & Pricing
              </button>
            </div>

            {/* Trust Badges & Clinical Guarantees */}
            <div className="w-full pt-6 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Zero Pain Focus</p>
                  <p className="text-[11px] text-slate-500">Gentle numbing tech</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-700 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">3D Digital Scans</p>
                  <p className="text-[11px] text-slate-500">No goopy impressions</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 col-span-2 sm:col-span-1">
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Board Certified</p>
                  <p className="text-[11px] text-slate-500">Top 1% Dental Clinicians</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Layered Dental Clinic Visual Composition */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Primary Clinic Photography */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/15 border-4 border-white bg-slate-100 aspect-[4/3] sm:aspect-[14/11]">
                <img
                  src={CLINIC_IMAGES.heroMain}
                  alt="Modern clean dental treatment room with ergonomic chair and medical instruments"
                  className="w-full h-full object-cover object-center transform hover:scale-102 transition-transform duration-700"
                  loading="eager"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent" />
                
                {/* Image caption badge on photo */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <p className="text-xs font-semibold text-white/95 drop-shadow-sm">
                      State-of-the-art sterile treatment suites
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating Card 1: Patient Review Badge */}
              <div className="absolute -top-6 -left-4 sm:-left-8 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl shadow-slate-900/10 border border-slate-100 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex -space-x-2">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                    alt="Patient"
                    className="w-8 h-8 rounded-full border-2 border-white object-cover"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                    alt="Patient"
                    className="w-8 h-8 rounded-full border-2 border-white object-cover"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80"
                    alt="Patient"
                    className="w-8 h-8 rounded-full border-2 border-white object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                    <span className="ml-1.5 text-xs font-bold text-slate-800">4.9 / 5.0</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">Over 1,200+ Happy Smiles</p>
                </div>
              </div>

              {/* Floating Card 2: Consultation / Quick Availability */}
              <div className="absolute -bottom-6 -right-2 sm:-right-6 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl shadow-slate-900/10 border border-slate-100 max-w-[240px]">
                <div className="flex items-center gap-3 mb-1.5">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700">
                    <HeartPulse className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Immediate Slots Open</p>
                    <p className="text-[10px] text-teal-600 font-semibold">Today & Tomorrow</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  Book in under 60 seconds with instant confirmation.
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
