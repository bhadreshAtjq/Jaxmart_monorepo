const { logger } = require('../utils/logger');

const sendSms = async (phone, message) => {
  try {
    // In production, integrate with Twilio or AWS SNS
    if (process.env.NODE_ENV === 'production') {
      logger.info(`Sending REAL SMS to ${phone}: ${message}`);
    } else {
      logger.info(`SIMULATED SMS to ${phone}: ${message}`);
    }
    return true;
  } catch (err) {
    logger.error('sendSms error:', err);
    return false;
  }
};

module.exports = { sendSms };
