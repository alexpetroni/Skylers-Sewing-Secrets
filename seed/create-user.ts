import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db, pool, schema } from './lib/client.js';

async function createUser() {
	const email = 'test@test.com';
	const password = 'test123';

	console.log(`Creating user: ${email}`);

	const userId = crypto.randomUUID();
	const passwordHash = await bcrypt.hash(password, 10);

	try {
		await db.insert(schema.users).values({
			id: userId,
			name: '',
			email: email.toLowerCase(),
			emailVerified: true
		});

		await db.insert(schema.accounts).values({
			userId,
			accountId: userId,
			providerId: 'credential',
			password: passwordHash
		});

		console.log('✓ User created in auth tables');

		await db
			.insert(schema.profiles)
			.values({
				id: userId,
				email: email.toLowerCase(),
				is_member: true,
				is_admin: false,
				member_since: new Date().toISOString()
			})
			.onConflictDoUpdate({
				target: schema.profiles.id,
				set: {
					is_member: true,
					is_admin: false,
					member_since: new Date().toISOString()
				}
			});
	} catch (error) {
		console.error('Error creating user:', (error as Error).message);
		process.exit(1);
	}

	console.log('✓ Profile updated with member access');
	console.log('\nUser created successfully:');
	console.log(`  Email: ${email}`);
	console.log(`  Password: ${password}`);
	console.log(`  is_member: true`);
	console.log(`  is_admin: false`);

	await pool.end();
}

createUser().catch(console.error);
