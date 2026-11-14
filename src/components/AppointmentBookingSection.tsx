import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { CalendarCheck, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchDoctorAvailability, submitAppointment } from '../lib/api';
import {
  getUpcomingAvailableDates,
  validateAppointmentForm,
} from '../lib/validation';
import type {
  AppointmentConfirmation,
  Department,
  Doctor,
} from '../types/hospital';

interface AppointmentBookingSectionProps {
  departments: Department[];
  doctors: Doctor[];
  preselectedDepartmentId?: number | null;
  preselectedDoctorId?: number | null;
  onViewPortal?: () => void;
}

export function AppointmentBookingSection({
  departments,
  doctors,
  preselectedDepartmentId = null,
  preselectedDoctorId = null,
  onViewPortal,
}: AppointmentBookingSectionProps) {
  const { firebaseUser, idToken, patientProfile, refreshPortal } = useAuth();

  const [departmentId, setDepartmentId] = useState<number | ''>(
    preselectedDepartmentId ?? ''
  );
  const [doctorId, setDoctorId] = useState<number | ''>(
    preselectedDoctorId ?? ''
  );
  const [appointmentDate, setAppointmentDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [visitType, setVisitType] = useState('In-Person Consultation');

  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [reasonForVisit, setReasonForVisit] = useState('');

  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [confirmation, setConfirmation] = useState<AppointmentConfirmation | null>(
    null
  );

  // Sync preselected doctor/department if props change
  useEffect(() => {
    if (preselectedDoctorId) {
      const doc = doctors.find((d) => d.id === preselectedDoctorId);
      if (doc) {
        setDepartmentId(doc.departmentId);
        setDoctorId(doc.id);
      }
    } else if (preselectedDepartmentId) {
      setDepartmentId(preselectedDepartmentId);
    }
  }, [preselectedDepartmentId, preselectedDoctorId, doctors]);

  // Autofill authenticated patient profile fields without overriding user edits
  useEffect(() => {
    if (patientProfile) {
      setPatientName((prev) => prev || patientProfile.fullName);
      setPatientEmail((prev) => prev || patientProfile.email);
      setPatientPhone((prev) => prev || patientProfile.phone);
      setDateOfBirth((prev) => prev || patientProfile.dateOfBirth || '');
      setInsuranceProvider(
        (prev) => prev || patientProfile.insuranceProvider || ''
      );
    } else if (firebaseUser) {
      setPatientName((prev) => prev || firebaseUser.displayName || '');
      setPatientEmail((prev) => prev || firebaseUser.email || '');
    }
  }, [patientProfile, firebaseUser]);

  const filteredDoctors = useMemo(() => {
    if (!departmentId) return doctors;
    return doctors.filter((doc) => doc.departmentId === departmentId);
  }, [doctors, departmentId]);

  const selectedDoctor = useMemo(
    () => doctors.find((doc) => doc.id === doctorId) ?? null,
    [doctors, doctorId]
  );

  const availableDates = useMemo(() => {
    if (!selectedDoctor) return [];
    return getUpcomingAvailableDates(selectedDoctor.availableDaysList, 8);
  }, [selectedDoctor]);

  // Select first available date automatically when doctor changes
  useEffect(() => {
    if (!selectedDoctor) {
      setAppointmentDate('');
      setTimeSlot('');
      setBookedSlots([]);
      return;
    }
    const dates = getUpcomingAvailableDates(selectedDoctor.availableDaysList, 8);
    if (dates.length > 0) {
      setAppointmentDate((prev) =>
        dates.some((d) => d.isoDate === prev) ? prev : dates[0].isoDate
      );
    }
    setTimeSlot('');
  }, [selectedDoctor]);

  // Fetch live booked slots whenever doctor + date change
  useEffect(() => {
    if (!selectedDoctor || !appointmentDate) {
      setBookedSlots([]);
      return;
    }

    let cancelled = false;
    setLoadingSlots(true);
    setSlotsError(null);

    fetchDoctorAvailability(selectedDoctor.id, appointmentDate)
      .then((res) => {
        if (!cancelled) {
          setBookedSlots(res.bookedSlots);
          setTimeSlot((prev) => (res.bookedSlots.includes(prev) ? '' : prev));
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setSlotsError(err.message || 'Unable to verify open slots.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingSlots(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedDoctor, appointmentDate]);

  const handleDepartmentChange = (nextDept: string) => {
    const num = nextDept ? Number(nextDept) : '';
    setDepartmentId(num);
    setFieldErrors((prev) => ({ ...prev, departmentId: '' }));
    if (num && selectedDoctor && selectedDoctor.departmentId !== num) {
      setDoctorId('');
      setAppointmentDate('');
      setTimeSlot('');
    }
  };

  const handleDoctorChange = (nextDoc: string) => {
    const num = nextDoc ? Number(nextDoc) : '';
    setDoctorId(num);
    setFieldErrors((prev) => ({ ...prev, doctorId: '' }));
    if (num) {
      const doc = doctors.find((d) => d.id === num);
      if (doc) {
        setDepartmentId(doc.departmentId);
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const errors = validateAppointmentForm({
      departmentId,
      doctorId,
      appointmentDate,
      timeSlot,
      patientName,
      patientEmail,
      patientPhone,
      reasonForVisit,
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);

    try {
      const result = await submitAppointment(
        {
          departmentId: Number(departmentId),
          doctorId: Number(doctorId),
          appointmentDate,
          timeSlot,
          visitType,
          patientName,
          patientEmail,
          patientPhone,
          dateOfBirth: dateOfBirth || undefined,
          insuranceProvider: insuranceProvider || undefined,
          reasonForVisit,
        },
        idToken
      );

      setConfirmation(result);
      if (firebaseUser) {
        await refreshPortal();
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Could not submit your appointment request.');
      if (selectedDoctor && appointmentDate) {
        fetchDoctorAvailability(selectedDoctor.id, appointmentDate)
          .then((res) => setBookedSlots(res.bookedSlots))
          .catch(() => {});
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetBooking = () => {
    setConfirmation(null);
    setTimeSlot('');
    setReasonForVisit('');
    setSubmitError(null);
  };

  if (confirmation) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 max-w-2xl mx-auto"
      >
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-emerald-700">
              Appointment Confirmed
            </p>
            <h3 className="text-2xl font-display font-bold text-slate-900 mt-1">
              Booking Reference {confirmation.confirmationCode}
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Confirmation details have been recorded for {confirmation.patientName} (
              {confirmation.patientEmail}).
            </p>
          </div>
        </div>

        <dl className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs text-slate-500">Department</dt>
            <dd className="font-semibold text-slate-900 mt-0.5">
              {confirmation.departmentName}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Specialist</dt>
            <dd className="font-semibold text-slate-900 mt-0.5">
              {confirmation.doctorName}, {confirmation.doctorCredentials}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Date &amp; Time</dt>
            <dd className="font-mono font-semibold text-slate-900 mt-0.5 tabular-nums">
              {confirmation.appointmentDate} · {confirmation.timeSlot}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Clinic Location</dt>
            <dd className="font-semibold text-slate-900 mt-0.5">
              {confirmation.floorLocation}
            </dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleResetBooking}
            className="px-4 py-2.5 min-h-[42px] text-sm font-semibold text-white bg-[#0F4C81] hover:bg-[#0c3d68] rounded-lg transition-colors cursor-pointer"
          >
            Book Another Appointment
          </button>
          {onViewPortal && (
            <button
              type="button"
              onClick={onViewPortal}
              className="px-4 py-2.5 min-h-[42px] text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              View in Patient Portal
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Column 1: Department, Doctor, Date, and Slot */}
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-display font-bold text-slate-900">
              01. Choose Department &amp; Specialist
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Select a clinical department to view matching specialists and open clinic times.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="booking-department"
                className="block text-sm font-medium text-slate-800 mb-1.5"
              >
                Medical Department
              </label>
              <select
                id="booking-department"
                value={departmentId}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-[#1D4ED8]"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {fieldErrors.departmentId && (
                <p className="text-xs text-red-700 mt-1" role="alert">
                  {fieldErrors.departmentId}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="booking-doctor"
                className="block text-sm font-medium text-slate-800 mb-1.5"
              >
                Specialist Doctor
              </label>
              <select
                id="booking-doctor"
                value={doctorId}
                onChange={(e) => handleDoctorChange(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-[#1D4ED8]"
              >
                <option value="">Select a doctor</option>
                {filteredDoctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.fullName}, {doc.credentials} — {doc.specialization}
                  </option>
                ))}
              </select>
              {fieldErrors.doctorId && (
                <p className="text-xs text-red-700 mt-1" role="alert">
                  {fieldErrors.doctorId}
                </p>
              )}
            </div>
          </div>

          {/* Schedule Date & Time Slot Selector */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-display font-semibold text-slate-900">
                Available Clinic Dates
              </h4>
              {selectedDoctor && (
                <span className="text-xs text-slate-500">
                  Consultation fee: ${selectedDoctor.consultationFee}
                </span>
              )}
            </div>

            {!selectedDoctor ? (
              <p className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-4">
                Choose a specialist above to view upcoming clinic dates and open time slots.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {availableDates.map((d) => {
                    const active = appointmentDate === d.isoDate;
                    return (
                      <button
                        key={d.isoDate}
                        type="button"
                        onClick={() => {
                          setAppointmentDate(d.isoDate);
                          setFieldErrors((prev) => ({
                            ...prev,
                            appointmentDate: '',
                          }));
                        }}
                        className={`px-2.5 py-2 min-h-[44px] rounded-lg border text-left transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#0F4C81] border-[#0F4C81] text-white'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-[#1D4ED8]'
                        }`}
                      >
                        <div className="text-[11px] opacity-80">{d.weekdayShort}</div>
                        <div className="text-xs font-semibold tabular-nums">
                          {d.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {fieldErrors.appointmentDate && (
                  <p className="text-xs text-red-700" role="alert">
                    {fieldErrors.appointmentDate}
                  </p>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#0F4C81]" />
                      Select Time Slot
                    </span>
                    {loadingSlots && (
                      <span className="text-xs text-slate-500 inline-flex items-center gap-1">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Checking schedule...
                      </span>
                    )}
                  </div>

                  {slotsError && (
                    <p className="text-xs text-red-700 mb-2" role="alert">
                      {slotsError}
                    </p>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {selectedDoctor.timeSlotsList.map((slot) => {
                      const isBooked = bookedSlots.includes(slot);
                      const isSelected = timeSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isBooked}
                          onClick={() => {
                            setTimeSlot(slot);
                            setFieldErrors((prev) => ({ ...prev, timeSlot: '' }));
                          }}
                          className={`px-3 py-2 min-h-[40px] rounded-lg border text-xs font-mono font-medium tabular-nums transition-colors ${
                            isBooked
                              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through'
                              : isSelected
                                ? 'bg-[#1D4ED8] border-[#1D4ED8] text-white cursor-pointer'
                                : 'bg-white border-slate-200 text-slate-800 hover:border-[#1D4ED8] cursor-pointer'
                          }`}
                        >
                          {slot} {isBooked ? '(Booked)' : ''}
                        </button>
                      );
                    })}
                  </div>
                  {fieldErrors.timeSlot && (
                    <p className="text-xs text-red-700 mt-1.5" role="alert">
                      {fieldErrors.timeSlot}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Column 2: Patient Details */}
        <div className="space-y-5">
          <div>
            <h3 className="text-base font-display font-bold text-slate-900">
              02. Patient Contact &amp; Visit Details
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Existing patient records are matched by email so your history stays unified.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label
                htmlFor="patient-name"
                className="block text-sm font-medium text-slate-800 mb-1.5"
              >
                Patient Full Name
              </label>
              <input
                id="patient-name"
                type="text"
                value={patientName}
                onChange={(e) => {
                  setPatientName(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, patientName: '' }));
                }}
                placeholder="e.g. Jordan Taylor"
                className="w-full min-h-[42px] px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
              />
              {fieldErrors.patientName && (
                <p className="text-xs text-red-700 mt-1" role="alert">
                  {fieldErrors.patientName}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="patient-email"
                className="block text-sm font-medium text-slate-800 mb-1.5"
              >
                Email Address
              </label>
              <input
                id="patient-email"
                type="email"
                value={patientEmail}
                onChange={(e) => {
                  setPatientEmail(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, patientEmail: '' }));
                }}
                placeholder="patient@example.com"
                className="w-full min-h-[42px] px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
              />
              {fieldErrors.patientEmail && (
                <p className="text-xs text-red-700 mt-1" role="alert">
                  {fieldErrors.patientEmail}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="patient-phone"
                className="block text-sm font-medium text-slate-800 mb-1.5"
              >
                Phone Number
              </label>
              <input
                id="patient-phone"
                type="tel"
                value={patientPhone}
                onChange={(e) => {
                  setPatientPhone(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, patientPhone: '' }));
                }}
                placeholder="(555) 390-2100"
                className="w-full min-h-[42px] px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
              />
              {fieldErrors.patientPhone && (
                <p className="text-xs text-red-700 mt-1" role="alert">
                  {fieldErrors.patientPhone}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="patient-dob"
                className="block text-sm font-medium text-slate-800 mb-1.5"
              >
                Date of Birth (Optional)
              </label>
              <input
                id="patient-dob"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
              />
            </div>

            <div>
              <label
                htmlFor="visit-type"
                className="block text-sm font-medium text-slate-800 mb-1.5"
              >
                Consultation Type
              </label>
              <select
                id="visit-type"
                value={visitType}
                onChange={(e) => setVisitType(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
              >
                <option value="In-Person Consultation">In-Person Consultation</option>
                <option value="Follow-Up Review">Follow-Up Review</option>
                <option value="Second Opinion">Second Opinion</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="patient-insurance"
                className="block text-sm font-medium text-slate-800 mb-1.5"
              >
                Insurance Provider (Optional)
              </label>
              <input
                id="patient-insurance"
                type="text"
                value={insuranceProvider}
                onChange={(e) => setInsuranceProvider(e.target.value)}
                placeholder="e.g. BlueCross BlueShield, Aetna, Self-Pay"
                className="w-full min-h-[42px] px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="reason-visit"
                className="block text-sm font-medium text-slate-800 mb-1.5"
              >
                Reason for Visit / Symptoms
              </label>
              <textarea
                id="reason-visit"
                rows={3}
                value={reasonForVisit}
                onChange={(e) => {
                  setReasonForVisit(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, reasonForVisit: '' }));
                }}
                placeholder="Briefly describe symptoms, referral notes, or diagnostic follow-up needs."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
              />
              {fieldErrors.reasonForVisit && (
                <p className="text-xs text-red-700 mt-1" role="alert">
                  {fieldErrors.reasonForVisit}
                </p>
              )}
            </div>
          </div>

          {submitError && (
            <div
              role="alert"
              className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800"
            >
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 min-h-[46px] text-sm font-semibold text-white bg-[#0F4C81] hover:bg-[#0c3d68] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Confirming Appointment...</span>
              </>
            ) : (
              <>
                <CalendarCheck className="w-4 h-4" />
                <span>Submit Appointment Request</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
