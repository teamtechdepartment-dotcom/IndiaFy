const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:8000/api/v1/indiafy';

// We'll generate a random string to ensure unique emails
const randomStr = Math.random().toString(36).substring(7);
const SELLER_EMAIL = `test_seller_${randomStr}@indiafy.com`;
const SELLER_PASSWORD = 'Password123@';
const ADMIN_EMAIL = 'kishan12@gmail.com';
const ADMIN_PASSWORD = 'kishan1234';

const DUMMY_FILE_PATH = path.join(__dirname, 'dummy_image.jpg');

async function createDummyFile() {
  if (!fs.existsSync(DUMMY_FILE_PATH)) {
    const base64Data = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";
    fs.writeFileSync(DUMMY_FILE_PATH, Buffer.from(base64Data, 'base64'));
  }
}

async function runTests() {
  let sellerToken = '';
  let adminToken = '';
  let storeId = '';
  let applicationId = '';

  console.log('--- Starting IndiaFy Seller Flow E2E Test ---');

  await createDummyFile();

  // 1. Seller Signup
  try {
    console.log(`[1] Signing up seller with email: ${SELLER_EMAIL}...`);
    const signupRes = await axios.post(`${BASE_URL}/seller/auth/signup`, {
      firstName: 'Test',
      lastName: 'Seller',
      email: SELLER_EMAIL,
      password: SELLER_PASSWORD,
    });
    console.log('Signup success:', signupRes.data.message);
    sellerToken = signupRes.data.data.accessToken;
  } catch (error) {
    console.error('Signup failed:', error.response?.data || error.message);
    return;
  }

  // 2. Seller Login
  try {
    console.log(`[2] Logging in seller: ${SELLER_EMAIL}...`);
    const loginRes = await axios.post(`${BASE_URL}/seller/auth/login`, {
      email: SELLER_EMAIL,
      password: SELLER_PASSWORD,
    });
    console.log('Login success:', loginRes.data.message);
    sellerToken = loginRes.data.accessToken;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    return;
  }

  // 3. Submit Store Application
  try {
    console.log('[3] Submitting store application...');
    const dummyBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';
    
    const randomDigits = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digits
    const applyPayload = {
      nodeType: 'LOCAL_RETAIL',
      storeName: 'Test Business ' + randomStr,
      storeDescription: 'A test store for e2e flow',
      address: '123 Test St, Gurugram',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122001',
      latitude: '28.4595',
      longitude: '77.0266',
      ownerFullName: 'Test Owner',
      ownerEmail: SELLER_EMAIL,
      ownerPhone: '9876543210',
      businessType: 'sole_proprietorship',
      panNumber: `ABCDE${randomDigits}F`,
      aadhaarNumber: `12345678${randomDigits}`,
      gstNumber: `22AAAAA${randomDigits}A1Z5`,
      fssaiNumber: `1234567890${randomDigits}`,
      bankAccountNumber: `123456${randomDigits}`,
      ifscCode: 'SBIN0001234',
      bankName: 'State Bank of India',
      aadhaarFront: dummyBase64,
      aadhaarBack: dummyBase64,
      panCard: dummyBase64,
      gstCertificate: dummyBase64,
      foodLicense: dummyBase64,
      cancelledCheque: dummyBase64,
      bankStatement: dummyBase64,
      storePhoto: dummyBase64,
      storeBanner: dummyBase64
    };

    const applyRes = await axios.post(`${BASE_URL}/seller/applications/apply`, applyPayload, {
      headers: {
        'Cookie': `SellerAccessToken=${sellerToken}`
      }
    });
    
    console.log('Application submission success:', applyRes.data.message);
    applicationId = applyRes.data.application?.applicationId;
    console.log('Extracted applicationId:', applicationId);
  } catch (error) {
    console.error('Application submission failed:', error.response?.data || error.message);
    return;
  }

  // 4. Admin Login
  try {
    console.log(`[4] Logging in admin: ${ADMIN_EMAIL}...`);
    const adminLoginRes = await axios.post(`${BASE_URL}/admin/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    console.log('Admin login success:', adminLoginRes.data.message);
    adminToken = adminLoginRes.data.data?.accessToken || adminLoginRes.data.accessToken;
  } catch (error) {
    console.error('Admin login failed:', error.response?.data || error.message);
    return;
  }

  // 5. Admin Approve Store Application
  if (applicationId) {
    try {
      console.log(`[5] Admin approving application... Fetching list to find _id for applicationId: ${applicationId}`);
      const appsRes = await axios.get(`${BASE_URL}/admin/management/seller-applications`, {
        headers: {
          'Cookie': `AdminAccessToken=${adminToken}`
        }
      });
      const apps = appsRes.data.data?.applications || appsRes.data.data || [];
      const targetApp = apps.find(a => a.applicationId === applicationId || a._id === applicationId);
      const targetId = targetApp ? targetApp._id : applicationId;
      
      if (!targetId) {
         console.error('Could not find application _id for approval');
         return;
      }
      
      console.log(`Approving application _id: ${targetId}...`);
      const approveRes = await axios.put(`${BASE_URL}/admin/management/seller-applications/${targetId}/approve`, {}, {
        headers: {
          'Cookie': `AdminAccessToken=${adminToken}`
        }
      });
      console.log('Admin approval success:', approveRes.data.message);
    } catch (error) {
      console.error('PUT approval failed:', error.response?.data || error.message);
      try {
          console.log('Trying PATCH approval...');
          const approveRes = await axios.patch(`${BASE_URL}/admin/management/seller-applications/${applicationId}/approve`, {}, {
              headers: { 'Cookie': `AdminAccessToken=${adminToken}` }
          });
          console.log('Admin approval success via PATCH:', approveRes.data.message);
      } catch (err2) {
           console.error('PATCH approval also failed:', err2.response?.data || err2.message);
      }
    }
  } else {
    console.log('[5] Skipping admin approval because applicationId is missing');
  }

  // 6. Check Application Status from Seller Side
  try {
    console.log('[6] Fetching Seller Application Status...');
    const statusRes = await axios.get(`${BASE_URL}/seller/applications/node/LOCAL_RETAIL`, {
      headers: {
        'Cookie': `SellerAccessToken=${sellerToken}`
      }
    });
    console.log('Application status fetched successfully.');
    console.log('Store status:', statusRes.data?.data?.status);
  } catch (error) {
    console.error('Fetching status failed:', error.response?.data || error.message);
  }

  console.log('--- E2E Test Finished ---');
}

runTests();
