const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:8000/api/v1';

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
    const form = new FormData();
    form.append('nodeType', 'local_seller');
    form.append('businessName', 'Test Business ' + randomStr);
    form.append('businessType', 'sole_proprietorship');
    form.append('panNumber', 'ABCDE1234F');
    form.append('aadhaarNumber', '123456789012');
    form.append('gstNumber', '22AAAAA0000A1Z5');
    form.append('fssaiNumber', '12345678901234');
    form.append('address', '123 Test St, Gurugram');
    form.append('city', 'Gurugram');
    form.append('state', 'Haryana');
    form.append('pincode', '122001');
    form.append('latitude', '28.4595');
    form.append('longitude', '77.0266');
    form.append('primaryCategory', 'electronics');
    form.append('subCategories', 'mobiles,accessories'); 
    form.append('description', 'A test store for e2e flow');
    form.append('deliveryModes', 'self_delivery');
    
    // Append dummy files
    const fileFields = ['aadhaarFront', 'aadhaarBack', 'panCard', 'gstCertificate', 'foodLicense', 'cancelledCheque', 'bankStatement', 'storePhoto', 'storeBanner'];
    for (const field of fileFields) {
      form.append(field, fs.createReadStream(DUMMY_FILE_PATH));
    }

    const applyRes = await axios.post(`${BASE_URL}/seller/application/apply`, form, {
      headers: {
        ...form.getHeaders(),
        'Cookie': `SellerAccessToken=${sellerToken}`
      }
    });
    
    console.log('Application submission success:', applyRes.data.message);
    applicationId = applyRes.data.data?._id || applyRes.data.data?.application?._id;
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
    adminToken = adminLoginRes.data.accessToken;
  } catch (error) {
    console.error('Admin login failed:', error.response?.data || error.message);
    return;
  }

  // 5. Admin Approve Store Application
  if (applicationId) {
    try {
      console.log(`[5] Admin approving application: ${applicationId}...`);
      const approveRes = await axios.put(`${BASE_URL}/admin/management/seller-applications/${applicationId}/approve`, {}, {
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
    const statusRes = await axios.get(`${BASE_URL}/seller/application/node/local_seller`, {
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
