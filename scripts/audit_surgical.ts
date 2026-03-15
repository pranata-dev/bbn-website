import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
    let log = '';
    const addLog = (msg: string) => { console.log(msg); log += msg + '\n'; };

    addLog('=== SURGICAL AUDIT ===');
    
    // Auth
    const { data: { users: authUsers } } = await supabase.auth.admin.listUsers();
    addLog(`Auth Users Count: ${authUsers.length}`);
    for (const au of authUsers) {
        addLog(`AUTH: ${au.email} | ${au.id}`);
    }

    // Public Users
    const { data: users } = await supabase.from('users').select('*');
    addLog(`Public Users Count: ${users?.length}`);
    for (const u of users || []) {
        addLog(`USER: ${u.email} | ${u.id} | AuthID: ${u.auth_id}`);
    }

    // Access
    const { data: access } = await supabase.from('user_subject_access').select('*');
    addLog(`Access Count: ${access?.length}`);
    for (const a of access || []) {
        addLog(`ACCESS: user_id=${a.user_id} | subject=${a.subject} | role=${a.role}`);
    }

    fs.writeFileSync('audit_surgical.txt', log);
}

run();
