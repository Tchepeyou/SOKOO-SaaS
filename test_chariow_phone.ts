import { chariow } from './lib/chariow.ts';
import fs from 'fs';
import dotenv from 'dotenv';

const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

async function test(phone, country_code) {
  console.log(`Testing ${phone} - ${country_code}...`);
  const result = await chariow.createCheckout({
    plan_id: 'business',
    name: `Test Plan`,
    amount: 15000,
    currency: 'XOF',
    customer: {
      email: 'test@sokoo.app',
      name: 'Client Test',
      phone: phone,
      country_code: country_code
    },
    success_url: `http://localhost:3000/dashboard/settings?checkout=chariow_success`,
    cancel_url: `http://localhost:3000/dashboard/settings?tab=Abonnement`,
    metadata: {
      subscription_id: 'test_sub_123',
    }
  });

  console.log(`Result for ${phone}:`, result);
}

async function run() {
  await test("+237655000099", "CM");
  await test("+2290197000000", "BJ");
  await test("22997000000", "BJ");
  await test(undefined, undefined);
}

run();
