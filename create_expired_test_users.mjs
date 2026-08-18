import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = Object.fromEntries(
  envFile.split('\n')
  .map(line => line.trim())
  .filter(line => line && !line.startsWith('#') && line.includes('='))
  .map(line => {
    const idx = line.indexOf('=');
    return [line.slice(0, idx).trim(), line.slice(idx + 1).replace(/"/g, '').trim()];
  })
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const ts = Date.now().toString().slice(-4);
  const ownerPhone = '65500' + ts;
  const ownerEmail = '237' + ownerPhone + '@sokoo.app';
  
  const empPhone = '65511' + ts;
  const empEmail = '237' + empPhone + '@sokoo.app';
  
  const testPassword = 'Password123!';
  
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: ownerEmail,
    password: testPassword,
    email_confirm: true,
    user_metadata: { phone: '+237' + ownerPhone }
  });
  
  if (authError) { console.error('Auth error', authError); return; }
  
  const { data: org, error: orgError } = await supabase.from('organizations').insert({
    name: 'Expired Org Test ' + ts,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  }).select('id').single();
  
  if (orgError) { console.error('Org error', orgError); return; }
  
  await supabase.from('profiles').update({
    organization_id: org.id,
    role: 'owner',
    phone: '+237' + ownerPhone
  }).eq('id', authData.user.id);
  
  console.log('Created owner:', ownerPhone, '/', testPassword);
  
  const { data: authDataEmp, error: authErrorEmp } = await supabase.auth.admin.createUser({
    email: empEmail,
    password: testPassword,
    email_confirm: true,
    user_metadata: { phone: '+237' + empPhone }
  });
  
  if (authErrorEmp) { console.error('Auth error emp', authErrorEmp); return; }
  
  await supabase.from('profiles').update({
    organization_id: org.id,
    role: 'employee',
    phone: '+237' + empPhone
  }).eq('id', authDataEmp.user.id);
  
  console.log('Created employee:', empPhone, '/', testPassword);
}
run();
