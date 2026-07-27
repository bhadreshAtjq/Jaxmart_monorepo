require('dotenv').config();
const apiSetuService = require('../src/services/apiSetuService');

async function testApiSetu() {
  console.log('Testing API Setu Service Integration...');
  console.log('Config:', apiSetuService.getApiSetuConfig());

  try {
    console.log('\n--- 1. Testing PAN Verification ---');
    const panResult = await apiSetuService.verifyPan({
      pan: 'ABCDE1234F',
      fullName: 'TEST USER',
      dob: '1990-01-01'
    });
    console.log('PAN Result:', panResult);

    console.log('\n--- 2. Testing GSTIN Verification ---');
    const gstinResult = await apiSetuService.verifyGstin({
      gstin: '27AAAAA0000A1Z5',
      legalName: 'TEST ENTERPRISES'
    });
    console.log('GSTIN Result:', gstinResult);

    console.log('\n--- 3. Testing Aadhaar Verification ---');
    const aadhaarResult = await apiSetuService.verifyAadhaar({
      uid: '123456789012',
      fullName: 'TEST USER',
      dob: '1990-01-01'
    });
    console.log('Aadhaar Result:', aadhaarResult);

    console.log('\n--- 4. Testing Driving License Verification ---');
    const dlResult = await apiSetuService.verifyDrivingLicense({
      dlNo: 'DL-1420110012345',
      dob: '1990-01-01'
    });
    console.log('Driving License Result:', dlResult);

    console.log('\n--- 5. Testing MSME Udyam Verification ---');
    const udyamResult = await apiSetuService.verifyUdyam({
      udyamNo: 'UDYAM-MH-01-0012345'
    });
    console.log('Udyam Result:', udyamResult);

    console.log('\n✅ ALL API SETU VERIFICATION TESTS COMPLETED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

testApiSetu();
