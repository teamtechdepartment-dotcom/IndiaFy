import { validationResult } from "express-validator";
import ApiError from "../utils/apiError.js";

export const validateResult = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map((err) => ({
            field: err.path,
            message: err.msg
        }));

        return res.status(400).json(
            new ApiError(400, "Validation Failed", formattedErrors)
        );
    }

    next();
};