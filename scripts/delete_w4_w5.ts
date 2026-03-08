import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase URL or Key not found in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function purgeAll() {
    console.log("Purging WEEK_4 and WEEK_5 tryouts and questions...");
    
    // 1. Fetch tryouts
    const { data: tryouts } = await supabase.from('tryouts').select('id').in('category', ['WEEK_4', 'WEEK_5']);
    const tIds = tryouts?.map(t => t.id) || [];
    
    // 2. Delete tryout questions linked
    if (tIds.length > 0) {
        await supabase.from('tryout_questions').delete().in('tryout_id', tIds);
        console.log(`Deleted tryout_questions for ${tIds.length} tryouts`);
        
        await supabase.from('tryouts').delete().in('id', tIds);
        console.log(`Deleted ${tIds.length} tryouts`);
    }

    // 3. Delete questions
    const { error: qErr } = await supabase.from('questions').delete().in('category', ['WEEK_4', 'WEEK_5']);
    if (qErr) {
        console.error("Error deleting questions:", qErr.message);
    } else {
        console.log("Deleted all WEEK_4 and WEEK_5 questions.");
    }
}

purgeAll().then(() => console.log("Done")).catch(console.error);
