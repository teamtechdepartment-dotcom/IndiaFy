// Central configuration for Indiafy Enterprise Support Queue & Workload Management

export const SUPPORT_CONFIG = {
  // Configurable default active ticket capacity per support member
  DEFAULT_MEMBER_CAPACITY: parseInt(process.env.SUPPORT_MEMBER_CAPACITY || "3", 10),

  // Pagination rules
  DEFAULT_ADMIN_PAGE_SIZE: 50,
  DEFAULT_WORKSPACE_PAGE_SIZE: 25,
  ALLOWED_PAGE_SIZES: [25, 50, 100],
  MAX_PAGE_SIZE: 100,

  // Status lifecycle classification
  ACTIVE_STATUSES: ["Open", "Assigned", "In Progress", "Waiting", "Reopened"],
  TERMINAL_STATUSES: ["Resolved", "Closed"],

  // Queue retry limits
  MAX_QUEUE_RETRIES: 3,
};

export default SUPPORT_CONFIG;
