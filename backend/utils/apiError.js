class ApiError extends Error {
    /**
     * @param {number} statusCode
     * @param {string} message
     * @param {Array}  error    - Array of sub-errors (optional)
     * @param {string} field    - The form field this error relates to (optional, for frontend mapping)
     * @param {string} stack    - Custom stack trace (optional)
     */
    constructor(statusCode, message = "Failed, Something went wrong", error = [], field = null, stack = "") {
        super(message);

        this.statusCode = statusCode;
        this.message = message;
        this.data = null;
        this.success = false;
        this.errors = error;
        this.field = field; // field-level error for frontend form mapping

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }

        // Ensure these are enumerable so JSON.stringify picks them up
        Object.defineProperty(this, 'message', { enumerable: true });
        Object.defineProperty(this, 'statusCode', { enumerable: true });
        Object.defineProperty(this, 'success', { enumerable: true });
        if (field) {
            Object.defineProperty(this, 'field', { enumerable: true });
        }
    }

    toJSON() {
        return {
            success: this.success,
            message: this.message,
            statusCode: this.statusCode,
            field: this.field || undefined,
            errors: this.errors,
            stack: process.env.NODE_ENV === "development" ? this.stack : undefined
        };
    }
}

export default ApiError;

