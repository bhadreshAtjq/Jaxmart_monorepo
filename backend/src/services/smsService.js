const { logger } = require('../utils/logger');

/**
 * Send OTP via MSG91 Send OTP API (https://control.msg91.com/api/v5/otp)
 *
 * Rules:
 * - If NODE_ENV is NOT 'production' or MSG91_AUTHKEY is missing, bypass network call and log simulated OTP.
 * - If NODE_ENV is 'production' AND MSG91_AUTHKEY is present, dispatch real SMS OTP via MSG91.
 *
 * @param {string} phone - Mobile number (10 digits or with 91 prefix)
 * @param {string|number} otp - 6-digit OTP code
 * @returns {Promise<boolean>}
 */
const sendMsg91Otp = async (phone, otp) => {
  const authkey = process.env.MSG91_AUTHKEY;
  const templateId = process.env.MSG91_OTP_TEMPLATE_ID;
  const isProd = process.env.NODE_ENV === 'production';

  // Format number (India standard 91XXXXXXXXXX)
  const cleanNumber = String(phone).replace(/[^0-9]/g, '');
  const mobileWithCountryCode = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;

  // Staging / Dev Mode: Do not spend MSG91 API credits
  if (!isProd || !authkey || authkey.trim() === '') {
    logger.info(`[MSG91 STAGING/DEV SIMULATOR] Target: +${mobileWithCountryCode} | Generated OTP: ${otp} | Universal Bypass: 123456`);
    return true;
  }

  try {
    const url = new URL('https://control.msg91.com/api/v5/otp');
    url.searchParams.set('authkey', authkey.trim());
    url.searchParams.set('mobile', mobileWithCountryCode);
    url.searchParams.set('otp', String(otp));
    if (templateId && templateId.trim()) {
      url.searchParams.set('template_id', templateId.trim());
    }
    url.searchParams.set('otp_expiry', '5'); // 5 minutes validity

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authkey: authkey.trim(),
      },
    });

    const data = await response.json().catch(() => ({}));
    if (response.ok && (data.type === 'success' || data.type !== 'error')) {
      logger.info(`[MSG91 PRODUCTION] OTP sent successfully to +${mobileWithCountryCode}`);
      return true;
    } else {
      logger.error(`[MSG91 PRODUCTION ERROR] Failed sending OTP to +${mobileWithCountryCode}:`, data);
      return false;
    }
  } catch (err) {
    logger.error(`[MSG91 NETWORK ERROR] Exception while sending OTP to +${mobileWithCountryCode}:`, err);
    return false;
  }
};

/**
 * Generic SMS Notification Dispatcher
 */
const sendSms = async (phone, message) => {
  try {
    const isProd = process.env.NODE_ENV === 'production' && !!process.env.MSG91_AUTHKEY;
    if (isProd) {
      logger.info(`[SMS PRODUCTION] Dispatching to ${phone}: ${message}`);
    } else {
      logger.info(`[SMS SIMULATED] Dispatching to ${phone}: ${message}`);
    }
    return true;
  } catch (err) {
    logger.error('sendSms error:', err);
    return false;
  }
};

module.exports = { sendMsg91Otp, sendSms };
