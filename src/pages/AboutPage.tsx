import { Award, Building2, HeartHandshake, ShieldCheck } from 'lucide-react';
import type { AppRoute } from '../components/Navbar';

interface AboutPageProps {
  onNavigate: (path: AppRoute) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <div className="bg-[#f8fafc] py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
        <header className="space-y-4">
          <p className="text-xs font-semibold text-[#0F4C81]">
            About Us &amp; Hospital Profile
          </p>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 text-balance">
            Five Decades of Evidence-Driven Multi-Speciality Care
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl">
            Founded in 1968, St. Mary&apos;s Premier Health serves as a regional quaternary
            referral center uniting cardiovascular surgery, neurosciences, pediatrics,
            orthopedics, oncology, and 24/7 emergency trauma services.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <HeartHandshake className="w-6 h-6 text-[#0F4C81]" />
            <h2 className="text-lg font-display font-bold text-slate-900">
              Clinical Mission
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              We deliver transparent, multidisciplinary medical care anchored in shared
              electronic patient records—eliminating fragmented referrals and redundant
              testing across departments.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <Award className="w-6 h-6 text-[#0F4C81]" />
            <h2 className="text-lg font-display font-bold text-slate-900">
              Accreditations &amp; Standards
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Accredited by The Joint Commission with Gold Seal certification, designated
              Level I Adult &amp; Pediatric Trauma Center, and Comprehensive Primary Stroke
              Center.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <Building2 className="w-6 h-6 text-[#0F4C81]" />
            <h2 className="text-lg font-display font-bold text-slate-900">
              Campus Architecture
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Four interconnected clinical wings (East Pavilion, West Tower, North
              Courtyard, and South Pavilion) designed around daylight healing courtyards,
              private recovery rooms, and direct ambulance bay access.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <ShieldCheck className="w-6 h-6 text-[#0F4C81]" />
            <h2 className="text-lg font-display font-bold text-slate-900">
              Patient Safety &amp; Quality Metrics
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Continuous infection-control auditing, 1:2 ICU nurse-to-patient staffing
              ratios, and rapid door-to-balloon cardiac intervention times under 42 minutes.
            </p>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-display font-bold text-slate-900">
              Explore Our Medical Departments &amp; Specialists
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Meet the department chairs leading clinical research and patient care at St.
              Mary&apos;s Premier Health.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('/doctors')}
              className="px-4 py-2.5 min-h-[42px] text-sm font-semibold text-white bg-[#0F4C81] hover:bg-[#0c3d68] rounded-lg transition-colors cursor-pointer"
            >
              Meet Our Doctors
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/contact')}
              className="px-4 py-2.5 min-h-[42px] text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Contact Administration
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
