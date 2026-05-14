/**
 * Wraps async route handlers and forwards errors
 * to Express global error middleware automatically.
 */

const asyncHandler = (requestHandler) => {
  return async (req, res, next) => {
    try {
      await requestHandler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

export { asyncHandler };