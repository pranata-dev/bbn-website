import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

async function run() {
  const { data: { users } } = await supabase.auth.admin.listUsers();
  console.log('AUTH_USERS_START');
  users.forEach(u => console.log(`${u.email}|${u.id}`));
  console.log('AUTH_USERS_END');
}

run();
