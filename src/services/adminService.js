/**
 * Admin service - MongoDB admins collection for multiple admin users
 */
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');
const config = require('../config');

let client = null;
let db = null;

const DB_NAME = 'haircut-ai';
const ADMINS_COLL = 'admins';

async function getDb() {
  if (db) return db;
  const uri = config.mongo?.uri || process.env.MONGO_URI || 'mongodb://localhost:27017/haircut-ai';
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(DB_NAME);
  return db;
}

/**
 * Find admin by email
 */
async function findByEmail(email) {
  const d = await getDb();
  const coll = d.collection(ADMINS_COLL);
  return coll.findOne({ email: String(email).trim().toLowerCase() });
}

/**
 * Verify password against admin record
 */
async function verifyAdmin(email, password) {
  const admin = await findByEmail(email);
  if (!admin || !admin.passwordHash) return null;
  const ok = await bcrypt.compare(password, admin.passwordHash);
  return ok ? admin : null;
}

/**
 * Create a new admin (for seeding or future admin management)
 */
async function createAdmin(email, plainPassword) {
  const d = await getDb();
  const coll = d.collection(ADMINS_COLL);
  const normalized = String(email).trim().toLowerCase();
  const existing = await coll.findOne({ email: normalized });
  if (existing) return { ok: false, message: 'Admin already exists' };
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(plainPassword, saltRounds);
  await coll.insertOne({
    email: normalized,
    passwordHash,
    created_at: new Date().toISOString(),
  });
  return { ok: true };
}

/**
 * Seed first admin from env if admins collection is empty
 */
async function seedAdminFromEnv() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;
  const d = await getDb();
  const coll = d.collection(ADMINS_COLL);
  const count = await coll.countDocuments();
  if (count > 0) return;
  const result = await createAdmin(email, password);
  if (result.ok) {
    console.log(`Seeded admin: ${email}`);
  }
}

module.exports = {
  findByEmail,
  verifyAdmin,
  createAdmin,
  seedAdminFromEnv,
};
