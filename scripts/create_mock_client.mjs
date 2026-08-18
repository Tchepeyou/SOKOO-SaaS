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
  
  const phone = '699999123';
  const email = '237' + phone + '@sokoo.app';
  
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password: 'Password123!',
    email_confirm: true,
    user_metadata: { phone: '+237' + phone }
  });
  
  if (authError) { console.error('Auth error', authError); return; }
  
  const orgName = "Boutique de Test 1";
  
  const { data: orgData } = await supabase.from('organizations').insert({
    name: orgName
  }).select().single();
  
  await supabase.from('profiles').insert({
    id: authData.user.id,
    full_name: "Client Test",
    phone: "+237" + phone,
    role: "owner",
    organization_id: orgData.id
  });
  
  console.log('Created mock client:', orgName);
}
run();
