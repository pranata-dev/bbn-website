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

async function run() {
    console.log('--- CLEARING WEEK 7 QUESTIONS ---');
    
    // 1. Get all WEEK_7 questions
    const { data: questions, error: fetchErr } = await supabase
        .from('questions')
        .select('id')
        .eq('category', 'WEEK_7');

    if (fetchErr) {
        console.error(`Error fetching questions: ${fetchErr.message}`);
        process.exit(1);
    }

    if (!questions || questions.length === 0) {
        console.log('No WEEK_7 questions found.');
        return;
    }

    const ids = questions.map(q => q.id);
    console.log(`Found ${ids.length} questions to delete.`);

    // 2. Delete linked tryout questions first
    const { error: delLinkErr } = await supabase
        .from('tryout_questions')
        .delete()
        .in('question_id', ids);

    if (delLinkErr) {
        console.error(`Error deleting links: ${delLinkErr.message}`);
        // Continue anyway
    }

    // 3. Delete from questions table
    const { error: delErr } = await supabase
        .from('questions')
        .delete()
        .in('id', ids);

    if (delErr) {
        console.error(`Error deleting questions: ${delErr.message}`);
        process.exit(1);
    }

    console.log('✅ Successfully cleared WEEK_7 questions.');
}

run().catch(console.error);
