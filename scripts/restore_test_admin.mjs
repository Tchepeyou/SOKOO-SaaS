import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

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

const targetId = 'ec0d2453-4d1b-4630-bfd2-2b15fd3a3af5'; // 237999999999@sokoo.app

supabase.from('profiles').select('*').eq('id', targetId).then(d => {
  console.log('Profile:', d.data);
  if (!d.data || d.data.length === 0) {
    console.log('Profile is missing! Recreating...');
    supabase.from('profiles').insert({
      id: targetId,
      phone: '237999999999',
      full_name: 'Test Admin',
      role: 'owner'
    }).then(res => console.log('Insert result:', res));
  }
});
