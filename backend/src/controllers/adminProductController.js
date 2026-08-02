const Product = require('../models/productModel');

exports.getAllProducts = async (req, res) => {
  try {
    let {
      search,
      category,
      occasion,
      minPrice,
      maxPrice,
      isFeatured,
      isActive,
      sort
    } = req.query;

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
      const decodedCategory = decodeURIComponent(category).trim();

      filter.category = { $regex: `^${decodedCategory}$`, $options: 'i' };
    }

    if (occasion) {
      filter.occasion = { $regex: occasion, $options: 'i' };
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

    let sortOption = { createdAt: -1 };
    if (sort) {
      sortOption = sort;
    }

    const products = await Product.find(filter).sort(sortOption);

    if (products.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        message: 'No products found matching your criteria. Try different filters.',
        data: []
      });
    }

    res.status(200).json({
      success: true,
      count: products.length,
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
      discount,
      category,
      occasion,
      images,
      stock,
      isFeatured,
      isActive
    } = req.body;

    if (!name || !description || price === undefined || !category || !occasion) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, price, category, and occasion are required'
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
      discount: discount || 0,
      category,
      occasion,
      images: images || [],
      stock: stock || 0,
      isFeatured: isFeatured || false,
      isActive: isActive !== undefined ? isActive : true
    });

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
    const product = await Product.findById(req.params.id);

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
    );

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
