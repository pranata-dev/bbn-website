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
        id: uuidv4(),
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

async function seedWeek(weekName: string, rawQuestions: any[]) {
  console.log(`\n🚀 Seeding ${weekName}...`);
  
  if (!rawQuestions || rawQuestions.length === 0) {
    console.log(`⚠️ No questions found for ${weekName}. Skipping.`);
    return;
  }

  // Normalize and validate
  const normalized = rawQuestions.map(normalize);
  const valid = normalized.filter(q => {
      if (!q.text) return false;
      if (!q.category) return false;
      if (!q.option_a) return false;
      if (!q.option_b) return false;
      if (!q.option_c) return false;
      if (!q.option_d) return false;
      if (!['A','B','C','D','E'].includes(q.correct_answer)) return false;
      return true;
  });

  // Deduplicate by text
  const unique = Array.from(new Map(valid.map(q => [q.text, q])).values());
  
  console.log(`📊 Found ${rawQuestions.length} raw, ${valid.length} valid, ${unique.length} unique.`);

  if (unique.length === 0) {
      console.log('⚠️ No valid unique questions to seed.');
      return;
  }

  const { data, error } = await supabase
    .from('questions')
    .upsert(unique, { onConflict: 'text' })
    .select();

  if (error) {
    console.error(`❌ Error seeding ${weekName}:`, error.message);
  } else {
    console.log(`✅ Successfully seeded/updated ${unique.length} questions for ${weekName}.`);
  }
}

async function main() {
  console.log('🏁 Starting Modular Seeding Process...');

  await seedWeek('Week 1', week1Questions);
  await seedWeek('Week 6', week6Questions);
  await seedWeek('Week 7', week7Questions);

  console.log('\n✨ Seeding completed!');
  
  // Verify final counts
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
