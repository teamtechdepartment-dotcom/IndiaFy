import CustomerProfile from "../../models/customers/profile.model.js";
import ApiError from "../../utils/apiError.js";
import ApiResponse from "../../utils/apiResponse.js";
import CustomerModel from "../../models/customers/auth.model.js";

// @desc    Get or create customer profile
// @route   GET /api/v1/indiafy/customer/profile
export const getProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;
        let profile = await CustomerProfile.findOne({ customerId: userId });
        
        if (!profile) {
            // Fetch user info from the correct model based on role
            let userData = null;
            if (role === "Seller") {
                const SellerModel = (await import("../../models/sellers/auth.model.js")).default;
                userData = await SellerModel.findById(userId);
            } else {
                userData = await CustomerModel.findById(userId);
            }

            if (!userData) {
                return res.status(404).json(new ApiError(404, "User account not found"));
            }

            // Create a default profile if it doesn't exist
            profile = await CustomerProfile.create({
                customerId: userId,
                firstName: userData.firstName || (role === "Seller" ? "Seller" : "Customer"),
                lastName: userData.lastName || "",
                contact: userData.contact || Date.now() % 10000000000, // Generate a numeric placeholder
                address: []
            });
        }
        
        // Populate email from the correct auth model
        let email = "";
        if (role === "Seller") {
            const SellerModel = (await import("../../models/sellers/auth.model.js")).default;
            const seller = await SellerModel.findById(userId).select("email");
            email = seller?.email;
        } else {
            const customer = await CustomerModel.findById(userId).select("email");
            email = customer?.email;
        }

        const profileObj = profile.toObject();
        profileObj.email = email;

        return res.status(200).json(new ApiResponse(200, profileObj, "Profile fetched successfully"));
    } catch (error) {
        console.error("getProfile Error:", error);
        return res.status(500).json(new ApiError(500, error.message, [error]));
    }
};

// @desc    Update customer profile
// @route   PUT /api/v1/indiafy/customer/profile
export const updateProfile = async (req, res) => {
    try {
        const customerId = req.user._id;
        const { firstName, lastName, middleName, contact, interests } = req.body;
        
        let profile = await CustomerProfile.findOne({ customerId });
        if (!profile) {
            return res.status(404).json(new ApiError(404, "Profile not found"));
        }

        if (firstName) profile.firstName = firstName;
        if (lastName) profile.lastName = lastName;
        if (middleName) profile.middleName = middleName;
        if (contact) profile.contact = contact;
        if (interests && Array.isArray(interests)) profile.interests = interests;

        await profile.save();
        
        return res.status(200).json(new ApiResponse(200, profile, "Profile updated successfully"));
    } catch (error) {
        return res.status(500).json(new ApiError(500, error.message, [error]));
    }
};

// @desc    Add address
// @route   POST /api/v1/indiafy/customer/profile/addresses
export const addAddress = async (req, res) => {
    try {
        const customerId = req.user._id;
        const { street, nearBy, city, state, country } = req.body;
        
        let profile = await CustomerProfile.findOne({ customerId });
        if (!profile) {
             return res.status(404).json(new ApiError(404, "Profile not found"));
        }

        profile.address.push({ street, nearBy, city, state, country });
        await profile.save();
        
        return res.status(201).json(new ApiResponse(201, profile.address, "Address added successfully"));
    } catch (error) {
        return res.status(500).json(new ApiError(500, error.message, [error]));
    }
};

// @desc    Delete address
// @route   DELETE /api/v1/indiafy/customer/profile/addresses/:id
export const deleteAddress = async (req, res) => {
    try {
        const customerId = req.user._id;
        const addressId = req.params.id;
        
        let profile = await CustomerProfile.findOne({ customerId });
        if (!profile) {
             return res.status(404).json(new ApiError(404, "Profile not found"));
        }

        profile.address = profile.address.filter(addr => addr._id.toString() !== addressId);
        await profile.save();
        
        return res.status(200).json(new ApiResponse(200, profile.address, "Address deleted successfully"));
    } catch (error) {
        return res.status(500).json(new ApiError(500, error.message, [error]));
    }
};
