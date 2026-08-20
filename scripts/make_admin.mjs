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

async function run() {
  const { data, error } = await supabase.from('platform_admins').insert({
    id: '1bd7f100-5cfd-4d46-aecc-960fcf7360e4',
    email: '237675035285@sokoo.app'
  });
  console.log('Added to platform_admins', error ? error.message : 'Success');
}
run();
