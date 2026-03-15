import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminUsername = process.env.ADMIN_USERNAME;
const adminEmail = process.env.ADMIN_EMAIL;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// Initialize Supabase Admin Client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function clearTestUsers() {
  console.log('🚀 Starting cleanup of test users...');
  console.log('🔍 Fetching users from Supabase Auth...');
  
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error('❌ Failed to fetch users:', error.message);
    process.exit(1);
  }

  console.log(`📊 Found ${users.length} users in total.`);
  
  let deletedCount = 0;
  let skippedCount = 0;

  for (const user of users) {
    const email = user.email || '';
    
    // Protection logic
    const isExplicitAdmin = (adminEmail && email === adminEmail) || (adminUsername && email === adminUsername);
    const containsAdmin = email.toLowerCase().includes('admin');
    
    if (isExplicitAdmin || containsAdmin) {
      console.log(`⏭️  SKIPPING protected admin user: ${email}`);
      skippedCount++;
      continue;
    }

    // Delete the user from Supabase Auth
    // This will cascade to delete data in the public schema if correctly foreign-keyed to auth.users
    console.log(`🗑️  Deleting test user: ${email} (${user.id})...`);
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    
    if (deleteError) {
      console.error(`❌ Failed to delete user ${email}:`, deleteError.message);
    } else {
      deletedCount++;
    }
  }

  console.log(`\n✨ Cleanup completed!`);
  console.log(`✅ Users deleted: ${deletedCount}`);
  console.log(`⏭️  Users skipped (protected): ${skippedCount}`);
}

clearTestUsers().catch(err => {
  console.error('💥 Fatal error during cleanup:', err);
  process.exit(1);
});
