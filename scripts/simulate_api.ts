import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
    console.log('--- Simulating /api/admin/users GET ---');
    
    // This is what the API does
    const { data: users, error } = await supabase
        .from("users")
        .select("*, subject_access:user_subject_access(*)") // Use the explicit table name for join
        .order("created_at", { ascending: false });

    if (error) {
        console.error('API Simulation Error:', error);
    } else {
        console.log(`API returned ${users?.length} users.`);
        users?.forEach(u => {
            console.log(`- ${u.email} | SubjectAccess count: ${u.subject_access?.length}`);
            u.subject_access?.forEach((a: any) => console.log(`  - ${a.subject}: ${a.role}`));
        });
    }
}

run();
