const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/logger');

/**
 * API Setu (apisetu.gov.in) Service Integration
 * Connects to Government of India's Open API Platform (MeitY/DigiLocker)
 */

const getApiSetuConfig = () => {
  return {
    apiKey: process.env.APISETU_API_KEY || '',
    clientId: process.env.APISETU_CLIENT_ID || '',
    baseUrl: process.env.APISETU_BASE_URL || 'https://apisetu.gov.in/api/v1',
    isMock: process.env.APISETU_MOCK_MODE === 'true' || !process.env.APISETU_API_KEY || process.env.APISETU_API_KEY === 'your_apisetu_api_key'
  };
};

/**
 * Helper to build standard API Setu Consent Artifact
 */
const buildConsentArtifact = ({ idType, idNumber, dataProviderId, purposeDescription = 'Jaxmart B2B KYC Verification' }) => {
  const { clientId } = getApiSetuConfig();
  return {
    consent: {
      consentId: uuidv4(),
      timestamp: new Date().toISOString(),
      dataConsumer: {
        id: clientId || 'jaxmart-b2b-platform'
      },
      dataProvider: {
        id: dataProviderId
      },
      purpose: {
        description: purposeDescription
      },
      user: {
        idType: idType,
        idNumber: idNumber
      },
      consentGiven: 'Y'
    }
  };
};

/**
 * Generic caller for API Setu endpoints
 */
const callApiSetuEndpoint = async ({ endpoint, dataProviderId, certificateParameters, userDetails }) => {
  const config = getApiSetuConfig();

  // If mock mode is active, simulate realistic API Setu response
  if (config.isMock) {
    logger.info(`[API SETU MOCK MODE] Invoking ${endpoint} with params:`, certificateParameters);
    return {
      success: true,
      status: 'VERIFIED',
      txnId: uuidv4(),
      issuedAt: new Date().toISOString(),
      data: {
        ...certificateParameters,
        verifiedBy: 'API_SETU_GOV_IN',
        issuer: dataProviderId
      }
    };
  }

  const txnId = uuidv4();
  const consentArtifact = buildConsentArtifact({
    idType: Object.keys(certificateParameters)[0] || 'IDENTITY',
    idNumber: Object.values(certificateParameters)[0] || 'N/A',
    dataProviderId
  });

  const payload = {
    txnId,
    format: 'json',
    certificateParameters,
    consentArtifact
  };

  try {
    const url = `${config.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'X-APISETU-APIKEY': config.apiKey,
        'X-APISETU-CLIENTID': config.clientId
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`API Setu Error [${response.status}] for ${endpoint}:`, errorText);
      throw new Error(`API Setu request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return {
      success: true,
      status: 'VERIFIED',
      txnId: data.txnId || txnId,
      issuedAt: new Date().toISOString(),
      data
    };
  } catch (error) {
    logger.error(`API Setu Service Error on ${endpoint}:`, error.message);
    return {
      success: false,
      status: 'REJECTED',
      error: error.message
    };
  }
};

/**
 * 1. Income Tax Department - PAN Verification via API Setu
 * Endpoint: /income-tax/pan
 */
const verifyPan = async ({ pan, fullName, dob }) => {
  if (!pan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.trim().toUpperCase())) {
    throw new Error('Invalid PAN number format. Expected format: ABCDE1234F');
  }

  const formattedPan = pan.trim().toUpperCase();

  return callApiSetuEndpoint({
    endpoint: '/income-tax/pan',
    dataProviderId: 'IN.GOV.ITD',
    certificateParameters: {
      PAN: formattedPan,
      FullName: fullName || '',
      DOB: dob || ''
    }
  });
};

/**
 * 2. GSTN - GSTIN Verification via API Setu
 * Endpoint: /gstn/gstin
 */
const verifyGstin = async ({ gstin, legalName }) => {
  if (!gstin || !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin.trim().toUpperCase())) {
    throw new Error('Invalid GSTIN format. Expected 15-digit GSTIN');
  }

  const formattedGstin = gstin.trim().toUpperCase();

  return callApiSetuEndpoint({
    endpoint: '/gstn/gstin',
    dataProviderId: 'IN.GOV.GSTN',
    certificateParameters: {
      GSTIN: formattedGstin,
      LegalName: legalName || ''
    }
  });
};

/**
 * 3. UIDAI / DigiLocker - Aadhaar Verification via API Setu
 * Endpoint: /uidai/aadhaar
 */
const verifyAadhaar = async ({ uid, fullName, dob }) => {
  const cleanUid = (uid || '').replace(/\s+/g, '');
  if (!cleanUid || !/^[0-9]{12}$/.test(cleanUid)) {
    throw new Error('Invalid Aadhaar number format. Expected 12 digits');
  }

  return callApiSetuEndpoint({
    endpoint: '/uidai/aadhaar',
    dataProviderId: 'IN.GOV.UIDAI',
    certificateParameters: {
      UID: cleanUid,
      FullName: fullName || '',
      DOB: dob || ''
    }
  });
};

/**
 * 4. MoRTH - Driving License Verification via API Setu
 * Endpoint: /morth/dl
 */
const verifyDrivingLicense = async ({ dlNo, dob }) => {
  if (!dlNo) {
    throw new Error('Driving license number is required');
  }

  return callApiSetuEndpoint({
    endpoint: '/morth/dl',
    dataProviderId: 'IN.GOV.MORTH',
    certificateParameters: {
      DLNO: dlNo.trim().toUpperCase(),
      DOB: dob || ''
    }
  });
};

/**
 * 5. MSME Udyam Registration Verification via API Setu
 * Endpoint: /msme/udyam
 */
const verifyUdyam = async ({ udyamNo }) => {
  if (!udyamNo || !/^UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7}$/i.test(udyamNo.trim())) {
    throw new Error('Invalid MSME Udyam number. Format expected: UDYAM-XX-00-0000000');
  }

  return callApiSetuEndpoint({
    endpoint: '/msme/udyam',
    dataProviderId: 'IN.GOV.MSME',
    certificateParameters: {
      UdyamRegistrationNumber: udyamNo.trim().toUpperCase()
    }
  });
};

module.exports = {
  getApiSetuConfig,
  verifyPan,
  verifyGstin,
  verifyAadhaar,
  verifyDrivingLicense,
  verifyUdyam
};
