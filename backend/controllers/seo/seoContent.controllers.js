import mongoose from "mongoose";
import ProductModel from "../../models/products/product.model.js";
import CategoryModel from "../../models/products/category.model.js";
import SellerNodeModel from "../../models/sellerNodes/sellerNode.model.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "https://indiafy.com";

const normalizeSlug = (str) => {
    if (!str) return "";
    return str.toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/[\s-]+/g, "-")
        .replace(/^-+|-+$/g, "");
};

// 1. getCategorySeoContent
export const getCategorySeoContent = async (req, res) => {
    try {
        const { categorySlug } = req.params;
        const categoryName = categorySlug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

        const category = await CategoryModel.findOne({
            $or: [
                { categoryName: new RegExp(`^${categoryName}$`, 'i') },
                { categoryName: new RegExp(`^${categorySlug.replace(/-/g, ' ')}$`, 'i') }
            ]
        });

        // Basic active products match
        const matchStage = {
            status: "ACTIVE",
            isDeleted: false,
            isActive: true,
            categoryName: category ? category.categoryName : new RegExp(`^${categorySlug.replace(/-/g, ' ')}$`, 'i')
        };

        const activeProductCount = await ProductModel.countDocuments(matchStage);

        if (activeProductCount < 1) {
            return res.status(404).json({ success: false, message: "Category not found or empty" });
        }

        // Get popular brands in category
        const brandAgg = await ProductModel.aggregate([
            { $match: matchStage },
            { $group: { _id: "$brand", count: { $sum: 1 } } },
            { $match: { _id: { $ne: "" }, count: { $gte: 2 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);
        const brands = brandAgg.map(b => b._id);

        const seoTitle = category?.seoTitle || `${category?.categoryName || categoryName} | Buy Online | IndiaFy`;
        const seoDescription = category?.seoDescription || `Explore ${category?.categoryName || categoryName} on IndiaFy, with ${activeProductCount} products available across relevant categories and brands.`;
        
        let intro = `Explore ${category?.categoryName || categoryName} on IndiaFy, with ${activeProductCount} products available across relevant categories and brands.`;
        if (brands.length > 0) {
            intro += ` Popular brands include ${brands.join(", ")}.`;
        }

        res.status(200).json({
            success: true,
            data: {
                title: seoTitle,
                description: seoDescription,
                intro,
                activeProductCount,
                popularBrands: brands,
                canonical: `${FRONTEND_URL}/category/${categorySlug}`
            }
        });
    } catch (error) {
        console.error("Error in getCategorySeoContent:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// 2. getEligibleBrands
export const getEligibleBrands = async (req, res) => {
    try {
        const brands = await ProductModel.aggregate([
            { $match: { status: "ACTIVE", isDeleted: false, isActive: true, brand: { $ne: "", $ne: null } } },
            { $group: { _id: { $toLower: { $trim: { input: "$brand" } } }, originalBrand: { $first: "$brand" }, count: { $sum: 1 } } },
            { $match: { count: { $gte: 10 } } }, // Threshold: 10 active products
            { $sort: { count: -1 } }
        ]);

        const formatted = brands.map(b => ({
            brand: b.originalBrand,
            slug: normalizeSlug(b._id),
            count: b.count
        }));

        // Detect collisions
        const slugMap = {};
        formatted.forEach(b => {
            if (slugMap[b.slug]) slugMap[b.slug].push(b.brand);
            else slugMap[b.slug] = [b.brand];
        });

        const safeBrands = formatted.filter(b => slugMap[b.slug].length === 1);

        res.status(200).json({ success: true, data: safeBrands });
    } catch (error) {
        console.error("Error in getEligibleBrands:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// 3. getBrandSeoContent
export const getBrandSeoContent = async (req, res) => {
    try {
        const { brandSlug } = req.params;

        // Verify eligibility
        const brands = await ProductModel.aggregate([
            { $match: { status: "ACTIVE", isDeleted: false, isActive: true, brand: { $ne: "", $ne: null } } },
            { $group: { _id: { $toLower: { $trim: { input: "$brand" } } }, originalBrand: { $first: "$brand" }, count: { $sum: 1 } } },
            { $match: { count: { $gte: 10 } } }
        ]);

        const formatted = brands.map(b => ({
            brand: b.originalBrand,
            slug: normalizeSlug(b._id),
            count: b.count
        }));

        const matchingBrands = formatted.filter(b => b.slug === brandSlug);
        
        if (matchingBrands.length === 0) {
            return res.status(404).json({ success: false, message: "Brand not eligible or not found" });
        }
        if (matchingBrands.length > 1) {
            return res.status(409).json({ success: false, message: "Ambiguous brand slug collision" });
        }

        const brandData = matchingBrands[0];

        // Get popular categories for this brand
        const catAgg = await ProductModel.aggregate([
            { $match: { status: "ACTIVE", isDeleted: false, isActive: true, brand: brandData.brand } },
            { $group: { _id: "$categoryName", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);
        const categories = catAgg.filter(c => c._id).map(c => c._id);

        res.status(200).json({
            success: true,
            data: {
                brand: brandData.brand,
                slug: brandData.slug,
                activeProductCount: brandData.count,
                title: `${brandData.brand} Products | Buy Online | IndiaFy`,
                description: `Shop ${brandData.brand} online on IndiaFy. Explore ${brandData.count} active products across ${categories.length > 0 ? categories.join(', ') : 'multiple categories'}.`,
                intro: `Discover ${brandData.brand} products on IndiaFy, with ${brandData.count} products available across relevant categories.`,
                relatedCategories: categories,
                canonical: `${FRONTEND_URL}/brand/${brandData.slug}`
            }
        });
    } catch (error) {
        console.error("Error in getBrandSeoContent:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// 4. getEligibleLocations
export const getEligibleLocations = async (req, res) => {
    try {
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
                    slug: normalizeSlug(city._id),
                    nodeCount: city.nodeCount,
                    productCount
                });
            }
        }

        // Detect collisions
        const slugMap = {};
        eligibleCities.forEach(c => {
            if (slugMap[c.slug]) slugMap[c.slug].push(c.city);
            else slugMap[c.slug] = [c.city];
        });

        const safeCities = eligibleCities.filter(c => slugMap[c.slug].length === 1);

        res.status(200).json({ success: true, data: safeCities });
    } catch (error) {
        console.error("Error in getEligibleLocations:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// 5. getLocationSeoContent
export const getLocationSeoContent = async (req, res) => {
    try {
        const { citySlug } = req.params;

        const nodes = await SellerNodeModel.aggregate([
            { $match: { status: { $in: ["APPROVED", "approved"] }, city: { $ne: "", $ne: null } } },
            { $group: { _id: { $toLower: { $trim: { input: "$city" } } }, originalCity: { $first: "$city" }, nodeCount: { $sum: 1 }, nodeIds: { $push: "$_id" } } }
        ]);

        let matchedCity = null;
        for (const city of nodes) {
            if (normalizeSlug(city._id) === citySlug) {
                const productCount = await ProductModel.countDocuments({
                    status: "ACTIVE",
                    isDeleted: false,
                    isActive: true,
                    nodeId: { $in: city.nodeIds }
                });

                if (productCount >= 10 && (city.nodeCount >= 2 || productCount >= 25)) {
                    if (matchedCity) {
                        return res.status(409).json({ success: false, message: "Ambiguous city slug collision" });
                    }
                    matchedCity = {
                        city: city.originalCity,
                        slug: citySlug,
                        nodeCount: city.nodeCount,
                        productCount,
                        nodeIds: city.nodeIds
                    };
                }
            }
        }

        if (!matchedCity) {
            return res.status(404).json({ success: false, message: "Location not eligible or not found" });
        }

        // Get popular categories for this location
        const catAgg = await ProductModel.aggregate([
            { $match: { status: "ACTIVE", isDeleted: false, isActive: true, nodeId: { $in: matchedCity.nodeIds } } },
            { $group: { _id: "$categoryName", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 8 }
        ]);
        const categories = catAgg.filter(c => c._id).map(c => c._id);

        res.status(200).json({
            success: true,
            data: {
                city: matchedCity.city,
                slug: matchedCity.slug,
                activeProductCount: matchedCity.productCount,
                title: `Buy Products Online in ${matchedCity.city} | IndiaFy`,
                description: `Shop online in ${matchedCity.city} on IndiaFy. Explore ${matchedCity.productCount} active products available from local stores with quick delivery.`,
                intro: `Explore a wide range of products in ${matchedCity.city} on IndiaFy, with ${matchedCity.productCount} items available across popular categories.`,
                availableCategories: categories,
                canonical: `${FRONTEND_URL}/location/${matchedCity.slug}`
            }
        });
    } catch (error) {
        console.error("Error in getLocationSeoContent:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
