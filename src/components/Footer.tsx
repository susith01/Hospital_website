import { MapPin, Phone, Clock } from 'lucide-react';
import type { AppRoute } from './Navbar';

interface FooterProps {
  onNavigate: (path: AppRoute) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-4">
            <p className="text-lg font-display font-bold text-white tracking-tight">
              St. Mary&apos;s Premier Health
            </p>
            <p className="text-sm text-slate-400 leading-relaxed">
              Academic multi-speciality medical center providing quaternary surgical care,
              diagnostic imaging, and family medicine.
            </p>
            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <span>450 Meridian Parkway, Medical District, Suite 100</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="tabular-nums">Main Reception: (555) 234-8000</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Emergency &amp; Trauma: Open 24/7</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-display font-semibold text-white mb-4">
              Clinical Care
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/departments')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Medical Departments
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/doctors')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Find a Doctor
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/services')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Services &amp; Facilities
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/appointments')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Book an Appointment
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-display font-semibold text-white mb-4">
              Hospital &amp; Visitors
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/about')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  About Us &amp; Hospital Profile
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/emergency')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Emergency Information
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/contact')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Contact &amp; Directions
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/portal')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Patient Login &amp; Portal
                </button>
              </li>
            </ul>
          </div>

          <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-display font-semibold text-white">
              24/7 Emergency Triage
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              For life-threatening symptoms, chest pain, or acute trauma, dial 911 or call our
              direct Ambulance Bay A triage desk immediately.
            </p>
            <p className="text-lg font-mono font-semibold text-white tabular-nums">
              (555) 234-9110
            </p>
            <button
              type="button"
              onClick={() => onNavigate('/emergency')}
              className="inline-flex items-center text-xs font-semibold text-blue-300 hover:text-white transition-colors cursor-pointer"
            >
              View Emergency Protocols &rarr;
            </button>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
          <p>&copy; 2026 St. Mary&apos;s Premier Health. Accredited Level I Trauma &amp; Multi-Speciality Center.</p>
          <p>Visiting Hours: Daily 08:00 AM &ndash; 08:00 PM · Outpatient Clinics: Mon &ndash; Sat</p>
        </div>
      </div>
    </footer>
  );
}
