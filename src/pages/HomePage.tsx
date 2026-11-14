import { useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Building2,
  Calendar,
  MapPin,
  Megaphone,
  Phone,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { DoctorCard } from '../components/DoctorCard';
import type { AppRoute } from '../components/Navbar';
import type { Announcement, Department, Doctor } from '../types/hospital';

interface HomePageProps {
  departments: Department[];
  doctors: Doctor[];
  announcements: Announcement[];
  loading: boolean;
  error: string | null;
  onNavigate: (path: AppRoute) => void;
  onSearchDoctors: (query: string, departmentSlug?: string) => void;
  onBookDoctor: (doctor: Doctor) => void;
}

const TESTIMONIALS = [
  {
    name: 'Margaret Alvarez',
    context: 'Cardiology Patient · Structural Heart Clinic',
    quote:
      'From diagnostic echocardiography to my minimally invasive valve procedure with Dr. Reed, every stage was explained clearly. I walked out within 48 hours and returned to daily walks two weeks later.',
  },
  {
    name: 'Daniel Osei',
    context: 'Orthopedic Rehabilitation · Joint Arthroplasty',
    quote:
      'After years of knee pain, Dr. Robert Chen performed robotic-assisted knee replacement and paired me with the outpatient physical therapy team on Level 4. My mobility score doubled in eight weeks.',
  },
  {
    name: 'Hannah Lindstrom',
    context: 'Pediatrics Parent · North Courtyard Clinic',
    quote:
      'Scheduling same-week follow-ups for our son with Dr. Jenkins was effortless. Having pediatric imaging and pharmacy pickup under one roof saved our family hours of travel.',
  },
];

export function HomePage({
  departments,
  doctors,
  announcements,
  loading,
  error,
  onNavigate,
  onSearchDoctors,
  onBookDoctor,
}: HomePageProps) {
  const [searchInput, setSearchInput] = useState('');
  const [selectedDeptSlug, setSelectedDeptSlug] = useState('all');
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [suiteImgFailed, setSuiteImgFailed] = useState(false);

  const featuredDoctors = doctors.filter((d) => d.featured).slice(0, 4);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearchDoctors(searchInput, selectedDeptSlug);
  };

  return (
    <div className="bg-[#f8fafc]">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              <p className="text-xs font-semibold tracking-wide text-[#0F4C81]">
                Accredited Multi-Speciality Academic Hospital · Est. 1968
              </p>

              <h1 className="text-[clamp(2.25rem,4vw,3.5rem)] font-display font-bold tracking-tight text-slate-900 leading-[1.1] text-balance">
                Coordinated Specialist Care Under One Roof
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                St. Mary&apos;s Premier Health brings together board-certified specialists,
                robotic surgical suites, and 24/7 Level I trauma care in a calm,
                patient-centered medical campus.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <button
                  type="button"
                  onClick={() => onNavigate('/appointments')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[46px] text-sm font-semibold text-white bg-[#0F4C81] hover:bg-[#0c3d68] rounded-lg transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book an Appointment</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/about')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] text-sm font-semibold text-slate-700 hover:text-[#0F4C81] transition-colors whitespace-nowrap cursor-pointer"
                >
                  <span>Hospital Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="h-full min-h-[280px] sm:min-h-[360px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                {!heroImgFailed ? (
                  <img
                    src="/src/assets/images/hero_hospital_atrium_1794676530748.jpg"
                    alt="Sunlit glass atrium and clinical courtyard inside St. Mary's Premier Health"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgFailed(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-50 via-slate-100 to-blue-100 flex flex-col items-center justify-center p-8 text-center">
                    <Building2 className="w-12 h-12 text-[#0F4C81] mb-3" />
                    <p className="font-display font-bold text-slate-900">
                      St. Mary&apos;s Premier Health Main Campus
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      450 Meridian Parkway · Open 24/7 for Emergency &amp; Inpatient Care
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4-column hospital metrics strip below hero split */}
          <div className="mt-10 pt-8 border-t border-slate-200 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-2xl sm:text-3xl font-display font-bold text-[#0F4C81] tabular-nums">
                420+
              </p>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Private inpatient &amp; ICU beds
              </p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-display font-bold text-[#0F4C81] tabular-nums">
                6 Institutes
              </p>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Integrated multi-speciality wings
              </p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-display font-bold text-[#0F4C81] tabular-nums">
                24/7
              </p>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Level I trauma &amp; stroke center
              </p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-display font-bold text-[#0F4C81] tabular-nums">
                98.4%
              </p>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Patient-reported care satisfaction (2026)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Doctor Search Bar */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6 relative z-10">
        <form
          onSubmit={handleSearchSubmit}
          className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
        >
          <div className="md:col-span-6">
            <label
              htmlFor="home-doctor-search"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Find a Doctor by Name or Specialization
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="home-doctor-search"
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="e.g. Dr. Evelyn Reed, Cardiology, Knee Surgery..."
                className="w-full min-h-[42px] pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
              />
            </div>
          </div>

          <div className="md:col-span-4">
            <label
              htmlFor="home-dept-filter"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Department
            </label>
            <select
              id="home-dept-filter"
              value={selectedDeptSlug}
              onChange={(e) => setSelectedDeptSlug(e.target.value)}
              className="w-full min-h-[42px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            >
              <option value="all">All Medical Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.slug}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full min-h-[42px] px-4 py-2 text-sm font-semibold text-white bg-[#1D4ED8] hover:bg-[#1e40af] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              Search Doctors
            </button>
          </div>
        </form>
      </section>

      {error && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
          <div
            role="alert"
            className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800"
          >
            {error}
          </div>
        </div>
      )}

      {/* Medical Departments */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 text-balance">
              Clinical Departments &amp; Institutes
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-2xl">
              Specialized multidisciplinary teams collaborating across inpatient, surgical, and
              outpatient clinics.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/departments')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F4C81] hover:text-[#1D4ED8] whitespace-nowrap cursor-pointer"
          >
            <span>All Departments</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-44 bg-white border border-slate-200 rounded-xl p-6 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between hover:border-blue-300 transition-colors"
              >
                <div>
                  <div className="text-xs font-medium text-slate-500 mb-2">
                    <span>{dept.floorLocation}</span>
                    <span aria-hidden="true" className="mx-1.5">
                      ·
                    </span>
                    <span className="tabular-nums">
                      {dept.doctorCount} {dept.doctorCount === 1 ? 'Specialist' : 'Specialists'}
                    </span>
                  </div>
                  <h3 className="text-lg font-display font-bold text-slate-900">
                    {dept.name}
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    {dept.shortDescription}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-500 tabular-nums">
                    {dept.phoneExtension}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSearchDoctors('', dept.slug)}
                    className="text-xs font-semibold text-[#0F4C81] hover:text-[#1D4ED8] inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Explore Specialists</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Featured Doctors */}
      <section className="bg-white border-y border-slate-200 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 text-balance">
                Featured Medical Specialists
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-2xl">
                Board-certified department chairs and surgeons accepting new consultations and
                second-opinion referrals.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/doctors')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F4C81] hover:text-[#1D4ED8] whitespace-nowrap cursor-pointer"
            >
              <span>View Full Directory</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-96 bg-slate-100 border border-slate-200 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredDoctors.map((doctor) => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  onViewProfile={(slug) => onNavigate(`/doctors/${slug}`)}
                  onBookDoctor={onBookDoctor}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Facilities, Services & Patient Outcomes */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          <div className="lg:col-span-6">
            <div className="h-full min-h-[260px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              {!suiteImgFailed ? (
                <img
                  src="/src/assets/images/hospital_clinical_suite_1794676531728.jpg"
                  alt="Hybrid surgical robotics and 3T diagnostic imaging suite at St. Mary's Premier Health"
                  referrerPolicy="no-referrer"
                  onError={() => setSuiteImgFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center p-8 text-center">
                  <ShieldCheck className="w-10 h-10 text-[#0F4C81] mb-2" />
                  <p className="font-display font-bold text-slate-900">
                    Robotic Surgery &amp; 3T Diagnostic Suites
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-center space-y-5">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 text-balance">
              Hospital Facilities &amp; Diagnostic Precision
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Every inpatient and outpatient floor is engineered for rapid diagnostics and quiet
              recovery, integrating robotic surgery with same-day laboratory turnaround.
            </p>

            <ol className="space-y-3.5 text-sm text-slate-700 border-t border-slate-200 pt-5">
              <li>
                <span className="font-display font-semibold text-slate-900">
                  01. Quiet-Coil 3T MRI &amp; Low-Dose CT Center
                </span>
                <p className="text-slate-600 mt-0.5">
                  Same-day outpatient imaging with 4-hour radiologist reporting.
                </p>
              </li>
              <li>
                <span className="font-display font-semibold text-slate-900">
                  02. Hybrid Cardiac &amp; Robotic Surgical Suites
                </span>
                <p className="text-slate-600 mt-0.5">
                  Minimally invasive structural heart, orthopedic, and neurosurgical theatres.
                </p>
              </li>
              <li>
                <span className="font-display font-semibold text-slate-900">
                  03. 24/7 Clinical Pathology &amp; Post-Discharge Pharmacy
                </span>
                <p className="text-slate-600 mt-0.5">
                  Direct bedside medication counseling before you return home.
                </p>
              </li>
            </ol>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate('/services')}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F4C81] hover:text-[#1D4ED8] cursor-pointer"
              >
                <span>Explore All Services &amp; Facilities</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Attributable Patient Testimonials adjacent to Facilities */}
        <div className="pt-6 border-t border-slate-200">
          <h3 className="text-xl font-display font-bold text-slate-900 mb-6">
            Patient Care Stories
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((item) => (
              <blockquote
                key={item.name}
                className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between"
              >
                <p className="text-sm text-slate-700 leading-relaxed">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <footer className="mt-5 pt-4 border-t border-slate-100">
                  <p className="text-sm font-display font-bold text-slate-900">
                    {item.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.context}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Hospital Announcements */}
      <section className="bg-white border-t border-slate-200 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2.5 mb-2">
            <Megaphone className="w-5 h-5 text-[#0F4C81]" />
            <h2 className="text-2xl font-display font-bold text-slate-900">
              Hospital Announcements
            </h2>
          </div>
          <p className="text-sm text-slate-600 mb-8">
            Live clinical notices, community screening schedules, and campus facility updates.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {announcements.map((item) => (
              <article
                key={item.id}
                className={`rounded-xl p-6 border ${
                  item.isUrgent
                    ? 'bg-blue-50/60 border-blue-200'
                    : 'bg-[#f8fafc] border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-xs mb-2">
                  <span className="font-semibold text-[#0F4C81]">
                    {item.isUrgent ? `Priority Notice · ${item.category}` : item.category}
                  </span>
                  <time className="font-mono text-slate-500 tabular-nums">
                    {item.publishedAt}
                  </time>
                </div>
                <h3 className="text-base font-display font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {item.summary}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Appointment & Contact Call to Action */}
      <section className="bg-[#0F4C81] text-white py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-balance">
              Ready to Schedule a Specialist Consultation?
            </h2>
            <p className="text-sm sm:text-base text-blue-100">
              Browse open clinic dates online or contact our patient coordination desk for
              diagnostic referrals and insurance guidance.
            </p>
            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs sm:text-sm text-blue-100">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                450 Meridian Parkway, Medical District
              </span>
              <span className="inline-flex items-center gap-1.5 tabular-nums">
                <Phone className="w-4 h-4" />
                (555) 234-8000
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('/appointments')}
              className="px-6 py-3 min-h-[46px] text-sm font-semibold text-[#0F4C81] bg-white hover:bg-blue-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              Book Appointment
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/contact')}
              className="px-5 py-3 min-h-[46px] text-sm font-semibold text-white border border-blue-300/60 hover:bg-white/10 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              Contact Hospital Desk
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
