const crypto = require('crypto');
const razorpayService = require('../services/razorpayService');

describe('Razorpay Integration & Security Tests', () => {
  const mockKeySecret = 'test_secret_1234567890';
  const originalEnvSecret = process.env.RAZORPAY_KEY_SECRET;

  beforeAll(() => {
    process.env.RAZORPAY_KEY_SECRET = mockKeySecret;
    process.env.RAZORPAY_KEY_ID = 'rzp_test_mockkey123';
  });

  afterAll(() => {
    process.env.RAZORPAY_KEY_SECRET = originalEnvSecret;
  });

  test('validateRazorpayConfig should return true when credentials exist', () => {
    const isValid = razorpayService.validateRazorpayConfig();
    expect(isValid).toBe(true);
  });

  test('verifyPaymentSignature should validate authentic HMAC signatures correctly', () => {
    const razorpayOrderId = 'order_mock_12345';
    const razorpayPaymentId = 'pay_mock_67890';
    const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
    const validSignature = crypto
      .createHmac('sha256', mockKeySecret)
      .update(payload)
      .digest('hex');

    const result = razorpayService.verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature: validSignature,
    });

    expect(result).toBe(true);
  });

  test('verifyPaymentSignature should reject forged / altered signatures', () => {
    const razorpayOrderId = 'order_mock_12345';
    const razorpayPaymentId = 'pay_mock_67890';
    const invalidSignature = 'forged_signature_1234567890abcdef';

    const result = razorpayService.verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature: invalidSignature,
    });

    expect(result).toBe(false);
  });

  test('verifyWebhookSignature should validate raw body HMAC signature', () => {
    const rawBody = JSON.stringify({ event: 'payment.captured', payload: { payment: { entity: { id: 'pay_123' } } } });
    const validWebhookSig = crypto
      .createHmac('sha256', mockKeySecret)
      .update(rawBody)
      .digest('hex');

    const isWebhookValid = razorpayService.verifyWebhookSignature(rawBody, validWebhookSig, mockKeySecret);
    expect(isWebhookValid).toBe(true);
  });

  test('verifyWebhookSignature should reject invalid webhook signature', () => {
    const rawBody = JSON.stringify({ event: 'payment.captured' });
    const invalidWebhookSig = 'invalid_webhook_sig';

    const isWebhookValid = razorpayService.verifyWebhookSignature(rawBody, invalidWebhookSig, mockKeySecret);
    expect(isWebhookValid).toBe(false);
  });
});
