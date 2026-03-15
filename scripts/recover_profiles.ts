import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

async function recoverUsers() {
  console.log('--- Starting Profile Recovery ---');
  
  const { data: { users: authUsers }, error: authErr } = await supabase.auth.admin.listUsers();
  if (authErr) {
    console.error('Error listing auth users:', authErr);
    return;
  }

  console.log(`Found ${authUsers.length} users in Supabase Auth.`);
  for (const u of authUsers) {
    console.log(`- Auth User: ${u.email} (${u.id})`);
  }

  for (const authUser of authUsers) {
    const email = authUser.email;
    const authId = authUser.id;
    
    console.log(`\nProcessing: ${email} (${authId})`);
    
    // 1. Find registration info
    const { data: reg } = await supabase
      .from('registrations')
      .select('*, uts_package_details(*)')
      .eq('email', email)
      .maybeSingle();

    let name = email?.split('@')[0] || 'User';
    let isActive = false;
    
    if (reg) {
        name = reg.name;
        isActive = reg.status === 'APPROVED';
        console.log(`Found registration: ${reg.status}, subject: ${reg.subject}`);
    } else {
        // Special case for admin if no registration exists
        if (email === process.env.ADMIN_EMAIL || email?.includes('admin')) {
            name = 'Administrator';
            isActive = true;
            console.log('Marked as Admin');
        }
    }

    // 2. Insert into public.users
    const userId = uuidv4();
    const { error: userErr } = await supabase
      .from('users')
      .insert({
        id: userId,
        auth_id: authId,
        email: email,
        name: name,
        is_active: isActive,
        updated_at: new Date().toISOString()
      });

    if (userErr) {
      console.error(`Error inserting user ${email}:`, userErr.message);
      continue;
    }
    console.log(`Created profile in public.users (id: ${userId})`);

    // 3. Provision Access if applicable
    if (reg && reg.status === 'APPROVED') {
        const subject = reg.subject.includes('FISDAS2') ? 'FISDAS2' : 'FISMAT';
        
        let role = 'UTS_FLUX';
        let packageType = 'FLUX';
        
        const pkgDetails = reg.uts_package_details?.[0];
        if (pkgDetails) {
            packageType = pkgDetails.package_type.toUpperCase();
            role = `UTS_${packageType}`;
        }

        const { error: accessErr } = await supabase
          .from('user_subject_access')
          .upsert({
            user_id: userId,
            subject: subject,
            role: role,
            package_type: packageType,
            is_active: true,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id,subject' });

        if (accessErr) {
            console.error(`Error provisioning access for ${email}:`, accessErr.message);
        } else {
            console.log(`Provisioned ${subject} access with role ${role}`);
        }
    }
  }
  
  console.log('\n--- Recovery Complete ---');
}

recoverUsers();
