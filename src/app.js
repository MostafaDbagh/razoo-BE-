/**
 * Express application
 */
const express = require('express');
const cors = require('cors');
const bookRoutes = require('./routes/bookRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    const orderService = require('./services/orderService');
    const mongo = await orderService.checkConnection();
    res.json({
      ok: true,
      mongo: mongo.status,
    });
  } catch {
    res.json({ ok: true, mongo: 'unknown' });
  }
});

app.use('/api/book', bookRoutes);
app.use('/api/contact', contactRoutes);

module.exports = app;
