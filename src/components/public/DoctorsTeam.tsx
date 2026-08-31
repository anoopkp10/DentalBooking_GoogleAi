import React from 'react';
import { Award, GraduationCap, Sparkles, Star } from 'lucide-react';
import { CLINIC_IMAGES } from '../../data/imagery';

export const DoctorsTeam: React.FC = () => {
  const doctors = [
    {
      name: "Dr. Elena Vance, DDS, FAGD",
      role: "Lead Cosmetic & Restorative Dentist",
      degrees: "Columbia University College of Dental Medicine",
      experience: "14+ Years Clinical Practice",
      image: CLINIC_IMAGES.doctorPortrait,
      bio: "Fellow of the Academy of General Dentistry specializing in biomimetic composite bonding, ceramic smile design, and gentle preventive care."
    },
    {
      name: "Dr. Marcus Hayes, DMD, MS",
      role: "Orthodontics & 3D Aligner Specialist",
      degrees: "UCSF School of Dentistry",
      experience: "11+ Years Clinical Practice",
      image: CLINIC_IMAGES.doctorAssociate,
      bio: "Board-certified orthodontic specialist with over 2,000 completed clear aligner treatments focusing on airway-friendly bite alignment and aesthetic harmony."
    }
  ];

  return (
    <section id="doctors-section" className="py-20 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 text-cyan-900 text-xs font-bold tracking-wide uppercase mb-3">
            <GraduationCap className="w-3.5 h-3.5 text-cyan-700" />
            Clinical Leadership
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Meet your dedicated dental clinicians.
          </h2>
          <p className="text-base text-slate-600 mt-3">
            Our clinicians combine rigorous academic background, continuous training in advanced techniques, and a compassionate bedside manner.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {doctors.map((doc, idx) => (
            <div
              key={idx}
              className="bg-slate-50/70 rounded-3xl p-6 sm:p-8 border border-slate-200/80 flex flex-col sm:flex-row items-center sm:items-start gap-6 hover:shadow-lg hover:border-teal-300 transition-all duration-300"
            >
              {/* Doctor Portrait */}
              <div className="w-36 h-44 sm:w-40 sm:h-52 rounded-2xl overflow-hidden shrink-0 border-2 border-white shadow-md bg-slate-200">
                <img
                  src={doc.image}
                  alt={doc.name}
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Bio Details */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-500 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-1">5.0 Star Doctor</span>
                </div>

                <h3 className="text-xl font-bold text-slate-900">{doc.name}</h3>
                <p className="text-xs font-semibold text-teal-700 uppercase tracking-wider mb-3">
                  {doc.role}
                </p>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  {doc.bio}
                </p>

                <div className="pt-3 border-t border-slate-200/80 text-[11px] text-slate-500 space-y-1">
                  <p className="flex items-center justify-center sm:justify-start gap-1.5 font-medium">
                    <GraduationCap className="w-3.5 h-3.5 text-teal-600" />
                    {doc.degrees}
                  </p>
                  <p className="flex items-center justify-center sm:justify-start gap-1.5 font-medium">
                    <Award className="w-3.5 h-3.5 text-cyan-600" />
                    {doc.experience}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
