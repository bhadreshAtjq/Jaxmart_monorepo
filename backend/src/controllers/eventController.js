const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');

// GET /api/events (Public - active only)
const getEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { isActive: true },
      orderBy: { date: 'asc' }
    });
    res.json({ events });
  } catch (err) {
    logger.error('getEvents error:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

// GET /api/admin/events (Admin - all events)
const adminGetEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: 'asc' }
    });
    res.json({ events });
  } catch (err) {
    logger.error('adminGetEvents error:', err);
    res.status(500).json({ error: 'Failed to fetch admin events' });
  }
};

// POST /api/admin/events (Admin - create)
const createEvent = async (req, res) => {
  try {
    const { title, description, date, location, mediaUrl, isActive } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }
    
    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: date ? new Date(date) : undefined,
        location,
        mediaUrl,
        isActive: isActive !== undefined ? isActive : true
      }
    });
    res.status(201).json({ event });
  } catch (err) {
    logger.error('createEvent error:', err);
    res.status(500).json({ error: 'Failed to create event' });
  }
};

// PUT /api/admin/events/:id (Admin - update)
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, location, mediaUrl, isActive } = req.body;
    
    const event = await prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        date: date ? new Date(date) : undefined,
        location,
        mediaUrl,
        isActive: isActive !== undefined ? isActive : undefined
      }
    });
    res.json({ event });
  } catch (err) {
    logger.error('updateEvent error:', err);
    res.status(500).json({ error: 'Failed to update event' });
  }
};

// DELETE /api/admin/events/:id (Admin - delete)
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.event.delete({
      where: { id }
    });
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    logger.error('deleteEvent error:', err);
    res.status(500).json({ error: 'Failed to delete event' });
  }
};

module.exports = {
  getEvents,
  adminGetEvents,
  createEvent,
  updateEvent,
  deleteEvent
};
