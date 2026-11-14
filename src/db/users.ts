import { eq } from 'drizzle-orm';
import { db } from './index.ts';
import { patients, users } from './schema.ts';

export async function getOrCreateUser(uid: string, email: string, fullName: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const cleanName = fullName.trim() || normalizedEmail.split('@')[0];

  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email: normalizedEmail,
        fullName: cleanName,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: normalizedEmail,
          fullName: cleanName,
        },
      })
      .returning();

    const userRecord = result[0];

    // If a patient record already exists for this email (e.g. from an earlier guest booking),
    // link it to this authenticated user without creating a duplicate patient row.
    await db
      .update(patients)
      .set({ userId: userRecord.id, updatedAt: new Date() })
      .where(eq(patients.email, normalizedEmail));

    return userRecord;
  } catch (error) {
    console.error('Database error in getOrCreateUser:', error);
    throw new Error('Unable to synchronize user profile.', { cause: error });
  }
}

export async function getUserByUid(uid: string) {
  try {
    const rows = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    return rows[0] ?? null;
  } catch (error) {
    console.error('Database error in getUserByUid:', error);
    throw new Error('Unable to load user profile.', { cause: error });
  }
}
