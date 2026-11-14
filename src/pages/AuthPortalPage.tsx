import { useEffect, useState, type FormEvent } from 'react';
import { Calendar, CheckCircle2, Loader2, LogOut, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cancelAppointment, updatePatientProfile } from '../lib/api';
import type { AppRoute } from '../components/Navbar';

interface AuthPortalPageProps {
  onNavigate: (path: AppRoute) => void;
}

export function AuthPortalPage({ onNavigate }: AuthPortalPageProps) {
  const {
    firebaseUser,
    idToken,
    patientProfile,
    appointments,
    loading,
    authError,
    signInWithGoogle,
    logout,
    refreshPortal,
  } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileNotice, setProfileNotice] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    if (patientProfile) {
      setFullName(patientProfile.fullName);
      setPhone(patientProfile.phone);
      setDateOfBirth(patientProfile.dateOfBirth || '');
      setGender(patientProfile.gender || '');
      setInsuranceProvider(patientProfile.insuranceProvider || '');
    } else if (firebaseUser) {
      setFullName(firebaseUser.displayName || '');
    }
  }, [patientProfile, firebaseUser]);

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!idToken) return;
    setProfileNotice(null);
    setProfileError(null);
    setSavingProfile(true);

    try {
      await updatePatientProfile(idToken, {
        fullName,
        phone,
        dateOfBirth: dateOfBirth || undefined,
        gender: gender || undefined,
        insuranceProvider: insuranceProvider || undefined,
      });
      await refreshPortal();
      setProfileNotice('Patient profile saved to your unified hospital record.');
    } catch (err: any) {
      setProfileError(err.message || 'Could not update patient profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    if (!idToken) return;
    setCancellingId(appointmentId);
    try {
      await cancelAppointment(idToken, appointmentId);
      await refreshPortal();
    } catch (err: any) {
      setProfileError(err.message || 'Unable to cancel appointment.');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="h-64 bg-white border border-slate-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="bg-[#f8fafc] py-14 sm:py-20">
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          <div className="bg-white border border-slate-200 rounded-xl p-8 space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#0F4C81]">
                Patient Login &amp; Registration
              </p>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">
                Sign In to Your Patient Portal
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed">
                Access your shared hospital patient profile, review upcoming specialist
                appointments, and pre-fill future bookings without duplicate registration.
              </p>
            </div>

            {authError && (
              <div
                role="alert"
                className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800"
              >
                {authError}
              </div>
            )}

            <button
              type="button"
              onClick={signInWithGoogle}
              className="w-full inline-flex items-center justify-center gap-3 px-5 py-3 min-h-[46px] text-sm font-semibold text-white bg-[#0F4C81] hover:bg-[#0c3d68] rounded-lg transition-colors cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Continue with Google Sign-In</span>
            </button>

            <div className="pt-4 border-t border-slate-200 flex items-start gap-2.5 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-[#0F4C81] shrink-0 mt-0.5" />
              <p>
                New visitors are registered automatically on first sign-in and matched by
                email to any prior outpatient appointment requests.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        <header className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#0F4C81]">Patient Portal</p>
            <h1 className="text-2xl font-display font-bold text-slate-900 mt-1">
              Welcome, {patientProfile?.fullName || firebaseUser.displayName || firebaseUser.email}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">{firebaseUser.email}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/appointments')}
              className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] text-xs font-semibold text-white bg-[#0F4C81] hover:bg-[#0c3d68] rounded-lg transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>New Appointment</span>
            </button>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Shared Patient Profile Form */}
          <section className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div>
              <h2 className="text-lg font-display font-bold text-slate-900">
                Shared Patient Profile
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Keep your contact and insurance details current across all hospital
                departments.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label
                  htmlFor="portal-name"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Full Name
                </label>
                <input
                  id="portal-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full min-h-[40px] px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                />
              </div>

              <div>
                <label
                  htmlFor="portal-phone"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Phone Number
                </label>
                <input
                  id="portal-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 390-2100"
                  className="w-full min-h-[40px] px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="portal-dob"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Date of Birth
                  </label>
                  <input
                    id="portal-dob"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full min-h-[40px] px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="portal-gender"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Gender
                  </label>
                  <select
                    id="portal-gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full min-h-[40px] px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                  >
                    <option value="">Select</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="portal-insurance"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Insurance Provider
                </label>
                <input
                  id="portal-insurance"
                  type="text"
                  value={insuranceProvider}
                  onChange={(e) => setInsuranceProvider(e.target.value)}
                  placeholder="e.g. Aetna, BlueCross, Medicare"
                  className="w-full min-h-[40px] px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                />
              </div>

              {profileNotice && (
                <div
                  role="status"
                  className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{profileNotice}</span>
                </div>
              )}

              {profileError && (
                <div
                  role="alert"
                  className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800"
                >
                  {profileError}
                </div>
              )}

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 min-h-[42px] text-sm font-semibold text-white bg-[#0F4C81] hover:bg-[#0c3d68] rounded-lg transition-colors cursor-pointer"
              >
                {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Save Patient Record</span>
              </button>
            </form>
          </section>

          {/* Appointments History */}
          <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <h2 className="text-lg font-display font-bold text-slate-900">
              Your Hospital Appointments
            </h2>

            {appointments.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <p className="text-sm font-medium text-slate-700">
                  No appointments recorded under {firebaseUser.email} yet.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('/appointments')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#0F4C81] rounded-lg cursor-pointer"
                >
                  Schedule Your First Visit
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {appointments.map((appt) => (
                  <article
                    key={appt.id}
                    className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-mono font-semibold text-[#0F4C81] tabular-nums">
                          {appt.confirmationCode}
                        </span>
                        <span aria-hidden="true" className="text-slate-400">
                          ·
                        </span>
                        <span
                          className={`font-semibold ${
                            appt.status === 'Cancelled'
                              ? 'text-slate-500'
                              : 'text-emerald-700'
                          }`}
                        >
                          {appt.status}
                        </span>
                      </div>
                      <h3 className="text-base font-display font-bold text-slate-900">
                        {appt.doctorName}, {appt.doctorCredentials}
                      </h3>
                      <p className="text-xs text-slate-600">
                        {appt.departmentName} · {appt.floorLocation}
                      </p>
                      <p className="text-xs font-mono text-slate-700 tabular-nums">
                        {appt.appointmentDate} at {appt.timeSlot} ({appt.visitType})
                      </p>
                    </div>

                    {appt.status !== 'Cancelled' && (
                      <button
                        type="button"
                        disabled={cancellingId === appt.id}
                        onClick={() => handleCancelAppointment(appt.id)}
                        className="px-3 py-2 min-h-[38px] text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors self-start sm:self-center cursor-pointer"
                      >
                        {cancellingId === appt.id ? 'Cancelling...' : 'Cancel Visit'}
                      </button>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
