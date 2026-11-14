import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  GraduationCap,
  Languages,
  MapPin,
  Stethoscope,
} from 'lucide-react';
import { AppointmentBookingSection } from '../components/AppointmentBookingSection';
import { fetchDoctorBySlug } from '../lib/api';
import type { Department, Doctor } from '../types/hospital';

interface DoctorDetailPageProps {
  slug: string;
  departments: Department[];
  doctors: Doctor[];
  onBack: () => void;
  onViewPortal: () => void;
}

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function DoctorDetailPage({
  slug,
  departments,
  doctors,
  onBack,
  onViewPortal,
}: DoctorDetailPageProps) {
  const cached = doctors.find((d) => d.slug === slug) ?? null;
  const [doctor, setDoctor] = useState<Doctor | null>(cached);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchDoctorBySlug(slug)
      .then((data) => {
        if (!cancelled) setDoctor(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Doctor profile could not be loaded.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading && !doctor) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="h-72 bg-white border border-slate-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center space-y-4">
        <p className="text-lg font-display font-bold text-slate-900">
          {error || 'Doctor profile not found'}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-sm font-semibold text-white bg-[#0F4C81] rounded-lg cursor-pointer"
        >
          Back to Doctors Directory
        </button>
      </div>
    );
  }

  const initials = doctor.fullName
    .replace(/^Dr\.\s*/i, '')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-[#f8fafc] py-10 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-[#0F4C81] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Doctors Directory</span>
        </button>

        {/* Doctor Profile Header */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4">
            <div className="aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              {doctor.imageUrl && !imgFailed ? (
                <img
                  src={doctor.imageUrl}
                  alt={`${doctor.fullName}, ${doctor.title}`}
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-24 h-24 rounded-full bg-[#0F4C81] text-white flex items-center justify-center font-display text-3xl font-bold mb-3">
                    {initials}
                  </div>
                  <Stethoscope className="w-6 h-6 text-[#0F4C81]/70" />
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div>
              <div className="text-xs font-semibold text-[#0F4C81] mb-2">
                <span>{doctor.departmentName}</span>
                <span aria-hidden="true" className="mx-1.5 text-slate-400">
                  ·
                </span>
                <span>{doctor.acceptingNewPatients ? 'Accepting New Patients' : 'Referral Only'}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900">
                {doctor.fullName}, {doctor.credentials}
              </h1>
              <p className="text-base sm:text-lg text-slate-600 mt-1">{doctor.title}</p>
            </div>

            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              {doctor.bio}
            </p>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-sm">
              <div className="flex items-start gap-2.5">
                <Stethoscope className="w-4 h-4 text-[#0F4C81] mt-1 shrink-0" />
                <div>
                  <dt className="text-xs text-slate-500">Clinical Specialization</dt>
                  <dd className="font-semibold text-slate-900 mt-0.5">
                    {doctor.specialization}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <GraduationCap className="w-4 h-4 text-[#0F4C81] mt-1 shrink-0" />
                <div>
                  <dt className="text-xs text-slate-500">Education &amp; Training</dt>
                  <dd className="font-semibold text-slate-900 mt-0.5">
                    {doctor.education}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Languages className="w-4 h-4 text-[#0F4C81] mt-1 shrink-0" />
                <div>
                  <dt className="text-xs text-slate-500">Languages &amp; Experience</dt>
                  <dd className="font-semibold text-slate-900 mt-0.5 tabular-nums">
                    {doctor.languages} · {doctor.experienceYears} years practice
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#0F4C81] mt-1 shrink-0" />
                <div>
                  <dt className="text-xs text-slate-500">Clinic Wing &amp; Fee</dt>
                  <dd className="font-semibold text-slate-900 mt-0.5 tabular-nums">
                    {doctor.floorLocation} · ${doctor.consultationFee} Consultation
                  </dd>
                </div>
              </div>
            </dl>

            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#0F4C81]" />
                <span>
                  Clinic Days:{' '}
                  <strong className="text-slate-900">
                    {doctor.availableDaysList.map((d) => WEEKDAY_NAMES[d]).join(', ')}
                  </strong>
                </span>
              </div>
              <span className="font-mono text-slate-500 tabular-nums">
                {doctor.npiNumber}
              </span>
            </div>
          </div>
        </section>

        {/* Pre-selected Appointment Booking Section */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-display font-bold text-slate-900">
              Schedule a Visit with {doctor.fullName}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Available clinic dates and live time slots reflect Dr.{' '}
              {doctor.fullName.split(' ').slice(-1)[0]}&apos;s current schedule.
            </p>
          </div>
          <AppointmentBookingSection
            departments={departments}
            doctors={doctors}
            preselectedDepartmentId={doctor.departmentId}
            preselectedDoctorId={doctor.id}
            onViewPortal={onViewPortal}
          />
        </section>
      </div>
    </div>
  );
}
