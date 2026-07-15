import mongoose from "mongoose";
import SellerApplication from "../../models/sellers/sellerApplication.model.js";
import SellerNode from "../../models/sellerNodes/sellerNode.model.js";
import Notification from "../../models/notifications/notification.model.js";
import { encrypt, hashValue } from "../../utils/encryption.js";
import { queueEmail, getOnboardingTemplate } from "../../services/emailService.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { uploadBase64, uploadBuffer } from "../../utils/cloudinary.js";

/**
 * Validates and uploads a base64 encoded document to Cloudinary
 */
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
      if (!url) throw new Error("Cloudinary upload returned null URL");
      return url;
    } catch (err) {
      console.error(`[Upload Failed] Error uploading base64 to ${folder}:`, err.message);
      throw new Error(`Cloudinary upload failed: ${err.message}`);
    }
  }
  throw new Error("Invalid document format provided.");
};

const REVIEW_STATUS = {
  DRAFT: "DRAFT",
  PENDING_REVIEW: "PENDING_REVIEW",
  UNDER_REVIEW: "UNDER_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  SUSPENDED: "SUSPENDED",
  CHANGES_REQUESTED: "CHANGES_REQUESTED",
};

const ACTIVE_APPLICATION_STATUSES = [
  REVIEW_STATUS.PENDING_REVIEW,
  REVIEW_STATUS.UNDER_REVIEW,
  REVIEW_STATUS.APPROVED,
  "pending",
  "approved",
];

const EDITABLE_APPLICATION_STATUSES = [
  REVIEW_STATUS.REJECTED,
  REVIEW_STATUS.CHANGES_REQUESTED,
  "rejected",
  "additional_information_required",
];

const isBlank = (value) => value === undefined || value === null || String(value).trim() === "";

const validateStoreSubmission = (payload) => {
  const requiredFields = [
    ["nodeType", "Store type"],
    ["storeName", "Store name"],
    ["storeDescription", "Description"],
    ["address", "Address"],
    ["city", "City"],
    ["state", "State"],
    ["pincode", "Pincode"],
    ["latitude", "Latitude"],
    ["longitude", "Longitude"],
    ["ownerFullName", "Owner name"],
    ["ownerEmail", "Business email"],
    ["ownerPhone", "Phone"],
    ["businessType", "Business type"],
    ["panNumber", "PAN"],
    ["gstNumber", "GST"],
    ["bankAccountNumber", "Bank account number"],
    ["ifscCode", "IFSC"],
    ["bankName", "Bank name"],
  ];

  const missing = requiredFields
    .filter(([key]) => isBlank(payload[key]))
    .map(([, label]) => label);

  const latitude = Number(payload.latitude);
  const longitude = Number(payload.longitude);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    missing.push("Valid latitude");
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    missing.push("Valid longitude");
  }

  return missing;
};

/**
 * Submit Seller Onboarding Application
 * POST /seller/applications/apply
 * Supports both multipart/form-data (Multer req.files) and JSON base64
 */
export const submitApplication = asyncHandler(async (req, res) => {
  const sellerId = req.user?.sellerId || req.user?._id;

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
    foodLicenseNumber,
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

  // Basic required inputs validation
  const missingFields = validateStoreSubmission(req.body);
  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required onboarding information: ${missingFields.join(", ")}.`
    });
  }

  // Helper to extract file from Multer req.files or fallback to req.body
  const processDocumentUpload = async (fieldName, bodyFallback, folder) => {
    if (req.files && req.files[fieldName] && req.files[fieldName][0]) {
      const file = req.files[fieldName][0];
      return await uploadBuffer(file.buffer, file.mimetype, folder);
    }
    if (bodyFallback) {
      return await validateAndUpload(bodyFallback, folder);
    }
    return "";
  };

  // Upload Document Files to Cloudinary
  let uploadedDocs = {};
  let uploadedStorePhoto = "";
  let uploadedStoreBanner = "";

  try {
    console.log("[Onboarding] Uploading documents to Cloudinary CDN...");
    
    uploadedDocs.aadhaarFront = await processDocumentUpload("aadhaarFront", bodyAadhaarFront, "seller-documents");
    uploadedDocs.aadhaarBack = await processDocumentUpload("aadhaarBack", bodyAadhaarBack, "seller-documents");
    uploadedDocs.panCard = await processDocumentUpload("panCard", bodyPanCard, "seller-documents");
    uploadedDocs.gstCertificate = await processDocumentUpload("gstCertificate", bodyGstCertificate, "seller-documents");
    uploadedDocs.cancelledCheque = await processDocumentUpload("cancelledCheque", bodyCancelledCheque, "seller-documents");
    uploadedDocs.bankStatement = await processDocumentUpload("bankStatement", bodyBankStatement, "seller-documents");
    
    const foodLic = await processDocumentUpload("foodLicense", bodyFoodLicense, "seller-documents");
    uploadedDocs.foodLicense = foodLic || "";

    uploadedStorePhoto = await processDocumentUpload("storePhoto", bodyStorePhoto, "store-images");
    uploadedStoreBanner = await processDocumentUpload("storeBanner", bodyStoreBanner, "store-banners");

    if (
      !uploadedDocs.aadhaarFront || !uploadedDocs.aadhaarBack || !uploadedDocs.panCard ||
      !uploadedDocs.gstCertificate || !uploadedDocs.cancelledCheque || !uploadedDocs.bankStatement ||
      !uploadedStorePhoto || !uploadedStoreBanner
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required document or photo uploads."
      });
    }

    console.log("[Onboarding] Document uploads complete.");
  } catch (uploadError) {
    console.error("[Upload Error]:", uploadError);
    return res.status(400).json({
      success: false,
      message: `Document upload failed: ${uploadError.message}`
    });
  }

  // Pre-calculate SHA-256 blind hashes for security duplicate check
  const calculatedGstHash = hashValue(gstNumber);
  const calculatedPanHash = hashValue(panNumber);
  const calculatedAadhaarHash = hashValue(aadhaarNumber);

  // 1. Prevent duplicate active application for the same nodeType
  const activeApp = await SellerApplication.findOne({
    userId: sellerId,
    nodeType,
    status: { $in: ACTIVE_APPLICATION_STATUSES }
  });
  if (activeApp) {
    return res.status(400).json({
      success: false,
      message: `You already have a pending or approved application for ${nodeType.replace(/_/g, " ")}.`
    });
  }

  // Check if there is an existing app in editable status (additional_information_required or rejected)
  const editableApp = await SellerApplication.findOne({
    userId: sellerId,
    nodeType,
    status: { $in: EDITABLE_APPLICATION_STATUSES }
  });

  // 2. Prevent duplicate business identity checks (GST, PAN, Aadhaar) across OTHER sellers
  const duplicateGst = await SellerApplication.findOne({
    gstHash: calculatedGstHash,
    status: { $in: [...ACTIVE_APPLICATION_STATUSES, REVIEW_STATUS.CHANGES_REQUESTED, "additional_information_required"] },
    userId: { $ne: sellerId }
  });
  if (duplicateGst) {
    return res.status(400).json({
      success: false,
      message: "An onboarding application with this GST Number has already been registered."
    });
  }

  const duplicatePan = await SellerApplication.findOne({
    panHash: calculatedPanHash,
    status: { $in: [...ACTIVE_APPLICATION_STATUSES, REVIEW_STATUS.CHANGES_REQUESTED, "additional_information_required"] },
    userId: { $ne: sellerId }
  });
  if (duplicatePan) {
    return res.status(400).json({
      success: false,
      message: "An onboarding application with this PAN Number has already been registered."
    });
  }

  const duplicateAadhaar = await SellerApplication.findOne({
    aadhaarHash: calculatedAadhaarHash,
    status: { $in: [...ACTIVE_APPLICATION_STATUSES, REVIEW_STATUS.CHANGES_REQUESTED, "additional_information_required"] },
    userId: { $ne: sellerId }
  });
  if (duplicateAadhaar) {
    return res.status(400).json({
      success: false,
      message: "An onboarding application with this Aadhaar Number has already been registered."
    });
  }

  // Encrypt sensitive KYC fields before DB insertion
  const encryptedAadhaar = encrypt(aadhaarNumber);
  const encryptedPan = encrypt(panNumber);
  const encryptedBankAccount = encrypt(bankAccountNumber);

  // Generate unique store slug
  const storeNameStr = storeName.trim();
  const slug = storeNameStr.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();

  // Initialize MongoDB Transaction Session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let application;

    if (editableApp) {
      // Update existing application record
      application = editableApp;
      application.storeName = storeNameStr;
      application.storeDescription = storeDescription || "";
      application.ownerName = ownerFullName;
      application.ownerEmail = ownerEmail;
      application.ownerPhone = ownerPhone;
      application.businessType = businessType;
      application.aadhaarNumber = encryptedAadhaar;
      application.aadhaarHash = calculatedAadhaarHash;
      application.panNumber = encryptedPan;
      application.panHash = calculatedPanHash;
      application.gstNumber = gstNumber;
      application.gstHash = calculatedGstHash;
      application.foodLicenseNumber = foodLicenseNumber || "";
      application.bankAccountNumber = encryptedBankAccount;
      application.ifscCode = ifscCode;
      application.bankName = bankName;
      application.address = address;
      application.city = city;
      application.state = state;
      application.pincode = pincode;
      application.latitude = Number(latitude);
      application.longitude = Number(longitude);
      application.documents = uploadedDocs;
      application.storePhoto = uploadedStorePhoto;
      application.storeBanner = uploadedStoreBanner;
      application.status = REVIEW_STATUS.PENDING_REVIEW;
      application.rejectionReason = "";
      application.remarks = "";
      application.submittedAt = new Date();
      application.reviewedAt = undefined;
      application.reviewedBy = undefined;
      application.approval = {
        status: REVIEW_STATUS.PENDING_REVIEW,
        submittedAt: new Date(),
        remarks: ""
      };

      await application.save({ session });
    } else {
      // Create new application record
      application = new SellerApplication({
        userId: sellerId,
        nodeType,
        storeName: storeNameStr,
        storeDescription: storeDescription || "",
        ownerName: ownerFullName,
        ownerEmail,
        ownerPhone,
        businessType,
        aadhaarNumber: encryptedAadhaar,
        aadhaarHash: calculatedAadhaarHash,
        panNumber: encryptedPan,
        panHash: calculatedPanHash,
        gstNumber,
        gstHash: calculatedGstHash,
        foodLicenseNumber: foodLicenseNumber || "",
        bankAccountNumber: encryptedBankAccount,
        ifscCode,
        bankName,
        address,
        city,
        state,
        pincode,
        latitude: Number(latitude),
        longitude: Number(longitude),
        documents: uploadedDocs,
        storePhoto: uploadedStorePhoto,
        storeBanner: uploadedStoreBanner,
        status: REVIEW_STATUS.PENDING_REVIEW,
        approval: {
          status: REVIEW_STATUS.PENDING_REVIEW,
          submittedAt: new Date(),
          remarks: ""
        }
      });

      await application.save({ session });
    }

    // Instantiate or update the corresponding SellerNode in pending state
    let storeNode;
    if (application.storeId) {
      storeNode = await SellerNode.findById(application.storeId).session(session);
    }

    if (!storeNode) {
      storeNode = new SellerNode({
        seller: sellerId,
        nodeType,
        storeName: storeNameStr,
        slug,
        status: REVIEW_STATUS.PENDING_REVIEW,
        approval: {
          status: REVIEW_STATUS.PENDING_REVIEW,
          submittedAt: new Date(),
          remarks: ""
        },
        isActive: false,
        isVerified: false,
        isLive: false
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
    storeNode.status = REVIEW_STATUS.PENDING_REVIEW;
    storeNode.approval = {
      status: REVIEW_STATUS.PENDING_REVIEW,
      submittedAt: new Date(),
      remarks: ""
    };
    storeNode.sellerSnapshot = {
      sellerId,
      storeName: storeNameStr,
      storeSlug: storeNode.slug,
      businessInfo: {
        businessType,
        gstNumber,
        panNumber: encryptedPan,
        ownerFullName,
        businessEmail: ownerEmail,
        businessPhone: ownerPhone,
      },
      location: {
        address,
        city,
        state,
        pincode,
        latitude: Number(latitude),
        longitude: Number(longitude),
      },
      documents: uploadedDocs,
      bankDetails: {
        bankName,
        ifscCode,
        bankAccountNumber: encryptedBankAccount,
      },
    };
    storeNode.isActive = false;
    storeNode.isVerified = false;
    storeNode.isLive = false;

    await storeNode.save({ session });

    // Link application storeId
    application.storeId = storeNode._id;
    await application.save({ session });

    // Commit Mongoose transaction atomically
    await session.commitTransaction();
    session.endSession();

    // 1. Create Seller In-App Notification
    try {
      await Notification.create({
        recipientId: sellerId,
        title: "Application Submitted Successfully",
        message: `Your seller onboarding application for ${storeNameStr} (${nodeType.replace(/_/g, " ")}) has been received and is pending admin review.`,
        type: "application_submitted",
        metadata: {
          applicationId: application.applicationId
        }
      });
    } catch (_notifErr) {
      console.error("[Notification] Non-blocking notification creation error:", _notifErr);
    }

    // 2. Queue Email Alert asynchronously to jsmith80769@gmail.com
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

      queueEmail(
        "jsmith80769@gmail.com",
        "New Seller Application Received",
        emailHtml
      ).catch(e => console.error("[Email Async Queue Error]:", e));
    } catch (_emailErr) {
      console.error("[Email Alert] Non-blocking email error:", _emailErr);
    }

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully.",
      status: REVIEW_STATUS.PENDING_REVIEW,
      application: {
        applicationId: application.applicationId,
        storeId: application.storeId,
        status: REVIEW_STATUS.PENDING_REVIEW
      },
      node: storeNode
    });

  } catch (error) {
    // Rollback Mongoose actions
    await session.abortTransaction();
    session.endSession();

    console.error("[Transaction Failed] Onboarding rollback:", error);
    return res.status(500).json({
      success: false,
      message: `Failed to register onboarding records: ${error.message}`
    });
  }
});

/**
 * Fetch application status for logged-in seller
 * GET /seller/applications/status/:storeId
 */
export const getApplicationStatus = asyncHandler(async (req, res) => {
  const sellerId = req.user?.sellerId || req.user?._id;
  const { storeId } = req.params;

  const application = await SellerApplication.findOne({
    userId: sellerId,
    storeId
  });

  if (!application) {
    return res.status(404).json({
      success: false,
      message: "No active onboarding application found for this store node."
    });
  }

  return res.status(200).json({
    success: true,
    application
  });
});

/**
 * Fetch application status by nodeType for logged-in seller
 * GET /seller/applications/node/:nodeType
 */
export const getApplicationStatusByNodeType = asyncHandler(async (req, res) => {
  const sellerId = req.user?.sellerId || req.user?._id;
  const { nodeType } = req.params;

  const application = await SellerApplication.findOne({
    userId: sellerId,
    nodeType
  }).sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    application: application || null
  });
});

/**
 * Fetch the current seller store approval status.
 * GET /seller/store/status
 */
export const getStoreStatus = asyncHandler(async (req, res) => {
  const sellerId = req.user?.sellerId || req.user?._id;

  const store = await SellerNode.findOne({ seller: sellerId }).sort({ updatedAt: -1 });
  const application = await SellerApplication.findOne({ userId: sellerId })
    .sort({ updatedAt: -1 });

  const status = store?.status || application?.status || REVIEW_STATUS.DRAFT;
  const approval = store?.approval || application?.approval || {
    status,
    submittedAt: application?.submittedAt || store?.createdAt || null,
    reviewedAt: application?.reviewedAt || null,
    reviewedBy: application?.reviewedBy || null,
    remarks: application?.remarks || application?.rejectionReason || "",
  };

  return res.status(200).json({
    success: true,
    status,
    store: store || null,
    application: application || null,
    approval,
    timeline: [
      {
        key: "SUBMITTED",
        label: "Submitted",
        completed: Boolean(approval?.submittedAt || application?.submittedAt || store?.createdAt),
        at: approval?.submittedAt || application?.submittedAt || store?.createdAt || null,
      },
      {
        key: "UNDER_REVIEW",
        label: "Under Review",
        completed: [REVIEW_STATUS.UNDER_REVIEW, REVIEW_STATUS.APPROVED, REVIEW_STATUS.REJECTED, REVIEW_STATUS.SUSPENDED, REVIEW_STATUS.CHANGES_REQUESTED].includes(status),
      },
      {
        key: "APPROVED",
        label: "Approved",
        completed: status === REVIEW_STATUS.APPROVED,
        failed: [REVIEW_STATUS.REJECTED, REVIEW_STATUS.SUSPENDED].includes(status),
        at: approval?.reviewedAt || application?.reviewedAt || null,
      },
      {
        key: "STORE_ACTIVATED",
        label: "Store Activated",
        completed: Boolean(store?.isActive && store?.isLive && status === REVIEW_STATUS.APPROVED),
      },
    ],
  });
});

/**
 * Fetch all onboarding applications for the logged-in seller
 * GET /seller/applications/my-applications
 */
export const getMyApplications = asyncHandler(async (req, res) => {
  const sellerId = req.user?.sellerId || req.user?._id;
  const applications = await SellerApplication.find({ userId: sellerId }).sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    applications
  });
});
