import { AppointmentBookingSection } from '../components/AppointmentBookingSection';
import type { Department, Doctor } from '../types/hospital';

interface BookAppointmentPageProps {
  departments: Department[];
  doctors: Doctor[];
  preselectedDepartmentId?: number | null;
  preselectedDoctorId?: number | null;
  onViewPortal: () => void;
}

export function BookAppointmentPage({
  departments,
  doctors,
  preselectedDepartmentId = null,
  preselectedDoctorId = null,
  onViewPortal,
}: BookAppointmentPageProps) {
  return (
    <div className="bg-[#f8fafc] py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <header className="space-y-3 max-w-3xl">
          <p className="text-xs font-semibold text-[#0F4C81]">
            Outpatient Scheduling
          </p>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 text-balance">
            Book a Hospital Appointment
          </h1>
          <p className="text-base text-slate-600">
            Select your medical department and physician to inspect real-time clinic
            availability and receive an instant booking confirmation.
          </p>
        </header>

        <AppointmentBookingSection
          departments={departments}
          doctors={doctors}
          preselectedDepartmentId={preselectedDepartmentId}
          preselectedDoctorId={preselectedDoctorId}
          onViewPortal={onViewPortal}
        />
      </div>
    </div>
  );
}
