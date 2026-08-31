import React, { useState, useMemo } from 'react';
import { Clock, DollarSign, ArrowRight, Sparkles, CheckCircle2, ShieldCheck, HeartPulse } from 'lucide-react';
import { DentalService } from '../../types/database';
import { CLINIC_IMAGES } from '../../data/imagery';

interface ServicesSectionProps {
  services: DentalService[];
  isLoading: boolean;
  onSelectService: (service: DentalService) => void;
}

// Fallback images matching dental treatments if a custom service is added without an image
const getServiceFallbackImage = (name: string, category?: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes('cleaning') || lower.includes('hygiene') || lower.includes('scaling')) {
    return CLINIC_IMAGES.services.cleaning;
  }
  if (lower.includes('white') || lower.includes('bleach') || lower.includes('cosmetic')) {
    return CLINIC_IMAGES.services.whitening;
  }
  if (lower.includes('filling') || lower.includes('cavity') || lower.includes('restoration') || lower.includes('crown')) {
    return CLINIC_IMAGES.services.filling;
  }
  if (lower.includes('align') || lower.includes('invisalign') || lower.includes('ortho') || lower.includes('brace')) {
    return CLINIC_IMAGES.services.aligners;
  }
  if (lower.includes('emergency') || lower.includes('urgent') || lower.includes('pain')) {
    return CLINIC_IMAGES.services.emergency;
  }
  return CLINIC_IMAGES.services.checkup;
};

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  isLoading,
  onSelectService,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Filter only active services for public website
  const activeServices = useMemo(() => {
    return services.filter((s) => s.is_active);
  }, [services]);

  // Distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    activeServices.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return ['all', ...Array.from(set)];
  }, [activeServices]);

  const filteredServices = useMemo(() => {
    if (selectedFilter === 'all') return activeServices;
    return activeServices.filter((s) => s.category === selectedFilter);
  }, [activeServices, selectedFilter]);

  return (
    <section id="services-section" className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold tracking-wide uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              Comprehensive Dental Treatments
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Gentle, precision dental services tailored to you.
            </h2>
            <p className="text-base sm:text-lg text-slate-600 mt-2 max-w-2xl">
              Transparent upfront pricing, zero hidden fees, and treatment plans crafted using 3D digital diagnosis.
            </p>
          </div>

          {/* Category Filter Pills (if categories available) */}
          {categories.length > 2 && (
            <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                    selectedFilter === cat
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat === 'all' ? 'All Treatments' : cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Services Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-600 font-medium">No dental services available in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service) => {
              const imageSrc = service.image_url || getServiceFallbackImage(service.name, service.category);

              return (
                <div
                  key={service.id}
                  id={`service-card-${service.id}`}
                  className="group relative flex flex-col justify-between bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:shadow-teal-950/5 hover:border-teal-300/80 transition-all duration-300"
                >
                  {/* Service Photography Header */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                    <img
                      src={imageSrc}
                      alt={service.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    
                    {/* Category pill on image */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-[11px] font-bold text-slate-800 shadow-xs">
                        {service.category || 'Dental Care'}
                      </span>
                    </div>

                    {/* Price tag on image */}
                    <div className="absolute bottom-3 right-3 bg-teal-600/95 backdrop-blur-md text-white px-3 py-1 rounded-xl text-sm font-extrabold shadow-sm">
                      ${Number(service.price).toFixed(0)}
                    </div>
                  </div>

                  {/* Service Details Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 mb-2">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{service.duration_minutes} minutes appointment</span>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-snug group-hover:text-teal-700 transition-colors mb-2.5">
                        {service.name}
                      </h3>

                      <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed mb-6">
                        {service.description}
                      </p>
                    </div>

                    {/* Bottom CTA to book */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400 block font-medium">Standard Investment</span>
                        <span className="text-lg font-extrabold text-slate-900">${Number(service.price).toFixed(0)}</span>
                      </div>

                      <button
                        onClick={() => onSelectService(service)}
                        id={`btn-select-service-${service.id}`}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-600 hover:text-white rounded-xl transition-all cursor-pointer group-hover:bg-teal-600 group-hover:text-white"
                      >
                        <span>Book Visit</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Clinical Assurance Strip */}
        <div className="mt-16 bg-slate-50 border border-slate-200/80 rounded-3xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-700">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-teal-100 text-teal-800 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Hospital-Grade Sterilization</h4>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Autoclave tracking and medical air purification in every treatment suite.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-cyan-100 text-cyan-800 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Insurance & Direct Billing</h4>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                We accept most major dental PPO plans and file claims directly on your behalf.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Anxiety-Free Dentistry</h4>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Noise-cancelling headphones, warm blankets, and gentle numbing options.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
