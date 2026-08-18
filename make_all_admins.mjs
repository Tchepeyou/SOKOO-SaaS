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
  console.log("Fetching all users...");
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error("Error fetching users:", error);
    return;
  }
  
  console.log(`Found ${users.length} users. Making them admins...`);
  
  for (const user of users) {
    const { error: insertError } = await supabase
      .from('platform_admins')
      .upsert({ id: user.id, email: user.email || user.phone || 'unknown@sokoo.app' }, { onConflict: 'id' });
      
    if (insertError) {
      console.error(`Failed to make ${user.email || user.phone} admin:`, insertError);
    } else {
      console.log(`Made ${user.email || user.phone} (${user.id}) an admin!`);
    }
  }
  console.log("Done!");
}

run();
