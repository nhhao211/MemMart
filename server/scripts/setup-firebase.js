#!/usr/bin/env node

/**
 * Script to help setup Firebase credentials
 * Run: node scripts/setup-firebase.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('\n🔥 Firebase Setup Helper\n');
  console.log('This script will help you configure Firebase credentials.\n');

  // Ask for service account JSON path
  const jsonPath = await question('Enter path to Firebase service account JSON file: ');

  if (!fs.existsSync(jsonPath)) {
    console.error('❌ File not found:', jsonPath);
    process.exit(1);
  }

  try {
    // Read and parse JSON
    const serviceAccount = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    // Extract credentials
    const projectId = serviceAccount.project_id;
    const clientEmail = serviceAccount.client_email;
    const privateKey = serviceAccount.private_key;

    // Read current .env
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Update credentials
    envContent = envContent.replace(
      /FIREBASE_PROJECT_ID=.*/,
      `FIREBASE_PROJECT_ID=${projectId}`
    );
    envContent = envContent.replace(
      /FIREBASE_CLIENT_EMAIL=.*/,
      `FIREBASE_CLIENT_EMAIL=${clientEmail}`
    );
    envContent = envContent.replace(
      /FIREBASE_PRIVATE_KEY=".*"/s,
      `FIREBASE_PRIVATE_KEY="${privateKey.replace(/\n/g, '\\n')}"`
    );

    // Write back
    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ Successfully updated server/.env with Firebase credentials!\n');
    console.log('Project ID:', projectId);
    console.log('Client Email:', clientEmail);
    console.log('\n📝 Next steps:');
    console.log('1. Update client/.env.local with Web App credentials');
    console.log('2. Enable Email/Password authentication in Firebase Console');
    console.log('3. Restart your servers: npm run dev\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
