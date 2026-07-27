const { prisma } = require('../config/database');
const apiSetuService = require('../services/apiSetuService');
const { logger } = require('../utils/logger');

/**
 * Controller for handling API Setu KYC and Identity verifications
 */

// Helper to check user & update trust score
const updateVerificationProgress = async (userId, docType) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { kycDocuments: true }
    });

    if (!user) return;

    // Check if user has at least one verified critical document (PAN, Aadhaar, or GSTIN)
    const hasVerifiedCriticalDoc = user.kycDocuments.some(
      doc => doc.status === 'VERIFIED' && ['PAN', 'AADHAAR', 'GSTIN'].includes(doc.documentType)
    );

    const newKycStatus = hasVerifiedCriticalDoc ? 'VERIFIED' : user.kycStatus;

    await prisma.user.update({
      where: { id: userId },
      data: {
        kycStatus: newKycStatus,
        trustScore: { increment: 20 }
      }
    });
  } catch (err) {
    logger.error('updateVerificationProgress error:', err);
  }
};

/**
 * POST /api/kyc/verify-pan
 */
const verifyPan = async (req, res) => {
  try {
    const { pan, fullName, dob } = req.body;
    const userId = req.user.id;

    if (!pan) {
      return res.status(400).json({ error: 'PAN number is required' });
    }

    const result = await apiSetuService.verifyPan({ pan, fullName, dob });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'PAN verification failed via API Setu'
      });
    }

    const formattedPan = pan.toUpperCase();

    // Record document in Prisma
    const kycDoc = await prisma.kycDocument.create({
      data: {
        userId,
        documentType: 'PAN',
        documentNumber: formattedPan,
        documentUrl: `apisetu://income-tax/pan/${formattedPan}`,
        status: 'VERIFIED',
        verificationMethod: 'API_SETU',
        txnId: result.txnId,
        metadata: result.data || {},
        reviewNote: `Verified via API Setu. TxnId: ${result.txnId}`,
        reviewedAt: new Date()
      }
    });

    // Update Business Profile PAN if profile exists
    const profile = await prisma.businessProfile.findUnique({ where: { userId } });
    if (profile) {
      await prisma.businessProfile.update({
        where: { userId },
        data: { pan: formattedPan, verifiedAt: new Date() }
      });
    }

    await updateVerificationProgress(userId, 'PAN');

    return res.json({
      success: true,
      message: 'PAN verified successfully via API Setu',
      data: {
        documentId: kycDoc.id,
        pan: formattedPan,
        txnId: result.txnId,
        issuedAt: result.issuedAt
      }
    });
  } catch (err) {
    logger.error('verifyPan error:', err);
    return res.status(500).json({ error: err.message || 'Failed to verify PAN' });
  }
};

/**
 * POST /api/kyc/verify-gstin
 */
const verifyGstin = async (req, res) => {
  try {
    const { gstin, legalName } = req.body;
    const userId = req.user.id;

    if (!gstin) {
      return res.status(400).json({ error: 'GSTIN is required' });
    }

    const result = await apiSetuService.verifyGstin({ gstin, legalName });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'GSTIN verification failed via API Setu'
      });
    }

    const formattedGstin = gstin.toUpperCase();

    const kycDoc = await prisma.kycDocument.create({
      data: {
        userId,
        documentType: 'GSTIN',
        documentNumber: formattedGstin,
        documentUrl: `apisetu://gstn/gstin/${formattedGstin}`,
        status: 'VERIFIED',
        verificationMethod: 'API_SETU',
        txnId: result.txnId,
        metadata: result.data || {},
        reviewNote: `Verified via API Setu. TxnId: ${result.txnId}`,
        reviewedAt: new Date()
      }
    });

    const profile = await prisma.businessProfile.findUnique({ where: { userId } });
    if (profile) {
      await prisma.businessProfile.update({
        where: { userId },
        data: { gstin: formattedGstin, verifiedAt: new Date() }
      });
    }

    await updateVerificationProgress(userId, 'GSTIN');

    return res.json({
      success: true,
      message: 'GSTIN verified successfully via API Setu',
      data: {
        documentId: kycDoc.id,
        gstin: formattedGstin,
        txnId: result.txnId,
        issuedAt: result.issuedAt
      }
    });
  } catch (err) {
    logger.error('verifyGstin error:', err);
    return res.status(500).json({ error: err.message || 'Failed to verify GSTIN' });
  }
};

/**
 * POST /api/kyc/verify-aadhaar
 */
const verifyAadhaar = async (req, res) => {
  try {
    const { uid, fullName, dob } = req.body;
    const userId = req.user.id;

    if (!uid) {
      return res.status(400).json({ error: 'Aadhaar number (UID) is required' });
    }

    const result = await apiSetuService.verifyAadhaar({ uid, fullName, dob });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Aadhaar verification failed via API Setu'
      });
    }

    const maskedUid = 'XXXX-XXXX-' + uid.replace(/\s+/g, '').slice(-4);

    const kycDoc = await prisma.kycDocument.create({
      data: {
        userId,
        documentType: 'AADHAAR',
        documentNumber: maskedUid,
        documentUrl: `apisetu://uidai/aadhaar/${maskedUid}`,
        status: 'VERIFIED',
        verificationMethod: 'API_SETU',
        txnId: result.txnId,
        metadata: result.data || {},
        reviewNote: `Verified via API Setu / DigiLocker. TxnId: ${result.txnId}`,
        reviewedAt: new Date()
      }
    });

    await updateVerificationProgress(userId, 'AADHAAR');

    return res.json({
      success: true,
      message: 'Aadhaar verified successfully via API Setu',
      data: {
        documentId: kycDoc.id,
        aadhaarMasked: maskedUid,
        txnId: result.txnId,
        issuedAt: result.issuedAt
      }
    });
  } catch (err) {
    logger.error('verifyAadhaar error:', err);
    return res.status(500).json({ error: err.message || 'Failed to verify Aadhaar' });
  }
};

/**
 * POST /api/kyc/verify-dl
 */
const verifyDrivingLicense = async (req, res) => {
  try {
    const { dlNo, dob } = req.body;
    const userId = req.user.id;

    if (!dlNo) {
      return res.status(400).json({ error: 'Driving License number is required' });
    }

    const result = await apiSetuService.verifyDrivingLicense({ dlNo, dob });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Driving License verification failed via API Setu'
      });
    }

    const formattedDl = dlNo.toUpperCase();

    const kycDoc = await prisma.kycDocument.create({
      data: {
        userId,
        documentType: 'DRIVING_LICENSE',
        documentNumber: formattedDl,
        documentUrl: `apisetu://morth/dl/${formattedDl}`,
        status: 'VERIFIED',
        verificationMethod: 'API_SETU',
        txnId: result.txnId,
        metadata: result.data || {},
        reviewNote: `Verified via API Setu MoRTH. TxnId: ${result.txnId}`,
        reviewedAt: new Date()
      }
    });

    await updateVerificationProgress(userId, 'DRIVING_LICENSE');

    return res.json({
      success: true,
      message: 'Driving License verified successfully via API Setu',
      data: {
        documentId: kycDoc.id,
        dlNo: formattedDl,
        txnId: result.txnId,
        issuedAt: result.issuedAt
      }
    });
  } catch (err) {
    logger.error('verifyDrivingLicense error:', err);
    return res.status(500).json({ error: err.message || 'Failed to verify Driving License' });
  }
};

/**
 * POST /api/kyc/verify-udyam
 */
const verifyUdyam = async (req, res) => {
  try {
    const { udyamNo } = req.body;
    const userId = req.user.id;

    if (!udyamNo) {
      return res.status(400).json({ error: 'Udyam Registration Number is required' });
    }

    const result = await apiSetuService.verifyUdyam({ udyamNo });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'MSME Udyam verification failed via API Setu'
      });
    }

    const formattedUdyam = udyamNo.toUpperCase();

    const kycDoc = await prisma.kycDocument.create({
      data: {
        userId,
        documentType: 'UDYAM_MSME',
        documentNumber: formattedUdyam,
        documentUrl: `apisetu://msme/udyam/${formattedUdyam}`,
        status: 'VERIFIED',
        verificationMethod: 'API_SETU',
        txnId: result.txnId,
        metadata: result.data || {},
        reviewNote: `Verified via API Setu MSME. TxnId: ${result.txnId}`,
        reviewedAt: new Date()
      }
    });

    const profile = await prisma.businessProfile.findUnique({ where: { userId } });
    if (profile) {
      await prisma.businessProfile.update({
        where: { userId },
        data: { udyamNumber: formattedUdyam }
      });
    }

    await updateVerificationProgress(userId, 'UDYAM_MSME');

    return res.json({
      success: true,
      message: 'MSME Udyam Registration verified successfully via API Setu',
      data: {
        documentId: kycDoc.id,
        udyamNo: formattedUdyam,
        txnId: result.txnId,
        issuedAt: result.issuedAt
      }
    });
  } catch (err) {
    logger.error('verifyUdyam error:', err);
    return res.status(500).json({ error: err.message || 'Failed to verify MSME Udyam registration' });
  }
};

/**
 * GET /api/kyc/status
 */
const getKycStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        kycStatus: true,
        trustScore: true,
        kycDocuments: {
          orderBy: { createdAt: 'desc' }
        },
        businessProfile: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      success: true,
      kycStatus: user.kycStatus,
      trustScore: user.trustScore,
      businessProfile: user.businessProfile,
      documents: user.kycDocuments
    });
  } catch (err) {
    logger.error('getKycStatus error:', err);
    return res.status(500).json({ error: 'Failed to fetch KYC status' });
  }
};

module.exports = {
  verifyPan,
  verifyGstin,
  verifyAadhaar,
  verifyDrivingLicense,
  verifyUdyam,
  getKycStatus
};
