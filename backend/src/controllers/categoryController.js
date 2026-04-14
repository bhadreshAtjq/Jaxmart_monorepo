const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');

const getCategories = async (req, res) => {
  try {
    const { parentId } = req.query;
    const categories = await prisma.category.findMany({
      where: {
        parentId: parentId || null,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (err) {
    logger.error('getCategories error:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

module.exports = { getCategories };
