import ProductModel from "../../models/products/product.model.js";
import CategoryModel from "../../models/products/category.model.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "https://indiafy.com";

// Helper for generating XML
const generateXml = (urls) => {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  urls.forEach(url => {
    xml += '  <url>\n';
    xml += `    <loc>${url.loc}</loc>\n`;
    if (url.lastmod) xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
    if (url.changefreq) xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
    if (url.priority) xml += `    <priority>${url.priority}</priority>\n`;
    xml += '  </url>\n';
  });
  xml += '</urlset>';
  return xml;
};

export const getSitemapIndex = (req, res) => {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  const sitemaps = [
    `${FRONTEND_URL}/sitemap-pages.xml`,
    `${FRONTEND_URL}/sitemap-products.xml`,
    `${FRONTEND_URL}/sitemap-categories.xml`,
    `${FRONTEND_URL}/sitemap-brands.xml`,
    `${FRONTEND_URL}/sitemap-locations.xml`,
  ];
  
  sitemaps.forEach(loc => {
    xml += '  <sitemap>\n';
    xml += `    <loc>${loc}</loc>\n`;
    xml += '  </sitemap>\n';
  });
  xml += '</sitemapindex>';

  res.header("Content-Type", "application/xml");
  res.send(xml);
};

export const getPagesSitemap = (req, res) => {
  const urls = [
    { loc: `${FRONTEND_URL}/`, priority: "1.0", changefreq: "daily" },
    { loc: `${FRONTEND_URL}/about`, priority: "0.8", changefreq: "monthly" },
    { loc: `${FRONTEND_URL}/contact`, priority: "0.8", changefreq: "monthly" },
    { loc: `${FRONTEND_URL}/faq`, priority: "0.8", changefreq: "monthly" }
  ];
  const xml = generateXml(urls);
  res.header("Content-Type", "application/xml");
  res.send(xml);
};

export const getProductsSitemap = async (req, res) => {
  try {
    res.header("Content-Type", "application/xml");
    res.write('<?xml version="1.0" encoding="UTF-8"?>\n');
    res.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n');

    const cursor = ProductModel.find({ status: "ACTIVE", isDeleted: false, isActive: true }, "slug _id updatedAt").cursor();

    for await (const p of cursor) {
      const slugOrId = p.slug || p._id.toString();
      const lastmod = p.updatedAt ? p.updatedAt.toISOString() : new Date().toISOString();
      res.write('  <url>\n');
      res.write(`    <loc>${FRONTEND_URL}/product/${slugOrId}</loc>\n`);
      res.write(`    <lastmod>${lastmod}</lastmod>\n`);
      res.write(`    <changefreq>weekly</changefreq>\n`);
      res.write(`    <priority>0.9</priority>\n`);
      res.write('  </url>\n');
    }

    res.write('</urlset>');
    res.end();
  } catch (error) {
    console.error("Products sitemap error:", error);
    if (!res.headersSent) {
      res.status(500).send("Error generating sitemap");
    } else {
      res.end();
    }
  }
};

export const getCategoriesSitemap = async (req, res) => {
  try {
    const categories = await CategoryModel.find({}, "name updatedAt");
    
    const urls = categories.map(c => {
      // Category listing page expects categoryName parameter
      // Normalize it similarly to how the frontend routes it
      const categoryPath = encodeURIComponent(c.name);
      return {
        loc: `${FRONTEND_URL}/category/${categoryPath}`,
        lastmod: c.updatedAt ? c.updatedAt.toISOString() : new Date().toISOString(),
        changefreq: "weekly",
        priority: "0.8"
      };
    });

    const xml = generateXml(urls);
    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (error) {
    console.error("Categories sitemap error:", error);
    res.status(500).send("Error generating sitemap");
  }
};

export const getRobotsTxt = (req, res) => {
  const robots = `User-agent: *
Allow: /
Allow: /product/
Allow: /category/
Allow: /seller/
Disallow: /cart
Disallow: /checkout
Disallow: /payment
Disallow: /account
Disallow: /admin
Disallow: /api
Disallow: /search
Disallow: /*?sort=
Disallow: /*?price=
Disallow: /*?ref=

Sitemap: ${FRONTEND_URL}/sitemap.xml
`;
  res.header("Content-Type", "text/plain");
  res.send(robots);
};

export const getLlmsTxt = (req, res) => {
  const llms = `# IndiaFy Public Site Overview

IndiaFy is an ecommerce platform connecting customers with local retail, wholesale, and quick-commerce sellers.

## Public Navigation
- Homepage: ${FRONTEND_URL}/
- Search: ${FRONTEND_URL}/search (Use search parameters internally only)

## Sitemaps
- Index: ${FRONTEND_URL}/sitemap.xml
- Products: ${FRONTEND_URL}/sitemap-products.xml
- Categories: ${FRONTEND_URL}/sitemap-categories.xml

## Important Policies
- Terms and Conditions: ${FRONTEND_URL}/terms-and-conditions
- Privacy Policy: ${FRONTEND_URL}/privacy-policy
- Refund Policy: ${FRONTEND_URL}/refund-policy

Note: Customer data, personalized recommendation algorithms, and admin panels are strictly private.
`;
  res.header("Content-Type", "text/plain");
  res.send(llms);
};

export const getBrandsSitemap = async (req, res) => {
  try {
    const brands = await ProductModel.aggregate([
      { $match: { status: "ACTIVE", isDeleted: false, isActive: true, brand: { $ne: "", $ne: null } } },
      { $group: { _id: { $toLower: { $trim: { input: "$brand" } } }, originalBrand: { $first: "$brand" }, count: { $sum: 1 } } },
      { $match: { count: { $gte: 10 } } }
    ]);
    
    const formatted = brands.map(b => ({
      brand: b.originalBrand,
      slug: b._id.replace(/[^a-z0-9\s-]/g, "").replace(/[\s-]+/g, "-").replace(/^-+|-+$/g, ""),
      count: b.count
    }));
    
    const slugMap = {};
    formatted.forEach(b => {
      if (slugMap[b.slug]) slugMap[b.slug].push(b.brand);
      else slugMap[b.slug] = [b.brand];
    });
    const safeBrands = formatted.filter(b => slugMap[b.slug].length === 1);

    const urls = safeBrands.map(b => ({
      loc: `${FRONTEND_URL}/brand/${b.slug}`,
      changefreq: "weekly",
      priority: "0.7"
    }));

    const xml = generateXml(urls);
    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (error) {
    console.error("Brands sitemap error:", error);
    res.status(500).send("Error generating sitemap");
  }
};

export const getLocationsSitemap = async (req, res) => {
  try {
    const SellerNodeModel = (await import("../../models/sellerNodes/sellerNode.model.js")).default;
    const nodes = await SellerNodeModel.aggregate([
      { $match: { status: { $in: ["APPROVED", "approved"] }, city: { $ne: "", $ne: null } } },
      { $group: { _id: { $toLower: { $trim: { input: "$city" } } }, originalCity: { $first: "$city" }, nodeCount: { $sum: 1 }, nodeIds: { $push: "$_id" } } }
    ]);

    const eligibleCities = [];
    for (const city of nodes) {
      const productCount = await ProductModel.countDocuments({
        status: "ACTIVE",
        isDeleted: false,
        isActive: true,
        nodeId: { $in: city.nodeIds }
      });
      if (productCount >= 10 && (city.nodeCount >= 2 || productCount >= 25)) {
        eligibleCities.push({
          city: city.originalCity,
          slug: city._id.replace(/[^a-z0-9\s-]/g, "").replace(/[\s-]+/g, "-").replace(/^-+|-+$/g, ""),
          nodeCount: city.nodeCount,
          productCount
        });
      }
    }

    const slugMap = {};
    eligibleCities.forEach(c => {
      if (slugMap[c.slug]) slugMap[c.slug].push(c.city);
      else slugMap[c.slug] = [c.city];
    });
    const safeCities = eligibleCities.filter(c => slugMap[c.slug].length === 1);

    const urls = safeCities.map(c => ({
      loc: `${FRONTEND_URL}/location/${c.slug}`,
      changefreq: "weekly",
      priority: "0.7"
    }));

    const xml = generateXml(urls);
    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (error) {
    console.error("Locations sitemap error:", error);
    res.status(500).send("Error generating sitemap");
  }
};
