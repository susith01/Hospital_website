import { AlertTriangle, Ambulance, Clock, MapPin, PhoneCall } from 'lucide-react';
import type { AppRoute } from '../components/Navbar';

interface EmergencyPageProps {
  onNavigate: (path: AppRoute) => void;
}

export function EmergencyPage({ onNavigate }: EmergencyPageProps) {
  return (
    <div className="bg-[#f8fafc] py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
        {/* Urgent Emergency Triage Banner */}
        <section className="bg-[#0F4C81] text-white rounded-xl p-6 sm:p-10 space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-200">
            <AlertTriangle className="w-4 h-4 text-amber-300" />
            <span>24/7 Level I Adult &amp; Pediatric Trauma Center</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-3">
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-balance">
                Emergency &amp; Acute Trauma Information
              </h1>
              <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
                If you or someone near you is experiencing chest pain, difficulty
                breathing, sudden weakness, severe bleeding, or head trauma, call
                emergency services immediately or proceed to Ambulance Bay A.
              </p>
            </div>

            <div className="md:col-span-5 bg-slate-900/50 border border-blue-400/30 rounded-xl p-5 space-y-3">
              <p className="text-xs font-semibold text-blue-200">
                Direct Emergency Triage Desk
              </p>
              <p className="text-2xl sm:text-3xl font-mono font-bold tabular-nums">
                911 / (555) 234-9110
              </p>
              <p className="text-xs text-blue-100">
                Ground Level · 450 Meridian Parkway · Dedicated Helipad &amp; Ambulance Bay A
              </p>
            </div>
          </div>
        </section>

        {/* Triage & Arrival Guide */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <Ambulance className="w-6 h-6 text-[#0F4C81]" />
            <h2 className="text-lg font-display font-bold text-slate-900">
              Immediate Emergency Signs
            </h2>
            <ul className="text-sm text-slate-600 space-y-2 leading-relaxed">
              <li>&bull; Chest pressure, radiating arm or jaw pain</li>
              <li>&bull; Sudden facial drooping, slurred speech, or arm weakness</li>
              <li>&bull; Severe shortness of breath or anaphylaxis</li>
              <li>&bull; Uncontrolled bleeding, major burns, or acute fractures</li>
            </ul>
          </article>

          <article className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <Clock className="w-6 h-6 text-[#0F4C81]" />
            <h2 className="text-lg font-display font-bold text-slate-900">
              Rapid Stroke &amp; Cardiac Protocol
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Pre-hospital ECGs transmitted by paramedics activate our Cardiology Catheter
              Lab and Stroke Neurology team before the ambulance arrives—maintaining median
              triage-to-CT times under 14 minutes.
            </p>
          </article>

          <article className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <MapPin className="w-6 h-6 text-[#0F4C81]" />
            <h2 className="text-lg font-display font-bold text-slate-900">
              Walk-In Emergency Entrance
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Enter via Meridian Parkway North Drive directly to Ground Level Emergency
              Reception. Complimentary short-term drop-off parking and wheelchair escort
              assistance are available 24/7.
            </p>
          </article>
        </section>

        {/* Non-Emergency Guidance */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <h2 className="text-xl font-display font-bold text-slate-900">
              Need Same-Week Outpatient Care Instead?
            </h2>
            <p className="text-sm text-slate-600">
              For non-life-threatening fevers, routine follow-ups, or specialist referrals,
              book a scheduled clinic slot online or call our Nurse Advice Line.
            </p>
            <p className="text-xs font-mono text-slate-700 pt-1 inline-flex items-center gap-1.5 tabular-nums">
              <PhoneCall className="w-3.5 h-3.5 text-[#0F4C81]" />
              24/7 Nurse Triage Line: (555) 234-8150
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/appointments')}
            className="px-5 py-3 min-h-[44px] text-sm font-semibold text-white bg-[#0F4C81] hover:bg-[#0c3d68] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Book Outpatient Visit
          </button>
        </section>
      </div>
    </div>
  );
}
