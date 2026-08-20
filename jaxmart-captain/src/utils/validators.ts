// src/utils/validators.ts

// Indian Tax & Identity Regexes
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
export const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
export const PHONE_REGEX = /^[6-9]\d{9}$/;
export const PINCODE_REGEX = /^[1-9][0-9]{5}$/;
export const UDYAM_REGEX = /^UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7}$/;
export const AADHAAR_MASKED_REGEX = /^XXXX-XXXX-[0-9]{4}$/;
export const FSSAI_REGEX = /^[0-9]{14}$/;

export const isValidGstin = (val: string): boolean => GSTIN_REGEX.test(val.trim().toUpperCase());
export const isValidPan = (val: string): boolean => PAN_REGEX.test(val.trim().toUpperCase());
export const isValidIfsc = (val: string): boolean => IFSC_REGEX.test(val.trim().toUpperCase());
export const isValidPhone = (val: string): boolean => PHONE_REGEX.test(val.trim());
export const isValidPincode = (val: string): boolean => PINCODE_REGEX.test(val.trim());
export const isValidUdyam = (val: string): boolean => UDYAM_REGEX.test(val.trim().toUpperCase());
export const isValidFssai = (val: string): boolean => FSSAI_REGEX.test(val.trim());

// Auto-derive State and PAN from GSTIN
export const extractPanFromGstin = (gstin: string): string => {
  if (gstin && gstin.length >= 12) {
    return gstin.substring(2, 12).toUpperCase();
  }
  return '';
};
