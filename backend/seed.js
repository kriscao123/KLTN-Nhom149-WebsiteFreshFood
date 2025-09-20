require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./src/models/Category');
const Product = require('./src/models/Product');
const ProductVariant = require('./src/models/ProductVariant');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  await Category.deleteMany({});
  await Product.deleteMany({});
  await ProductVariant.deleteMany({});

  const cats = await Category.insertMany([
    { name: 'Rau củ' }, { name: 'Thịt cá' }, { name: 'Sữa' }, { name: 'Đồ khô' }, { name: 'Nước giải khát' }
  ]);

  const veg = cats.find(c=>c.name==='Rau củ')._id;

  const p1 = await Product.create({
    sku:'VEG001', title:'Rau cải xanh', description:'Rau hữu cơ',
    brand:'LocalFarm', origin_country:'Vietnam', storage_temp:'2-5C',
    shelf_life_days:7, diet_tags:['vegan'], allergens:[], categories:[veg]
  });
  await ProductVariant.insertMany([
    { product_id:p1._id, unit:'g', size_value:250, price:8000, stock_qty:50, in_stock:true },
    { product_id:p1._id, unit:'g', size_value:500, price:15000, stock_qty:30, in_stock:true }
  ]);

  console.log('Seed done');
  process.exit(0);
})();
