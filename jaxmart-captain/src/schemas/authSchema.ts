// src/schemas/authSchema.ts
import { z } from 'zod';
import { PHONE_REGEX } from '../utils/validators';

export const loginSchema = z.object({
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(10, 'Phone number must be 10 digits')
    .regex(PHONE_REGEX, 'Enter a valid 10-digit Indian mobile number'),
});

export const phoneSchema = loginSchema;

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only numbers'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type PhoneFormValues = z.infer<typeof loginSchema>;
export type OtpFormValues = z.infer<typeof otpSchema>;
