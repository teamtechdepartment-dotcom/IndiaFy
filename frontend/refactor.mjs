import fs from 'fs';
import path from 'path';

const srcDir = 'c:\\Users\\mukun\\Downloads\\Indiafy\\src';

const dirsToCreate = [
  'pages/auth',
  'pages/admin',
  'pages/seller',
  'pages/customer',
  'pages/public'
];

dirsToCreate.forEach(dir => {
  const fullPath = path.join(srcDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

const moves = [
  { from: 'frontend/pages/admin', to: 'pages/admin', isDir: true },
  { from: 'frontend/pages/SellerDashboard', to: 'pages/seller', isDir: true },
  { from: 'frontend/pages/SellerAuth.jsx', to: 'pages/auth/SellerAuth.jsx' },
  { from: 'components/HomePage/UserSignup.jsx', to: 'pages/auth/UserSignup.jsx' },
  { from: 'components/HomePage/Customerprofile.jsx', to: 'pages/customer/Customerprofile.jsx' },
  { from: 'components/HomePage/Savedaddresses.jsx', to: 'pages/customer/Savedaddresses.jsx' },
  { from: 'components/HomePage/Orderhistorypage.jsx', to: 'pages/customer/Orderhistorypage.jsx' },
  { from: 'components/HomePage/Ordertrackingpage.jsx', to: 'pages/customer/Ordertrackingpage.jsx' },
  { from: 'components/HomePage/Customersupport.jsx', to: 'pages/customer/Customersupport.jsx' },
  { from: 'components/HomePage/Wholesalepage.jsx', to: 'pages/public/Wholesalepage.jsx' },
  { from: 'components/HomePage/Cartpage.jsx', to: 'pages/customer/Cartpage.jsx' },
  { from: 'components/HomePage/Checkoutpage.jsx', to: 'pages/customer/Checkoutpage.jsx' },
  { from: 'components/HomePage/Paymentpage.jsx', to: 'pages/customer/Paymentpage.jsx' },
  { from: 'components/HomePage/Ordersuccesspage.jsx', to: 'pages/customer/Ordersuccesspage.jsx' },
  { from: 'components/HomePage/Productdetailpage.jsx', to: 'pages/public/Productdetailpage.jsx' },
  { from: 'components/HomePage/Categorylistingpage.jsx', to: 'pages/public/Categorylistingpage.jsx' },
  { from: 'components/HomePage/Searchresultspage.jsx', to: 'pages/public/Searchresultspage.jsx' },
  { from: 'pages/Home.jsx', to: 'pages/public/Home.jsx' },
  { from: 'pages/About.jsx', to: 'pages/public/About.jsx' },
  { from: 'pages/LocalSellers.jsx', to: 'pages/public/LocalSellers.jsx' },
  { from: 'pages/QuickCommerce.jsx', to: 'pages/public/QuickCommerce.jsx' },
  { from: 'pages/StorePage.jsx', to: 'pages/public/StorePage.jsx' },
  { from: 'pages/TermsAndConditions.jsx', to: 'pages/public/TermsAndConditions.jsx' },
  { from: 'pages/PrivacyPolicy.jsx', to: 'pages/public/PrivacyPolicy.jsx' },
];

moves.forEach(move => {
  try {
    const fromPath = path.join(srcDir, move.from);
    const toPath = path.join(srcDir, move.to);
    
    if (move.isDir) {
        if(fs.existsSync(fromPath)) {
            const files = fs.readdirSync(fromPath);
            files.forEach(file => {
                fs.renameSync(path.join(fromPath, file), path.join(toPath, file));
            });
        }
    } else {
        if (fs.existsSync(fromPath)) {
            fs.renameSync(fromPath, toPath);
        }
    }
  } catch (err) {
    console.error(`Error moving ${move.from}: ${err.message}`);
  }
});

// Admin Login/Signup need special handling because we moved admin dir
try {
  const adminLoginOld = path.join(srcDir, 'pages/admin/AdminLogin.jsx');
  const adminLoginNew = path.join(srcDir, 'pages/auth/AdminLogin.jsx');
  if (fs.existsSync(adminLoginOld)) fs.renameSync(adminLoginOld, adminLoginNew);
} catch(e) {}

try {
  const adminSignupOld = path.join(srcDir, 'pages/admin/AdminSignup.jsx');
  const adminSignupNew = path.join(srcDir, 'pages/auth/AdminSignup.jsx');
  if (fs.existsSync(adminSignupOld)) fs.renameSync(adminSignupOld, adminSignupNew);
} catch(e) {}
