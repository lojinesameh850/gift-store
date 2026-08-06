const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');

const bcrypt = require('bcryptjs'); // or require('bcrypt')

// Models
const Category = require('./models/categoryModel');
const Tag = require('./models/tagModel');
const Product = require('./models/productModel');
const User = require('./models/userModel');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('ERROR: MONGO_URI is missing from your .env file.');
  process.exit(1);
}

// Plaintext password for all test accounts:
const RAW_PASSWORD = 'Password123!';

// Generate a valid bcrypt hash dynamically (10 salt rounds)
const DEMO_PASSWORD_HASH = bcrypt.hashSync(RAW_PASSWORD, 10);

// Real product definitions tailored for a gift shop
const GIFT_CATALOG_TEMPLATES = [
  {
    name: 'Aromatic Lavender Soy Candle',
    categoryName: 'Home Decor',
    description: 'Hand-poured 100% natural soy wax candle with essential oil notes of wild lavender, vanilla, and cedarwood. Burn time: 45 hours.',
    basePrice: 24.99,
    tagName: 'romantic'
  },
  {
    name: 'Minimalist Ceramic Flower Vase',
    categoryName: 'Home Decor',
    description: 'Matte-finish ceramic vase with an elegant Scandinavian curve design. Perfect centerpiece for dried or fresh floral arrangements.',
    basePrice: 38.00,
    tagName: 'wedding'
  },
  {
    name: 'Sterling Silver Heart Pendant Necklace',
    categoryName: 'Jewelry & Accessories',
    description: 'Solid 925 sterling silver chain with a polished petite heart pendant. Hypoallergenic and comes in a velvet gift box.',
    basePrice: 59.99,
    tagName: 'romantic'
  },
  {
    name: 'Deluxe Celebration Greeting Card Pack',
    categoryName: 'Greeting Cards & Stationery',
    description: 'Set of 10 gold-foil embossed greeting cards with matching luxury envelopes for birthdays, anniversaries, and milestones.',
    basePrice: 18.50,
    tagName: 'holiday'
  },
  {
    name: 'Handcrafted Wooden Desk Clock',
    categoryName: 'Handmade Crafts',
    description: 'Precision quartz clock movement encased in polished natural walnut wood. Quiet sweep second hand.',
    basePrice: 45.00,
    tagName: 'birthday'
  },
  {
    name: 'Crystal Wine Glass Set (Pair)',
    categoryName: 'Home Decor',
    description: 'Pair of lead-free crystal red wine glasses with ultra-clear clarity and delicate thin rims. Comes in protective foam gift packaging.',
    basePrice: 42.99,
    tagName: 'anniversary'
  },
  {
    name: 'Plush Velvet Travel Jewelry Organizer',
    categoryName: 'Jewelry & Accessories',
    description: 'Compact zip-around travel case with ring rolls, earring slots, and necklace hooks lined in anti-tarnish micro-suede.',
    basePrice: 29.99,
    tagName: 'holiday'
  },
  {
    name: 'Botanical Pressed Flower Bookmark Set',
    categoryName: 'Greeting Cards & Stationery',
    description: 'Set of 4 acrylic bookmarks featuring real dried wildflowers, finished with raw-edge silk tassels.',
    basePrice: 14.00,
    tagName: 'birthday'
  },
  {
    name: 'Luxury Rose Quartz Massage Roller',
    categoryName: 'Self-Care & Wellness',
    description: 'Dual-ended facial roller crafted from natural Brazilian rose quartz stone to soothe skin and promote circulation.',
    basePrice: 32.50,
    tagName: 'luxury'
  },
  {
    name: 'Eucalyptus & Sea Salt Bath Soak',
    categoryName: 'Self-Care & Wellness',
    description: 'Mineral-rich Dead Sea salts infused with organic eucalyptus leaves and soothing magnesium crystals in a glass apothecary jar.',
    basePrice: 22.00,
    tagName: 'holiday'
  },
  {
    name: 'Handwoven Macrame Wall Tapestry',
    categoryName: 'Handmade Crafts',
    description: 'Bohemian wall hanging crafted from 100% natural unbleached cotton cord mounted on a natural wood branch.',
    basePrice: 48.00,
    tagName: 'holiday'
  },
  {
    name: 'Classic Brass Floating Picture Frame',
    categoryName: 'Home Decor',
    description: 'Double-pane glass frame with a vintage brass metal border. Designed for 5x7 photos or pressed botanicals.',
    basePrice: 26.99,
    tagName: 'wedding'
  }
];

// 1. Generate Categories
const seedCategories = async () => {
  const categoryNames = [
    'Home Decor',
    'Jewelry & Accessories',
    'Greeting Cards & Stationery',
    'Handmade Crafts',
    'Self-Care & Wellness'
  ];

  const categories = categoryNames.map((name) => ({
    name,
    slug: faker.helpers.slugify(name).toLowerCase(),
    description: `Curated collection of gift items under ${name}.`,
    isActive: true
  }));

  return await Category.insertMany(categories);
};

// 2. Generate Tags
const seedTags = async () => {
  const tagList = ['birthday', 'anniversary', 'wedding', 'holiday', 'romantic', 'luxury'];

  const tags = tagList.map((name) => ({
    name,
    slug: faker.helpers.slugify(name).toLowerCase(),
    description: `Gifts tagged for ${name}.`,
    isActive: true
  }));

  return await Tag.insertMany(tags);
};

// 3. Generate Sensible Products
const seedProducts = async (categories, tags, count = 60) => {
  // Map category names to ObjectIds
  const categoryMap = new Map(categories.map((c) => [c.name, c._id]));

  const products = [];

  for (let i = 0; i < count; i++) {
    // Pick a template pattern and apply small variations to scale to desired count
    const template = GIFT_CATALOG_TEMPLATES[i % GIFT_CATALOG_TEMPLATES.length];
    const categoryId = categoryMap.get(template.categoryName) || categories[0]._id;

    // Assign 1-3 tags per product
    const randomTags = faker.helpers.arrayElements(tags, faker.number.int({ min: 1, max: 3 })).map((t) => t._id);

    const name = i >= GIFT_CATALOG_TEMPLATES.length ? `${template.name} (${faker.color.human()})` : template.name;
    const slug = `${faker.helpers.slugify(name).toLowerCase()}-${i}-${faker.string.alphanumeric(4)}`;

    products.push({
      name,
      slug,
      description: template.description,
      price: parseFloat((template.basePrice + faker.number.float({ min: 0, max: 10, fractionDigits: 2 })).toFixed(2)),
      category: categoryId,
      tags: randomTags,
      images: [
        `https://picsum.photos/seed/${slug}-1/600/600`,
        `https://picsum.photos/seed/${slug}-2/600/600`
      ],
      stock: faker.number.int({ min: 5, max: 80 }),
      isFeatured: faker.datatype.boolean(0.2),
      isActive: true
    });
  }

  return await Product.insertMany(products);
};

// 4. Generate Users
const seedUsers = async (products, count = 50) => {
  const users = Array.from({ length: count }, (_, i) => {
    const role = i === 0 ? 'admin' : 'customer';
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = `${i}_${faker.internet.email({ firstName, lastName }).toLowerCase()}`;

    const addressCount = faker.number.int({ min: 1, max: 3 });
    const shippingAddresses = Array.from({ length: addressCount }, (__, index) => ({
      city: faker.location.city(),
      street: faker.location.street(),
      building: String(faker.number.int({ min: 1, max: 150 })),
      apartment: faker.datatype.boolean(0.6) ? String(faker.number.int({ min: 1, max: 80 })) : undefined,
      isDefault: index === 0
    }));

    const wishlist = faker.helpers
      .arrayElements(products, faker.number.int({ min: 0, max: 5 }))
      .map((p) => p._id);

    const cartProducts = faker.helpers.arrayElements(products, faker.number.int({ min: 0, max: 3 }));
    const cart = cartProducts.map((p) => ({
      product: p._id,
      quantity: faker.number.int({ min: 1, max: 5 })
    }));

    return {
      email,
      passwordHash: DEMO_PASSWORD_HASH,
      role,
      activeToken: null,
      firstName,
      lastName,
      phone: faker.phone.number(),
      shippingAddresses,
      wishlist,
      cart
    };
  });

  return await User.insertMany(users);
};

// Main execution function
const runSeed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB...');

    await Promise.all([
      Category.deleteMany({}),
      Tag.deleteMany({}),
      Product.deleteMany({}),
      User.deleteMany({})
    ]);
    console.log('Cleared existing collections.');

    const createdCategories = await seedCategories();
    console.log(`Seeded ${createdCategories.length} categories.`);

    const createdTags = await seedTags();
    console.log(`Seeded ${createdTags.length} tags.`);

    const createdProducts = await seedProducts(createdCategories, createdTags, 60);
    console.log(`Seeded ${createdProducts.length} realistic gift products.`);

    const createdUsers = await seedUsers(createdProducts, 50);
    console.log(`Seeded ${createdUsers.length} users with linked carts and wishlists.`);

    console.log('\nDatabase seeding complete!');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
};

runSeed();