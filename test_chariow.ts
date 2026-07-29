import { chariow } from './lib/chariow.ts';
import fs from 'fs';
import dotenv from 'dotenv';

const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

async function testChariow() {
  const result = await chariow.createCheckout({
    plan_id: 'business',
    name: `Abonnement Sokoo - Plan Business`,
    description: `Mise à niveau SOKOO SaaS (Business)`,
    amount: 15000,
    currency: 'XOF',
    customer: {
      email: 'test@sokoo.app',
      name: 'Client Test',
      // NO phone provided
    },
    success_url: `http://localhost:3000/dashboard/settings?checkout=chariow_success`,
    cancel_url: `http://localhost:3000/dashboard/settings?tab=Abonnement`,
    metadata: {
      subscription_id: 'test_sub_123',
      organization_id: 'test_org_123',
      plan_id: 'business'
    }
  });

  console.log("Result:", result);
}

testChariow();
