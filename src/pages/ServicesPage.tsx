import { useState } from 'react';
import { Activity, Building2, FlaskConical, HeartPulse, Pill, ScanLine } from 'lucide-react';
import type { AppRoute } from '../components/Navbar';

interface ServicesPageProps {
  onNavigate: (path: AppRoute) => void;
}

const SERVICES = [
  {
    icon: ScanLine,
    title: '3T Quiet-Coil MRI & Diagnostic Radiology',
    location: 'East Pavilion · Level 1',
    hours: 'Mon–Sat · 06:30 AM – 09:00 PM',
    description:
      'Wide-bore 3T MRI, 256-slice low-dose cardiac CT, digital mammography, and musculoskeletal ultrasound with same-day radiologist reporting.',
  },
  {
    icon: HeartPulse,
    title: 'Hybrid Cardiac Catheterization & Robotics Suites',
    location: 'East Pavilion · Level 3',
    hours: '24/7 Surgical Readiness',
    description:
      'Twelve laminar-airflow operating rooms equipped for transcatheter valve repair, robotic joint arthroplasty, and intraoperative neuro-navigation.',
  },
  {
    icon: FlaskConical,
    title: 'Clinical Pathology & Genomic Lab',
    location: 'West Tower · Level 1',
    hours: 'Open 24/7 (Outpatient Draw 06:00 AM – 06:00 PM)',
    description:
      'Automated hematology, microbiology, molecular oncology assays, and rapid troponin/stroke biomarkers with direct portal results.',
  },
  {
    icon: Activity,
    title: 'Outpatient Rehabilitation & Sports Therapy',
    location: 'South Pavilion · Level 4',
    hours: 'Mon–Fri · 07:00 AM – 07:00 PM',
    description:
      'Hydrotherapy pools, gait-analysis treadmills, post-stroke neuro-rehabilitation, and certified orthopedic physical therapists.',
  },
  {
    icon: Pill,
    title: '24/7 Outpatient & Discharge Pharmacy',
    location: 'Ground Level · Main Atrium',
    hours: 'Open 24 Hours Daily',
    description:
      'Full clinical compounding, specialty biologics, and bedside discharge medication delivery before patients leave the inpatient ward.',
  },
  {
    icon: Building2,
    title: 'Private Inpatient Suites & Level III NICU',
    location: 'North Courtyard · Levels 2–6',
    hours: 'Visiting Hours · 08:00 AM – 08:00 PM',
    description:
      'Single-occupancy acoustic recovery suites with dedicated family lounges, negative-pressure isolation bays, and neonatal family rooms.',
  },
];

export function ServicesPage({ onNavigate }: ServicesPageProps) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="bg-[#f8fafc] py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        <header className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center space-y-4">
            <p className="text-xs font-semibold text-[#0F4C81]">
              Services &amp; Facilities
            </p>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 text-balance">
              Diagnostic &amp; Surgical Infrastructure Built for Recovery
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              Every diagnostic scanner, laboratory analyzer, and surgical suite is
              centrally linked to your unified patient record so specialists review results
              without delay.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate('/appointments')}
                className="px-5 py-2.5 min-h-[44px] text-sm font-semibold text-white bg-[#0F4C81] hover:bg-[#0c3d68] rounded-lg transition-colors cursor-pointer"
              >
                Schedule a Consultation
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="h-full min-h-[260px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              {!imgFailed ? (
                <img
                  src="/src/assets/images/hospital_clinical_suite_1794676531728.jpg"
                  alt="Diagnostic imaging and surgical robotics suite"
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center p-8 text-slate-500 text-sm">
                  Clinical Diagnostics &amp; Robotics Suite
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <article
                key={service.title}
                className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#0F4C81] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-display font-bold text-slate-900">
                    {service.title}
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                  <p className="font-medium text-slate-800">{service.location}</p>
                  <p className="tabular-nums">{service.hours}</p>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
}
