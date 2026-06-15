import { sendGenericEmail } from "../config/bervo.config.js";
import CustomerModel from "../models/customers/auth.model.js";
import SellerModel from "../models/sellers/auth.model.js";
import ProductModel from "../models/products/product.model.js";

export const sendOrderNotifications = async (order) => {
    try {
        // Fetch customer details
        const customer = await CustomerModel.findById(order.customer);
        if (!customer) {
            console.warn(`[Notification] Customer not found for order ${order._id}`);
            return;
        }

        // Fetch product names for summary
        const itemSummaries = [];
        for (const item of order.orderItems) {
            const product = await ProductModel.findById(item.product);
            itemSummaries.push({
                name: product ? product.productName : "Product",
                quantity: item.quantity,
                price: item.price,
                sellerId: item.seller
            });
        }

        // Send Email to Customer
        if (customer.email) {
            const itemsHtml = itemSummaries.map(it => `
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${it.name}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${it.quantity}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${it.price}</td>
                </tr>
            `).join("");

            const customerHtmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #10B981; border-bottom: 2px solid #10B981; padding-bottom: 10px;">Order Confirmed!</h2>
                    <p>Hello ${customer.firstName || "Customer"},</p>
                    <p>Thank you for shopping on <strong>Indiafy</strong>! Your order has been placed and is currently being processed.</p>
                    <p><strong>Order ID:</strong> #${order._id}</p>
                    <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                    
                    <h3 style="margin-top: 20px;">Order Summary</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #f9f9f9;">
                                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Item</th>
                                <th style="padding: 8px; text-align: center; border-bottom: 1px solid #ddd;">Qty</th>
                                <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>

                    <div style="margin-top: 20px; text-align: right; font-weight: bold; font-size: 16px;">
                        Total Paid: ₹${order.totalPrice}
                    </div>

                    <p style="margin-top: 20px; font-size: 12px; color: #666;">
                        <strong>Delivery Address:</strong><br/>
                        ${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}
                    </p>

                    <p style="margin-top: 30px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 10px;">
                        Indiafy - Verified Local Sellers Delivered in 15 Minutes.
                    </p>
                </div>
            `;

            await sendGenericEmail(customer.email, `Your Indiafy Order Confirmation - #${order._id}`, customerHtmlContent);
            console.log(`[Notification] Customer email sent to: ${customer.email}`);
        }

        // Send Email to Sellers
        const sellerGroups = {};
        itemSummaries.forEach(it => {
            if (it.sellerId) {
                const sId = it.sellerId.toString();
                if (!sellerGroups[sId]) sellerGroups[sId] = [];
                sellerGroups[sId].push(it);
            }
        });

        for (const [sellerId, items] of Object.entries(sellerGroups)) {
            const seller = await SellerModel.findById(sellerId);
            if (seller && seller.email) {
                const sellerItemsHtml = items.map(it => `
                    <li>${it.name} (Qty: ${it.quantity}) - Price: ₹${it.price}</li>
                `).join("");

                const sellerHtmlContent = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #4F46E5; border-bottom: 2px solid #4F46E5; padding-bottom: 10px;">New Order Received!</h2>
                        <p>Hello ${seller.firstName || "Seller"},</p>
                        <p>You have received a new order on <strong>Indiafy Quick Commerce Node</strong>.</p>
                        <p><strong>Order ID:</strong> #${order._id}</p>
                        
                        <h3>Items to Pack:</h3>
                        <ul>
                            ${sellerItemsHtml}
                        </ul>

                        <p>Please log in to your Seller Dashboard to download invoices, prepare packages, and upload the packing verification video.</p>
                        <p style="margin-top: 30px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 10px;">
                            Indiafy Merchant Services
                        </p>
                    </div>
                `;

                await sendGenericEmail(seller.email, `New Indiafy Order Alert - #${order._id}`, sellerHtmlContent);
                console.log(`[Notification] Seller email sent to: ${seller.email}`);
            }
        }

        // Mock SMS/WhatsApp Notification
        console.log(`[SMS/WhatsApp Notification Simulated] SMS sent to customer ${customer.contact || "+91 9999999999"}: Your Indiafy order #${order._id} of ₹${order.totalPrice} has been confirmed!`);

    } catch (err) {
        console.error("[Notification] Error sending order notifications:", err);
    }
};
