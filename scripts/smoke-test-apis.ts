import { loadEnvConfig } from '@next/env';
import path from 'path';
import { fileURLToPath } from 'url';

// Next.js's env loader will automatically find .env, .env.local, etc. in the root
const projectDir = process.cwd();
loadEnvConfig(projectDir);

const massiveKey = process.env.MASSIVE_API_KEY;
const newsApiKey = process.env.NEWS_API_KEY;

if (!massiveKey) {
  console.error("❌ MASSIVE_API_KEY is missing from environment. Tests for this provider will likely fail auth.");
}
if (!newsApiKey) {
  console.error("❌ NEWS_API_KEY is missing from environment. Tests for this provider will likely fail auth.");
}

let hasFailures = false;

async function checkEndpoint(
  provider: string,
  endpoint: string,
  url: string,
  options: RequestInit,
  validate: (data: any) => boolean
) {
  console.log(`\nTesting ${provider} - ${endpoint}...`);
  try {
    const res = await fetch(url, options);
    
    if (res.status === 401 || res.status === 403) {
      console.log(`❌ FAIL [${res.status}]: Auth failed. API Key might be invalid or expired.`);
      hasFailures = true;
      return;
    }
    
    if (!res.ok) {
      console.log(`❌ FAIL [${res.status}]: Unexpected error.`);
      const text = await res.text();
      console.log(`   Response: ${text.slice(0, 150)}`);
      hasFailures = true;
      return;
    }

    const data = await res.json();
    
    const isValid = validate(data);
    
    if (isValid) {
      console.log(`✅ PASS [200]: Auth worked, valid fields present.`);
    } else {
      console.log(`⚠️ FAIL [200]: Response OK, but missing expected data fields or rate limited.`);
      console.log(`   Response sample: ${JSON.stringify(data).slice(0, 150)}`);
      hasFailures = true;
    }

  } catch (err: any) {
    console.log(`❌ FAIL: Network error. ${err.message}`);
    hasFailures = true;
  }
}

async function run() {
  console.log("Starting Live API Smoke Tests...\n");

  // 1. Massive API Stock Test
  await checkEndpoint(
    'Massive',
    'Stock/Reference',
    `https://api.massive.com/v3/reference/dividends?apiKey=${massiveKey}`,
    {},
    (data) => {
      return !!data && data.status !== 'ERROR';
    }
  );

  // 2. Massive API Forex Test
  await checkEndpoint(
    'Massive',
    'Forex Quote',
    `https://api.massive.com/v3/quotes/EURUSD?apiKey=${massiveKey}`,
    {},
    (data) => {
      return !!data && data.status !== 'ERROR';
    }
  );

  // 3. NewsAPI Top Headlines
  await checkEndpoint(
    'NewsAPI',
    'Top Headlines',
    `https://newsapi.org/v2/top-headlines?category=business&language=en&pageSize=1`,
    { headers: { 'X-Api-Key': newsApiKey! } },
    (data) => {
      return data.status === 'ok' && Array.isArray(data.articles);
    }
  );

  // 4. NewsAPI Search
  await checkEndpoint(
    'NewsAPI',
    'Everything (startups)',
    `https://newsapi.org/v2/everything?q=startups&language=en&pageSize=1`,
    { headers: { 'X-Api-Key': newsApiKey! } },
    (data) => {
      return data.status === 'ok' && Array.isArray(data.articles);
    }
  );

  console.log("\n=========================");
  if (hasFailures) {
    console.log("❌ Some API smoke tests failed. Check the logs above.");
    process.exit(1);
  } else {
    console.log("✅ All API smoke tests passed!");
    process.exit(0);
  }
}

run();
