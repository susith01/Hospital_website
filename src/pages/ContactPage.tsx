import { useState, type FormEvent } from 'react';
import { CheckCircle2, Clock, Loader2, Mail, MapPin, Phone, Send } from 'lucide-react';
import { submitContactMessage } from '../lib/api';
import { validateContactForm } from '../lib/validation';
import type { ContactConfirmation } from '../types/hospital';

export function ContactPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Patient Coordination & Appointments');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<ContactConfirmation | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const errors = validateContactForm({
      fullName,
      email,
      phone,
      department,
      subject,
      message,
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);

    try {
      const saved = await submitContactMessage({
        fullName,
        email,
        phone: phone || undefined,
        department,
        subject,
        message,
      });
      setConfirmation(saved);
    } catch (err: any) {
      setSubmitError(err.message || 'Unable to send your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f8fafc] py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        <header className="space-y-3 max-w-3xl">
          <p className="text-xs font-semibold text-[#0F4C81]">Contact Us</p>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 text-balance">
            Hospital Directory, Directions &amp; Patient Inquiries
          </h1>
          <p className="text-base text-slate-600">
            Reach our patient coordination desk for medical records, billing questions,
            international patient services, or general campus inquiries.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Campus Directory & Location */}
          <aside className="lg:col-span-5 space-y-5">
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
              <h2 className="text-lg font-display font-bold text-slate-900">
                Main Campus Contact Details
              </h2>

              <div className="space-y-4 text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#0F4C81] mt-1 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">Campus Address</p>
                    <p className="text-slate-600">
                      450 Meridian Parkway, Medical District, Suite 100
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#0F4C81] mt-1 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">Hospital Switchboard</p>
                    <p className="text-slate-600 font-mono tabular-nums">
                      Main: (555) 234-8000 · Emergency: (555) 234-9110
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#0F4C81] mt-1 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">Patient Coordination</p>
                    <p className="text-slate-600">care@stmaryspremierhealth.org</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#0F4C81] mt-1 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">Visiting &amp; Clinic Hours</p>
                    <p className="text-slate-600">
                      Outpatient Clinics: Mon–Sat, 07:30 AM – 06:30 PM
                      <br />
                      Inpatient Visiting: Daily, 08:00 AM – 08:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
              <h3 className="text-sm font-display font-bold text-slate-900">
                Direct Department Extensions
              </h3>
              <dl className="divide-y divide-slate-100 text-xs">
                <div className="py-2 flex justify-between">
                  <dt className="text-slate-600">Cardiology &amp; Vascular</dt>
                  <dd className="font-mono font-semibold text-slate-900 tabular-nums">
                    Ext. 3100
                  </dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-slate-600">Neurology &amp; Neurosurgery</dt>
                  <dd className="font-mono font-semibold text-slate-900 tabular-nums">
                    Ext. 5200
                  </dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-slate-600">Pediatrics &amp; NICU</dt>
                  <dd className="font-mono font-semibold text-slate-900 tabular-nums">
                    Ext. 2400
                  </dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-slate-600">Medical Records &amp; Billing</dt>
                  <dd className="font-mono font-semibold text-slate-900 tabular-nums">
                    Ext. 1150
                  </dd>
                </div>
              </dl>
            </div>
          </aside>

          {/* Inquiry Form */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
            {confirmation ? (
              <div role="status" aria-live="polite" className="space-y-4 py-4">
                <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-display font-bold text-slate-900">
                  Inquiry Received ({confirmation.referenceCode})
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Thank you, {confirmation.fullName}. Your message regarding{' '}
                  <strong>{confirmation.subject}</strong> has been routed to{' '}
                  <strong>{confirmation.department}</strong>. A hospital coordinator will
                  reply to {confirmation.email} within one business day.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmation(null);
                    setSubject('');
                    setMessage('');
                  }}
                  className="px-4 py-2.5 text-sm font-semibold text-white bg-[#0F4C81] rounded-lg cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <h2 className="text-xl font-display font-bold text-slate-900">
                  Send a Message to Hospital Coordination
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-sm font-medium text-slate-800 mb-1.5"
                    >
                      Full Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, fullName: '' }));
                      }}
                      placeholder="Your full name"
                      className="w-full min-h-[42px] px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                    />
                    {fieldErrors.fullName && (
                      <p className="text-xs text-red-700 mt-1" role="alert">
                        {fieldErrors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-sm font-medium text-slate-800 mb-1.5"
                    >
                      Email Address
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, email: '' }));
                      }}
                      placeholder="you@example.com"
                      className="w-full min-h-[42px] px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                    />
                    {fieldErrors.email && (
                      <p className="text-xs text-red-700 mt-1" role="alert">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-phone"
                      className="block text-sm font-medium text-slate-800 mb-1.5"
                    >
                      Phone Number (Optional)
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, phone: '' }));
                      }}
                      placeholder="(555) 390-2100"
                      className="w-full min-h-[42px] px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                    />
                    {fieldErrors.phone && (
                      <p className="text-xs text-red-700 mt-1" role="alert">
                        {fieldErrors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-department"
                      className="block text-sm font-medium text-slate-800 mb-1.5"
                    >
                      Inquiry Desk
                    </label>
                    <select
                      id="contact-department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full min-h-[42px] px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                    >
                      <option value="Patient Coordination & Appointments">
                        Patient Coordination &amp; Appointments
                      </option>
                      <option value="Billing & Insurance Desk">
                        Billing &amp; Insurance Desk
                      </option>
                      <option value="Medical Records">Medical Records</option>
                      <option value="Hospital Administration">
                        Hospital Administration
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-subject"
                    className="block text-sm font-medium text-slate-800 mb-1.5"
                  >
                    Subject
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, subject: '' }));
                    }}
                    placeholder="e.g. Insurance verification for MRI scan"
                    className="w-full min-h-[42px] px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                  />
                  {fieldErrors.subject && (
                    <p className="text-xs text-red-700 mt-1" role="alert">
                      {fieldErrors.subject}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-sm font-medium text-slate-800 mb-1.5"
                  >
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, message: '' }));
                    }}
                    placeholder="How can our hospital team assist you? Please do not include emergency symptoms here—call 911 for emergencies."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                  />
                  {fieldErrors.message && (
                    <p className="text-xs text-red-700 mt-1" role="alert">
                      {fieldErrors.message}
                    </p>
                  )}
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
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] text-sm font-semibold text-white bg-[#0F4C81] hover:bg-[#0c3d68] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Inquiry</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
