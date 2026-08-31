import React, { useState } from 'react';
import { Star, ChevronDown, MessageSquareQuote, ShieldCheck, HelpCircle } from 'lucide-react';
import { CLINIC_IMAGES } from '../../data/imagery';

export const TestimonialsSection: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const reviews = [
    {
      name: "Marcus Sterling",
      treatment: "Laser Teeth Whitening & Cleaning",
      rating: 5,
      date: "3 weeks ago",
      text: "I haven't been to a dentist in almost 4 years due to severe dental anxiety. The team at Lumina completely changed my perspective. The laser whitening was totally painless and the clinic feels like a peaceful luxury lounge.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
    },
    {
      name: "Clara Nguyen",
      treatment: "Clear Aligners Consultation",
      rating: 5,
      date: "1 month ago",
      text: "The 3D intraoral scan took less than two minutes with no messy putty trays! Dr. Hayes showed me the exact digital progression of my teeth straightening right on the screen. Seamless booking process too.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
    },
    {
      name: "Arthur Pendelton",
      treatment: "Biomimetic Filling Restorations",
      rating: 5,
      date: "2 months ago",
      text: "Dr. Vance is a true artist. You literally cannot tell where my natural enamel ends and the restoration begins. Upfront pricing before touching a tooth. Highly recommend to anyone in the metro area.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
    }
  ];

  const faqs = [
    {
      q: "What should I bring to my first appointment?",
      a: "Please bring a valid photo ID and your dental insurance card if you have one. If you have recent dental x-rays from a previous provider, you can email them in advance or let us know."
    },
    {
      q: "Do you accept major dental insurance plans?",
      a: "Yes! We work with most major PPO dental insurances (including Delta Dental, MetLife, Cigna, Aetna, Guardian, and Humana) and handle direct claim filing so you only pay your copay."
    },
    {
      q: "What if I feel anxious about dental procedures?",
      a: "We specialize in anxiety-free dentistry. We offer noise-canceling headphones with music streaming, warm fleece blankets, ceiling entertainment displays, and gentle computerized local anesthesia."
    },
    {
      q: "What is your cancellation and rescheduling policy?",
      a: "We appreciate at least 24 hours advance notice for rescheduling or cancellation so we can open the reserved time slot for other patients."
    }
  ];

  return (
    <section id="testimonials-section" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold tracking-wide uppercase mb-3">
            <MessageSquareQuote className="w-3.5 h-3.5 text-teal-600" />
            Verified Patient Experiences
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Loved by patients across the community.
          </h2>
          <p className="text-base text-slate-600 mt-2">
            Read real stories from patients who transformed their oral health and smile confidence with us.
          </p>
        </div>

        {/* Reviews 3-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-slate-50/70 p-7 rounded-3xl border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                {/* Stars */}
                <div className="flex items-center text-amber-400 mb-4">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                  <span className="text-xs text-slate-400 ml-2 font-medium">{rev.date}</span>
                </div>

                <p className="text-slate-700 text-sm leading-relaxed mb-6 italic">
                  "{rev.text}"
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200/80">
                <img
                  src={rev.avatar}
                  alt={rev.name}
                  className="w-10 h-10 rounded-full object-cover border border-white shadow-xs"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{rev.name}</h4>
                  <p className="text-[11px] text-teal-700 font-semibold">{rev.treatment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div id="faq-section" className="max-w-3xl mx-auto pt-10 border-t border-slate-200">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              <HelpCircle className="w-4 h-4 text-teal-600" />
              Patient Inquiries
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-2xl overflow-hidden transition-colors bg-white"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between font-bold text-slate-900 text-sm sm:text-base hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-teal-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
