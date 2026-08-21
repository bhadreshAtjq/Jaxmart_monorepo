const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');

/**
 * GET /api/categories
 * Fetch categories with optional parent filter, root filter, search, or nested tree view
 */
const getCategories = async (req, res) => {
  try {
    const { parentId, tree = 'false', all = 'false', type, search } = req.query;

    if (tree === 'true') {
      const rootCategories = await prisma.category.findMany({
        where: {
          parentId: null,
          isActive: true,
          ...(type && { applicableType: type.toUpperCase() }),
        },
        orderBy: { sortOrder: 'asc' },
        include: {
          children: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            include: {
              children: {
                where: { isActive: true },
                orderBy: { sortOrder: 'asc' },
              },
              _count: { select: { listings: true, rfqRequests: true } },
            },
          },
          attributes: { orderBy: { sortOrder: 'asc' } },
          _count: { select: { listings: true, rfqRequests: true } },
        },
      });
      return res.json(rootCategories);
    }

    let parentCondition = { parentId: null }; // Default: return top-level root categories

    // When searching or explicitly requesting all, search across the entire taxonomy
    if (all === 'true' || (search && search.trim().length > 0)) {
      parentCondition = {};
    } else if (parentId !== undefined) {
      if (parentId === 'null' || !parentId) {
        parentCondition = { parentId: null };
      } else {
        parentCondition = { parentId };
      }
    }

    const where = {
      isActive: true,
      ...parentCondition,
      ...(type && { applicableType: type.toUpperCase() }),
      ...(search && {
        OR: [
          { name: { contains: search.trim(), mode: 'insensitive' } },
          { slug: { contains: search.trim(), mode: 'insensitive' } },
        ],
      }),
    };

    const categories = await prisma.category.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      take: search ? 30 : 100,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
            parent: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
        children: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            slug: true,
            iconUrl: true,
            _count: { select: { listings: true } },
          },
          take: 8,
        },
        _count: { select: { listings: true, rfqRequests: true } },
      },
    });

    res.json(categories);
  } catch (err) {
    logger.error('getCategories error:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

/**
 * GET /api/categories/:idOrSlug
 * Fetch a single category by ID or SEO slug
 */
const getCategoryByIdOrSlug = async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

    const category = await prisma.category.findFirst({
      where: isUUID ? { id: idOrSlug } : { slug: idOrSlug },
      include: {
        parent: { select: { id: true, name: true, slug: true, parent: { select: { id: true, name: true } } } },
        children: {
          where: { isActive: true },
          include: {
            children: {
              where: { isActive: true },
              select: { id: true, name: true, slug: true },
            },
            _count: { select: { listings: true } },
          },
        },
        attributes: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: { select: { listings: true, rfqRequests: true } },
      },
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (err) {
    logger.error('getCategoryByIdOrSlug error:', err);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
};

/**
 * GET /api/categories/:id/attributes
 * Fetch dynamic attributes defined for this category
 */
const getCategoryAttributes = async (req, res) => {
  try {
    const { id } = req.params;
    const attributes = await prisma.categoryAttribute.findMany({
      where: { categoryId: id },
      orderBy: { sortOrder: 'asc' },
    });
    res.json(attributes);
  } catch (err) {
    logger.error('getCategoryAttributes error:', err);
    res.status(500).json({ error: 'Failed to fetch category attributes' });
  }
};

/**
 * POST /api/categories (Admin)
 */
const createCategory = async (req, res) => {
  try {
    const {
      name,
      slug,
      parentId,
      applicableType = 'PRODUCT',
      depthLevel = 1,
      iconUrl,
      bannerUrl,
      metaTitle,
      metaDescription,
      sortOrder = 0,
    } = req.body;

    if (!name) return res.status(400).json({ error: 'Category name is required' });

    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const category = await prisma.category.create({
      data: {
        name,
        slug: finalSlug,
        parentId: parentId || null,
        applicableType: applicableType.toUpperCase(),
        depthLevel: parentId ? 2 : parseInt(depthLevel),
        iconUrl,
        bannerUrl,
        metaTitle: metaTitle || `${name} - Wholesale Suppliers & Manufacturers | JaxMart`,
        metaDescription: metaDescription || `Source quality ${name} from verified B2B suppliers and manufacturers at wholesale rates on JaxMart.`,
        sortOrder: parseInt(sortOrder) || 0,
        isActive: true,
      },
      include: { parent: true },
    });

    res.status(201).json({ success: true, category });
  } catch (err) {
    logger.error('createCategory error:', err);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

/**
 * PUT /api/categories/:id (Admin)
 */
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      parentId,
      applicableType,
      iconUrl,
      bannerUrl,
      metaTitle,
      metaDescription,
      sortOrder,
      isActive,
    } = req.body;

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(parentId !== undefined && { parentId: parentId || null }),
        ...(applicableType && { applicableType: applicableType.toUpperCase() }),
        ...(iconUrl !== undefined && { iconUrl }),
        ...(bannerUrl !== undefined && { bannerUrl }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDescription !== undefined && { metaDescription }),
        ...(sortOrder !== undefined && { sortOrder: parseInt(sortOrder) }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({ success: true, category });
  } catch (err) {
    logger.error('updateCategory error:', err);
    res.status(500).json({ error: 'Failed to update category' });
  }
};

/**
 * POST /api/categories/:id/attributes (Admin)
 */
const addCategoryAttribute = async (req, res) => {
  try {
    const { id: categoryId } = req.params;
    const { name, slug, unit, attributeType = 'TEXT', isRequired = false, isFilterable = true, options = [], sortOrder = 0 } = req.body;

    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const attribute = await prisma.categoryAttribute.create({
      data: {
        categoryId,
        name,
        slug: finalSlug,
        unit,
        attributeType: attributeType.toUpperCase(),
        isRequired: Boolean(isRequired),
        isFilterable: Boolean(isFilterable),
        options,
        sortOrder: parseInt(sortOrder) || 0,
      },
    });

    res.status(201).json({ success: true, attribute });
  } catch (err) {
    logger.error('addCategoryAttribute error:', err);
    res.status(500).json({ error: 'Failed to add category attribute' });
  }
};

module.exports = {
  getCategories,
  getCategoryByIdOrSlug,
  getCategoryAttributes,
  createCategory,
  updateCategory,
  addCategoryAttribute,
};
