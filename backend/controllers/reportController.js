const mongoose = require('mongoose');
const Report = require('../models/Report');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { categorizeWasteImage } = require('../services/aiService');

const getTickets = async (req, res) => {
  try {
    const { email, userId, limit, role, area } = req.query;
    const query = {};

    // Authority filtering
    if (role === 'authority' && area) {
      query.assignedArea = area;
    } 
    // Citizen filtering
    else {
      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        query.userId = userId;
      } else if (email) {
        query.userEmail = email;
      }

      if (!query.userId && !query.userEmail) {
        return res.status(400).json({ message: 'email or userId is required for non-authorities' });
      }
    }

    const parsedLimit = Number(limit);
    const ticketLimit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 0;

    const tickets = await Ticket.find(query)
      .sort({ createdAt: -1 })
      .limit(ticketLimit);

    res.status(200).json(tickets);

  } catch (error) {
    res.status(500).json({
      message: 'Server error while fetching tickets',
      error: error.message
    });
  }
};

const getTicketById = async (req, res) => {
  try {
    const { ticketId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({ message: 'Invalid ticket id' });
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    res.status(200).json(ticket);

  } catch (error) {
    res.status(500).json({
      message: 'Server error while fetching ticket',
      error: error.message
    });
  }
};

const getTicketByTrackingId = async (req, res) => {
  try {
    const { trackingId } = req.params;
    const ticket = await Ticket.findOne({ trackingId: trackingId.toUpperCase() });

    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    res.status(200).json(ticket);

  } catch (error) {
    res.status(500).json({
      message: 'Server error while fetching ticket',
      error: error.message
    });
  }
};

const updateTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    if (!['Open', 'In Progress', 'Resolved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({ message: 'Invalid ticket id' });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      { status },
      { new: true }
    );

    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    res.status(200).json({ message: 'Status updated successfully', ticket });

  } catch (error) {
    res.status(500).json({
      message: 'Server error updating ticket status',
      error: error.message
    });
  }
};

const submitTicket = async (req, res) => {
  try {
    const { user_name, userEmail, description, location, userId, role, lat, lon } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    if (!user_name) {
      return res.status(400).json({ message: 'User Name is required' });
    }

    if (!location) {
      return res.status(400).json({ message: 'Location is required' });
    }

    let resolvedUserId = null;

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      const existingUser = await User.findById(userId);
      if (existingUser) resolvedUserId = userId;
    }

    if (!resolvedUserId && userEmail) {
      const user = await User.findOne({ email: userEmail });
      if (user) resolvedUserId = user._id;
    }

    let category = "General Waste";
    let confidence = 0;

    const aiResult = await categorizeWasteImage(file.path, file.mimetype);
    if (aiResult) {
      category = aiResult.category;
      confidence = aiResult.confidence;
    }

    // determine assigned area
    const knownAreas = ['Satna', 'Jabalpur', 'Rewa', 'Narsinghpur', 'Burhanpur'];

    let assignedArea = "Other";

    for (const area of knownAreas) {
      if (location.toLowerCase().includes(area.toLowerCase())) {
        assignedArea = area;
        break;
      }
    }

    const ticket = new Ticket({
      assignedArea,
      userId: resolvedUserId,
      userEmail: userEmail || null,
      user_name,
      role: role || 'citizen',
      aiCategory: category,
      confidence,
      imageUrl: `/uploads/${file.filename}`,
      description,
      location,
      lat: lat ? Number(lat) : null,
      lon: lon ? Number(lon) : null,
      googleMapsUrl: (lat && lon)
        ? `https://www.google.com/maps?q=${lat},${lon}`
        : null
    });

    await ticket.save();

    res.status(201).json({
      message: 'Ticket created successfully',
      ticket
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error during ticket submission',
      error: error.message
    });
  }
};

const submitReport = async (req, res) => {
  try {
    const { userEmail, description, location, wasteCategory } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ message: 'No image uploaded' });

    const report = new Report({
      userEmail,
      wasteCategory: wasteCategory || "General Waste",
      imageUrl: `/uploads/${file.filename}`,
      description,
      location,
    });

    await report.save();

    res.status(201).json({
      message: 'Report submitted successfully',
      report
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  submitReport,
  submitTicket,
  getReports: () => {},
  analyzeImage: () => {},
  getTickets,
  getTicketById,
  getTicketByTrackingId,
  updateTicketStatus
};