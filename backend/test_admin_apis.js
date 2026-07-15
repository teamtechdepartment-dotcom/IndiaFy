import axios from "axios";

const BASE_URL = "http://localhost:8000/api/v1/indiafy";

const adminCredentials = {
  email: "kishan12@gmail.com",
  password: "kishan1234"
};

async function runTests() {
  console.log("Starting Admin API Integration Tests...");
  let cookieHeader = "";

  try {
    console.log("\n[1] Testing Admin Login...");
    const loginRes = await axios.post(`${BASE_URL}/admin/auth/login`, adminCredentials);
    const cookies = loginRes.headers['set-cookie'];
    if (cookies) {
      cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');
      console.log("✅ Admin Login Successful. Token acquired.");
    } else {
      console.error("❌ Admin Login failed to return cookies!");
      return;
    }
  } catch (err) {
    console.error("❌ Admin Login failed:", err.response?.data || err.message);
    return;
  }

  const axiosInst = axios.create({
    headers: { Cookie: cookieHeader }
  });

  const endpointsToTest = [
    { name: "Pending Sellers", method: "GET", url: `${BASE_URL}/admin/management/sellers?status=Pending` },
    { name: "Active Sellers", method: "GET", url: `${BASE_URL}/admin/management/sellers?status=Active` },
    { name: "All Customers", method: "GET", url: `${BASE_URL}/admin/management/customers` },
    { name: "All Orders", method: "GET", url: `${BASE_URL}/admin/management/orders` },
    { name: "All Products", method: "GET", url: `${BASE_URL}/admin/management/products` },
    { name: "Categories", method: "GET", url: `${BASE_URL}/admin/management/categories` },
    { name: "Dashboard Stats", method: "GET", url: `${BASE_URL}/admin/management/dashboard/stats` },
  ];

  let passed = 0;
  for (const ep of endpointsToTest) {
    try {
      console.log(`\nTesting [${ep.name}] - ${ep.method} ${ep.url}`);
      const res = await axiosInst({ method: ep.method, url: ep.url });
      console.log(`✅ Success! Status: ${res.status}`);
      // Print sample of data
      const dataSample = Array.isArray(res.data.data) 
        ? `Array(${res.data.data.length})` 
        : typeof res.data.data === 'object' 
          ? `Object with keys: ${Object.keys(res.data.data || {}).join(', ')}`
          : typeof res.data;
      console.log(`   Response Data Structure: ${dataSample}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAILED! Status: ${err.response?.status}`);
      console.error(`   Error Message: ${JSON.stringify(err.response?.data || err.message)}`);
    }
  }

  console.log(`\n--- Test Complete: ${passed}/${endpointsToTest.length} endpoints passed ---`);
}

runTests();
