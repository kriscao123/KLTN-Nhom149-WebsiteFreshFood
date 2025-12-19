require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connect = require('./src/db/mongoose');

const authRoutes = require('./src/routes/auth');
const productRoutes = require('./src/routes/productsRoutes');
const interactionRoutes = require('./src/routes/interactions');
const categoryRoutes=require('./src/routes/categoryRoutes');
const cartRoutes=require('./src/routes/cartRoutes');
const orderRoutes=require('./src/routes/orderRoutes');
const userRoutes=require('./src/routes/userRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const sepayQRCodeRoutes = require('./src/routes/sepayQRCodeRoutes');
const sepayWebhookRoutes = require('./src/routes/sepayWebhookRoutes');

const app = express();
app.use(cors({ origin: ['https://kltn-nhom149-websitefreshfood.onrender.com','http://localhost:5173'], credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (_req, res)=> res.json({ok:true}));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/users',userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/sepay', sepayQRCodeRoutes);
app.use('/api/sepay-webhook', sepayWebhookRoutes);

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');      
  res.setHeader('Pragma', 'no-cache');             
  res.setHeader('Expires', '0');                   
  next();
});

const port = process.env.PORT || 5000;
connect().then(() => { 
  app.listen(port, () => console.log('Backend listening on :' + port));
}).catch(err => {
  console.error('Mongo connect failed:', err.message);
  process.exit(1);
});
