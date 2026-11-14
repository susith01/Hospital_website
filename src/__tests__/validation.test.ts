import { describe, expect, it } from 'vitest';
import {
  getUpcomingAvailableDates,
  isValidEmail,
  isValidPhone,
  validateAppointmentForm,
  validateContactForm,
} from '../lib/validation';

describe('Hospital validation & scheduling utilities', () => {
  it('validates email and phone formats', () => {
    expect(isValidEmail('patient@example.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidPhone('(555) 234-8000')).toBe(true);
    expect(isValidPhone('123')).toBe(false);
  });

  it('returns upcoming clinic dates strictly matching doctor available weekdays', () => {
    // Only Mondays (1) and Wednesdays (3)
    const start = new Date(2026, 10, 14); // Saturday Nov 14, 2026
    const dates = getUpcomingAvailableDates([1, 3], 4, start);
    expect(dates).toHaveLength(4);
    for (const item of dates) {
      const [y, m, d] = item.isoDate.split('-').map(Number);
      const dayOfWeek = new Date(y, m - 1, d).getDay();
      expect([1, 3]).toContain(dayOfWeek);
    }
  });

  it('catches missing and malformed appointment form fields', () => {
    const errors = validateAppointmentForm({
      departmentId: '',
      doctorId: '',
      appointmentDate: '',
      timeSlot: '',
      patientName: 'A',
      patientEmail: 'bad',
      patientPhone: '12',
      reasonForVisit: 'Hi',
    });

    expect(errors.departmentId).toBeDefined();
    expect(errors.doctorId).toBeDefined();
    expect(errors.appointmentDate).toBeDefined();
    expect(errors.timeSlot).toBeDefined();
    expect(errors.patientName).toBeDefined();
    expect(errors.patientEmail).toBeDefined();
    expect(errors.patientPhone).toBeDefined();
    expect(errors.reasonForVisit).toBeDefined();
  });

  it('passes valid appointment form inputs', () => {
    const errors = validateAppointmentForm({
      departmentId: 1,
      doctorId: 2,
      appointmentDate: '2026-11-18',
      timeSlot: '09:00 AM',
      patientName: 'Jordan Taylor',
      patientEmail: 'jordan@example.com',
      patientPhone: '(555) 390-2100',
      reasonForVisit: 'Annual cardiology follow-up and ECG review.',
    });

    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('validates contact inquiry inputs accurately', () => {
    const invalid = validateContactForm({
      fullName: 'J',
      email: 'not-an-email',
      phone: '12',
      department: '',
      subject: 'Hi',
      message: 'Short',
    });
    expect(invalid.fullName).toBeDefined();
    expect(invalid.email).toBeDefined();
    expect(invalid.phone).toBeDefined();
    expect(invalid.department).toBeDefined();
    expect(invalid.subject).toBeDefined();
    expect(invalid.message).toBeDefined();

    const valid = validateContactForm({
      fullName: 'Jordan Taylor',
      email: 'jordan@example.com',
      phone: '555-390-2100',
      department: 'Billing & Insurance Desk',
      subject: 'MRI Pre-Authorization Question',
      message: 'Please confirm whether BlueCross PPO covers 3T outpatient MRI.',
    });
    expect(Object.keys(valid)).toHaveLength(0);
  });
});
