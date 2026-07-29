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

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: orgs, error } = await supabase
    .from('organizations')
    .select('id, created_at, trial_ends_at')
    .eq('subscription_status', 'trialing');
    
  if (error) {
    console.error("Error fetching orgs:", error);
    return;
  }
  
  console.log(`Trouvé ${orgs?.length || 0} organisations en essai.`);
  
  for (const org of orgs) {
    // Calcul de 14 jours exacts après created_at
    const trialEnds = new Date(new Date(org.created_at).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
    await supabase.from('organizations').update({ trial_ends_at: trialEnds }).eq('id', org.id);
    console.log(`Mis à jour org ${org.id} avec trial_ends_at = ${trialEnds}`);
  }
  console.log('Terminé.');
}

run();
