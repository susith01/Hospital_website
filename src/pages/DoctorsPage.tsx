import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { DoctorCard } from '../components/DoctorCard';
import type { Department, Doctor } from '../types/hospital';

interface DoctorsPageProps {
  departments: Department[];
  doctors: Doctor[];
  loading: boolean;
  error: string | null;
  initialSearch?: string;
  initialDepartment?: string;
  onViewProfile: (slug: string) => void;
  onBookDoctor: (doctor: Doctor) => void;
}

export function DoctorsPage({
  departments,
  doctors,
  loading,
  error,
  initialSearch = '',
  initialDepartment = 'all',
  onViewProfile,
  onBookDoctor,
}: DoctorsPageProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [departmentFilter, setDepartmentFilter] = useState(initialDepartment);

  const filteredDoctors = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return doctors.filter((doc) => {
      if (departmentFilter !== 'all' && doc.departmentSlug !== departmentFilter) {
        return false;
      }
      if (q) {
        const haystack = [
          doc.fullName,
          doc.specialization,
          doc.title,
          doc.departmentName,
          doc.languages,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [doctors, searchQuery, departmentFilter]);

  return (
    <div className="bg-[#f8fafc] py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <header className="space-y-3 max-w-3xl">
          <p className="text-xs font-semibold text-[#0F4C81]">Medical Staff Directory</p>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 text-balance">
            Find a Specialist Doctor
          </h1>
          <p className="text-base text-slate-600">
            Search by physician name, clinical subspecialty, or department to inspect
            credentials and book an appointment.
          </p>
        </header>

        {/* Search & Department Filter Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-7">
              <label
                htmlFor="doctors-search-input"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Search by Doctor Name or Specialization
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="doctors-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search e.g. Cardiology, Dr. Arthur Chen, Spine..."
                  className="w-full min-h-[42px] pl-9 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search query"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="md:col-span-5">
              <label
                htmlFor="doctors-dept-select"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Filter by Department
              </label>
              <select
                id="doctors-dept-select"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
              >
                <option value="all">All Departments ({doctors.length})</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.slug}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Interactive department segmented filter tabs */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setDepartmentFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                departmentFilter === 'all'
                  ? 'bg-[#0F4C81] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Specialists
            </button>
            {departments.map((dept) => (
              <button
                key={dept.id}
                type="button"
                onClick={() => setDepartmentFilter(dept.slug)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  departmentFilter === dept.slug
                    ? 'bg-[#0F4C81] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {dept.name.split(' & ')[0]}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-96 bg-white border border-slate-200 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-3">
            <p className="text-base font-display font-bold text-slate-900">
              No specialists matched your search criteria
            </p>
            <p className="text-sm text-slate-600">
              Try clearing your search filter or selecting All Departments.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setDepartmentFilter('all');
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0F4C81] rounded-lg cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                onViewProfile={onViewProfile}
                onBookDoctor={onBookDoctor}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
