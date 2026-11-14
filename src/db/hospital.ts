import { and, desc, eq, ne } from 'drizzle-orm';
import { db } from './index.ts';
import {
  announcements,
  appointments,
  contactMessages,
  departments,
  doctors,
  patients,
} from './schema.ts';

export interface PatientUpsertInput {
  userId?: number | null;
  email: string;
  fullName: string;
  phone: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  insuranceProvider?: string | null;
}

export interface CreateAppointmentInput {
  userId?: number | null;
  patientEmail: string;
  patientName: string;
  patientPhone: string;
  dateOfBirth?: string | null;
  insuranceProvider?: string | null;
  departmentId: number;
  doctorId: number;
  appointmentDate: string;
  timeSlot: string;
  visitType: string;
  reasonForVisit: string;
}

export interface CreateContactMessageInput {
  fullName: string;
  email: string;
  phone?: string | null;
  department: string;
  subject: string;
  message: string;
}

export async function getAllDepartments() {
  try {
    const deptRows = await db.select().from(departments).orderBy(departments.id);
    const doctorRows = await db
      .select({ id: doctors.id, departmentId: doctors.departmentId })
      .from(doctors);

    const countByDept = new Map<number, number>();
    for (const doc of doctorRows) {
      countByDept.set(doc.departmentId, (countByDept.get(doc.departmentId) ?? 0) + 1);
    }

    return deptRows.map((dept) => ({
      ...dept,
      services: JSON.parse(dept.servicesList) as string[],
      doctorCount: countByDept.get(dept.id) ?? 0,
    }));
  } catch (error) {
    console.error('Database query failed in getAllDepartments:', error);
    throw new Error('Failed to load hospital departments.', { cause: error });
  }
}

export async function getAllDoctors(filters?: {
  search?: string;
  departmentSlug?: string;
  featuredOnly?: boolean;
}) {
  try {
    const rows = await db
      .select({
        doctor: doctors,
        departmentName: departments.name,
        departmentSlug: departments.slug,
        floorLocation: departments.floorLocation,
      })
      .from(doctors)
      .innerJoin(departments, eq(doctors.departmentId, departments.id))
      .orderBy(desc(doctors.featured), doctors.id);

    const searchTerm = filters?.search?.trim().toLowerCase() || '';
    const deptSlug = filters?.departmentSlug?.trim().toLowerCase() || '';

    return rows
      .filter((row) => {
        if (filters?.featuredOnly && !row.doctor.featured) {
          return false;
        }
        if (deptSlug && deptSlug !== 'all' && row.departmentSlug.toLowerCase() !== deptSlug) {
          return false;
        }
        if (searchTerm) {
          const haystack = [
            row.doctor.fullName,
            row.doctor.specialization,
            row.doctor.title,
            row.departmentName,
          ]
            .join(' ')
            .toLowerCase();
          if (!haystack.includes(searchTerm)) {
            return false;
          }
        }
        return true;
      })
      .map((row) => ({
        ...row.doctor,
        availableDaysList: JSON.parse(row.doctor.availableDays) as number[],
        timeSlotsList: JSON.parse(row.doctor.timeSlots) as string[],
        departmentName: row.departmentName,
        departmentSlug: row.departmentSlug,
        floorLocation: row.floorLocation,
      }));
  } catch (error) {
    console.error('Database query failed in getAllDoctors:', error);
    throw new Error('Failed to load medical specialists.', { cause: error });
  }
}

export async function getDoctorBySlug(slug: string) {
  try {
    const rows = await db
      .select({
        doctor: doctors,
        departmentName: departments.name,
        departmentSlug: departments.slug,
        floorLocation: departments.floorLocation,
        phoneExtension: departments.phoneExtension,
      })
      .from(doctors)
      .innerJoin(departments, eq(doctors.departmentId, departments.id))
      .where(eq(doctors.slug, slug))
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    return {
      ...row.doctor,
      availableDaysList: JSON.parse(row.doctor.availableDays) as number[],
      timeSlotsList: JSON.parse(row.doctor.timeSlots) as string[],
      departmentName: row.departmentName,
      departmentSlug: row.departmentSlug,
      floorLocation: row.floorLocation,
      phoneExtension: row.phoneExtension,
    };
  } catch (error) {
    console.error('Database query failed in getDoctorBySlug:', error);
    throw new Error('Failed to load doctor details.', { cause: error });
  }
}

export async function getDoctorAvailability(doctorId: number, appointmentDate: string) {
  try {
    const docRows = await db
      .select()
      .from(doctors)
      .where(eq(doctors.id, doctorId))
      .limit(1);
    const doctor = docRows[0];
    if (!doctor) {
      return null;
    }

    const bookedRows = await db
      .select({ timeSlot: appointments.timeSlot })
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, doctorId),
          eq(appointments.appointmentDate, appointmentDate),
          ne(appointments.status, 'Cancelled')
        )
      );

    const allSlots = JSON.parse(doctor.timeSlots) as string[];
    const availableDays = JSON.parse(doctor.availableDays) as number[];
    const bookedSlots = bookedRows.map((r) => r.timeSlot);

    return {
      doctorId: doctor.id,
      appointmentDate,
      availableDays,
      allSlots,
      bookedSlots,
    };
  } catch (error) {
    console.error('Database query failed in getDoctorAvailability:', error);
    throw new Error('Failed to load doctor schedule availability.', { cause: error });
  }
}

export async function upsertPatientRecord(input: PatientUpsertInput) {
  const normalizedEmail = input.email.trim().toLowerCase();

  try {
    const existing = await db
      .select()
      .from(patients)
      .where(eq(patients.email, normalizedEmail))
      .limit(1);

    if (existing[0]) {
      const updated = await db
        .update(patients)
        .set({
          fullName: input.fullName.trim(),
          phone: input.phone.trim(),
          userId: input.userId ?? existing[0].userId,
          dateOfBirth: input.dateOfBirth ?? existing[0].dateOfBirth,
          gender: input.gender ?? existing[0].gender,
          insuranceProvider: input.insuranceProvider ?? existing[0].insuranceProvider,
          updatedAt: new Date(),
        })
        .where(eq(patients.id, existing[0].id))
        .returning();
      return updated[0];
    }

    const inserted = await db
      .insert(patients)
      .values({
        userId: input.userId ?? null,
        email: normalizedEmail,
        fullName: input.fullName.trim(),
        phone: input.phone.trim(),
        dateOfBirth: input.dateOfBirth ?? null,
        gender: input.gender ?? null,
        insuranceProvider: input.insuranceProvider ?? null,
      })
      .onConflictDoUpdate({
        target: patients.email,
        set: {
          fullName: input.fullName.trim(),
          phone: input.phone.trim(),
          updatedAt: new Date(),
        },
      })
      .returning();

    return inserted[0];
  } catch (error) {
    console.error('Database query failed in upsertPatientRecord:', error);
    throw new Error('Failed to save patient record.', { cause: error });
  }
}

export async function createAppointment(input: CreateAppointmentInput) {
  try {
    const docRows = await db
      .select()
      .from(doctors)
      .where(eq(doctors.id, input.doctorId))
      .limit(1);
    const doctor = docRows[0];

    if (!doctor) {
      throw new Error('DOCTOR_NOT_FOUND');
    }
    if (doctor.departmentId !== input.departmentId) {
      throw new Error('DEPARTMENT_MISMATCH');
    }

    const allowedSlots = JSON.parse(doctor.timeSlots) as string[];
    if (!allowedSlots.includes(input.timeSlot)) {
      throw new Error('INVALID_TIME_SLOT');
    }

    const conflicting = await db
      .select({ id: appointments.id })
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, input.doctorId),
          eq(appointments.appointmentDate, input.appointmentDate),
          eq(appointments.timeSlot, input.timeSlot),
          ne(appointments.status, 'Cancelled')
        )
      )
      .limit(1);

    if (conflicting[0]) {
      throw new Error('SLOT_ALREADY_BOOKED');
    }

    const patient = await upsertPatientRecord({
      userId: input.userId,
      email: input.patientEmail,
      fullName: input.patientName,
      phone: input.patientPhone,
      dateOfBirth: input.dateOfBirth,
      insuranceProvider: input.insuranceProvider,
    });

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const confirmationCode = `SMH-${randomSuffix}`;

    const inserted = await db
      .insert(appointments)
      .values({
        confirmationCode,
        patientId: patient.id,
        departmentId: input.departmentId,
        doctorId: input.doctorId,
        appointmentDate: input.appointmentDate,
        timeSlot: input.timeSlot,
        visitType: input.visitType,
        reasonForVisit: input.reasonForVisit.trim(),
        status: 'Confirmed',
      })
      .returning();

    const deptRows = await db
      .select({ name: departments.name, floorLocation: departments.floorLocation })
      .from(departments)
      .where(eq(departments.id, input.departmentId))
      .limit(1);

    return {
      ...inserted[0],
      patientName: patient.fullName,
      patientEmail: patient.email,
      doctorName: doctor.fullName,
      doctorCredentials: doctor.credentials,
      departmentName: deptRows[0]?.name ?? 'Medical Department',
      floorLocation: deptRows[0]?.floorLocation ?? 'Main Campus',
    };
  } catch (error: any) {
    if (
      error instanceof Error &&
      [
        'DOCTOR_NOT_FOUND',
        'DEPARTMENT_MISMATCH',
        'INVALID_TIME_SLOT',
        'SLOT_ALREADY_BOOKED',
      ].includes(error.message)
    ) {
      throw error;
    }
    console.error('Database query failed in createAppointment:', error);
    throw new Error('Failed to create appointment request.', { cause: error });
  }
}

export async function getAnnouncements() {
  try {
    return await db
      .select()
      .from(announcements)
      .orderBy(desc(announcements.isUrgent), desc(announcements.publishedAt));
  } catch (error) {
    console.error('Database query failed in getAnnouncements:', error);
    throw new Error('Failed to fetch hospital announcements.', { cause: error });
  }
}

export async function createContactMessage(input: CreateContactMessageInput) {
  try {
    const refNumber = Math.floor(10000 + Math.random() * 90000);
    const referenceCode = `MSG-${refNumber}`;

    const inserted = await db
      .insert(contactMessages)
      .values({
        referenceCode,
        fullName: input.fullName.trim(),
        email: input.email.trim().toLowerCase(),
        phone: input.phone?.trim() || null,
        department: input.department.trim(),
        subject: input.subject.trim(),
        message: input.message.trim(),
        status: 'Received',
      })
      .returning();

    return inserted[0];
  } catch (error) {
    console.error('Database query failed in createContactMessage:', error);
    throw new Error('Failed to submit contact message.', { cause: error });
  }
}

export async function getPatientPortalData(userId: number, email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  try {
    const patientRows = await db
      .select()
      .from(patients)
      .where(eq(patients.email, normalizedEmail))
      .limit(1);

    let patient = patientRows[0] ?? null;
    if (patient && patient.userId !== userId) {
      const updated = await db
        .update(patients)
        .set({ userId, updatedAt: new Date() })
        .where(eq(patients.id, patient.id))
        .returning();
      patient = updated[0];
    }

    if (!patient) {
      return { patient: null, appointments: [] };
    }

    const apptRows = await db
      .select({
        appointment: appointments,
        doctorName: doctors.fullName,
        doctorCredentials: doctors.credentials,
        doctorSlug: doctors.slug,
        departmentName: departments.name,
        floorLocation: departments.floorLocation,
      })
      .from(appointments)
      .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
      .innerJoin(departments, eq(appointments.departmentId, departments.id))
      .where(eq(appointments.patientId, patient.id))
      .orderBy(desc(appointments.appointmentDate), desc(appointments.createdAt));

    return {
      patient,
      appointments: apptRows.map((row) => ({
        ...row.appointment,
        doctorName: row.doctorName,
        doctorCredentials: row.doctorCredentials,
        doctorSlug: row.doctorSlug,
        departmentName: row.departmentName,
        floorLocation: row.floorLocation,
      })),
    };
  } catch (error) {
    console.error('Database query failed in getPatientPortalData:', error);
    throw new Error('Failed to load patient portal records.', { cause: error });
  }
}

export async function cancelPatientAppointment(appointmentId: number, userId: number, email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  try {
    const patientRows = await db
      .select()
      .from(patients)
      .where(eq(patients.email, normalizedEmail))
      .limit(1);
    const patient = patientRows[0];

    if (!patient || (patient.userId !== null && patient.userId !== userId)) {
      return null;
    }

    const updated = await db
      .update(appointments)
      .set({ status: 'Cancelled' })
      .where(and(eq(appointments.id, appointmentId), eq(appointments.patientId, patient.id)))
      .returning();

    return updated[0] ?? null;
  } catch (error) {
    console.error('Database query failed in cancelPatientAppointment:', error);
    throw new Error('Failed to cancel appointment.', { cause: error });
  }
}
