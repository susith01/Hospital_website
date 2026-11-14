import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull().unique(),
  fullName: text('full_name').notNull(),
  role: text('role').notNull().default('patient'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const patients = pgTable('patients', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  email: text('email').notNull().unique(),
  fullName: text('full_name').notNull(),
  phone: text('phone').notNull(),
  dateOfBirth: text('date_of_birth'),
  gender: text('gender'),
  insuranceProvider: text('insurance_provider'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const departments = pgTable('departments', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  shortDescription: text('short_description').notNull(),
  overview: text('overview').notNull(),
  floorLocation: text('floor_location').notNull(),
  phoneExtension: text('phone_extension').notNull(),
  servicesList: text('services_list').notNull(),
  featured: boolean('featured').default(false).notNull(),
});

export const doctors = pgTable('doctors', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  npiNumber: text('npi_number').notNull().unique(),
  fullName: text('full_name').notNull(),
  credentials: text('credentials').notNull(),
  title: text('title').notNull(),
  departmentId: integer('department_id')
    .references(() => departments.id)
    .notNull(),
  specialization: text('specialization').notNull(),
  experienceYears: integer('experience_years').notNull(),
  education: text('education').notNull(),
  languages: text('languages').notNull(),
  bio: text('bio').notNull(),
  consultationFee: integer('consultation_fee').notNull(),
  imageUrl: text('image_url'),
  availableDays: text('available_days').notNull(),
  timeSlots: text('time_slots').notNull(),
  acceptingNewPatients: boolean('accepting_new_patients').default(true).notNull(),
  featured: boolean('featured').default(false).notNull(),
});

export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  confirmationCode: text('confirmation_code').notNull().unique(),
  patientId: integer('patient_id')
    .references(() => patients.id)
    .notNull(),
  departmentId: integer('department_id')
    .references(() => departments.id)
    .notNull(),
  doctorId: integer('doctor_id')
    .references(() => doctors.id)
    .notNull(),
  appointmentDate: text('appointment_date').notNull(),
  timeSlot: text('time_slot').notNull(),
  visitType: text('visit_type').notNull().default('In-Person Consultation'),
  reasonForVisit: text('reason_for_visit').notNull(),
  status: text('status').notNull().default('Confirmed'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const announcements = pgTable('announcements', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  summary: text('summary').notNull(),
  publishedAt: text('published_at').notNull(),
  isUrgent: boolean('is_urgent').default(false).notNull(),
});

export const contactMessages = pgTable('contact_messages', {
  id: serial('id').primaryKey(),
  referenceCode: text('reference_code').notNull().unique(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  department: text('department').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  status: text('status').notNull().default('Received'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one }) => ({
  patientProfile: one(patients, {
    fields: [users.id],
    references: [patients.userId],
  }),
}));

export const patientsRelations = relations(patients, ({ one, many }) => ({
  user: one(users, {
    fields: [patients.userId],
    references: [users.id],
  }),
  appointments: many(appointments),
}));

export const departmentsRelations = relations(departments, ({ many }) => ({
  doctors: many(doctors),
  appointments: many(appointments),
}));

export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  department: one(departments, {
    fields: [doctors.departmentId],
    references: [departments.id],
  }),
  appointments: many(appointments),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.id],
  }),
  department: one(departments, {
    fields: [appointments.departmentId],
    references: [departments.id],
  }),
  doctor: one(doctors, {
    fields: [appointments.doctorId],
    references: [doctors.id],
  }),
}));
