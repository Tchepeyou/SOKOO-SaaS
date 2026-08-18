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
  
  const ownerPhone = '655009999';
  const ownerEmail = '237' + ownerPhone + '@sokoo.app';
  const testPassword = 'Password123!';
  
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: ownerEmail,
    password: testPassword,
    email_confirm: true,
    user_metadata: { phone: '+237' + ownerPhone }
  });
  
  if (authError) { console.error('Auth error', authError); return; }
  
  // Make admin
  await supabase.from('platform_admins').insert({
    id: authData.user.id,
    email: ownerEmail
  });
  
  console.log('Created super admin:', ownerPhone, '/', testPassword);
}
run();
