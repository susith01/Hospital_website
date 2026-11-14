export interface Department {
  id: number;
  slug: string;
  name: string;
  shortDescription: string;
  overview: string;
  floorLocation: string;
  phoneExtension: string;
  services: string[];
  featured: boolean;
  doctorCount: number;
}

export interface Doctor {
  id: number;
  slug: string;
  npiNumber: string;
  fullName: string;
  credentials: string;
  title: string;
  departmentId: number;
  departmentName: string;
  departmentSlug: string;
  floorLocation: string;
  phoneExtension?: string;
  specialization: string;
  experienceYears: number;
  education: string;
  languages: string;
  bio: string;
  consultationFee: number;
  imageUrl: string | null;
  availableDaysList: number[];
  timeSlotsList: string[];
  acceptingNewPatients: boolean;
  featured: boolean;
}

export interface Announcement {
  id: number;
  slug: string;
  title: string;
  category: string;
  summary: string;
  publishedAt: string;
  isUrgent: boolean;
}

export interface DoctorAvailability {
  doctorId: number;
  appointmentDate: string;
  availableDays: number[];
  allSlots: string[];
  bookedSlots: string[];
}

export interface AppointmentConfirmation {
  id: number;
  confirmationCode: string;
  patientId: number;
  departmentId: number;
  doctorId: number;
  appointmentDate: string;
  timeSlot: string;
  visitType: string;
  reasonForVisit: string;
  status: string;
  patientName: string;
  patientEmail: string;
  doctorName: string;
  doctorCredentials: string;
  departmentName: string;
  floorLocation: string;
}

export interface PatientProfile {
  id: number;
  userId: number | null;
  email: string;
  fullName: string;
  phone: string;
  dateOfBirth: string | null;
  gender: string | null;
  insuranceProvider: string | null;
}

export interface PortalAppointment {
  id: number;
  confirmationCode: string;
  appointmentDate: string;
  timeSlot: string;
  visitType: string;
  reasonForVisit: string;
  status: string;
  doctorName: string;
  doctorCredentials: string;
  doctorSlug: string;
  departmentName: string;
  floorLocation: string;
}

export interface ContactConfirmation {
  id: number;
  referenceCode: string;
  fullName: string;
  email: string;
  department: string;
  subject: string;
  status: string;
}
