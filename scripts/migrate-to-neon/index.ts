#!/usr/bin/env npx tsx
/**
 * One-off Supabase -> Neon migration.
 *
 * Usage:
 *   npx tsx scripts/migrate-to-neon/index.ts [users|data|verify|all]
 *
 * Required env vars (direct, non-pooled connections):
 *   SUPABASE_DB_URL  Supabase direct Postgres connection
 *                    (Dashboard > Settings > Database > Connection string)
 *   NEON_DB_URL      Neon direct connection (DATABASE_URL_UNPOOLED)
 *
 * Prerequisites: the Neon schema must exist already
 *   (npx drizzle-kit migrate with DATABASE_URL pointing at Neon).
 *
 * Steps:
 *   users  - import auth.users into Better Auth tables, PRESERVING user ids
 *            (profiles.id and every user FK keep working) and bcrypt password
 *            hashes (users keep their existing passwords). Google identities
 *            from auth.identities become accounts rows (providerId 'google',
 *            accountId = the Google sub claim).
 *   data   - copy all public tables from Supabase to Neon.
 *   verify - compare row counts per table.
 *
 * Both steps are idempotent (ON CONFLICT DO NOTHING) and safe to re-run.
 */

import 'dotenv/config';
import { Client } from 'pg';

const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL;
const NEON_DB_URL = process.env.NEON_DB_URL;

if (!SUPABASE_DB_URL || !NEON_DB_URL) {
	console.error('Missing environment variables: SUPABASE_DB_URL and/or NEON_DB_URL');
	process.exit(1);
}

// Copy order matters: FK dependencies (profiles -> users, lessons -> modules, ...)
const PUBLIC_TABLES = [
	'profiles',
	'pricing_config',
	'promo_codes',
	'modules',
	'lessons',
	'lesson_resources',
	'user_progress',
	'blog_posts',
	'testimonials',
	'faq_items',
	'contact_submissions',
	'newsletter_subscribers',
	'payments',
	'site_settings'
];

// These two get default rows from the Drizzle migrations; production values
// must win, so clear them before copying instead of skipping on conflict.
const REPLACE_TABLES = new Set(['pricing_config', 'site_settings']);

async function importUsers(src: Client, dst: Client): Promise<void> {
	console.log('\n=== Importing auth users ===');

	const { rows: users } = await src.query(`
		SELECT
			u.id,
			u.email,
			u.encrypted_password,
			u.email_confirmed_at,
			u.created_at,
			u.updated_at,
			COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', '') AS name,
			u.raw_user_meta_data->>'avatar_url' AS image
		FROM auth.users u
		WHERE u.deleted_at IS NULL
			AND COALESCE(u.is_anonymous, false) = false
		ORDER BY u.created_at
	`);

	console.log(`Found ${users.length} users in Supabase auth.users`);

	let created = 0;
	let withPassword = 0;
	let skippedHashes = 0;

	for (const user of users) {
		if (!user.email) {
			console.warn(`  ! Skipping user ${user.id} — no email`);
			continue;
		}

		const inserted = await dst.query(
			`INSERT INTO users (id, name, email, email_verified, image, created_at, updated_at)
			 VALUES ($1, $2, lower($3), $4, $5, $6, $7)
			 ON CONFLICT DO NOTHING
			 RETURNING id`,
			[
				user.id,
				user.name,
				user.email,
				!!user.email_confirmed_at,
				user.image,
				user.created_at,
				user.updated_at
			]
		);
		if (inserted.rowCount) created++;

		// Credential account with the bcrypt hash (users keep their passwords)
		if (user.encrypted_password) {
			if (/^\$2[aby]\$/.test(user.encrypted_password)) {
				await dst.query(
					`INSERT INTO accounts (user_id, account_id, provider_id, password, created_at, updated_at)
					 VALUES ($1, $2, 'credential', $3, $4, $5)
					 ON CONFLICT DO NOTHING`,
					[user.id, user.id, user.encrypted_password, user.created_at, user.updated_at]
				);
				withPassword++;
			} else {
				skippedHashes++;
				console.warn(`  ! Non-bcrypt hash for ${user.email} — user will need a password reset`);
			}
		}
	}

	console.log(`Users inserted: ${created} (${users.length - created} already existed)`);
	console.log(`Credential accounts with bcrypt hash: ${withPassword}`);
	if (skippedHashes > 0) {
		console.warn(`Non-bcrypt hashes skipped: ${skippedHashes}`);
	}

	// OAuth identities -> accounts rows (Google sub becomes accountId)
	const { rows: identities } = await src.query(`
		SELECT i.user_id, i.provider, i.provider_id, i.created_at, i.updated_at
		FROM auth.identities i
		JOIN auth.users u ON u.id = i.user_id
		WHERE u.deleted_at IS NULL
			AND i.provider <> 'email'
	`);

	console.log(`\nFound ${identities.length} OAuth identities`);

	let googleAccounts = 0;
	for (const identity of identities) {
		if (identity.provider !== 'google') {
			console.warn(
				`  ! Unhandled provider "${identity.provider}" for user ${identity.user_id} — configure it in Better Auth if needed`
			);
			continue;
		}

		await dst.query(
			`INSERT INTO accounts (user_id, account_id, provider_id, created_at, updated_at)
			 VALUES ($1, $2, 'google', $3, $4)
			 ON CONFLICT DO NOTHING`,
			[identity.user_id, identity.provider_id, identity.created_at, identity.updated_at]
		);
		googleAccounts++;
	}

	console.log(`Google accounts linked: ${googleAccounts}`);
}

async function copyTable(src: Client, dst: Client, table: string): Promise<void> {
	const { rows } = await src.query(`SELECT * FROM public.${table}`);

	if (rows.length === 0) {
		console.log(`  ${table}: no rows`);
		return;
	}

	if (REPLACE_TABLES.has(table)) {
		await dst.query(`DELETE FROM ${table}`);
	}

	const columns = Object.keys(rows[0]);
	const columnList = columns.map((c) => `"${c}"`).join(', ');
	const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
	const insertSql = `INSERT INTO ${table} (${columnList}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;

	let inserted = 0;
	for (const row of rows) {
		const result = await dst.query(
			insertSql,
			columns.map((c) => row[c])
		);
		inserted += result.rowCount ?? 0;
	}

	console.log(`  ${table}: ${inserted}/${rows.length} rows copied`);
}

async function copyData(src: Client, dst: Client): Promise<void> {
	console.log('\n=== Copying public tables ===');
	for (const table of PUBLIC_TABLES) {
		await copyTable(src, dst, table);
	}
}

async function verify(src: Client, dst: Client): Promise<void> {
	console.log('\n=== Verifying row counts ===');

	const report: Array<{ table: string; supabase: number; neon: number; ok: boolean }> = [];

	const [{ rows: srcUsers }, { rows: dstUsers }] = await Promise.all([
		src.query('SELECT count(*)::int AS n FROM auth.users WHERE deleted_at IS NULL'),
		dst.query('SELECT count(*)::int AS n FROM users')
	]);
	report.push({
		table: 'auth.users -> users',
		supabase: srcUsers[0].n,
		neon: dstUsers[0].n,
		ok: srcUsers[0].n === dstUsers[0].n
	});

	for (const table of PUBLIC_TABLES) {
		const [{ rows: a }, { rows: b }] = await Promise.all([
			src.query(`SELECT count(*)::int AS n FROM public.${table}`),
			dst.query(`SELECT count(*)::int AS n FROM ${table}`)
		]);
		report.push({ table, supabase: a[0].n, neon: b[0].n, ok: a[0].n === b[0].n });
	}

	for (const row of report) {
		const marker = row.ok ? '✓' : '✗';
		console.log(
			`  ${marker} ${row.table.padEnd(32)} supabase=${String(row.supabase).padStart(5)}  neon=${String(row.neon).padStart(5)}`
		);
	}

	const failed = report.filter((r) => !r.ok);
	if (failed.length > 0) {
		console.warn(`\n${failed.length} table(s) differ — inspect before cutover.`);
	} else {
		console.log('\nAll row counts match.');
	}
}

async function main(): Promise<void> {
	const step = process.argv[2] || 'all';

	if (!['users', 'data', 'verify', 'all'].includes(step)) {
		console.error(`Unknown step "${step}". Use: users | data | verify | all`);
		process.exit(1);
	}

	const src = new Client({ connectionString: SUPABASE_DB_URL });
	const dst = new Client({ connectionString: NEON_DB_URL });

	await src.connect();
	await dst.connect();

	try {
		if (step === 'users' || step === 'all') await importUsers(src, dst);
		if (step === 'data' || step === 'all') await copyData(src, dst);
		if (step === 'verify' || step === 'all') await verify(src, dst);
	} finally {
		await src.end();
		await dst.end();
	}
}

main().catch((err) => {
	console.error('\n❌ Migration failed:', err);
	process.exit(1);
});
