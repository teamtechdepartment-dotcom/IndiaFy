import mongoose from "mongoose";
import SellerNode from "../../models/sellerNodes/sellerNode.model.js";
import SellerApplication from "../../models/sellers/sellerApplication.model.js";
import Notification from "../../models/notifications/notification.model.js";
import SellerProfileModel from "../../models/sellers/profile.model.js";
import SellerModel from "../../models/sellers/auth.model.js";
import { encrypt, decrypt, hashValue } from "../../utils/encryption.js";
import { queueEmail, getApprovalTemplate, getRejectionTemplate, getOnboardingTemplate } from "../../services/emailService.js";
import { getIO } from "../../utils/socket.js";
import { uploadBuffer, uploadBase64 } from "../../utils/cloudinary.js";
import ApiResponse from "../../utils/apiResponse.js";
import ApiError from "../../utils/apiError.js";
import { logAdminAction } from "../../utils/auditLogger.js";

const REVIEW_STATUS = {
  DRAFT: "DRAFT",
  PENDING_REVIEW: "PENDING_REVIEW",
  UNDER_REVIEW: "UNDER_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  SUSPENDED: "SUSPENDED",
  CHANGES_REQUESTED: "CHANGES_REQUESTED"
};

// Helper to upload document base64 or buffer
const validateAndUpload = async (base64Data, folder) => {
  if (!base64Data) return "";
  if (typeof base64Data === "string" && base64Data.startsWith("http")) {
    return base64Data;
  }
  if (typeof base64Data === "string" && base64Data.startsWith("data:")) {
    const mimeMatch = base64Data.match(/^data:([^;]+);base64,/);
    if (!mimeMatch) {
      throw new Error("Invalid file upload format");
    }
    const mimeType = mimeMatch[1];
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(mimeType)) {
      throw new Error(`Unsupported file type: ${mimeType}. Only JPG, PNG, WEBP, and PDF are allowed.`);
    }

    const base64Content = base64Data.split(",")[1];
    const sizeInBytes = Buffer.from(base64Content, 'base64').length;
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (sizeInBytes > maxSize) {
      throw new Error("File size exceeds 10MB limit");
    }

    try {
      const url = await uploadBase64(base64Data, folder);
      return url || "";
    } catch (err) {
      console.error(`[Upload Failed] Error uploading base64 to ${folder}:`, err.message);
      throw new Error(`Cloudinary upload failed: ${err.message}`);
    }
  }
  throw new Error("Invalid document format provided.");
};

// Helper to process document upload from multer buffer or fallback
const processDocumentUpload = async (req, fieldName, bodyFallback, folder) => {
  if (req.files && req.files[fieldName] && req.files[fieldName][0]) {
    const file = req.files[fieldName][0];
    return await uploadBuffer(file.buffer, file.mimetype, folder);
  }
  if (bodyFallback) {
    return await validateAndUpload(bodyFallback, folder);
  }
  return "";
};

/**
 * POST /seller/store/submit
 * Submit Store Application
 */
export const submitStoreApplication = async (req, res) => {
  console.log("[DEBUG SUBMIT] req.user:", req.user);
  const sellerId = req.user?.sellerId || req.user?._id;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      nodeType,
      storeName,
      storeDescription,
      address,
      city,
      state,
      pincode,
      latitude,
      longitude,
      ownerFullName,
      ownerEmail,
      ownerPhone,
      aadhaarNumber,
      panNumber,
      gstNumber,
      businessType,
      bankAccountNumber,
      ifscCode,
      bankName,
      // Base64 fallbacks in body if not sent via multipart
      aadhaarFront: bodyAadhaarFront,
      aadhaarBack: bodyAadhaarBack,
      panCard: bodyPanCard,
      gstCertificate: bodyGstCertificate,
      foodLicense: bodyFoodLicense,
      cancelledCheque: bodyCancelledCheque,
      bankStatement: bodyBankStatement,
      storePhoto: bodyStorePhoto,
      storeBanner: bodyStoreBanner
    } = req.body;

    // Validate Everything Required
    if (
      !nodeType || !storeName || !storeDescription || !address || !city || !state || !pincode ||
      !latitude || !longitude || !ownerFullName || !ownerEmail || !ownerPhone ||
      !aadhaarNumber || !panNumber || !gstNumber || !businessType ||
      !bankAccountNumber || !ifscCode || !bankName
    ) {
      throw new ApiError(400, "All onboarding information fields are required.");
    }

    // Process & Upload documents
    const uploadedDocs = {};
    uploadedDocs.aadhaarFront = await processDocumentUpload(req, "aadhaarFront", bodyAadhaarFront, "seller-documents");
    uploadedDocs.aadhaarBack = await processDocumentUpload(req, "aadhaarBack", bodyAadhaarBack, "seller-documents");
    uploadedDocs.panCard = await processDocumentUpload(req, "panCard", bodyPanCard, "seller-documents");
    uploadedDocs.gstCertificate = await processDocumentUpload(req, "gstCertificate", bodyGstCertificate, "seller-documents");
    uploadedDocs.cancelledCheque = await processDocumentUpload(req, "cancelledCheque", bodyCancelledCheque, "seller-documents");
    uploadedDocs.bankStatement = await processDocumentUpload(req, "bankStatement", bodyBankStatement, "seller-documents");
    const foodLic = await processDocumentUpload(req, "foodLicense", bodyFoodLicense, "seller-documents");
    uploadedDocs.foodLicense = foodLic || "";

    const uploadedStorePhoto = await processDocumentUpload(req, "storePhoto", bodyStorePhoto, "store-images");
    const uploadedStoreBanner = await processDocumentUpload(req, "storeBanner", bodyStoreBanner, "store-banners");

    // Ensure all mandatory files are uploaded
    if (
      !uploadedDocs.aadhaarFront || !uploadedDocs.aadhaarBack || !uploadedDocs.panCard ||
      !uploadedDocs.gstCertificate || !uploadedDocs.cancelledCheque || !uploadedDocs.bankStatement ||
      !uploadedStorePhoto || !uploadedStoreBanner
    ) {
      throw new ApiError(400, "All mandatory compliance documents and store photos must be uploaded.");
    }

    const calculatedGstHash = hashValue(gstNumber);
    const calculatedPanHash = hashValue(panNumber);
    const calculatedAadhaarHash = hashValue(aadhaarNumber);

    // Duplicate identity checks across other sellers
    const duplicateGst = await SellerApplication.findOne({
      gstHash: calculatedGstHash,
      status: { $in: ["pending", "PENDING_REVIEW", "approved", "APPROVED", "UNDER_REVIEW"] },
      userId: { $ne: sellerId }
    });
    if (duplicateGst) {
      throw new ApiError(400, "An application with this GST Number is already registered.");
    }

    const duplicatePan = await SellerApplication.findOne({
      panHash: calculatedPanHash,
      status: { $in: ["pending", "PENDING_REVIEW", "approved", "APPROVED", "UNDER_REVIEW"] },
      userId: { $ne: sellerId }
    });
    if (duplicatePan) {
      throw new ApiError(400, "An application with this PAN Number is already registered.");
    }

    const encryptedAadhaar = encrypt(aadhaarNumber);
    const encryptedPan = encrypt(panNumber);
    const encryptedBankAccount = encrypt(bankAccountNumber);

    const storeNameStr = storeName.trim();
    const slug = storeNameStr.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();

    // Check if there is an existing editable application
    const editableApp = await SellerApplication.findOne({
      userId: sellerId,
      nodeType,
      status: { $in: ["rejected", "REJECTED", "additional_information_required", "CHANGES_REQUESTED"] }
    });

    let application;
    if (editableApp) {
      application = editableApp;
      application.storeName = storeNameStr;
      application.storeDescription = storeDescription || "";
      application.ownerName = ownerFullName;
      application.ownerEmail = ownerEmail;
      application.ownerPhone = ownerPhone;
      application.aadhaarNumber = encryptedAadhaar;
      application.aadhaarHash = calculatedAadhaarHash;
      application.panNumber = encryptedPan;
      application.panHash = calculatedPanHash;
      application.gstNumber = gstNumber;
      application.gstHash = calculatedGstHash;
      application.bankAccountNumber = encryptedBankAccount;
      application.ifscCode = ifscCode;
      application.bankName = bankName;
      application.address = address;
      application.city = city;
      application.state = state;
      application.pincode = pincode;
      application.documents = uploadedDocs;
      application.storePhoto = uploadedStorePhoto;
      application.storeBanner = uploadedStoreBanner;
      application.status = "PENDING_REVIEW";
      application.rejectionReason = "";
      application.remarks = "";
      application.approval = {
        status: "PENDING_REVIEW",
        submittedAt: new Date(),
        remarks: ""
      };
      await application.save({ session });
    } else {
      application = new SellerApplication({
        userId: sellerId,
        nodeType,
        storeName: storeNameStr,
        storeDescription: storeDescription || "",
        ownerName: ownerFullName,
        ownerEmail,
        ownerPhone,
        aadhaarNumber: encryptedAadhaar,
        aadhaarHash: calculatedAadhaarHash,
        panNumber: encryptedPan,
        panHash: calculatedPanHash,
        gstNumber,
        gstHash: calculatedGstHash,
        bankAccountNumber: encryptedBankAccount,
        ifscCode,
        bankName,
        address,
        city,
        state,
        pincode,
        documents: uploadedDocs,
        storePhoto: uploadedStorePhoto,
        storeBanner: uploadedStoreBanner,
        status: "PENDING_REVIEW",
        approval: {
          status: "PENDING_REVIEW",
          submittedAt: new Date(),
          remarks: ""
        }
      });
      await application.save({ session });
    }

    // Update or Create SellerNode
    let storeNode = await SellerNode.findOne({ seller: sellerId, nodeType }).session(session);
    if (!storeNode) {
      storeNode = new SellerNode({
        seller: sellerId,
        nodeType,
        storeName: storeNameStr,
        slug
      });
    }

    storeNode.storeName = storeNameStr;
    storeNode.description = storeDescription || "";
    storeNode.email = ownerEmail;
    storeNode.phone = ownerPhone;
    storeNode.address = address;
    storeNode.city = city;
    storeNode.state = state;
    storeNode.pincode = pincode;
    storeNode.logo = uploadedStorePhoto;
    storeNode.banner = uploadedStoreBanner;
    storeNode.businessName = storeNameStr;
    storeNode.ownerFullName = ownerFullName;
    storeNode.businessType = businessType;
    storeNode.panNumber = encryptedPan;
    storeNode.aadhaarNumber = encryptedAadhaar;
    storeNode.businessEmail = ownerEmail;
    storeNode.businessPhone = ownerPhone;
    storeNode.gstin = gstNumber;
    storeNode.accountNumber = encryptedBankAccount;
    storeNode.ifsc = ifscCode;
    storeNode.bankName = bankName;
    storeNode.storeFrontPhoto = uploadedStorePhoto;
    storeNode.cancelledChequePhoto = uploadedDocs.cancelledCheque;
    storeNode.bankStatementPhoto = uploadedDocs.bankStatement;
    storeNode.gstCertificatePhoto = uploadedDocs.gstCertificate;
    storeNode.panCardPhoto = uploadedDocs.panCard;
    storeNode.aadhaarFrontPhoto = uploadedDocs.aadhaarFront;
    storeNode.aadhaarBackPhoto = uploadedDocs.aadhaarBack;
    storeNode.foodLicensePhoto = uploadedDocs.foodLicense || "";
    storeNode.latitude = Number(latitude) || 0;
    storeNode.longitude = Number(longitude) || 0;
    storeNode.status = "PENDING_REVIEW";
    storeNode.isVerified = false;
    storeNode.isActive = false;
    storeNode.isLive = false;
    storeNode.isStoreOpen = false;
    storeNode.approval = {
      status: "PENDING_REVIEW",
      submittedAt: new Date(),
      remarks: ""
    };

    await storeNode.save({ session });

    // Link application storeId
    application.storeId = storeNode._id;
    await application.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Create Notification
    try {
      await Notification.create({
        recipientId: sellerId,
        title: "Application Submitted Successfully",
        message: `Your seller onboarding application for ${storeNameStr} (${nodeType.replace(/_/g, " ")}) has been received.`,
        type: "application_submitted",
        metadata: {
          applicationId: application.applicationId
        }
      });
    } catch (err) {
      console.error("Non-blocking notification error:", err.message);
    }

    // Queue email to jsmith80769@gmail.com (admin)
    try {
      const emailHtml = getOnboardingTemplate({
        sellerName: ownerFullName,
        storeName: storeNameStr,
        nodeType,
        phone: ownerPhone,
        email: ownerEmail,
        address: `${address}, ${city}, ${state} - ${pincode}`,
        documentLinks: {
          aadhaarFront: uploadedDocs.aadhaarFront,
          aadhaarBack: uploadedDocs.aadhaarBack,
          panCard: uploadedDocs.panCard,
          gstCertificate: uploadedDocs.gstCertificate,
          cancelledCheque: uploadedDocs.cancelledCheque,
          bankStatement: uploadedDocs.bankStatement,
          ...(uploadedDocs.foodLicense ? { foodLicense: uploadedDocs.foodLicense } : {})
        }
      });
      queueEmail("jsmith80769@gmail.com", "New Seller Application Received", emailHtml);
    } catch (err) {
      console.error("Non-blocking email error:", err.message);
    }

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully.",
      status: "PENDING_REVIEW",
      application: {
        applicationId: application.applicationId,
        storeId: storeNode._id,
        status: "PENDING_REVIEW"
      }
    });

  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    console.error("Store submit error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to submit store application."
    });
  }
};

/**
 * GET /seller/store/status
 * Get Store Onboarding Status
 */
export const getStoreStatus = async (req, res) => {
  const sellerId = req.user?.sellerId || req.user?._id;
  const { nodeType } = req.query;

  try {
    const filter = { seller: sellerId };
    if (nodeType) {
      filter.nodeType = nodeType;
    }

    const storeNode = await SellerNode.findOne(filter).sort({ createdAt: -1 });

    if (!storeNode) {
      // Check application
      const appFilter = { userId: sellerId };
      if (nodeType) appFilter.nodeType = nodeType;
      const application = await SellerApplication.findOne(appFilter).sort({ createdAt: -1 });

      if (!application) {
        return res.status(200).json({
          success: true,
          status: "DRAFT",
          timeline: {
            submitted: false,
            underReview: false,
            approved: false,
            active: false
          }
        });
      }

      return res.status(200).json({
        success: true,
        status: application.status,
        approval: application.approval,
        timeline: {
          submitted: true,
          underReview: ["PENDING_REVIEW", "UNDER_REVIEW", "CHANGES_REQUESTED"].includes(application.status),
          approved: application.status === "APPROVED",
          active: false
        }
      });
    }

    return res.status(200).json({
      success: true,
      status: storeNode.status,
      approval: storeNode.approval || { status: storeNode.status, submittedAt: storeNode.createdAt },
      timeline: {
        submitted: true,
        underReview: ["PENDING_REVIEW", "UNDER_REVIEW", "CHANGES_REQUESTED"].includes(storeNode.status),
        approved: storeNode.status === "APPROVED" || storeNode.status === "approved",
        active: storeNode.isVerified && storeNode.isLive
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

/**
 * GET /admin/store-applications
 * Get Store Applications for Admin Panel
 */
export const getStoreApplications = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};

    // Standardize status filter for compatibility
    if (status) {
      const lowerStatus = status.toLowerCase();
      if (lowerStatus === "pending") {
        filter.status = { $in: ["pending", "PENDING_REVIEW", "UNDER_REVIEW", "under_review"] };
      } else if (lowerStatus === "approved") {
        filter.status = { $in: ["approved", "APPROVED"] };
      } else if (lowerStatus === "rejected") {
        filter.status = { $in: ["rejected", "REJECTED"] };
      } else if (lowerStatus === "suspended") {
        filter.status = { $in: ["suspended", "SUSPENDED"] };
      } else if (lowerStatus === "changes_requested" || lowerStatus === "additional_information_required") {
        filter.status = { $in: ["additional_information_required", "CHANGES_REQUESTED"] };
      } else {
        filter.status = status;
      }
    }

    if (search) {
      filter.$or = [
        { storeName: { $regex: search, $options: "i" } },
        { ownerName: { $regex: search, $options: "i" } }
      ];
    }

    const applications = await SellerApplication.find(filter)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SellerApplication.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: {
        applications,
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

/**
 * GET /admin/store-applications/:id
 * Get Store Application Details by ID
 */
export const getStoreApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await SellerApplication.findById(id);
    if (!application) {
      throw new ApiError(404, "Seller application not found");
    }

    const plainApplication = application.toObject();
    try {
      plainApplication.aadhaarNumber = decrypt(application.aadhaarNumber);
      plainApplication.panNumber = decrypt(application.panNumber);
      plainApplication.bankAccountNumber = decrypt(application.bankAccountNumber);
    } catch (e) {
      console.warn("Field decryption failed, using encrypted value:", e.message);
    }

    return res.status(200).json({
      success: true,
      data: plainApplication
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

/**
 * PATCH /admin/store-applications/:id/approve
 * Approve Seller Store Application
 */
export const approveStoreApplication = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const application = await SellerApplication.findById(id).session(session);
    if (!application) {
      throw new ApiError(404, "Seller application not found");
    }

    if (application.status === "APPROVED" || application.status === "approved") {
      throw new ApiError(400, "This application is already approved.");
    }

    const before = { status: application.status };

    // Find or create Linked Store Node
    let storeNode;
    if (application.storeId) {
      storeNode = await SellerNode.findById(application.storeId).session(session);
    }

    if (!storeNode) {
      const slug = application.storeName.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
      storeNode = new SellerNode({
        seller: application.userId,
        nodeType: application.nodeType,
        storeName: application.storeName,
        slug
      });
    }

    // Activate the store node
    storeNode.status = "ACTIVE";
    storeNode.isVerified = true;
    storeNode.isActive = true;
    storeNode.isLive = true;
    storeNode.isStoreOpen = true;
    storeNode.approvedAt = new Date();
    storeNode.approval = {
      status: "APPROVED",
      submittedAt: application.submittedAt,
      reviewedAt: new Date(),
      reviewedBy: req.user._id,
      remarks: "Approved by admin review."
    };

    await storeNode.save({ session });

    // Activate/create B2B/Wholesale seller profile
    let profile = await SellerProfileModel.findOne({ customerId: application.userId }).session(session);
    if (!profile) {
      profile = new SellerProfileModel({
        customerId: application.userId,
        firstName: application.ownerName?.split(" ")[0] || "Store",
        lastName: application.ownerName?.split(" ").slice(1).join(" ") || "Owner",
        contact: Number(application.ownerPhone) || 1111111111,
        address: [{
          street: application.address,
          nearBy: "Main Area",
          city: application.city,
          state: application.state,
          country: "India"
        }],
        sellerType: application.nodeType === "WHOLESALE_B2B" ? "wholesale" : "local",
        gstVerification: {
          isVerified: true,
          gstNumber: application.gstNumber,
          documentUrl: application.documents?.gstCertificate
        },
        indiafyVerifiedBadge: true
      });
    } else {
      profile.sellerType = application.nodeType === "WHOLESALE_B2B" ? "wholesale" : "local";
      profile.gstVerification = {
        isVerified: true,
        gstNumber: application.gstNumber,
        documentUrl: application.documents?.gstCertificate
      };
      profile.indiafyVerifiedBadge = true;
    }
    await profile.save({ session });

    // Update application
    application.status = "ACTIVE";
    application.storeId = storeNode._id;
    application.reviewedAt = new Date();
    application.approvedAt = new Date();
    application.reviewedBy = req.user._id;
    application.approval = {
      status: "APPROVED",
      submittedAt: application.submittedAt,
      reviewedAt: new Date(),
      reviewedBy: req.user._id,
      remarks: "Approved by admin review."
    };
    await application.save({ session });

    // Update Seller model isApproved to true and status to active
    await SellerModel.findByIdAndUpdate(application.userId, {
      isApproved: true,
      status: "active"
    }).session(session);

    await session.commitTransaction();
    session.endSession();

    // Audit action
    await logAdminAction(req, "APPROVE_SELLER_APPLICATION", `application:${id}`, before, { status: "APPROVED" });

    // Notifications
    try {
      await Notification.create({
        recipientId: application.userId,
        title: "Your Store Has Been Approved",
        message: `Your seller activation application for "${application.storeName}" has been approved. All business console features are now unlocked.`,
        type: "approved",
        metadata: {
          applicationId: application.applicationId,
          storeId: storeNode._id
        }
      });

      const emailHtml = getApprovalTemplate({
        sellerName: application.ownerName,
        storeName: application.storeName
      });
      queueEmail(application.ownerEmail, "Your Store Has Been Approved", emailHtml);
    } catch (err) {
      console.error("Non-blocking notification/email approval error:", err.message);
    }

    // Emit Socket operational live update
    try {
      const io = getIO();
      const roomName = `seller_${application.userId}_node_${application.nodeType}`;
      io.to(roomName).emit("APPLICATION_STATUS_UPDATED", {
        applicationId: application._id,
        status: "ACTIVE",
        storeId: storeNode._id
      });
    } catch (err) {
      console.error("Socket emit failure on approval:", err.message);
    }

    return res.status(200).json({
      success: true,
      message: "Application approved successfully.",
      data: application
    });

  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to approve application."
    });
  }
};

/**
 * PATCH /admin/store-applications/:id/reject
 * Reject Seller Store Application
 */
export const rejectStoreApplication = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { reason } = req.body;
    if (!reason) {
      throw new ApiError(400, "Rejection reason is required.");
    }

    const application = await SellerApplication.findById(id).session(session);
    if (!application) {
      throw new ApiError(404, "Seller application not found");
    }

    const before = { status: application.status };

    // Update application
    application.status = "REJECTED";
    application.rejectionReason = reason;
    application.reviewedAt = new Date();
    application.reviewedBy = req.user._id;
    application.approval = {
      status: "REJECTED",
      submittedAt: application.submittedAt,
      reviewedAt: new Date(),
      reviewedBy: req.user._id,
      remarks: reason
    };
    await application.save({ session });

    // Update Store Node if exists
    if (application.storeId) {
      const storeNode = await SellerNode.findById(application.storeId).session(session);
      if (storeNode) {
        storeNode.status = "REJECTED";
        storeNode.isVerified = false;
        storeNode.isActive = false;
        storeNode.isLive = false;
        storeNode.isStoreOpen = false;
        storeNode.approval = {
          status: "REJECTED",
          submittedAt: application.submittedAt,
          reviewedAt: new Date(),
          reviewedBy: req.user._id,
          remarks: reason
        };
        await storeNode.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    await logAdminAction(req, "REJECT_SELLER_APPLICATION", `application:${id}`, before, { status: "REJECTED", reason });

    // Notifications
    try {
      await Notification.create({
        recipientId: application.userId,
        title: "Your Seller Application Was Rejected",
        message: `Your seller onboarding application was rejected. Reason: ${reason}`,
        type: "rejected",
        metadata: {
          applicationId: application.applicationId,
          storeId: application.storeId || null
        }
      });

      const emailHtml = getRejectionTemplate({
        sellerName: application.ownerName,
        storeName: application.storeName,
        reason
      });
      queueEmail(application.ownerEmail, "Your Seller Application Was Rejected", emailHtml);
    } catch (err) {
      console.error("Non-blocking notification/email rejection error:", err.message);
    }

    // Socket status update
    try {
      const io = getIO();
      const roomName = `seller_${application.userId}_node_${application.nodeType}`;
      io.to(roomName).emit("APPLICATION_STATUS_UPDATED", {
        applicationId: application._id,
        status: "REJECTED",
        rejectionReason: reason,
        storeId: application.storeId || null
      });
    } catch (err) {
      console.error("Socket emit failure on rejection:", err.message);
    }

    return res.status(200).json({
      success: true,
      message: "Application rejected successfully.",
      data: application
    });

  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to reject application."
    });
  }
};

/**
 * PATCH /admin/store-applications/:id/request-changes
 * Request Corrections / Changes
 */
export const requestChangesStoreApplication = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { comments } = req.body;
    if (!comments) {
      throw new ApiError(400, "Detailed comments must be specified to request changes.");
    }

    const application = await SellerApplication.findById(id).session(session);
    if (!application) {
      throw new ApiError(404, "Seller application not found");
    }

    const before = { status: application.status };

    // Update application
    application.status = "CHANGES_REQUESTED";
    application.rejectionReason = comments;
    application.remarks = comments;
    application.reviewedAt = new Date();
    application.reviewedBy = req.user._id;
    application.approval = {
      status: "CHANGES_REQUESTED",
      submittedAt: application.submittedAt,
      reviewedAt: new Date(),
      reviewedBy: req.user._id,
      remarks: comments
    };
    await application.save({ session });

    // Update Store Node if exists
    if (application.storeId) {
      const storeNode = await SellerNode.findById(application.storeId).session(session);
      if (storeNode) {
        storeNode.status = "CHANGES_REQUESTED";
        storeNode.isVerified = false;
        storeNode.isActive = false;
        storeNode.isLive = false;
        storeNode.isStoreOpen = false;
        storeNode.approval = {
          status: "CHANGES_REQUESTED",
          submittedAt: application.submittedAt,
          reviewedAt: new Date(),
          reviewedBy: req.user._id,
          remarks: comments
        };
        await storeNode.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    await logAdminAction(req, "REQUEST_INFO_SELLER_APPLICATION", `application:${id}`, before, { status: "CHANGES_REQUESTED", comments });

    // Notifications
    try {
      await Notification.create({
        recipientId: application.userId,
        title: "More Information Requested",
        message: `Additional corrections required for your store application: ${comments}`,
        type: "more_info_requested",
        metadata: {
          applicationId: application.applicationId,
          storeId: application.storeId || null
        }
      });

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #3B82F6; border-bottom: 2px solid #3B82F6; padding-bottom: 10px; margin-bottom: 20px;">Onboarding Status: Corrections Required</h2>
            <p style="font-size: 14px; color: #334155;">Hello ${application.ownerName},</p>
            <p style="font-size: 14px; color: #334155;">Our compliance audit board reviewed your onboarding application for <strong>${application.storeName}</strong> and requires the following corrections:</p>
            
            <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 15px; border-radius: 8px; font-style: italic; margin: 15px 0; font-size: 13px; color: #475569;">
                "${comments}"
            </div>

            <p style="font-size: 14px; color: #334155;">Please log in to your Seller Dashboard to replace/re-submit your application.</p>
            <div style="margin-top: 30px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px;">
                <p style="font-size: 11px; color: #94a3b8;">Indiafy Merchant Services & Compliance Board</p>
            </div>
        </div>
      `;
      queueEmail(application.ownerEmail, "Indiafy Onboarding Verification - Action Required", emailHtml);
    } catch (err) {
      console.error("Non-blocking notification/email changes request error:", err.message);
    }

    // Socket status update
    try {
      const io = getIO();
      const roomName = `seller_${application.userId}_node_${application.nodeType}`;
      io.to(roomName).emit("APPLICATION_STATUS_UPDATED", {
        applicationId: application._id,
        status: "CHANGES_REQUESTED",
        rejectionReason: comments,
        storeId: application.storeId || null
      });
    } catch (err) {
      console.error("Socket emit failure on changes request:", err.message);
    }

    return res.status(200).json({
      success: true,
      message: "Changes requested successfully.",
      data: application
    });

  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to request changes."
    });
  }
};

/**
 * PATCH /admin/store-applications/:id/suspend
 * Suspend Seller Store Application / Active Store Node
 */
export const suspendStoreApplication = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { reason } = req.body;
    if (!reason) {
      throw new ApiError(400, "Suspension reason is required.");
    }

    const application = await SellerApplication.findById(id).session(session);
    if (!application) {
      throw new ApiError(404, "Seller application not found");
    }

    const before = { status: application.status };

    // Update application status
    application.status = "SUSPENDED";
    application.rejectionReason = reason;
    application.remarks = reason;
    application.reviewedAt = new Date();
    application.reviewedBy = req.user._id;
    application.approval = {
      status: "SUSPENDED",
      submittedAt: application.submittedAt,
      reviewedAt: new Date(),
      reviewedBy: req.user._id,
      remarks: reason
    };
    await application.save({ session });

    // Suspend linked store node
    if (application.storeId) {
      const storeNode = await SellerNode.findById(application.storeId).session(session);
      if (storeNode) {
        storeNode.status = "SUSPENDED";
        storeNode.isVerified = false;
        storeNode.isActive = false;
        storeNode.isLive = false;
        storeNode.isStoreOpen = false;
        storeNode.approval = {
          status: "SUSPENDED",
          submittedAt: application.submittedAt,
          reviewedAt: new Date(),
          reviewedBy: req.user._id,
          remarks: reason
        };
        await storeNode.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    await logAdminAction(req, "SUSPEND_SELLER_APPLICATION", `application:${id}`, before, { status: "SUSPENDED", reason });

    // Notifications
    try {
      await Notification.create({
        recipientId: application.userId,
        title: "Your Store Has Been Suspended",
        message: `Your store node has been suspended by administration. Reason: ${reason}`,
        type: "suspended",
        metadata: {
          applicationId: application.applicationId,
          storeId: application.storeId || null
        }
      });

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #EF4444; border-bottom: 2px solid #EF4444; padding-bottom: 10px; margin-bottom: 20px;">Your Seller Store Has Been Suspended</h2>
            <p style="font-size: 14px; color: #334155;">Hello ${application.ownerName},</p>
            <p style="font-size: 14px; color: #334155;">We regret to inform you that your seller store node <strong>${application.storeName}</strong> has been suspended.</p>
            
            <div style="background-color: #FEF2F2; border: 1px solid #FEE2E2; padding: 15px; border-radius: 8px; font-style: italic; margin: 15px 0; font-size: 13px; color: #991B1B;">
                "${reason}"
            </div>

            <p style="font-size: 14px; color: #334155;">Please contact support to appeal this decision or resolve any outstanding disputes.</p>
            <div style="margin-top: 30px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px;">
                <p style="font-size: 11px; color: #94a3b8;">Indiafy Merchant Services & Compliance Board</p>
            </div>
        </div>
      `;
      queueEmail(application.ownerEmail, "Important: Your Seller Account Has Been Suspended", emailHtml);
    } catch (err) {
      console.error("Non-blocking notification/email suspension error:", err.message);
    }

    // Socket status update
    try {
      const io = getIO();
      const roomName = `seller_${application.userId}_node_${application.nodeType}`;
      io.to(roomName).emit("APPLICATION_STATUS_UPDATED", {
        applicationId: application._id,
        status: "SUSPENDED",
        rejectionReason: reason,
        storeId: application.storeId || null
      });
    } catch (err) {
      console.error("Socket emit failure on suspension:", err.message);
    }

    return res.status(200).json({
      success: true,
      message: "Application suspended successfully.",
      data: application
    });

  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to suspend application."
    });
  }
};
