import { Router } from "express";
import {
  getSitemapIndex,
  getPagesSitemap,
  getProductsSitemap,
  getCategoriesSitemap,
  getRobotsTxt,
  getLlmsTxt,
  getBrandsSitemap,
  getLocationsSitemap
} from "../../controllers/seo/seo.controllers.js";

import {
  getCategorySeoContent,
  getEligibleBrands,
  getBrandSeoContent,
  getEligibleLocations,
  getLocationSeoContent
} from "../../controllers/seo/seoContent.controllers.js";

const router = Router();

router.get("/sitemap.xml", getSitemapIndex);
router.get("/sitemap-pages.xml", getPagesSitemap);
router.get("/sitemap-products.xml", getProductsSitemap);
router.get("/sitemap-categories.xml", getCategoriesSitemap);
router.get("/sitemap-brands.xml", getBrandsSitemap);
router.get("/sitemap-locations.xml", getLocationsSitemap);
router.get("/robots.txt", getRobotsTxt);
router.get("/llms.txt", getLlmsTxt);

// New SEO Content Routes
router.get("/content/category/:categorySlug", getCategorySeoContent);
router.get("/content/brands", getEligibleBrands);
router.get("/content/brand/:brandSlug", getBrandSeoContent);
router.get("/content/locations", getEligibleLocations);
router.get("/content/location/:citySlug", getLocationSeoContent);

export default router;
