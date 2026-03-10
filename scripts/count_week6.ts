import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { count, error } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('category', 'WEEK_6');

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log(`Total WEEK_6 questions in database: ${count}`);
    }
    
    // Also get tryout question count
    const { data: tryouts } = await supabase
        .from('tryouts')
        .select('id')
        .eq('category', 'WEEK_6')
        .eq('is_practice', true)
        .limit(1);
    
    if (tryouts && tryouts.length > 0) {
        const { count: linkedCount } = await supabase
            .from('tryout_questions')
            .select('*', { count: 'exact', head: true })
            .eq('tryout_id', tryouts[0].id);
        console.log(`Questions linked to Week 6 tryout: ${linkedCount}`);
    }
}

main().catch(console.error);
