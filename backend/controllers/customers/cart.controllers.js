import Cart from "../../models/customers/cart.model.js";
import ApiError from "../../utils/apiError.js";
import ApiResponse from "../../utils/apiResponse.js";
import Product from "../../models/products/product.model.js";
import { getActiveCampaigns, resolveProductPricing, roundToTwoDecimals } from "../../services/pricing.service.js";

export const addToCart = async (req, res) => {
    try {
        const customerId = req.user._id;
        const { productId, quantity } = req.body;

        if (!productId) {
            return res.status(400).json(new ApiError(400, "Product ID is required"));
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json(new ApiError(404, "Product not found"));
        }

        const parsedQuantity = quantity ? parseInt(quantity) : 1;
        const availableStock = parseInt(product.attribute?.quantity || "0");

        if (availableStock < parsedQuantity) {
            return res.status(400).json(new ApiError(400, `Insufficient stock. Only ${availableStock} units available.`));
        }

        // --- PRICING RESOLUTION (CAMPAIGN + WHOLESALE) ---
        const activeCampaigns = await getActiveCampaigns();
        const campaignPricing = resolveProductPricing(product, activeCampaigns);
        let finalPrice = campaignPricing.salePrice;
        let isWholesale = product.isWholesale || false;
        let gstAmount = 0;

        if (isWholesale) {
            if (parsedQuantity < (product.minimumOrderQty || 1)) {
                return res.status(400).json(new ApiError(400, `Minimum order quantity is ${product.minimumOrderQty || 1}`));
            }
            if (product.bulkPricing && product.bulkPricing.length > 0) {
                const sortedTiers = [...product.bulkPricing].sort((a, b) => b.minQty - a.minQty);
                const tier = sortedTiers.find(t => parsedQuantity >= t.minQty);
                if (tier) {
                    finalPrice = tier.pricePerUnit;
                }
            }
            gstAmount = roundToTwoDecimals((finalPrice * parsedQuantity) * ((product.gstPercentage || 0) / 100));
        }

        let cart = await Cart.findOne({ customerId });

        if (cart) {
            // Cart exists
            let itemIndex = cart.items.findIndex(p => p.productId.toString() === productId);

            if (itemIndex > -1) {
                // Update quantity
                let productItem = cart.items[itemIndex];
                
                if (productItem.quantity + parsedQuantity > availableStock) {
                    return res.status(400).json(new ApiError(400, `Cannot add more. You already have ${productItem.quantity} in cart and total stock is ${availableStock}.`));
                }

                // Keep track of the actual change in quantity
                if (productItem.quantity + parsedQuantity <= 0) {
                    cart.items.splice(itemIndex, 1);
                    cart.totalPrice -= productItem.price * productItem.quantity; // Revert old price
                } else {
                    // Recalculate price if wholesale tier changed due to new quantity
                    let newQty = productItem.quantity + parsedQuantity;
                    if (isWholesale && product.bulkPricing && product.bulkPricing.length > 0) {
                        const sortedTiers = [...product.bulkPricing].sort((a, b) => b.minQty - a.minQty);
                        const tier = sortedTiers.find(t => newQty >= t.minQty);
                        if (tier) finalPrice = tier.pricePerUnit;
                    }
                    
                    // Remove old item total, add new item total
                    cart.totalPrice -= productItem.price * productItem.quantity;
                    productItem.quantity = newQty;
                    productItem.price = finalPrice;
                    if (isWholesale) {
                        productItem.gstAmount = roundToTwoDecimals((finalPrice * newQty) * ((product.gstPercentage || 0) / 100));
                    }
                    cart.totalPrice += finalPrice * newQty;
                    cart.items[itemIndex] = productItem;
                }
            } else {
                // Add new item
                if (parsedQuantity > 0) {
                    cart.items.push({ productId, quantity: parsedQuantity, price: finalPrice, isWholesale, gstAmount });
                    cart.totalPrice += parsedQuantity * finalPrice;
                }
            }
            cart.totalPrice = roundToTwoDecimals(cart.totalPrice);
            await cart.save();
        } else {
            // New cart
            const totalPrice = roundToTwoDecimals(parsedQuantity * finalPrice);
            cart = await Cart.create({
                customerId,
                items: [{ productId, quantity: parsedQuantity, price: finalPrice, isWholesale, gstAmount }],
                totalPrice
            });
        }

        // Populate before returning
        await cart.populate("items.productId", "productName attribute productImage sellerId isWholesale minimumOrderQty gstPercentage");

        return res.status(200).json(new ApiResponse(200, cart, "Item added to cart"));
    } catch (error) {
        return res.status(500).json(new ApiError(500, error.message, [error]));
    }
};

export const getCart = async (req, res) => {
    try {
        const customerId = req.user._id;
        const cart = await Cart.findOne({ customerId }).populate("items.productId", "productName attribute productImage sellerId isWholesale minimumOrderQty gstPercentage");
        
        if (!cart) {
            return res.status(200).json(new ApiResponse(200, { items: [], totalPrice: 0 }, "Cart is empty"));
        }

        // Dynamically re-evaluate against currently active campaigns
        const activeCampaigns = await getActiveCampaigns();
        let cartChanged = false;
        let runningTotal = 0;

        for (const item of cart.items) {
            if (!item.productId) continue;
            const prod = item.productId;
            const pricing = resolveProductPricing(prod, activeCampaigns);
            
            let itemPrice = pricing.salePrice;
            if (item.isWholesale && prod.bulkPricing && prod.bulkPricing.length > 0) {
                const sortedTiers = [...prod.bulkPricing].sort((a, b) => b.minQty - a.minQty);
                const tier = sortedTiers.find(t => item.quantity >= t.minQty);
                if (tier) itemPrice = tier.pricePerUnit;
            }

            itemPrice = roundToTwoDecimals(itemPrice);

            if (item.price !== itemPrice) {
                item.price = itemPrice;
                if (item.isWholesale) {
                    item.gstAmount = roundToTwoDecimals((itemPrice * item.quantity) * ((prod.gstPercentage || 0) / 100));
                }
                cartChanged = true;
            }

            // Attach campaign metadata to item for frontend display
            if (pricing.campaign) {
                item._doc = item._doc || {};
                item._doc.campaign = pricing.campaign;
                item._doc.originalPrice = pricing.originalPrice;
                item.campaign = pricing.campaign;
                item.originalPrice = pricing.originalPrice;
            }

            runningTotal += item.price * item.quantity;
        }

        runningTotal = roundToTwoDecimals(runningTotal);
        if (cart.totalPrice !== runningTotal || cartChanged) {
            cart.totalPrice = runningTotal;
            await cart.save();
        }
        
        return res.status(200).json(new ApiResponse(200, cart, "Cart fetched successfully"));
    } catch (error) {
        return res.status(500).json(new ApiError(500, error.message, [error]));
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const customerId = req.user._id;
        const { productId } = req.params;

        let cart = await Cart.findOne({ customerId });
        if (!cart) {
            return res.status(404).json(new ApiError(404, "Cart not found"));
        }

        let itemIndex = cart.items.findIndex(p => p.productId.toString() === productId);
        if (itemIndex > -1) {
            let productItem = cart.items[itemIndex];
            cart.totalPrice -= productItem.quantity * productItem.price;
            cart.items.splice(itemIndex, 1);
            await cart.save();
        }

        // Populate before returning
        await cart.populate("items.productId", "productName attribute productImage sellerId");

        return res.status(200).json(new ApiResponse(200, cart, "Item removed from cart"));
    } catch (error) {
        return res.status(500).json(new ApiError(500, error.message, [error]));
    }
};

export const clearCart = async (req, res) => {
    try {
        const customerId = req.user._id;
        let cart = await Cart.findOne({ customerId });
        
        if (cart) {
            cart.items = [];
            cart.totalPrice = 0;
            await cart.save();
        }
        
        return res.status(200).json(new ApiResponse(200, null, "Cart cleared successfully"));
    } catch (error) {
        return res.status(500).json(new ApiError(500, error.message, [error]));
    }
};
