import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  cancelPatientAppointment,
  createAppointment,
  createContactMessage,
  getAllDepartments,
  getAllDoctors,
  getAnnouncements,
  getDoctorAvailability,
  getDoctorBySlug,
  getPatientPortalData,
  upsertPatientRecord,
} from './src/db/hospital.ts';
import { getOrCreateUser, getUserByUid } from './src/db/users.ts';
import { type AuthRequest, optionalAuth, requireAuth } from './src/middleware/auth.ts';
import { validateAppointmentForm, validateContactForm } from './src/lib/validation.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/departments', async (_req, res) => {
  try {
    const items = await getAllDepartments();
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to load departments' });
  }
});

app.get('/api/doctors', async (req, res) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const departmentSlug =
      typeof req.query.department === 'string' ? req.query.department : undefined;
    const featuredOnly = req.query.featured === 'true';

    const items = await getAllDoctors({ search, departmentSlug, featuredOnly });
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to load doctors' });
  }
});

app.get('/api/doctors/:slug', async (req, res) => {
  try {
    const doctor = await getDoctorBySlug(req.params.slug);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found.' });
    }
    res.json(doctor);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to load doctor details' });
  }
});

app.get('/api/appointments/availability', async (req, res) => {
  try {
    const doctorId = Number(req.query.doctorId);
    const date = typeof req.query.date === 'string' ? req.query.date : '';

    if (!doctorId || !date) {
      return res.status(400).json({ error: 'doctorId and date are required.' });
    }

    const availability = await getDoctorAvailability(doctorId, date);
    if (!availability) {
      return res.status(404).json({ error: 'Doctor schedule not found.' });
    }
    res.json(availability);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to load availability' });
  }
});

app.post('/api/appointments', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const body = req.body ?? {};
    const validationErrors = validateAppointmentForm({
      departmentId: Number(body.departmentId) || '',
      doctorId: Number(body.doctorId) || '',
      appointmentDate: String(body.appointmentDate || ''),
      timeSlot: String(body.timeSlot || ''),
      patientName: String(body.patientName || ''),
      patientEmail: String(body.patientEmail || ''),
      patientPhone: String(body.patientPhone || ''),
      reasonForVisit: String(body.reasonForVisit || ''),
    });

    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({
        error: 'Please correct the highlighted appointment details.',
        fields: validationErrors,
      });
    }

    let userId: number | null = null;
    if (req.user?.uid && req.user.email) {
      const userRecord = await getOrCreateUser(
        req.user.uid,
        req.user.email,
        req.user.name || String(body.patientName)
      );
      userId = userRecord.id;
    }

    const booking = await createAppointment({
      userId,
      patientEmail: String(body.patientEmail),
      patientName: String(body.patientName),
      patientPhone: String(body.patientPhone),
      dateOfBirth: body.dateOfBirth ? String(body.dateOfBirth) : null,
      insuranceProvider: body.insuranceProvider ? String(body.insuranceProvider) : null,
      departmentId: Number(body.departmentId),
      doctorId: Number(body.doctorId),
      appointmentDate: String(body.appointmentDate),
      timeSlot: String(body.timeSlot),
      visitType: body.visitType ? String(body.visitType) : 'In-Person Consultation',
      reasonForVisit: String(body.reasonForVisit),
    });

    res.status(201).json(booking);
  } catch (error: any) {
    if (error.message === 'SLOT_ALREADY_BOOKED') {
      return res.status(409).json({
        error: 'This time slot was just reserved by another patient. Please pick another slot.',
      });
    }
    if (
      error.message === 'DOCTOR_NOT_FOUND' ||
      error.message === 'DEPARTMENT_MISMATCH' ||
      error.message === 'INVALID_TIME_SLOT'
    ) {
      return res.status(400).json({ error: 'Selected doctor or time slot is invalid.' });
    }
    res.status(500).json({ error: error.message || 'Failed to submit appointment request.' });
  }
});

app.get('/api/announcements', async (_req, res) => {
  try {
    const items = await getAnnouncements();
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch announcements' });
  }
});

app.post('/api/contact', async (req, res) => {
  try {
    const body = req.body ?? {};
    const validationErrors = validateContactForm({
      fullName: String(body.fullName || ''),
      email: String(body.email || ''),
      phone: body.phone ? String(body.phone) : '',
      department: String(body.department || ''),
      subject: String(body.subject || ''),
      message: String(body.message || ''),
    });

    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({
        error: 'Please check the highlighted contact form fields.',
        fields: validationErrors,
      });
    }

    const saved = await createContactMessage({
      fullName: String(body.fullName),
      email: String(body.email),
      phone: body.phone ? String(body.phone) : null,
      department: String(body.department),
      subject: String(body.subject),
      message: String(body.message),
    });

    res.status(201).json(saved);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to send message.' });
  }
});

app.post('/api/auth/sync', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const email = req.user!.email;
    if (!email) {
      return res.status(400).json({ error: 'Authenticated account must include an email address.' });
    }
    const name = req.user!.name || req.body?.fullName || email.split('@')[0];
    const userRecord = await getOrCreateUser(uid, email, name);
    const portalData = await getPatientPortalData(userRecord.id, email);
    res.json({ user: userRecord, ...portalData });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to synchronize account.' });
  }
});

app.get('/api/patient/profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const email = req.user!.email;
    if (!email) {
      return res.status(400).json({ error: 'Account email is missing.' });
    }
    let userRecord = await getUserByUid(uid);
    if (!userRecord) {
      userRecord = await getOrCreateUser(uid, email, req.user!.name || email.split('@')[0]);
    }
    const portalData = await getPatientPortalData(userRecord.id, email);
    res.json({ user: userRecord, ...portalData });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to load patient profile.' });
  }
});

app.put('/api/patient/profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const email = req.user!.email;
    if (!email) {
      return res.status(400).json({ error: 'Account email is missing.' });
    }
    const body = req.body ?? {};
    if (!body.fullName || String(body.fullName).trim().length < 2) {
      return res.status(400).json({ error: 'Full name is required.' });
    }
    if (!body.phone || String(body.phone).trim().length < 7) {
      return res.status(400).json({ error: 'Valid phone number is required.' });
    }

    const userRecord = await getOrCreateUser(uid, email, String(body.fullName));
    const patient = await upsertPatientRecord({
      userId: userRecord.id,
      email,
      fullName: String(body.fullName),
      phone: String(body.phone),
      dateOfBirth: body.dateOfBirth ? String(body.dateOfBirth) : null,
      gender: body.gender ? String(body.gender) : null,
      insuranceProvider: body.insuranceProvider ? String(body.insuranceProvider) : null,
    });

    res.json({ user: userRecord, patient });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update patient profile.' });
  }
});

app.patch('/api/patient/appointments/:id/cancel', requireAuth, async (req: AuthRequest, res) => {
  try {
    const appointmentId = Number(req.params.id);
    if (!appointmentId) {
      return res.status(400).json({ error: 'Invalid appointment ID.' });
    }
    const email = req.user!.email;
    if (!email) {
      return res.status(400).json({ error: 'Account email is missing.' });
    }
    const userRecord = await getOrCreateUser(
      req.user!.uid,
      email,
      req.user!.name || email.split('@')[0]
    );
    const updated = await cancelPatientAppointment(appointmentId, userRecord.id, email);
    if (!updated) {
      return res.status(404).json({ error: 'Appointment not found for this patient.' });
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to cancel appointment.' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
