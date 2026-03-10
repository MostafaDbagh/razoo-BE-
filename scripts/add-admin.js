#!/usr/bin/env node
/**
 * Add a new admin to the database.
 * Usage: node scripts/add-admin.js <email> <password>
 * Or with env: ADMIN_EMAIL=x ADMIN_PASSWORD=y node scripts/add-admin.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const adminService = require('../src/services/adminService');

async function main() {
  const email = process.argv[2] || process.env.ADMIN_EMAIL;
  const password = process.argv[3] || process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.error('Usage: node scripts/add-admin.js <email> <password>');
    process.exit(1);
  }
  const result = await adminService.createAdmin(email, password);
  if (result.ok) {
    console.log(`Admin created: ${email}`);
  } else {
    console.error(result.message || 'Failed');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
