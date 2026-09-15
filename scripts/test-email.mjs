#!/usr/bin/env node
/**
 * Local tester for appointment email/WhatsApp notifications.
 *
 * Modes:
 *   1. function (default) - POSTs a fake appointment to the deployed Supabase
 *      Edge Function `send-appointment-notifications`, exactly like the app does.
 *      Usage:
 *        node scripts/test-email.mjs --to you@example.com
 *
 *   2. direct - calls the Resend API directly to validate RESEND_API_KEY and
 *      the sender address in isolation (bypasses Supabase).
 *      Usage:
 *        RESEND_API_KEY=re_xxx node scripts/test-email.mjs --to you@example.com --mode direct
 *
 * Supabase URL/anon key are read from .env.local in the project root.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Minimal .env loader (Node's --env-file is fine too, but this keeps quotes/spaces safe). */
function loadEnvFile(file) {
  try {
    for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1).trim();
      }
      if (!(match[1] in process.env)) process.env[match[1]] = value;
    }
  } catch {
    /* .env.local missing is fine; env vars can be provided externally */
  }
}
loadEnvFile(path.join(rootDir, '.env.local'));

// --- CLI args -------------------------------------------------------------
const args = process.argv.slice(2);
const getArg = (name, fallback = undefined) => {
  const index = args.indexOf(`--${name}`);
  return index !== -1 && args[index + 1] ? args[index + 1] : fallback;
};

const mode = getArg('mode', 'function');
const to = getArg('to');
if (!to) {
  console.error('Usage: node scripts/test-email.mjs --to you@example.com [--mode function|direct] [--from onboarding@resend.dev]');
  process.exit(1);
}

// --- Fake payload matching src/types/database.ts shapes --------------------
const appointment = {
  id: `test-${Date.now()}`,
  full_name: 'Test Patient',
  email: to,
  phone: '+15550001234',
  appointment_date: new Date(Date.now() + 86_400_000).toISOString().slice(0, 10),
  start_time: '10:00',
  end_time: '10:30',
  notes: 'Localhost notification test',
  service: { name: 'Dental Cleaning (Test)' },
};
const clinicSettings = {
  clinic_name: 'Lumina Dental Studio (Local Test)',
  clinic_email: 'care@luminadental.com',
  clinic_phone: '(555) 392-8840',
  clinic_address: '742 Evergreen Medical Way, Suite 300, Metropolitan City',
};

const pretty = (value) => JSON.stringify(value, null, 2);

if (mode === 'direct') {
  // ---------- Mode 2: hit Resend API directly ----------
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set. Get one at https://resend.com/api-keys and set it as an env var.');
    process.exit(1);
  }
  const from = getArg('from', process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev');
  const endpoint = 'https://api.resend.com/emails';
  console.log(`POST ${endpoint}`);
  console.log(`from: ${from} -> to: ${to}`);
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `Direct Resend test - ${clinicSettings.clinic_name}`,
      html: `<h2>Localhost email test</h2><p>If you can read this, RESEND_API_KEY and the sender "${from}" work.</p>`,
    }),
  });
  console.log(`Status: ${response.status}`);
  console.log(`Body: ${await response.text()}`);
  process.exit(response.ok ? 0 : 1);
}

// ---------- Mode 1 (default): hit the deployed Edge Function ----------
const supabaseUrl = (process.env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
const anonKey = (process.env.VITE_SUPABASE_ANON_KEY || '').trim();
if (!supabaseUrl || !anonKey) {
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const endpoint = `${supabaseUrl}/functions/v1/send_booking_Email`;
console.log(`POST ${endpoint}`);
console.log(`Payload recipient: ${to}`);

const response = await fetch(endpoint, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${anonKey}`,
    apikey: anonKey,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ appointment, clinicSettings }),
});

console.log(`Status: ${response.status}`);
const bodyText = await response.text();
try {
  console.log(`Body: ${pretty(JSON.parse(bodyText))}`);
} catch {
  console.log(`Body: ${bodyText}`);
}

// Interpret common outcomes to speed up debugging.
if (response.status === 404) {
  console.log('\n=> 404 usually means the Edge Function is not deployed yet. Deploy it with: supabase functions deploy send-appointment-notifications');
} else if (response.status === 401) {
  console.log('\n=> 401 means the anon key was rejected. Verify VITE_SUPABASE_ANON_KEY in .env.local.');
} else if (response.ok) {
  const body = JSON.parse(bodyText);
  console.log('\nemail result:    ' + (body.email ?? 'n/a'));
  console.log('whatsapp result: ' + (body.whatsapp ?? 'n/a'));
  if (body.email === 'fulfilled') {
    console.log(`=> Resend accepted the email for ${to}. Check the inbox (and spam folder).`);
  } else {
    console.log('=> email was "rejected": RESEND_API_KEY / RESEND_FROM_EMAIL secrets are likely missing or invalid in the Supabase project.');
    console.log('   Set them in Supabase Dashboard -> Project Settings -> Edge Functions -> Secrets.');
  }
  if (body.whatsapp === 'rejected') {
    console.log('=> whatsapp "rejected" only matters if you configured WHATSAPP_* secrets; otherwise it is expected to be skipped.');
  }
}
process.exit(response.ok ? 0 : 1);
