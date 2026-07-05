import { eq, sql, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from './db';
import { users, accounts, profiles } from './db/schema';

/**
 * Server-side user management for machine-driven flows (Stripe webhook,
 * checkout success). Replaces supabaseAdmin.auth.admin.createUser /
 * updateUserById. Writes the same rows Better Auth itself would create,
 * so users created here sign in through Better Auth normally.
 */

export async function findUserIdByEmail(email: string): Promise<string | null> {
	const [row] = await db
		.select({ id: users.id })
		.from(users)
		.where(sql`lower(${users.email}) = lower(${email})`)
		.limit(1);
	return row?.id ?? null;
}

export async function createCredentialUser(options: {
	email: string;
	password: string;
	fullName?: string | null;
}): Promise<string> {
	const { email, password, fullName } = options;
	const userId = crypto.randomUUID();
	const passwordHash = await bcrypt.hash(password, 10);

	// Purchase implies control of the email address (matches the previous
	// admin.createUser({ email_confirm: true }) behaviour)
	await db.insert(users).values({
		id: userId,
		name: fullName || '',
		email: email.toLowerCase(),
		emailVerified: true
	});

	// Better Auth stores credential password hashes on the account row,
	// with accountId = userId for the 'credential' provider
	await db.insert(accounts).values({
		userId,
		accountId: userId,
		providerId: 'credential',
		password: passwordHash
	});

	await ensureProfile({ userId, email, fullName });

	return userId;
}

/** Replaces admin.updateUserById(userId, { password }) */
export async function setUserPassword(userId: string, password: string): Promise<void> {
	const passwordHash = await bcrypt.hash(password, 10);
	const updated = await db
		.update(accounts)
		.set({ password: passwordHash, updatedAt: new Date() })
		.where(and(eq(accounts.userId, userId), eq(accounts.providerId, 'credential')))
		.returning({ id: accounts.id });

	if (updated.length === 0) {
		await db.insert(accounts).values({
			userId,
			accountId: userId,
			providerId: 'credential',
			password: passwordHash
		});
	}
}

/**
 * Ensure a profiles row exists for a user (defensive fallback, kept from
 * the Supabase version where the DB trigger was sometimes inactive).
 */
export async function ensureProfile(options: {
	userId: string;
	email: string;
	fullName?: string | null;
}): Promise<void> {
	await db
		.insert(profiles)
		.values({
			id: options.userId,
			email: options.email.toLowerCase(),
			full_name: options.fullName || null
		})
		.onConflictDoNothing();
}
