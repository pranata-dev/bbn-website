import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { week2Questions } from './data/week2';
import { week3Questions } from './data/week3';
import { week4Questions } from './data/week4';
import { week5Questions } from './data/week5';
import { week6Questions } from './data/week6';
import { week7Questions } from './data/week7';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase URL or Key not found in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface QuestionData {
    text: string;
    category: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    option_e?: string;
    correct_answer: string;
    explanation: string;
    weight: number;
}

const ALL_DATA: Record<string, QuestionData[]> = {
    'WEEK_2': week2Questions,
    'WEEK_3': week3Questions,
    'WEEK_4': week4Questions,
    'WEEK_5': week5Questions,
    'WEEK_6': week6Questions,
    'WEEK_7': week7Questions,
};

async function run() {
    console.log('--- REORGANIZING PRACTICE QUESTIONS (WEEKS 2-7) ---');

    for (const weekKey of ['WEEK_2', 'WEEK_3', 'WEEK_4', 'WEEK_5', 'WEEK_6', 'WEEK_7']) {
        console.log(`\nProcessing ${weekKey}...`);
        
        // 1. Ensure all questions for this week exist in the 'questions' table
        const sourceQuestions = ALL_DATA[weekKey];
        console.log(`Source has ${sourceQuestions.length} questions.`);
        
        for (const q of sourceQuestions) {
            const { data: existing } = await supabase
                .from('questions')
                .select('id')
                .eq('text', q.text.trim())
                .eq('category', weekKey)
                .limit(1);
                
            if (!existing || existing.length === 0) {
                const id = uuidv4();
                const now = new Date().toISOString();
                await supabase.from('questions').insert({
                    id: id,
                    text: q.text.trim(),
                    category: weekKey,
                    option_a: q.option_a.trim(),
                    option_b: q.option_b.trim(),
                    option_c: q.option_c.trim(),
                    option_d: q.option_d.trim(),
                    option_e: q.option_e?.trim() || null,
                    correct_answer: q.correct_answer.trim().toUpperCase(),
                    explanation: q.explanation.trim(),
                    weight: q.weight || 1,
                    created_at: now,
                    updated_at: now
                });
            }
        }

        // 2. Fetch all current question IDs for this week from DB
        const { data: dbQuestions } = await supabase
            .from('questions')
            .select('id, text')
            .eq('category', weekKey);
            
        if (!dbQuestions) continue;
        console.log(`DB has ${dbQuestions.length} questions for ${weekKey}.`);

        // 3. Delete existing practice tryouts and their question links for this week
        const { data: existingTryouts } = await supabase
            .from('tryouts')
            .select('id')
            .eq('category', weekKey)
            .eq('is_practice', true);
            
        if (existingTryouts && existingTryouts.length > 0) {
            const tIds = existingTryouts.map(t => t.id);
            await supabase.from('tryout_questions').delete().in('tryout_id', tIds);
            await supabase.from('tryouts').delete().in('id', tIds);
            console.log(`Deleted ${existingTryouts.length} old practice tryouts.`);
        }

        // 4. Split and Create new Parts
        const questionsPerPart = 20;
        const totalQuestions = dbQuestions.length;
        const numParts = Math.floor(totalQuestions / questionsPerPart);
        
        for (let i = 0; i < numParts; i++) {
            const partNum = i + 1;
            const startIdx = i * questionsPerPart;
            // Last part takes all remaining
            const endIdx = (i === numParts - 1) ? totalQuestions : (i + 1) * questionsPerPart;
            const partQuestions = dbQuestions.slice(startIdx, endIdx);
            
            const tryoutId = uuidv4();
            const now = new Date().toISOString();
            const weekNum = weekKey.split('_')[1];
            
            console.log(`Creating Part ${partNum} with ${partQuestions.length} questions...`);
            
            await supabase.from('tryouts').insert({
                id: tryoutId,
                title: `Latihan Soal Week ${weekNum} - Part ${partNum}`,
                category: weekKey,
                is_practice: true,
                status: 'ACTIVE',
                duration: 60,
                max_attempts: 999,
                created_at: now,
                updated_at: now
            });
            
            for (let j = 0; j < partQuestions.length; j++) {
                await supabase.from('tryout_questions').insert({
                    id: uuidv4(),
                    tryout_id: tryoutId,
                    question_id: partQuestions[j].id,
                    order: j
                });
            }
        }
    }

    console.log('\n✅ REORGANIZATION COMPLETE');
}

run().catch(console.error);
