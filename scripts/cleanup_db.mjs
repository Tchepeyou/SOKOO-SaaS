import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

async function run() {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  const env = Object.fromEntries(
    envFile.split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#') && line.includes('='))
    .map(line => {
      const idx = line.indexOf('=');
      return [line.slice(0, idx).trim(), line.slice(idx + 1).replace(/\"/g, '').trim()];
    })
  );
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  
  // 1. Fetch all organizations
  const { data: orgs } = await supabase.from('organizations').select('id, name');
  const orgsToDelete = orgs.filter(o => o.name.includes('Test') || o.name.includes('Expired') || o.name.includes('+237'));
  
  console.log(`Found ${orgsToDelete.length} test organizations to delete`);
  
  for (const org of orgsToDelete) {
     console.log('Deleting org:', org.name);
     await supabase.from('organizations').delete().eq('id', org.id);
  }
  
  // 2. Fetch users starting with our test emails or pseudo emails
  const { data: usersData, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
      console.error(authError);
      return;
  }
  const usersToDelete = usersData.users.filter(u => 
      u.email.includes('exp_') || 
      u.email.includes('@ex.com') ||
      u.email.includes('237655')
  );
  
  console.log(`Found ${usersToDelete.length} test users to delete`);
  
  for (const user of usersToDelete) {
     console.log('Deleting user:', user.email);
     await supabase.auth.admin.deleteUser(user.id);
  }
  
  console.log('Cleanup complete!');
}

run();
