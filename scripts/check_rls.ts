import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
    console.log('--- Checking RLS and Constraints ---');
    
    // Check if RLS is enabled on users table
    const { data: rls, error: rlsErr } = await supabase.rpc('get_table_rls_status');
    if (rlsErr) {
        // Fallback: check via standard query if RPC doesn't exist
        console.log('RPC get_table_rls_status not found, checking via direct SQL if possible or assuming RLS might be on.');
    } else {
        console.log('RLS:', rls);
    }
    
    // Check users table content again
    const { data: users } = await supabase.from('users').select('*');
    console.log(`Users in DB: ${users?.length}`);
    users?.forEach(u => console.log(`- ${u.email} | id=${u.id} | auth_id=${u.auth_id}`));
}

run();
