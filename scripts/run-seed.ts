import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { week1Questions } from './data/week1';
import { week6Questions } from './data/week6';
import { week7Questions } from './data/week7';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface RawQuestion {
    text: string;
    category: string;
    option_a?: string;
    optionA?: string;
    option_b?: string;
    optionB?: string;
    option_c?: string;
    optionC?: string;
    option_d?: string;
    optionD?: string;
    option_e?: string;
    optionE?: string;
    correct_answer?: string;
    correctAnswer?: string;
    explanation?: string;
    weight?: number;
}

function normalize(q: RawQuestion) {
    return {
        text: q.text?.trim() || '',
        category: q.category?.trim() || '',
        option_a: (q.option_a || q.optionA || '').trim(),
        option_b: (q.option_b || q.optionB || '').trim(),
        option_c: (q.option_c || q.optionC || '').trim(),
        option_d: (q.option_d || q.optionD || '').trim(),
        option_e: (q.option_e || q.optionE || '').trim() || null,
        correct_answer: (q.correct_answer || q.correctAnswer || '').trim().toUpperCase(),
        explanation: q.explanation?.trim() || null,
        weight: q.weight || 1
    };
}

async function seedWeek(weekName: string, rawQuestions: any[], existingMap: Map<string, any>) {
  console.log(`\n🚀 Processing ${weekName}...`);
  
  if (!rawQuestions || rawQuestions.length === 0) {
    console.log(`⚠️ No questions found for ${weekName}. Skipping.`);
    return;
  }

  // Deduplicate within the raw data first
  const normalizedRaw = rawQuestions.map(normalize);
  const uniqueInFile = Array.from(new Map(normalizedRaw.map(q => [q.text, q])).values());

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const q of uniqueInFile) {
      if (!q.text || !q.category || !q.option_a || !q.correct_answer) {
          skipped++;
          continue;
      }

      if (existingMap.has(q.text)) {
          const existing = existingMap.get(q.text)!;
          // Only update if category or something essential changed
          if (existing.category !== q.category) {
              const { error } = await supabase.from('questions').update(q).eq('id', existing.id);
              if (error) {
                  console.error(`❌ Failed to update [${existing.id}]:`, error.message);
                  failed++;
              } else {
                  updated++;
              }
          } else {
              skipped++;
          }
      } else {
          // Insert new record, manually providing ID since DB default is missing/not working
          const newId = uuidv4();
          const { error } = await supabase.from('questions').insert({
              ...q,
              id: newId
          });
          if (error) {
              console.error(`❌ Failed to insert:`, error.message);
              failed++;
          } else {
              if (inserted === 0) console.log(`   First insert ID: ${newId}`);
              inserted++;
          }
      }
  }

  console.log(`✅ Results for ${weekName}: ${inserted} inserted, ${updated} updated, ${skipped} skipped, ${failed} failed.`);
}

async function main() {
  console.log('🏁 Starting Manual Deduplication Seeding Process...');

  // 1. Fetch all existing questions to create a lookup map
  console.log('🔍 Fetching existing data for lookup...');
  const { data: existing, error } = await supabase.from('questions').select('id, text, category');
  if (error) {
      console.error('❌ Failed to fetch existing records:', error.message);
      process.exit(1);
  }
  const existingMap = new Map(existing.map(q => [q.text.trim(), q]));
  console.log(`📊 Found ${existing.length} existing records.`);

  // 2. Process each week
  await seedWeek('Week 1', week1Questions, existingMap);
  await seedWeek('Week 6', week6Questions, existingMap);
  await seedWeek('Week 7', week7Questions, existingMap);

  console.log('\n✨ Seeding completed!');
  
  // 3. Verify final counts
  const { data: finalData, error: finalError } = await supabase.from('questions').select('category');
  if (finalData) {
      const stats = finalData.reduce((acc: any, curr: any) => {
          acc[curr.category] = (acc[curr.category] || 0) + 1;
          return acc;
      }, {});
      console.log('Final Category Counts:', stats);
  }
}

main().catch(err => {
  console.error('💥 Fatal error during seeding:', err);
  process.exit(1);
});
