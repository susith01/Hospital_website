export interface AppointmentValidationInput {
  departmentId: number | '';
  doctorId: number | '';
  appointmentDate: string;
  timeSlot: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  reasonForVisit: string;
}

export interface ContactValidationInput {
  fullName: string;
  email: string;
  phone?: string;
  department: string;
  subject: string;
  message: string;
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^[+]?[\d\s().-]{7,20}$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  return PHONE_REGEX.test(phone.trim());
}

export function getWeekdayFromIsoDate(isoDate: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const dt = new Date(year, month, day);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.getDay();
}

export function getUpcomingAvailableDates(
  availableDays: number[],
  count = 10,
  fromDate = new Date()
): Array<{ isoDate: string; label: string; weekdayShort: string }> {
  const results: Array<{ isoDate: string; label: string; weekdayShort: string }> = [];
  const cursor = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  cursor.setDate(cursor.getDate() + 1); // Start from tomorrow for outpatient scheduling

  let safety = 0;
  while (results.length < count && safety < 45) {
    const dayOfWeek = cursor.getDay();
    if (availableDays.includes(dayOfWeek)) {
      const year = cursor.getFullYear();
      const month = String(cursor.getMonth() + 1).padStart(2, '0');
      const day = String(cursor.getDate()).padStart(2, '0');
      const isoDate = `${year}-${month}-${day}`;
      const label = cursor.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const weekdayShort = cursor.toLocaleDateString('en-US', {
        weekday: 'short',
      });
      results.push({ isoDate, label, weekdayShort });
    }
    cursor.setDate(cursor.getDate() + 1);
    safety += 1;
  }

  return results;
}

export function validateAppointmentForm(
  input: AppointmentValidationInput
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!input.departmentId) {
    errors.departmentId = 'Please select a clinical department.';
  }
  if (!input.doctorId) {
    errors.doctorId = 'Please select a specialist doctor.';
  }
  if (!input.appointmentDate) {
    errors.appointmentDate = 'Please select an available appointment date.';
  }
  if (!input.timeSlot) {
    errors.timeSlot = 'Please choose an open time slot.';
  }
  if (input.patientName.trim().length < 2) {
    errors.patientName = 'Enter the patient full name (at least 2 characters).';
  }
  if (!isValidEmail(input.patientEmail)) {
    errors.patientEmail = 'Enter a valid email address for booking confirmation.';
  }
  if (!isValidPhone(input.patientPhone)) {
    errors.patientPhone = 'Enter a valid contact phone number (at least 7 digits).';
  }
  if (input.reasonForVisit.trim().length < 5) {
    errors.reasonForVisit = 'Briefly describe the reason for your visit (at least 5 characters).';
  }

  return errors;
}

export function validateContactForm(
  input: ContactValidationInput
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (input.fullName.trim().length < 2) {
    errors.fullName = 'Please enter your full name.';
  }
  if (!isValidEmail(input.email)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (input.phone && input.phone.trim() && !isValidPhone(input.phone)) {
    errors.phone = 'Please enter a valid phone number.';
  }
  if (!input.department.trim()) {
    errors.department = 'Please select the relevant hospital desk or department.';
  }
  if (input.subject.trim().length < 3) {
    errors.subject = 'Please provide a brief subject.';
  }
  if (input.message.trim().length < 10) {
    errors.message = 'Please enter a message of at least 10 characters.';
  }

  return errors;
}
