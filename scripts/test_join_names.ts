import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
    console.log('--- Testing join names ---');
    
    // Test 1: subject_access
    const { data: d1, error: e1 } = await supabase.from('users').select('*, subject_access(*)').limit(1);
    console.log('Test subject_access:', e1 ? e1.message : 'SUCCESS');

    // Test 2: user_subject_access
    const { data: d2, error: e2 } = await supabase.from('users').select('*, user_subject_access(*)').limit(1);
    console.log('Test user_subject_access:', e2 ? e2.message : 'SUCCESS');

    // Test 3: subjectAccess (Prisma name)
    const { data: d3, error: e3 } = await supabase.from('users').select('*, subjectAccess(*)').limit(1);
    console.log('Test subjectAccess:', e3 ? e3.message : 'SUCCESS');
}

run();
