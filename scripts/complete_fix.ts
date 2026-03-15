import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
    console.log('=== STARTING COMPLETE DATA FIX ===');

    // 1. Fetch all Auth users
    const { data: { users: authUsers }, error: authErr } = await supabase.auth.admin.listUsers();
    if (authErr) {
        console.error('Auth Error:', authErr);
        return;
    }
    console.log(`Found ${authUsers.length} Auth users.`);

    for (const au of authUsers) {
        console.log(`\nProcessing: ${au.email} (${au.id})`);

        // Check if profile exists
        const { data: existing } = await supabase.from('users').select('*').eq('auth_id', au.id).maybeSingle();
        
        let userId: string;
        if (existing) {
            console.log(`Profile already exists: ${existing.id}`);
            userId = existing.id;
        } else {
            userId = uuidv4();
            console.log(`Creating new profile: ${userId}`);
            
            // Get name from registration or email
            const { data: reg } = await supabase.from('registrations').select('*').eq('email', au.email).maybeSingle();
            const name = reg?.name || au.email?.split('@')[0] || 'User';

            const { error: insertErr } = await supabase.from('users').insert({
                id: userId,
                auth_id: au.id,
                email: au.email,
                name: name,
                is_active: true, // Auto-activate for recovery
                updated_at: new Date().toISOString()
            });

            if (insertErr) {
                console.error(`Insert Error for ${au.email}:`, insertErr.message);
                continue;
            }
            console.log(`Profile created successfully.`);
        }

        // 2. Ensure Subject Access
        const { data: reg } = await supabase.from('registrations').select('*, uts_package_details(*)').eq('email', au.email).maybeSingle();
        if (reg) {
            console.log(`Register found: ${reg.status}. Subject: ${reg.subject}`);
            
            // Only provision if approved or if it's test2/test1
            if (reg.status === 'APPROVED' || au.email?.includes('test')) {
                const regSubject = reg.subject.toUpperCase();
                const subject = (regSubject.includes('FISDAS2') || regSubject.includes('FISIKA-DASAR-2') || regSubject.includes('FISIKA DASAR 2')) 
                    ? 'FISDAS2' 
                    : 'FISMAT';
                
                let role = 'UTS_FLUX';
                let packageType = 'FLUX';
                const pkgDetails = reg.uts_package_details?.[0];
                if (pkgDetails) {
                    packageType = pkgDetails.package_type.toUpperCase();
                    role = `UTS_${packageType}`;
                }

                console.log(`Provisioning access: subject=${subject}, role=${role}`);

                const { error: accessErr } = await supabase.from('user_subject_access').upsert({
                    user_id: userId,
                    subject,
                    role,
                    package_type: packageType,
                    is_active: true,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id,subject' });

                if (accessErr) {
                    console.error(`Access Error for ${au.email}:`, accessErr.message);
                } else {
                    console.log(`Access provisioned.`);
                }
            }
        }
    }

    // 3. SPECIAL: Admin Profile (natanajwa)
    // If the admin username is natanajwa, let's make sure it's in the users table too
    // even though it might not have an auth_id (since they login via custom token)
    // OR, if they use Supabase Auth, they'll be processed above.
    
    console.log('\n=== FIX COMPLETE ===');
    
    // Final verify
    const { data: finalUsers } = await supabase.from('users').select('id, email');
    console.log(`Final Users Count: ${finalUsers?.length}`);
}

run();
