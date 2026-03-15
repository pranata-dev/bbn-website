import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

async function run() {
    console.log('=== DB AUDIT START ===');
    
    // 1. Auth Users
    const { data: { users: authUsers } } = await supabase.auth.admin.listUsers();
    console.log(`AUTH_USERS_COUNT: ${authUsers.length}`);
    for (const au of authUsers) {
        console.log(`AUTH: email=${au.email} | id=${au.id}`);
    }

    // 2. Public.Users
    const { data: publicUsers } = await supabase.from('users').select('*');
    console.log(`PUBLIC_USERS_COUNT: ${publicUsers?.length}`);
    for (const pu of publicUsers || []) {
        console.log(`USER: email=${pu.email} | auth_id=${pu.auth_id} | id=${pu.id}`);
    }

    // 3. Subject Access
    const { data: access } = await supabase.from('user_subject_access').select('*');
    console.log(`ACCESS_COUNT: ${access?.length}`);
    for (const acc of access || []) {
        console.log(`ACCESS: user_id=${acc.user_id} | subject=${acc.subject} | role=${acc.role}`);
    }

    // 4. Registrations (last 5)
    const { data: regs } = await supabase.from('registrations').select('*').order('created_at', { ascending: false }).limit(5);
    console.log(`RECENT_REGS_COUNT: ${regs?.length}`);
    for (const r of regs || []) {
        console.log(`REG: email=${r.email} | status=${r.status} | subject=${r.subject}`);
    }

    console.log('=== DB AUDIT END ===');
}

run();
