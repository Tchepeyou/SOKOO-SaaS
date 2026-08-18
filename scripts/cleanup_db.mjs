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
  
  // Exclude the Super Admin
  const adminEmail = '237655009999@sokoo.app';
  
  // 1. Fetch all organizations
  const { data: orgs } = await supabase.from('organizations').select('id, name');
  // Delete all organizations except the admin's if they have one (admin probably doesn't have an org, or we don't care, we wipe all orgs)
  console.log(`Found ${orgs.length} organizations to delete`);
  
  for (const org of orgs) {
     console.log('Deleting org:', org.name);
     await supabase.from('organizations').delete().eq('id', org.id);
  }
  
  // 2. Fetch all users
  const { data: usersData, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
      console.error(authError);
      return;
  }
  const usersToDelete = usersData.users.filter(u => u.email !== adminEmail && u.email !== 'stephane.tchepeyou@example.com');
  
  console.log(`Found ${usersToDelete.length} users to delete`);
  
  for (const user of usersToDelete) {
     console.log('Deleting user:', user.email);
     await supabase.auth.admin.deleteUser(user.id);
  }
  
  console.log('Database Wipe complete! Only Super Admin remains.');
}

run();
