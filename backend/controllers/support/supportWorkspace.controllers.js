import ApiResponse from "../../utils/apiResponse.js";
import ApiError from "../../utils/apiError.js";
import * as supportService from "../../services/supportWorkspace.service.js";

const isProd = process.env.NODE_ENV === "production";
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "None" : "Lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// ==========================================
// AUTHENTICATION & SUPPORT MEMBERS
// ==========================================

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await supportService.loginSupportMember(email, password);

    res.cookie("SupportAccessToken", token, cookieOptions);

    return res.status(200).json(
      new ApiResponse(200, { token, user }, "Support member logged in successfully")
    );
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json(new ApiError(status, err.message || "Login failed"));
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("SupportAccessToken", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "None" : "Lax",
    });
    return res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

export const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json(new ApiError(401, "Authentication required"));
    }
    return res.status(200).json(
      new ApiResponse(200, req.user, "Support member profile retrieved")
    );
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

export const setupPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const result = await supportService.setupMemberPassword(token, password);

    res.cookie("SupportAccessToken", result.token, cookieOptions);

    return res.status(200).json(
      new ApiResponse(200, result, "Password configured and account activated successfully")
    );
  } catch (err) {
    const status = err.status || 400;
    return res.status(status).json(new ApiError(status, err.message));
  }
};

export const createMember = async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    const result = await supportService.createSupportMember({
      name,
      email,
      role,
      password,
      adminUser: req.user,
    });
    return res.status(201).json(
      new ApiResponse(201, result, "Support member created successfully")
    );
  } catch (err) {
    const status = err.status || 400;
    return res.status(status).json(new ApiError(status, err.message));
  }
};

export const listMembers = async (req, res) => {
  try {
    const members = await supportService.listSupportMembers();
    return res.status(200).json(
      new ApiResponse(200, members, "Support members retrieved successfully")
    );
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

export const updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await supportService.updateSupportMember(id, req.body, req.user);
    return res.status(200).json(
      new ApiResponse(200, result, "Support member updated successfully")
    );
  } catch (err) {
    const status = err.status || 400;
    return res.status(status).json(new ApiError(status, err.message));
  }
};

export const inviteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await supportService.resendMemberInvitation(id, req.user);
    return res.status(200).json(
      new ApiResponse(200, result, "Invitation resent successfully")
    );
  } catch (err) {
    const status = err.status || 400;
    return res.status(status).json(new ApiError(status, err.message));
  }
};

export const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await supportService.deleteSupportMember(id, req.user);
    return res.status(200).json(
      new ApiResponse(200, result, "Support member permanently deleted successfully")
    );
  } catch (err) {
    const status = err.status || 400;
    return res.status(status).json(new ApiError(status, err.message));
  }
};

// ==========================================
// TICKETS
// ==========================================

export const createTicket = async (req, res) => {
  try {
    const {
      subject,
      description,
      category,
      priority,
      customerName,
      customerEmail,
      customerPhone,
      orderId,
      attachments,
    } = req.body;

    // Determine user role and ID if authenticated
    let userId = req.user?._id;
    let userType = req.body.userType;
    if (!userType) {
      if (req.user?.role?.toLowerCase() === "seller") {
        userType = "seller";
        userId = req.user?.sellerId || req.user?._id;
      } else if (req.user) {
        userType = "customer";
      } else {
        userType = "guest";
      }
    }

    const ticket = await supportService.createTicket({
      userId,
      userType,
      customerName: customerName || (req.user ? `${req.user.firstName || req.user.name || ""} ${req.user.lastName || ""}`.trim() : ""),
      customerEmail: customerEmail || req.user?.email,
      customerPhone,
      subject,
      description,
      category,
      priority,
      orderId,
      attachments,
    });

    return res.status(201).json({
      statusCode: 201,
      data: ticket,
      ticketNumber: ticket.ticketNumber,
      message: "Support ticket created successfully",
      success: true,
    });
  } catch (err) {
    const status = err.status || 400;
    return res.status(status).json(new ApiError(status, err.message));
  }
};

export const listTickets = async (req, res) => {
  try {
    const { search, status, category, priority, assignedTo, page, limit } = req.query;
    const result = await supportService.listTickets({
      search,
      status,
      category,
      priority,
      assignedTo,
      page,
      limit,
      user: req.user,
    });
    return res.status(200).json(
      new ApiResponse(200, result, "Tickets fetched successfully")
    );
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

export const getTicketDetails = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await supportService.getTicketDetails(ticketId, req.user);
    return res.status(200).json(
      new ApiResponse(200, ticket, "Ticket details loaded")
    );
  } catch (err) {
    const status = err.status || 404;
    return res.status(status).json(new ApiError(status, err.message));
  }
};

export const updateTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status, priority, category } = req.body;
    const ticket = await supportService.updateTicketProperties(ticketId, { status, priority, category }, req.user);
    return res.status(200).json(
      new ApiResponse(200, ticket, "Ticket updated successfully")
    );
  } catch (err) {
    const status = err.status || 400;
    return res.status(status).json(new ApiError(status, err.message));
  }
};

export const assignTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { memberId } = req.body;
    const ticket = await supportService.assignTicket(ticketId, memberId, req.user);
    return res.status(200).json(
      new ApiResponse(200, ticket, "Ticket assignment updated")
    );
  } catch (err) {
    const status = err.status || 400;
    return res.status(status).json(new ApiError(status, err.message));
  }
};

export const closeTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { reason } = req.body;
    const ticket = await supportService.closeTicket(ticketId, reason, req.user);
    return res.status(200).json(
      new ApiResponse(200, ticket, "Ticket closed successfully")
    );
  } catch (err) {
    const status = err.status || 400;
    return res.status(status).json(new ApiError(status, err.message));
  }
};

export const resolveTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { resolutionNotes } = req.body;
    const ticket = await supportService.resolveTicket(ticketId, resolutionNotes, req.user);
    return res.status(200).json(
      new ApiResponse(200, ticket, "Ticket resolved successfully")
    );
  } catch (err) {
    const status = err.status || 400;
    return res.status(status).json(new ApiError(status, err.message));
  }
};

export const reopenTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { reason } = req.body;
    const ticket = await supportService.reopenTicket(ticketId, reason, req.user);
    return res.status(200).json(
      new ApiResponse(200, ticket, "Ticket reopened successfully")
    );
  } catch (err) {
    const status = err.status || 400;
    return res.status(status).json(new ApiError(status, err.message));
  }
};

// ==========================================
// CONVERSATIONS
// ==========================================

export const getMessages = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await supportService.getTicketDetails(ticketId, req.user);
    return res.status(200).json(
      new ApiResponse(200, ticket.messages || [], "Messages fetched successfully")
    );
  } catch (err) {
    const status = err.status || 404;
    return res.status(status).json(new ApiError(status, err.message));
  }
};

export const addMessage = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { body, attachments } = req.body;
    const message = await supportService.addTicketMessage(ticketId, req.user, { body, attachments });
    return res.status(201).json(
      new ApiResponse(201, message, "Reply sent successfully")
    );
  } catch (err) {
    const status = err.status || 400;
    return res.status(status).json(new ApiError(status, err.message));
  }
};

export const addInternalNote = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { note } = req.body;
    const createdNote = await supportService.addInternalNote(ticketId, req.user, note);
    return res.status(201).json(
      new ApiResponse(201, createdNote, "Internal note saved successfully")
    );
  } catch (err) {
    const status = err.status || 400;
    return res.status(status).json(new ApiError(status, err.message));
  }
};

// ==========================================
// DASHBOARD & CUSTOMER CONTEXT
// ==========================================

export const getDashboard = async (req, res) => {
  try {
    const metrics = await supportService.getDashboardMetrics(req.user);
    return res.status(200).json(
      new ApiResponse(200, metrics, "Dashboard metrics retrieved")
    );
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

export const getCustomerContext = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const context = await supportService.getCustomerContext(ticketId);
    return res.status(200).json(
      new ApiResponse(200, context, "Customer context retrieved successfully")
    );
  } catch (err) {
    const status = err.status || 404;
    return res.status(status).json(new ApiError(status, err.message));
  }
};

export const getAuditLog = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const auditData = await supportService.getTicketAuditLog(ticketId);
    return res.status(200).json(
      new ApiResponse(200, auditData, "Ticket audit log retrieved")
    );
  } catch (err) {
    const status = err.status || 404;
    return res.status(status).json(new ApiError(status, err.message));
  }
};

export const reconcileQueue = async (req, res) => {
  try {
    const report = await supportService.reconcileSupportQueue();
    return res.status(200).json(
      new ApiResponse(200, report, "Support queue reconciled successfully")
    );
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

export const getWorkload = async (req, res) => {
  try {
    const workloads = await supportService.calculateMemberWorkloads();
    return res.status(200).json(
      new ApiResponse(200, workloads, "Support member workloads fetched")
    );
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

export const uploadAttachment = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const file = req.file;
    const result = await supportService.uploadAttachmentService({
      ticketId,
      user: req.user,
      file,
    });
    return res.status(201).json(
      new ApiResponse(201, result, "Attachment uploaded successfully")
    );
  } catch (err) {
    const status = err.status || 400;
    return res.status(status).json(new ApiError(status, err.message));
  }
};

export const deleteTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const result = await supportService.deleteTicketPermanently(ticketId, req.user);
    return res.status(200).json(
      new ApiResponse(200, result, "Ticket permanently deleted successfully")
    );
  } catch (err) {
    const status = err.status || 400;
    return res.status(status).json(new ApiError(status, err.message));
  }
};

export const bulkDeleteTickets = async (req, res) => {
  try {
    const ticketIds = req.body.ticketIds || req.body.ids;
    const result = await supportService.bulkDeleteTicketsPermanently(ticketIds, req.user);
    return res.status(200).json(
      new ApiResponse(200, result, `${result.deletedCount} tickets permanently deleted successfully`)
    );
  } catch (err) {
    const status = err.status || 400;
    return res.status(status).json(new ApiError(status, err.message));
  }
};


