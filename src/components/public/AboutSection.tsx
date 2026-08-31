import React from 'react';
import { CheckCircle, Sparkles, Shield, Cpu, Heart, Users } from 'lucide-react';
import { CLINIC_IMAGES } from '../../data/imagery';

export const AboutSection: React.FC = () => {
  const values = [
    {
      icon: Cpu,
      title: "Guided Digital Precision",
      description: "Low-radiation 3D cone-beam tomography and optical intraoral scanners ensure zero guesswork and painless treatments."
    },
    {
      icon: Heart,
      title: "Patient-Centered Comfort",
      description: "No judgment, no rushed appointments. We take the time to listen, explain every step, and respect your pace."
    },
    {
      icon: Shield,
      title: "Minimally Invasive Philosophy",
      description: "We preserve healthy tooth structure wherever possible using biomimetic dental materials and preventative therapies."
    },
    {
      icon: Users,
      title: "Collaborative Specialist Team",
      description: "General dentistry, restorative specialists, and orthodontic consultants working together under one roof."
    }
  ];

  return (
    <section id="about-section" className="py-20 bg-slate-50 relative overflow-hidden">
      {/* Background soft blob */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-teal-100/50 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid: Story & Imagery */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-16">
          
          {/* Left: Layered Photography */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              
              {/* Primary Consultation Image */}
              <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-slate-200 aspect-[4/3]">
                <img
                  src={CLINIC_IMAGES.heroConsultation}
                  alt="Doctor consulting with patient in a calm, modern treatment room"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Secondary Overlapping Image (Dental Equipment / Clean Room) */}
              <div className="hidden sm:block absolute -bottom-8 -right-6 w-3/5 rounded-2xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] bg-slate-100">
                <img
                  src={CLINIC_IMAGES.tech3DScan}
                  alt="Doctor reviewing digital 3D dental diagnostics"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Experience badge */}
              <div className="absolute top-6 -left-4 bg-teal-800 text-white p-4 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black font-display">15+</span>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-teal-200">Years Serving<br/>The Community</span>
              </div>

            </div>
          </div>

          {/* Right: Narrative & Philosophy */}
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-900 text-xs font-bold tracking-wide uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5 text-teal-700" />
              The Lumina Difference
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
              Reinventing the dental visit from an obligation into a comfortable retreat.
            </h2>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-6">
              For too long, dental visits have been associated with cold clinical environments, anxiety, and unpredictable bills. At Lumina, we designed our entire clinic around clinical excellence, human empathy, and total transparency.
            </p>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8">
              From our ergonomic chairs with soothing ceiling monitors to our quiet electric handpieces that eliminate the high-pitched dental whine, every detail is engineered to put you entirely at ease.
            </p>

            <div className="space-y-3.5">
              {[
                "100% digital impressions (no messy trays)",
                "Private consultation rooms with full treatment price transparency",
                "Advanced biocompatible and tooth-conserving restorations",
                "Complimentary parking and seamless contactless check-in"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{item}</span>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* Bottom Core Values Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-10 border-t border-slate-200/90">
          {values.map((v, idx) => {
            const Icon = v.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{v.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{v.description}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
