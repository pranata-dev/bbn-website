import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

async function run() {
    console.log('--- Checking DB state ---');
    const { data: users, error: userError } = await supabase.from('users').select('*');
    if (userError) {
        console.error('Error fetching users:', userError);
    } else {
        console.log('USERS_COUNT:', users?.length);
        if (users && users.length > 0) {
            console.log('First user:', users[0].email);
        }
    }

    const { data: access, error: accessError } = await supabase.from('user_subject_access').select('*');
    if (accessError) {
        console.error('Error fetching access:', accessError);
    } else {
        console.log('ACCESS_COUNT:', access?.length);
    }
}

run();
