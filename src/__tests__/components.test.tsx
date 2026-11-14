import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppointmentBookingSection } from '../components/AppointmentBookingSection';
import { DoctorCard } from '../components/DoctorCard';
import { Navbar } from '../components/Navbar';
import { ContactPage } from '../pages/ContactPage';
import { DoctorsPage } from '../pages/DoctorsPage';
import type { Department, Doctor } from '../types/hospital';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    firebaseUser: null,
    idToken: null,
    patientProfile: null,
    appointments: [],
    loading: false,
    authError: null,
    signInWithGoogle: vi.fn(),
    logout: vi.fn(),
    refreshPortal: vi.fn(),
  }),
}));

const mockApi = vi.hoisted(() => ({
  fetchDoctorAvailability: vi.fn(),
  submitAppointment: vi.fn(),
  submitContactMessage: vi.fn(),
}));

vi.mock('../lib/api', () => mockApi);

const DEPARTMENTS: Department[] = [
  {
    id: 1,
    slug: 'cardiology',
    name: 'Cardiology & Vascular Institute',
    shortDescription: 'Heart & vascular care',
    overview: 'Comprehensive cardiac care.',
    floorLocation: 'East Pavilion · Level 3',
    phoneExtension: 'Ext. 3100',
    services: ['Coronary Angiography', '3D Echocardiography'],
    featured: true,
    doctorCount: 1,
  },
  {
    id: 2,
    slug: 'neurology',
    name: 'Neurology & Neurosurgery',
    shortDescription: 'Brain & spine care',
    overview: 'Comprehensive stroke and cranial center.',
    floorLocation: 'West Tower · Level 5',
    phoneExtension: 'Ext. 5200',
    services: ['Stroke Thrombectomy'],
    featured: true,
    doctorCount: 1,
  },
];

const DOCTORS: Doctor[] = [
  {
    id: 1,
    slug: 'dr-evelyn-reed',
    npiNumber: 'NPI-1049283710',
    fullName: 'Dr. Evelyn Reed',
    credentials: 'MD, FACC',
    title: 'Chief of Interventional Cardiology',
    departmentId: 1,
    departmentName: 'Cardiology & Vascular Institute',
    departmentSlug: 'cardiology',
    floorLocation: 'East Pavilion · Level 3',
    specialization: 'Interventional & Structural Cardiology',
    experienceYears: 18,
    education: 'Johns Hopkins',
    languages: 'English, French',
    bio: 'Leads structural heart interventions.',
    consultationFee: 220,
    imageUrl: null,
    availableDaysList: [1, 2, 3, 4, 5],
    timeSlotsList: ['09:00 AM', '10:30 AM', '02:00 PM'],
    acceptingNewPatients: true,
    featured: true,
  },
  {
    id: 2,
    slug: 'dr-arthur-chen',
    npiNumber: 'NPI-1184729104',
    fullName: 'Dr. Arthur Chen',
    credentials: 'MD, FAANS',
    title: 'Director of Cerebrovascular Neurosurgery',
    departmentId: 2,
    departmentName: 'Neurology & Neurosurgery',
    departmentSlug: 'neurology',
    floorLocation: 'West Tower · Level 5',
    specialization: 'Cerebrovascular & Skull-Base Neurosurgery',
    experienceYears: 21,
    education: 'Stanford University',
    languages: 'English, Mandarin',
    bio: 'Directs cerebrovascular surgery.',
    consultationFee: 250,
    imageUrl: null,
    availableDaysList: [1, 2, 4, 5],
    timeSlotsList: ['08:30 AM', '11:00 AM'],
    acceptingNewPatients: true,
    featured: true,
  },
];

describe('Core hospital UI components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApi.fetchDoctorAvailability.mockResolvedValue({
      doctorId: 1,
      appointmentDate: '2026-11-16',
      availableDays: [1, 2, 3, 4, 5],
      allSlots: ['09:00 AM', '10:30 AM', '02:00 PM'],
      bookedSlots: ['10:30 AM'],
    });
  });

  it('renders Navbar links, CTA, and mobile drawer toggle', () => {
    const onNavigate = vi.fn();
    render(<Navbar currentPath="/" onNavigate={onNavigate} />);

    expect(screen.getByText("St. Mary's Premier Health")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Departments' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Book Appointment' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Open navigation menu' }));
    expect(screen.getByText('About Us & Hospital Profile')).toBeInTheDocument();
    expect(screen.getByText('Emergency Information')).toBeInTheDocument();
  });

  it('renders DoctorCard with fallback monogram and triggers profile & book handlers', () => {
    const onViewProfile = vi.fn();
    const onBookDoctor = vi.fn();
    render(
      <DoctorCard
        doctor={DOCTORS[0]}
        onViewProfile={onViewProfile}
        onBookDoctor={onBookDoctor}
      />
    );

    expect(screen.getByText('Dr. Evelyn Reed, MD, FACC')).toBeInTheDocument();
    expect(screen.getByText('ER')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'View Profile' }));
    expect(onViewProfile).toHaveBeenCalledWith('dr-evelyn-reed');

    fireEvent.click(screen.getByRole('button', { name: /Book Visit/i }));
    expect(onBookDoctor).toHaveBeenCalledWith(DOCTORS[0]);
  });

  it('filters DoctorsPage by search query and department', () => {
    render(
      <DoctorsPage
        departments={DEPARTMENTS}
        doctors={DOCTORS}
        loading={false}
        error={null}
        onViewProfile={vi.fn()}
        onBookDoctor={vi.fn()}
      />
    );

    expect(screen.getByText('Dr. Evelyn Reed, MD, FACC')).toBeInTheDocument();
    expect(screen.getByText('Dr. Arthur Chen, MD, FAANS')).toBeInTheDocument();

    const searchInput = screen.getByLabelText('Search by Doctor Name or Specialization');
    fireEvent.change(searchInput, { target: { value: 'Neurosurgery' } });

    expect(screen.queryByText('Dr. Evelyn Reed, MD, FACC')).not.toBeInTheDocument();
    expect(screen.getByText('Dr. Arthur Chen, MD, FAANS')).toBeInTheDocument();
  });

  it('handles AppointmentBookingSection availability, validation, and confirmation', async () => {
    mockApi.submitAppointment.mockResolvedValue({
      id: 42,
      confirmationCode: 'SMH-839201',
      patientId: 7,
      departmentId: 1,
      doctorId: 1,
      appointmentDate: '2026-11-16',
      timeSlot: '09:00 AM',
      visitType: 'In-Person Consultation',
      reasonForVisit: 'Routine cardiac consultation',
      status: 'Confirmed',
      patientName: 'Jordan Taylor',
      patientEmail: 'jordan@example.com',
      doctorName: 'Dr. Evelyn Reed',
      doctorCredentials: 'MD, FACC',
      departmentName: 'Cardiology & Vascular Institute',
      floorLocation: 'East Pavilion · Level 3',
    });

    render(
      <AppointmentBookingSection
        departments={DEPARTMENTS}
        doctors={DOCTORS}
        preselectedDepartmentId={1}
        preselectedDoctorId={1}
      />
    );

    await waitFor(() => {
      expect(mockApi.fetchDoctorAvailability).toHaveBeenCalled();
    });

    // Booked slot is visibly disabled
    const bookedButton = screen.getByRole('button', { name: /10:30 AM \(Booked\)/i });
    expect(bookedButton).toBeDisabled();

    // Submit empty patient fields -> validation error shown
    fireEvent.click(screen.getByRole('button', { name: /Submit Appointment Request/i }));
    expect(
      screen.getByText('Enter the patient full name (at least 2 characters).')
    ).toBeInTheDocument();

    // Choose open slot and fill patient form
    fireEvent.click(screen.getByRole('button', { name: '09:00 AM' }));
    fireEvent.change(screen.getByLabelText('Patient Full Name'), {
      target: { value: 'Jordan Taylor' },
    });
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'jordan@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Phone Number'), {
      target: { value: '(555) 390-2100' },
    });
    fireEvent.change(screen.getByLabelText('Reason for Visit / Symptoms'), {
      target: { value: 'Routine cardiac consultation' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Submit Appointment Request/i }));

    await waitFor(() => {
      expect(screen.getByText(/Booking Reference SMH-839201/i)).toBeInTheDocument();
    });
  });

  it('validates and submits ContactPage inquiry form', async () => {
    mockApi.submitContactMessage.mockResolvedValue({
      id: 10,
      referenceCode: 'MSG-55412',
      fullName: 'Jordan Taylor',
      email: 'jordan@example.com',
      department: 'Patient Coordination & Appointments',
      subject: 'Insurance check',
      status: 'Received',
    });

    render(<ContactPage />);

    fireEvent.click(screen.getByRole('button', { name: /Send Inquiry/i }));
    expect(screen.getByText('Please enter your full name.')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Full Name'), {
      target: { value: 'Jordan Taylor' },
    });
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'jordan@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Subject'), {
      target: { value: 'Insurance check' },
    });
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'Confirming coverage for diagnostic echocardiography.' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Send Inquiry/i }));

    await waitFor(() => {
      expect(screen.getByText(/Inquiry Received \(MSG-55412\)/i)).toBeInTheDocument();
    });
  });
});
