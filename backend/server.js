require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connect = require('./src/db/mongoose');

const authRoutes = require('./src/routes/auth');
const productRoutes = require('./src/routes/products');
const recommendRoutes = require('./src/routes/recommend');
const interactionRoutes = require('./src/routes/interactions');

const app = express();
app.use(cors({ origin: ['http://localhost:5174'], credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (_req, res)=> res.json({ok:true}));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/recommend', recommendRoutes);
app.use('/api/interactions', interactionRoutes);

const port = process.env.PORT || 5000;
connect().then(() => { 
  app.listen(port, () => console.log('Backend listening on :' + port));
}).catch(err => {
  console.error('Mongo connect failed:', err.message);
  process.exit(1);
});
