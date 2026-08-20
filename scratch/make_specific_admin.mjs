import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
let supabaseUrl = '';
let serviceRoleKey = '';

envFile.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) serviceRoleKey = line.split('=')[1].trim();
});

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  const userId = 'a7b13d4d-6abf-4cb0-81ab-22f44d2cd702';
  const email = '237682147395@sokoo.app';
  
  const { error: insertError } = await supabase
    .from('platform_admins')
    .upsert({ id: userId, email: email }, { onConflict: 'id' });
    
  if (insertError) {
    console.error('Error inserting user to admins:', insertError);
  } else {
    console.log('Successfully made user an admin!');
  }
}

run();
