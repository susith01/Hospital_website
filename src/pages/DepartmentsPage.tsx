import { ArrowRight, Calendar, MapPin, Phone } from 'lucide-react';
import type { Department } from '../types/hospital';

interface DepartmentsPageProps {
  departments: Department[];
  loading: boolean;
  error: string | null;
  onViewDoctors: (departmentSlug: string) => void;
  onBookDepartment: (departmentId: number) => void;
}

export function DepartmentsPage({
  departments,
  loading,
  error,
  onViewDoctors,
  onBookDepartment,
}: DepartmentsPageProps) {
  return (
    <div className="bg-[#f8fafc] py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        <header className="space-y-3 max-w-3xl">
          <p className="text-xs font-semibold text-[#0F4C81]">Clinical Departments</p>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 text-balance">
            Specialized Medical &amp; Surgical Institutes
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            Each department operates dedicated inpatient suites, outpatient consultation
            clinics, and subspecialty diagnostic teams.
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-64 bg-white border border-slate-200 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {departments.map((dept) => (
              <article
                key={dept.id}
                className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 flex flex-col justify-between space-y-6"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1 font-medium text-[#0F4C81]">
                      <MapPin className="w-3.5 h-3.5" />
                      {dept.floorLocation}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                      <Phone className="w-3.5 h-3.5" />
                      {dept.phoneExtension}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">
                      {dept.doctorCount} {dept.doctorCount === 1 ? 'Specialist' : 'Specialists'}
                    </span>
                  </div>

                  <h2 className="text-xl font-display font-bold text-slate-900">
                    {dept.name}
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {dept.overview}
                  </p>

                  <div className="pt-2">
                    <h3 className="text-xs font-semibold text-slate-800 mb-2">
                      Key Clinical Programs
                    </h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600">
                      {dept.services.map((service) => (
                        <li key={service} className="flex items-start gap-2">
                          <span className="text-[#1D4ED8] font-bold" aria-hidden="true">
                            &bull;
                          </span>
                          <span>{service}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onBookDepartment(dept.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] text-xs font-semibold text-white bg-[#0F4C81] hover:bg-[#0c3d68] rounded-lg transition-colors cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book in Department</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onViewDoctors(dept.slug)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <span>View Specialists</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
