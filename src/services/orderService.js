/**
 * MongoDB service - single DB for orders, contacts, and analyses
 * Collections: orders, contacts, analyses
 */
const { MongoClient, ObjectId } = require('mongodb');
const config = require('../config');

const ORDER_STATUSES = ['pending', 'confirmed', 'in_progress', 'complete'];

let client = null;
let db = null;

async function getDb() {
  if (!config.mongo.uri || config.mongo.uri === 'null') {
    throw new Error('MONGO_URI is not configured');
  }
  if (!client) {
    client = new MongoClient(config.mongo.uri);
    await client.connect();
    db = client.db();
  }
  return db;
}

async function getOrdersCollection() {
  const database = await getDb();
  return database.collection('orders');
}

async function getContactsCollection() {
  const database = await getDb();
  return database.collection('contacts');
}

async function getAnalysesCollection() {
  const database = await getDb();
  return database.collection('analyses');
}

/**
 * Save a new order (from booking)
 * @param {Object} data
 * @returns {Promise<Object>} inserted order with _id and status
 */
async function createOrder({ name, email, phone, hairstyle, preferredDate, preferredTime, notes }) {
  const col = await getOrdersCollection();
  const doc = {
    name: name || '',
    email: email || '',
    phone: phone || null,
    hairstyle: hairstyle || null,
    preferred_date: preferredDate || null,
    preferred_time: preferredTime || null,
    notes: notes || null,
    status: 'pending',
    created_at: new Date(),
  };
  const result = await col.insertOne(doc);
  return {
    _id: result.insertedId,
    id: result.insertedId.toString(),
    ...doc,
    created_at: doc.created_at,
  };
}

/**
 * Get all orders, newest first
 * @returns {Promise<Array>}
 */
async function getAllOrders() {
  const col = await getOrdersCollection();
  const cursor = col.find({}).sort({ created_at: -1 });
  const orders = await cursor.toArray();
  return orders.map((o) => ({
    _id: o._id.toString(),
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
 * Update order status
 * @param {string} id - ObjectId string
 * @param {string} status
 * @returns {Promise<Object|null>}
 */
async function updateOrderStatus(id, status) {
  if (!ORDER_STATUSES.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${ORDER_STATUSES.join(', ')}`);
  }
  const col = await getOrdersCollection();
  const _id = new ObjectId(id);
  const result = await col.findOneAndUpdate(
    { _id },
    { $set: { status, updated_at: new Date() } },
    { returnDocument: 'after' }
  );
  if (!result) return null;
  return {
    _id: result._id.toString(),
    id: result._id.toString(),
    name: result.name,
    email: result.email,
    phone: result.phone,
    hairstyle: result.hairstyle,
    preferred_date: result.preferred_date,
    preferred_time: result.preferred_time,
    notes: result.notes,
    status: result.status,
    created_at: result.created_at,
  };
}

/**
 * Delete order only if status is 'complete'
 * @param {string} id - ObjectId string
 * @returns {Promise<{ deleted: boolean, error?: string }>}
 */
async function deleteOrderIfComplete(id) {
  const col = await getOrdersCollection();
  const _id = new ObjectId(id);
  const order = await col.findOne({ _id });
  if (!order) {
    return { deleted: false, error: 'Order not found' };
  }
  if (order.status !== 'complete') {
    return { deleted: false, error: 'Can only delete orders with status "complete"' };
  }
  await col.deleteOne({ _id });
  return { deleted: true };
}

/**
 * Save contact form submission (MongoDB collection: contacts)
 */
async function saveContact({ name, email, subject, message }) {
  const col = await getContactsCollection();
  const doc = {
    name: name || '',
    email: email || '',
    subject: subject || null,
    message: message || '',
    created_at: new Date(),
  };
  const result = await col.insertOne(doc);
  return {
    id: result.insertedId.toString(),
    name: doc.name,
    email: doc.email,
    subject: doc.subject,
    message: doc.message,
    created_at: doc.created_at,
  };
}

/**
 * Get all contacts, newest first
 */
async function getAllContacts() {
  const col = await getContactsCollection();
  const list = await col.find({}).sort({ created_at: -1 }).toArray();
  return list.map((c) => ({
    id: c._id.toString(),
    name: c.name,
    email: c.email,
    subject: c.subject,
    message: c.message,
    created_at: c.created_at,
  }));
}

/**
 * Save analysis result (MongoDB collection: analyses)
 */
async function saveAnalysis({ userId = null, imagePath, faceShape, confidence, suggestions }) {
  const col = await getAnalysesCollection();
  const doc = {
    user_id: userId,
    image_path: imagePath || null,
    face_shape: faceShape || null,
    confidence: confidence ?? 0,
    suggestions: Array.isArray(suggestions) ? suggestions : [],
    created_at: new Date(),
  };
  const result = await col.insertOne(doc);
  return {
    id: result.insertedId.toString(),
    image_path: doc.image_path,
    face_shape: doc.face_shape,
    confidence: doc.confidence,
    suggestions: doc.suggestions,
    created_at: doc.created_at,
  };
}

async function close() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

/**
 * Check MongoDB connection status (for health checks).
 * @returns {Promise<{ status: 'connected' | 'not_configured' | 'error', message?: string }>}
 */
async function checkConnection() {
  if (!config.mongo.uri || config.mongo.uri === 'null') {
    return { status: 'not_configured', message: 'MONGO_URI is not set' };
  }
  try {
    const database = await getDb();
    await database.command({ ping: 1 });
    return { status: 'connected' };
  } catch (err) {
    return { status: 'error', message: err.message || String(err) };
  }
}

module.exports = {
  createOrder,
  getAllOrders,
  updateOrderStatus,
  deleteOrderIfComplete,
  checkConnection,
  ORDER_STATUSES,
  close,
  saveContact,
  getAllContacts,
  saveAnalysis,
};
