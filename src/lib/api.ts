import type {
  Announcement,
  AppointmentConfirmation,
  ContactConfirmation,
  Department,
  Doctor,
  DoctorAvailability,
  PatientProfile,
  PortalAppointment,
} from '../types/hospital';

async function request<T>(
  url: string,
  options?: RequestInit & { token?: string | null }
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> | undefined),
  };

  if (options?.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }
  return data as T;
}

export function fetchDepartments() {
  return request<Department[]>('/api/departments');
}

export function fetchDoctors(params?: {
  search?: string;
  department?: string;
  featured?: boolean;
}) {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.department) query.set('department', params.department);
  if (params?.featured) query.set('featured', 'true');
  const qs = query.toString();
  return request<Doctor[]>(`/api/doctors${qs ? `?${qs}` : ''}`);
}

export function fetchDoctorBySlug(slug: string) {
  return request<Doctor>(`/api/doctors/${encodeURIComponent(slug)}`);
}

export function fetchDoctorAvailability(doctorId: number, date: string) {
  const query = new URLSearchParams({
    doctorId: String(doctorId),
    date,
  });
  return request<DoctorAvailability>(`/api/appointments/availability?${query.toString()}`);
}

export function submitAppointment(
  payload: {
    departmentId: number;
    doctorId: number;
    appointmentDate: string;
    timeSlot: string;
    visitType: string;
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    dateOfBirth?: string;
    insuranceProvider?: string;
    reasonForVisit: string;
  },
  token?: string | null
) {
  return request<AppointmentConfirmation>('/api/appointments', {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  });
}

export function fetchAnnouncements() {
  return request<Announcement[]>('/api/announcements');
}

export function submitContactMessage(payload: {
  fullName: string;
  email: string;
  phone?: string;
  department: string;
  subject: string;
  message: string;
}) {
  return request<ContactConfirmation>('/api/contact', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function syncAuthenticatedUser(token: string, fullName?: string) {
  return request<{
    user: { id: number; uid: string; email: string; fullName: string; role: string };
    patient: PatientProfile | null;
    appointments: PortalAppointment[];
  }>('/api/auth/sync', {
    method: 'POST',
    body: JSON.stringify({ fullName }),
    token,
  });
}

export function fetchPatientPortal(token: string) {
  return request<{
    user: { id: number; uid: string; email: string; fullName: string; role: string };
    patient: PatientProfile | null;
    appointments: PortalAppointment[];
  }>('/api/patient/profile', { token });
}

export function updatePatientProfile(
  token: string,
  payload: {
    fullName: string;
    phone: string;
    dateOfBirth?: string;
    gender?: string;
    insuranceProvider?: string;
  }
) {
  return request<{
    user: { id: number; uid: string; email: string; fullName: string; role: string };
    patient: PatientProfile;
  }>('/api/patient/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
    token,
  });
}

export function cancelAppointment(token: string, appointmentId: number) {
  return request<{ id: number; status: string }>(
    `/api/patient/appointments/${appointmentId}/cancel`,
    {
      method: 'PATCH',
      token,
    }
  );
}
