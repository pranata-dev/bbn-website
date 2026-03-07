import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
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

async function seedWeek(weekName: string, questions: any[]) {
  console.log(`\n🚀 Seeding ${weekName}...`);
  
  if (questions.length === 0) {
    console.log(`⚠️ No questions found for ${weekName}. Skipping.`);
    return;
  }

  // Deduplicate questions by text
  const uniqueQuestions = Array.from(new Map(questions.map(q => [q.text, q])).values());
  console.log(`📊 Found ${questions.length} questions, ${uniqueQuestions.length} unique.`);

  const { data, error } = await supabase
    .from('questions')
    .insert(uniqueQuestions);

  if (error) {
    console.error(`❌ Error bulk seeding ${weekName}:`, error.message);
    console.log('🔄 Attempting individual insertion to find the exact record...');
    for (let i = 0; i < uniqueQuestions.length; i++) {
        const q = uniqueQuestions[i];
        const { error: indError } = await supabase.from('questions').insert(q);
        if (indError) {
            console.error(`[!] Failed at index ${i}:`, indError.message);
            console.log('Record content:', JSON.stringify(q).substring(0, 200) + '...');
        }
    }
  } else {
    console.log(`✅ Successfully seeded ${uniqueQuestions.length} questions for ${weekName}.`);
  }
}

async function main() {
  console.log('🏁 Starting Modular Seeding Process...');

  await seedWeek('Week 1', week1Questions);
  await seedWeek('Week 6', week6Questions);
  await seedWeek('Week 7', week7Questions);

  console.log('\n✨ Seeding completed!');
}

main().catch(err => {
  console.error('💥 Fatal error during seeding:', err);
  process.exit(1);
});
