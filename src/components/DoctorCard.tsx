import { useState } from 'react';
import { Calendar, Stethoscope } from 'lucide-react';
import type { Doctor } from '../types/hospital';

interface DoctorCardProps {
  doctor: Doctor;
  onViewProfile: (slug: string) => void;
  onBookDoctor: (doctor: Doctor) => void;
}

export function DoctorCard({ doctor, onViewProfile, onBookDoctor }: DoctorCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const initials = doctor.fullName
    .replace(/^Dr\.\s*/i, '')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col transition-shadow hover:shadow-md">
      <div className="aspect-[3/4] w-full bg-slate-100 relative overflow-hidden">
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
            <div className="w-20 h-20 rounded-full bg-[#0F4C81] text-white flex items-center justify-center font-display text-2xl font-bold mb-3">
              {initials}
            </div>
            <Stethoscope className="w-5 h-5 text-[#0F4C81]/70 mb-1" />
            <p className="text-xs font-medium text-slate-600">{doctor.departmentName}</p>
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="text-xs font-medium text-[#0F4C81] mb-1.5">
          <span>{doctor.departmentName}</span>
          <span aria-hidden="true" className="mx-1.5 text-slate-400">
            ·
          </span>
          <span className="tabular-nums">{doctor.experienceYears} yrs exp</span>
        </div>

        <h3 className="text-lg font-display font-bold text-slate-900 leading-snug">
          {doctor.fullName}, {doctor.credentials}
        </h3>
        <p className="text-sm text-slate-600 mt-1">{doctor.title}</p>
        <p className="text-xs text-slate-500 mt-2 line-clamp-2">{doctor.specialization}</p>

        <div className="mt-auto pt-5 flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onViewProfile(doctor.slug)}
            className="flex-1 py-2 px-3 min-h-[40px] text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-[#1D4ED8]"
          >
            View Profile
          </button>
          <button
            type="button"
            onClick={() => onBookDoctor(doctor)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 min-h-[40px] text-xs font-semibold text-white bg-[#0F4C81] hover:bg-[#0c3d68] rounded-lg transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-[#1D4ED8]"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Visit</span>
          </button>
        </div>
      </div>
    </article>
  );
}
