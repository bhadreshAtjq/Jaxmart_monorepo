// src/utils/gstParser.ts

export const INDIAN_STATE_CODES: Record<string, string> = {
  '01': 'Jammu and Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '26': 'Dadra and Nagar Haveli and Daman and Diu',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman and Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '38': 'Ladakh',
};

// PAN Entity Code Mapping (4th character of PAN)
export const PAN_ENTITY_MAPPING: Record<string, string> = {
  C: 'Private Limited',
  P: 'Sole Proprietorship',
  H: 'HUF (Hindu Undivided Family)',
  F: 'Partnership',
  A: 'AOP (Association of Persons)',
  T: 'Trust',
  B: 'BOI (Body of Individuals)',
  L: 'LLP',
  J: 'Artificial Juridical Person',
  G: 'Government Entity',
};

export interface ParsedGstinDetails {
  gstin: string;
  isValidFormat: boolean;
  stateCode: string;
  stateName: string;
  pan: string;
  entityType: 'Sole Proprietorship' | 'Partnership' | 'Private Limited' | 'Public Limited' | 'LLP' | 'OPC' | 'Unregistered';
  entityDescription: string;
}

export function parseGstin(gstin: string): ParsedGstinDetails {
  const clean = (gstin || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const isValidFormat = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(clean);

  const stateCode = clean.substring(0, 2);
  const stateName = INDIAN_STATE_CODES[stateCode] || 'India';
  const pan = clean.length >= 12 ? clean.substring(2, 12) : '';

  let entityType: ParsedGstinDetails['entityType'] = 'Private Limited';
  let entityDescription = 'Private Limited Company';

  if (pan.length >= 4) {
    const fourthChar = pan.charAt(3);
    const mapped = PAN_ENTITY_MAPPING[fourthChar];
    if (mapped) {
      if (mapped === 'Sole Proprietorship') {
        entityType = 'Sole Proprietorship';
        entityDescription = 'Proprietorship / Individual';
      } else if (mapped === 'Partnership') {
        entityType = 'Partnership';
        entityDescription = 'Partnership Firm';
      } else if (mapped === 'LLP') {
        entityType = 'LLP';
        entityDescription = 'Limited Liability Partnership';
      } else {
        entityType = 'Private Limited';
        entityDescription = 'Company (Pvt Ltd / Ltd)';
      }
    }
  }

  return {
    gstin: clean,
    isValidFormat,
    stateCode,
    stateName,
    pan,
    entityType,
    entityDescription,
  };
}
