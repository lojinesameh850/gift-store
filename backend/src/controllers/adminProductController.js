const Product = require('../models/productModel');

exports.getAllProducts = async (req, res) => {
  try {
    let {
      search,
      category,
      tag,
      minPrice,
      maxPrice,
      isFeatured,
      isActive,
      sort,
      page = 1,
      limit = 10
    } = req.query;

    page = Number(page);
    limit = Number(limit);

    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
      return res.status(400).json({
        success: false,
        message: 'minPrice cannot be greater than maxPrice'
      });
    }

    let filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (tag) {
      filter.tags = tag;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured === 'true';
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const sortMapping = {
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      'Low to High': { price: 1 },
      'High to Low': { price: -1 },
      'newest': { createdAt: -1 },
      'oldest': { createdAt: 1 },
      'name-asc': { name: 1 },
      'name-desc': { name: -1 }
    };

    let sortOption = sortMapping[sort] || { createdAt: -1 };

    const skip = (page - 1) * limit;

    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .populate('category', 'name')
      .populate('tags', 'name')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const pages = Math.ceil(total / limit);

    if (products.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        total: 0,
        page,
        pages: 0,
        message: 'No products found matching your criteria. Try different filters.',
        data: []
      });
    }

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page,
      pages,
      data: products
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      tags,
      images,
      stock,
      isFeatured,
      isActive
    } = req.body;

    if (!name || !description || price === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, price, and category are required'
      });
    }

    if (price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price cannot be negative'
      });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');

    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'A product with a similar name already exists'
      });
    }

    const product = await Product.create({
      name,
      slug,
      description,
      price,
      category,
      tags: tags || [],
      images: images || [],
      stock: stock || 0,
      isFeatured: isFeatured || false,
      isActive: isActive !== undefined ? isActive : true
    });

    await product.populate([
      { path: 'category', select: 'name' },
      { path: 'tags', select: 'name' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('tags', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (req.body.name && req.body.name !== product.name) {
      const newSlug = req.body.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');

      const existingProduct = await Product.findOne({
        slug: newSlug,
        _id: { $ne: product._id }
      });

      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'A product with a similar name already exists'
        });
      }

      req.body.slug = newSlug;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('category', 'name')
      .populate('tags', 'name');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};