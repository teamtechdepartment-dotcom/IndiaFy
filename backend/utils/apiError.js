class ApiError extends Error {
    constructor(statusCode, message = "Failed, Something went wrong", error = [], stack = "") {
        super(message);

        this.statusCode = statusCode;
        this.message = message;
        this.data = null;
        this.success = false;
        this.errors = error; // Renamed to errors for consistency

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }

        // Ensure these are enumerable so JSON.stringify picks them up
        Object.defineProperty(this, 'message', { enumerable: true });
        Object.defineProperty(this, 'statusCode', { enumerable: true });
        Object.defineProperty(this, 'success', { enumerable: true });
    }

    toJSON() {
        return {
            success: this.success,
            message: this.message,
            statusCode: this.statusCode,
            errors: this.errors,
            stack: process.env.NODE_ENV === "development" ? this.stack : undefined
        };
    }
}

export default ApiError;
