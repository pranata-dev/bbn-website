import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
    console.log('--- Final Check ---');
    const { data: users } = await supabase.from('users').select('email, id, auth_id');
    const { data: access } = await supabase.from('user_subject_access').select('user_id, subject, role');
    
    let report = `Final Users Count: ${users?.length}\n`;
    users?.forEach(u => {
        report += `- ${u.email} | id=${u.id} | authId=${u.auth_id}\n`;
    });
    
    report += `\nFinal Access Count: ${access?.length}\n`;
    access?.forEach(a => {
        const email = users?.find(u => u.id === a.user_id)?.email || 'Unknown';
        report += `- ${email}: ${a.subject} | ${a.role}\n`;
    });

    fs.writeFileSync('final_check_report.txt', report);
    console.log('Report written to final_check_report.txt');
}

run();
