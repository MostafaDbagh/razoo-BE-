/**
 * Order service - MongoDB for orders (bookings) and contacts
 */
const { MongoClient, ObjectId } = require('mongodb');
const config = require('../config');

let client = null;
let db = null;

const DB_NAME = 'haircut-ai';
const ORDERS_COLL = 'orders';
const CONTACTS_COLL = 'contacts';

async function getDb() {
  if (db) return db;
  const uri = config.mongo?.uri || process.env.MONGO_URI || 'mongodb://localhost:27017/haircut-ai';
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(DB_NAME);
  return db;
}

async function checkConnection() {
  try {
    await getDb();
    await db.command({ ping: 1 });
    return { status: 'connected' };
  } catch (err) {
    return { status: 'disconnected', message: err.message };
  }
}

/**
 * Save a booking/order
 */
async function saveOrder(doc) {
  const d = await getDb();
  const coll = d.collection(ORDERS_COLL);
  const now = new Date().toISOString();
  const insert = {
    name: doc.name || '',
    phone: doc.phone || '',
    hairstyle: doc.hairstyle || '',
    preferred_date: doc.preferred_date || '',
    preferred_time: doc.preferred_time || '',
    notes: doc.notes || '',
    status: 'pending',
    created_at: now,
    updated_at: now,
  };
  const result = await coll.insertOne(insert);
  return {
    id: result.insertedId.toString(),
    ...insert,
  };
}

/**
 * Save a contact form submission
 */
async function saveContact(doc) {
  const d = await getDb();
  const coll = d.collection(CONTACTS_COLL);
  const now = new Date().toISOString();
  const insert = {
    name: doc.name || '',
    phone: doc.phone || '',
    subject: doc.subject || '',
    message: doc.message || '',
    created_at: now,
  };
  const result = await coll.insertOne(insert);
  return {
    id: result.insertedId.toString(),
    ...insert,
  };
}

/**
 * Get all orders (for admin)
 */
async function getOrders() {
  const d = await getDb();
  const coll = d.collection(ORDERS_COLL);
  const cursor = coll.find({}).sort({ created_at: -1 });
  const arr = await cursor.toArray();
  return arr.map((o) => ({
    id: o._id.toString(),
    name: o.name,
    email: o.email,
    phone: o.phone,
    hairstyle: o.hairstyle,
    preferred_date: o.preferred_date,
    preferred_time: o.preferred_time,
    notes: o.notes,
    status: o.status || 'pending',
    created_at: o.created_at,
  }));
}

/**
 * Get all contacts (for admin)
 */
async function getContacts() {
  const d = await getDb();
  const coll = d.collection(CONTACTS_COLL);
  const cursor = coll.find({}).sort({ created_at: -1 });
  const arr = await cursor.toArray();
  return arr.map((c) => ({
    id: c._id.toString(),
    name: c.name,
    phone: c.phone,
    email: c.email,
    subject: c.subject,
    message: c.message,
    created_at: c.created_at,
  }));
}

/**
 * Update order status
 */
async function updateOrderStatus(id, status) {
  const d = await getDb();
  const coll = d.collection(ORDERS_COLL);
  const now = new Date().toISOString();
  const result = await coll.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { status, updated_at: now } },
    { returnDocument: 'after' }
  );
  if (!result) return null;
  const o = result;
  return {
    id: o._id.toString(),
    name: o.name,
    phone: o.phone,
    hairstyle: o.hairstyle,
    preferred_date: o.preferred_date,
    preferred_time: o.preferred_time,
    notes: o.notes,
    status: o.status,
    created_at: o.created_at,
  };
}

/**
 * Delete order (if complete)
 */
async function deleteOrder(id) {
  const d = await getDb();
  const coll = d.collection(ORDERS_COLL);
  const result = await coll.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

module.exports = {
  checkConnection,
  saveOrder,
  saveContact,
  getOrders,
  getContacts,
  updateOrderStatus,
  deleteOrder,
};
