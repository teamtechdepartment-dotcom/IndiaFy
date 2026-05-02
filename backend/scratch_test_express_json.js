import express from 'express';
import supertest from 'supertest';

class ApiError extends Error {
    constructor(statusCode, message = "Failed", error = [], stack = "") {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.data = null;
        this.success = false;
        this.errors = error;
        
        Object.defineProperty(this, 'message', { enumerable: true });
        Object.defineProperty(this, 'statusCode', { enumerable: true });
        Object.defineProperty(this, 'success', { enumerable: true });
    }

    toJSON() {
        return {
            success: this.success,
            message: this.message,
            statusCode: this.statusCode,
            errors: this.errors
        };
    }
}

const app = express();
app.get('/test', (req, res) => {
    res.status(401).json(new ApiError(401, "Incorrect Password"));
});

supertest(app)
    .get('/test')
    .expect(401)
    .end((err, res) => {
        console.log("Response body:", res.body);
        process.exit(0);
    });
