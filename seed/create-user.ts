import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
	console.error('Missing environment variables: PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY');
	process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
	auth: { persistSession: false }
});

async function createUser() {
	const email = 'test@test.com';
	const password = 'test123';

	console.log(`Creating user: ${email}`);

	const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
		email,
		password,
		email_confirm: true
	});

	if (createError) {
		console.error('Error creating user:', createError.message);
		process.exit(1);
	}

	if (!user) {
		console.error('User creation returned null');
		process.exit(1);
	}

	console.log('✓ User created in auth');

	const { error: updateError } = await supabase
		.from('profiles')
		.update({
			is_member: true,
			is_admin: false,
			member_since: new Date().toISOString()
		})
		.eq('id', user.id);

	if (updateError) {
		console.error('Error updating profile:', updateError.message);
		process.exit(1);
	}

	console.log('✓ Profile updated with member access');
	console.log('\nUser created successfully:');
	console.log(`  Email: ${email}`);
	console.log(`  Password: ${password}`);
	console.log(`  is_member: true`);
	console.log(`  is_admin: false`);
}

createUser().catch(console.error);
