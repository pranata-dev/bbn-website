import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { week4Questions } from '../src/lib/data/week4';
import { week5Questions } from '../src/lib/data/week5';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase URL or Key not found in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedWeek(weekName: string, category: string, questions: any[]) {
    console.log(`\n--- SEEDING ${weekName} (SUPABASE JS) ---`);
    console.log(`Processing ${questions.length} questions for ${category}...`);

    let inserted = 0;
    let skipped = 0;

    for (const q of questions) {
        const text = q.text.trim();
        const { data: existing, error: checkErr } = await supabase
            .from('questions')
            .select('id')
            .eq('text', text)
            .limit(1);

        if (checkErr) {
            console.error(`Error checking question: ${checkErr.message}`);
            continue;
        }

        if (existing && existing.length > 0) {
            skipped++;
            continue;
        }

        const id = uuidv4();
        const now = new Date().toISOString();

        const payload = {
            id: id,
            text: text,
            category: category,
            option_a: (q.option_a || '').trim(),
            option_b: (q.option_b || '').trim(),
            option_c: (q.option_c || '').trim(),
            option_d: (q.option_d || '').trim(),
            option_e: (q.option_e || '').trim() || null,
            correct_answer: (q.correct_answer || '').trim().toUpperCase(),
            explanation: q.explanation?.trim() || null,
            weight: q.weight || 1,
            created_at: now,
            updated_at: now,
        };

        const { error: insertErr } = await supabase
            .from('questions')
            .insert(payload);

        if (insertErr) {
            console.error(`Error inserting question: ${insertErr.message}`);
        } else {
            inserted++;
        }
    }

    console.log(`Results: ${inserted} inserted, ${skipped} skipped.`);

    console.log(`Checking Tryout for ${category}...`);
    const { data: tryouts, error: trErr } = await supabase
        .from('tryouts')
        .select('id')
        .eq('category', category)
        .eq('is_practice', true)
        .limit(1);

    let tryoutId: string;
    if (tryouts && tryouts.length > 0) {
        tryoutId = tryouts[0].id;
        console.log(`Tryout exists: ${tryoutId}`);
    } else {
        tryoutId = uuidv4();
        const now = new Date().toISOString();
        const { error: trInsertErr } = await supabase
            .from('tryouts')
            .insert({
                id: tryoutId,
                title: `Latihan Soal ${weekName}`,
                category: category,
                is_practice: true,
                status: 'ACTIVE',
                duration: 60,
                max_attempts: 999,
                created_at: now,
                updated_at: now
            });
            
        if (trInsertErr) {
            console.error(`Error creating tryout: ${trInsertErr.message}`);
            return;
        }
        console.log(`Created Tryout: ${tryoutId}`);
    }

    console.log('Linking questions to tryout...');
    const { data: allW, error: fetchErr } = await supabase
        .from('questions')
        .select('id')
        .eq('category', category);

    if (fetchErr) {
        console.error(`Error fetching ${category} questions: ${fetchErr.message}`);
    } else if (allW) {
        for (let i = 0; i < allW.length; i++) {
            const qid = allW[i].id;
            
            const { data: linkedCheck } = await supabase
                .from('tryout_questions')
                .select('id')
                .eq('tryout_id', tryoutId)
                .eq('question_id', qid)
                .limit(1);
                
            if (!linkedCheck || linkedCheck.length === 0) {
                await supabase.from('tryout_questions').insert({
                    id: uuidv4(),
                    tryout_id: tryoutId,
                    question_id: qid,
                    order: i
                });
            }
        }
        console.log('Linking complete.');
    }
}

async function run() {
    await seedWeek('WEEK 4', 'WEEK_4', week4Questions);
    await seedWeek('WEEK 5', 'WEEK_5', week5Questions);
    console.log('\n✅ ALL DONE');
}

run().catch(console.error);
