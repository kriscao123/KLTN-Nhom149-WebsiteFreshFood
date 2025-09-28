/* init_food_sales_compass.js
 * Khởi tạo database MongoDB cho hệ thống bán thực phẩm – dùng MongoDB Compass Playground
 * LƯU Ý: Collection 'products' dùng SIMPLE collation để tạo text index (tránh lỗi).
 */

// ======================== CẤU HÌNH ========================
const DB_NAME = "FoodSalesManagement";   // đổi nếu cần
const SEED = true;                       // bật/tắt dữ liệu mẫu
const ENABLE_EXTRA = false;              // bật thêm collections tham khảo
const AUTO_DROP_BACKUP = false;          // sau khi migrate collation, có drop collection backup không

// Collation mặc định (tiếng Việt) áp dụng CHO CÁC COLLECTION KHÁC 'products'
const DEFAULT_COLLATION = { locale: "vi", strength: 1 };

print(`==> Kết nối DB: ${DB_NAME}`);
const dbRef = db.getSiblingDB(DB_NAME);

// ======================== TIỆN ÍCH CHUNG ========================
/** Lấy options của collection (collation…) */
function getCollOptions(name) {
  const info = dbRef.runCommand({ listCollections: 1, filter: { name } });
  const coll = info.cursor && info.cursor.firstBatch && info.cursor.firstBatch[0];
  return coll ? (coll.options || {}) : null;
}

/**
 * Tạo/Chỉnh collection với $jsonSchema và đảm bảo collation mong muốn.
 * - desiredCollation = null  => SIMPLE collation (không set collation ở createCollection)
 * - desiredCollation = {...} => tạo với collation đó
 * Nếu collection tồn tại nhưng collation KHÁC với desired → MIGRATE:
 *   rename -> create new -> copy data bằng $merge
 */
function ensureCollection(name, schema, desiredCollation /* null = simple */) {
  const exists = dbRef.getCollectionNames().includes(name);
  if (!exists) {
    print(`--> Tạo collection '${name}' với collation = ${desiredCollation ? JSON.stringify(desiredCollation) : "SIMPLE"}`);
    const createOpts = {
      validator: { $jsonSchema: schema },
      validationLevel: "strict"
    };
    if (desiredCollation) createOpts.collation = desiredCollation;
    dbRef.createCollection(name, createOpts);
    return;
  }

  // Đã tồn tại → cập nhật validator
  dbRef.runCommand({ collMod: name, validator: { $jsonSchema: schema }, validationLevel: "strict" });

  // Kiểm tra và migrate collation nếu cần
  const opts = getCollOptions(name);
  const hasColl = opts && opts.collation;
  const wantSimple = (desiredCollation == null);

  const same =
    (wantSimple && !hasColl) ||
    (!wantSimple && hasColl && JSON.stringify(opts.collation) === JSON.stringify(desiredCollation));

  if (same) {
    print(`--> '${name}': collation đã đúng (${wantSimple ? "SIMPLE" : JSON.stringify(desiredCollation)})`);
    return;
  }

  // MIGRATE
  const bak = `${name}_bak_${Date.now()}`;
  print(`⚠️  MIGRATE collation '${name}': rename -> ${bak} -> create new -> merge data`);
  dbRef[name].renameCollection(bak);

  const createOpts = {
    validator: { $jsonSchema: schema },
    validationLevel: "strict"
  };
  if (!wantSimple) createOpts.collation = desiredCollation;
  dbRef.createCollection(name, createOpts);

  dbRef[bak].aggregate([
    { $match: {} },
    { $merge: { into: name, whenMatched: "keepExisting", whenNotMatched: "insert" } }
  ]);

  if (AUTO_DROP_BACKUP) {
    print(`Dropping backup '${bak}'...`);
    dbRef[bak].drop();
  } else {
    print(`Giữ backup: ${bak} (có thể drop thủ công sau khi kiểm tra)`);
  }
}

/** Tạo index nếu chưa có (idempotent) */
function ensureIndex(coll, spec, opts = {}) {
  const name = opts.name || Object.keys(spec).map(k => `${k}_${spec[k]}`).join("_");
  const existed = dbRef.getCollection(coll).getIndexes().some(i => i.name === name);
  if (!existed) {
    print(`   ↳ Tạo index '${name}' trên '${coll}'`);
    const dup = Object.assign({}, opts);
    delete dup.name;
    dbRef.getCollection(coll).createIndex(spec, Object.assign({ name }, dup));
  } else {
    print(`   ↳ Bỏ qua, index '${name}' đã có.`);
  }
}

/** Upsert theo khóa duy nhất, trả về _id */
function upsertOne(coll, query, doc) {
  const res = dbRef.getCollection(coll).findOneAndUpdate(
    query,
    { $setOnInsert: Object.assign({}, doc) },
    { upsert: true, returnDocument: "after" }
  );
  return res && res._id ? res._id : (res && res.value && res.value._id);
}

// ======================== 2) SCHEMA & COLLECTIONS ========================

// 2.1 roles (vi collation)
ensureCollection("roles", {
  bsonType: "object",
  required: ["roleName", "description"],
  properties: {
    roleName: { bsonType: "string" },
    description: { bsonType: "string" },
    permissions: { bsonType: "array", items: { bsonType: "string" } },
    createdAt: { bsonType: "date" }
  },
  additionalProperties: true
}, DEFAULT_COLLATION);
ensureIndex("roles", { roleName: 1 }, { unique: true, name: "uq_roleName" });

// 2.2 users (vi collation)
ensureCollection("users", {
  bsonType: "object",
  required: ["username", "email", "passwordHash", "fullName", "roleId"],
  properties: {
    username: { bsonType: "string" },
    email: { bsonType: "string" },
    passwordHash: { bsonType: "string" },
    fullName: { bsonType: "string" },
    phone: { bsonType: "string" },
    address: {
      bsonType: "object",
      properties: { street: {bsonType:"string"}, city:{bsonType:"string"}, district:{bsonType:"string"}, ward:{bsonType:"string"} },
      additionalProperties: true
    },
    roleId: { bsonType: "objectId" },
    isActive: { bsonType: "bool" },
    createdAt: { bsonType: "date" },
    lastLogin: { bsonType: "date" },
    resetPasswordToken: { bsonType: "string" },
    resetPasswordExpires: { bsonType: "date" }
  },
  additionalProperties: true
}, DEFAULT_COLLATION);
ensureIndex("users", { username: 1 }, { unique: true, name: "uq_username" });
// Email unique - case-insensitive
ensureIndex("users", { email: 1 }, { unique: true, name: "uq_email_ci", collation: { locale: "en", strength: 2 } });
// TTL cho resetPasswordExpires
ensureIndex("users", { resetPasswordExpires: 1 }, { expireAfterSeconds: 0, name: "ttl_resetPasswordExpires" });

// 2.3 categories (vi collation)
ensureCollection("categories", {
  bsonType: "object",
  required: ["categoryName"],
  properties: {
    categoryName: { bsonType: "string" },
    description: { bsonType: "string" },
    parentCategoryId: { bsonType: "objectId" },
    imageUrl: { bsonType: "string" },
    isActive: { bsonType: "bool" }
  },
  additionalProperties: true
}, DEFAULT_COLLATION);
ensureIndex("categories", { categoryName: 1 }, { unique: true, name: "uq_categoryName" });
ensureIndex("categories", { parentCategoryId: 1 }, { name: "ix_parentCategoryId" });

// 2.4 suppliers (vi collation)
ensureCollection("suppliers", {
  bsonType: "object",
  required: ["supplierName"],
  properties: {
    supplierName: { bsonType: "string" },
    contactName: { bsonType: "string" },
    phone: { bsonType: "string" },
    email: { bsonType: "string" },
    address: {
      bsonType: "object",
      properties: { street: {bsonType:"string"}, city:{bsonType:"string"}, district:{bsonType:"string"}, ward:{bsonType:"string"} }
    },
    taxCode: { bsonType: "string" },
    isActive: { bsonType: "bool" }
  },
  additionalProperties: true
}, DEFAULT_COLLATION);
ensureIndex("suppliers", { supplierName: 1 }, { unique: true, name: "uq_supplierName" });
ensureIndex("suppliers", { taxCode: 1 }, { unique: true, name: "uq_taxCode", partialFilterExpression: { taxCode: { $type: "string" } } });

// 2.5 products (**SIMPLE collation** để hỗ trợ text index)
ensureCollection("products", {
  bsonType: "object",
  required: ["productName", "categoryId", "supplierId", "unitPrice"],
  properties: {
    productName: { bsonType: "string" },
    description: { bsonType: "string" },
    categoryId: { bsonType: "objectId" },
    supplierId: { bsonType: "objectId" },
    unitPrice: { bsonType: "number", minimum: 0 },
    unitWeight: { bsonType: "number", minimum: 0 },
    unitsInStock: { bsonType: "int", minimum: 0 },
    unitsOnOrder: { bsonType: "int", minimum: 0 },
    reorderLevel: { bsonType: "int", minimum: 0 },
    isActive: { bsonType: "bool" },
    imageUrls: { bsonType: "array", items: { bsonType: "string" } },
    specifications: { bsonType: "object" },
    expiryDate: { bsonType: "date" }
  },
  additionalProperties: true
}, null /* SIMPLE */);
// Text index KHÔNG được gán collation
ensureIndex("products", { productName: "text", description: "text" }, {
  name: "tx_product",
  default_language: "none",
  weights: { productName: 10, description: 5 }
});
ensureIndex("products", { categoryId: 1 }, { name: "ix_categoryId" });
ensureIndex("products", { supplierId: 1 }, { name: "ix_supplierId" });
ensureIndex("products", { isActive: 1 }, { name: "ix_isActive" });

// 2.6 warehouses (vi collation)
ensureCollection("warehouses", {
  bsonType: "object",
  required: ["warehouseName"],
  properties: {
    warehouseName: { bsonType: "string" },
    address: {
      bsonType: "object",
      properties: { street: {bsonType:"string"}, city:{bsonType:"string"}, district:{bsonType:"string"}, ward:{bsonType:"string"} }
    },
    phone: { bsonType: "string" },
    managerId: { bsonType: "objectId" },
    capacity: { bsonType: "number", minimum: 0 },
    currentUsage: { bsonType: "number", minimum: 0 },
    isActive: { bsonType: "bool" }
  },
  additionalProperties: true
}, DEFAULT_COLLATION);
ensureIndex("warehouses", { warehouseName: 1 }, { unique: true, name: "uq_warehouseName" });

// 2.7 inventory (vi collation)
ensureCollection("inventory", {
  bsonType: "object",
  required: ["productId", "warehouseId", "quantity"],
  properties: {
    productId: { bsonType: "objectId" },
    warehouseId: { bsonType: "objectId" },
    quantity: { bsonType: "int", minimum: 0 },
    lastUpdated: { bsonType: "date" },
    location: { bsonType: "string" },
    batchNumber: { bsonType: "string" },
    expiryDate: { bsonType: "date" }
  },
  additionalProperties: true
}, DEFAULT_COLLATION);
ensureIndex("inventory", { productId: 1, warehouseId: 1, batchNumber: 1 }, {
  unique: true,
  name: "uq_product_warehouse_batch",
  partialFilterExpression: { productId: { $exists: true }, warehouseId: { $exists: true } }
});
ensureIndex("inventory", { warehouseId: 1, expiryDate: 1 }, { name: "ix_warehouse_expiry" });
ensureIndex("inventory", { productId: 1, expiryDate: 1 }, { name: "ix_product_expiry" });

// 2.8 orders (vi collation)
ensureCollection("orders", {
  bsonType: "object",
  required: ["customerId", "orderDate", "orderStatus"],
  properties: {
    customerId: { bsonType: "objectId" },
    employeeId: { bsonType: "objectId" },
    orderDate: { bsonType: "date" },
    requiredDate: { bsonType: "date" },
    shippedDate: { bsonType: "date" },
    shipAddress: {
      bsonType: "object",
      properties: { street: {bsonType:"string"}, city:{bsonType:"string"}, district:{bsonType:"string"}, ward:{bsonType:"string"} }
    },
    orderStatus: { bsonType: "string", enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"] },
    paymentMethod: { bsonType: "string", enum: ["Cash", "CreditCard", "EWallet"] },
    paymentStatus: { bsonType: "string", enum: ["Pending", "Paid", "Failed"] },
    totalAmount: { bsonType: "number", minimum: 0 },
    notes: { bsonType: "string" },
    orderItems: {
      bsonType: "array",
      items: {
        bsonType: "object",
        required: ["productId", "quantity", "unitPrice"],
        properties: {
          productId: { bsonType: "objectId" },
          productName: { bsonType: "string" },
          quantity: { bsonType: "int", minimum: 1 },
          unitPrice: { bsonType: "number", minimum: 0 },
          discount: { bsonType: "number", minimum: 0 },
          warehouseId: { bsonType: "objectId" },
          batchNumber: { bsonType: "string" }
        },
        additionalProperties: true
      }
    }
  },
  additionalProperties: true
}, DEFAULT_COLLATION);
ensureIndex("orders", { customerId: 1, orderDate: -1 }, { name: "ix_customer_date" });
ensureIndex("orders", { orderStatus: 1 }, { name: "ix_orderStatus" });
ensureIndex("orders", { paymentStatus: 1 }, { name: "ix_paymentStatus" });

// 2.9 optional
if (ENABLE_EXTRA) {
  print("ENABLE_EXTRA = true (placeholder for extra collections)");
}

// ======================== 4) SEED DỮ LIỆU ========================
if (SEED) {
  print("==> SEED dữ liệu mẫu");

  // Roles
  const roleAdminId = upsertOne("roles", { roleName: "Admin" }, {
    roleName: "Admin", description: "Quản trị hệ thống", permissions: ["*"], createdAt: new Date()
  });
  const roleCustomerId = upsertOne("roles", { roleName: "Customer" }, {
    roleName: "Customer", description: "Khách hàng", permissions: ["shop:*"], createdAt: new Date()
  });
  const roleWarehouseId = upsertOne("roles", { roleName: "Warehouse" }, {
    roleName: "Warehouse", description: "Nhân viên kho", permissions: ["inv:*"], createdAt: new Date()
  });
  const roleAccountantId = upsertOne("roles", { roleName: "Accountant" }, {
    roleName: "Accountant", description: "Kế toán", permissions: ["fin:*"], createdAt: new Date()
  });

  // Users
  const adminId = upsertOne("users", { username: "admin" }, {
    username: "admin",
    email: "admin@example.com",
    passwordHash: "hash$admin$demo",
    fullName: "System Admin",
    roleId: roleAdminId,
    isActive: true,
    createdAt: new Date()
  });
  const customerId = upsertOne("users", { username: "alice" }, {
    username: "alice",
    email: "alice@example.com",
    passwordHash: "hash$alice$demo",
    fullName: "Alice Nguyen",
    address: { street: "12 Trieu Viet Vuong", city: "Ha Noi", district: "Hai Ba Trung", ward: "Phuong X" },
    phone: "0900000001",
    roleId: roleCustomerId,
    isActive: true,
    createdAt: new Date()
  });
  const whStaffId = upsertOne("users", { username: "wh01" }, {
    username: "wh01",
    email: "wh01@example.com",
    passwordHash: "hash$wh01$demo",
    fullName: "Kho HN",
    roleId: roleWarehouseId,
    isActive: true,
    createdAt: new Date()
  });

  // Categories
  const catFoodId = upsertOne("categories", { categoryName: "Thực phẩm" }, { categoryName: "Thực phẩm", isActive: true });
  const catRauId  = upsertOne("categories", { categoryName: "Rau" }, { categoryName: "Rau",  parentCategoryId: catFoodId, isActive: true });
  const catThitId = upsertOne("categories", { categoryName: "Thịt" }, { categoryName: "Thịt", parentCategoryId: catFoodId, isActive: true });
  const catSuaId  = upsertOne("categories", { categoryName: "Sữa" },  { categoryName: "Sữa",  parentCategoryId: catFoodId, isActive: true });

  // Suppliers
  const supGreenId = upsertOne("suppliers", { supplierName: "GreenFarm Co." }, {
    supplierName: "GreenFarm Co.",
    contactName: "Mr. Binh",
    phone: "0909000000",
    email: "contact@greenfarm.vn",
    taxCode: "0800123456",
    address: { street: "1 Le Loi", city: "Da Nang", district: "Hai Chau", ward: "Thach Thang" },
    isActive: true
  });
  const supMilkId = upsertOne("suppliers", { supplierName: "MilkHouse JSC" }, {
    supplierName: "MilkHouse JSC",
    contactName: "Ms. Linh",
    phone: "0909000002",
    email: "sales@milkhouse.vn",
    taxCode: "0800123457",
    address: { street: "55 Nguyen Hue", city: "HCM", district: "1", ward: "Ben Nghe" },
    isActive: true
  });

  // Products
  const pRauMuong = upsertOne("products", { productName: "Rau muống bó 500g" }, {
    productName: "Rau muống bó 500g",
    categoryId: catRauId,
    supplierId: supGreenId,
    unitPrice: 15000,
    unitWeight: 0.5,
    unitsInStock: 0,
    unitsOnOrder: 0,
    reorderLevel: 10,
    isActive: true
  });
  const pThitBo = upsertOne("products", { productName: "Thịt bò thăn 1kg" }, {
    productName: "Thịt bò thăn 1kg",
    categoryId: catThitId,
    supplierId: supGreenId,
    unitPrice: 350000,
    unitWeight: 1.0,
    isActive: true
  });
  const pSuaTuoi = upsertOne("products", { productName: "Sữa tươi 1L" }, {
    productName: "Sữa tươi 1L",
    categoryId: catSuaId,
    supplierId: supMilkId,
    unitPrice: 32000,
    unitWeight: 1.0,
    isActive: true
  });

  // Warehouses
  const whHN = upsertOne("warehouses", { warehouseName: "Kho Hà Nội" }, {
    warehouseName: "Kho Hà Nội",
    address: { street: "KCN Bac Tu Liem", city: "Ha Noi", district: "Bac Tu Liem", ward: "Xuan Dinh" },
    phone: "0243-000-000",
    managerId: whStaffId,
    capacity: 10000,
    currentUsage: 0,
    isActive: true
  });
  const whHCM = upsertOne("warehouses", { warehouseName: "Kho HCM" }, {
    warehouseName: "Kho HCM",
    address: { street: "KCN Tan Binh", city: "HCM", district: "Tan Binh", ward: "Tan Son Nhi" },
    phone: "0283-000-000",
    capacity: 15000,
    currentUsage: 0,
    isActive: true
  });

  // Inventory (theo lô, phục vụ FEFO)
  const today = new Date();
  function addDays(d, n) { return new Date(d.getTime() + n*24*60*60*1000); }

  upsertOne("inventory", { productId: pRauMuong, warehouseId: whHN, batchNumber: "RM-001" }, {
    productId: pRauMuong, warehouseId: whHN, quantity: 50, batchNumber: "RM-001", expiryDate: addDays(today, 3), lastUpdated: today
  });
  upsertOne("inventory", { productId: pRauMuong, warehouseId: whHN, batchNumber: "RM-002" }, {
    productId: pRauMuong, warehouseId: whHN, quantity: 40, batchNumber: "RM-002", expiryDate: addDays(today, 5), lastUpdated: today
  });
  upsertOne("inventory", { productId: pThitBo, warehouseId: whHCM, batchNumber: "TB-001" }, {
    productId: pThitBo, warehouseId: whHCM, quantity: 20, batchNumber: "TB-001", expiryDate: addDays(today, 10), lastUpdated: today
  });
  upsertOne("inventory", { productId: pSuaTuoi, warehouseId: whHN, batchNumber: "SUA-001" }, {
    productId: pSuaTuoi, warehouseId: whHN, quantity: 100, batchNumber: "SUA-001", expiryDate: addDays(today, 20), lastUpdated: today
  });

  // Orders (mẫu)
  upsertOne("orders", { _seed: "order_alice_1" }, {
    _seed: "order_alice_1",
    customerId: customerId,
    orderDate: today,
    orderStatus: "Pending",
    paymentMethod: "EWallet",
    paymentStatus: "Pending",
    totalAmount: 15000 * 2 + 32000,
    shipAddress: { street: "12 Trieu Viet Vuong", city: "Ha Noi", district: "Hai Ba Trung", ward: "Phuong X" },
    orderItems: [
      { productId: pRauMuong, productName: "Rau muống bó 500g", quantity: 2, unitPrice: 15000, discount: 0, warehouseId: whHN },
      { productId: pSuaTuoi,  productName: "Sữa tươi 1L",        quantity: 1, unitPrice: 32000, discount: 0, warehouseId: whHN }
    ]
  });

  print("==> Seed hoàn tất.");
}

// ======================== 5) TRUY VẤN MẪU & HÀM ĐẶT HÀNG FEFO ========================

// Tìm sản phẩm theo text
print("-- Ví dụ tìm kiếm sản phẩm chứa 'sữa' --");
printjson(
  dbRef.products
    .find({ $text: { $search: "sữa" } }, { score: { $meta: "textScore" } })
    .sort({ score: { $meta: "textScore" } })
    .limit(3)
    .toArray()
);

// Lấy tồn khả dụng FEFO cho 1 productId
function getFefoBatches(productId, whId = null, limit = 5) {
  const q = { productId: productId };
  if (whId) q.warehouseId = whId;
  return dbRef.inventory.find(q).sort({ expiryDate: 1 }).limit(limit).toArray();
}

// Transaction: placeOrder theo FEFO (giản lược)
function placeOrder(orderDto) {
  const session = db.getMongo().startSession();
  session.startTransaction();
  try {
    const o = Object.assign({}, orderDto);
    o.orderDate = new Date();
    o.orderStatus = "Pending";
    o.paymentStatus = "Pending";
    o.totalAmount = o.orderItems.reduce((s, it) => s + (it.unitPrice * it.quantity - (it.discount || 0)), 0);

    // Trừ tồn theo FEFO cho từng item
    for (const it of o.orderItems) {
      let need = it.quantity;
      const batches = dbRef.inventory.find({ productId: it.productId }).sort({ expiryDate: 1 }).toArray();
      for (const b of batches) {
        if (need <= 0) break;
        const take = Math.min(need, b.quantity);
        if (take > 0) {
          dbRef.inventory.updateOne({ _id: b._id }, { $inc: { quantity: -take }, $set: { lastUpdated: new Date() } }, { session });
          need -= take;
        }
      }
      if (need > 0) throw new Error(`Không đủ tồn cho productId=${it.productId}`);
    }

    const ins = dbRef.orders.insertOne(o, { session });
    session.commitTransaction();
    session.endSession();
    return ins.insertedId;
  } catch (e) {
    print(`!! placeOrder thất bại: ${e.message}`);
    session.abortTransaction();
    session.endSession();
    return null;
  }
}

// ======================== HOÀN TẤT ========================
print("==> Danh sách collection:");
printjson(dbRef.getCollectionNames());

print("==> Một vài index minh hoạ (users, products, inventory):");
printjson(dbRef.users.getIndexes());
printjson(dbRef.products.getIndexes());
printjson(dbRef.inventory.getIndexes());

print("DONE");
