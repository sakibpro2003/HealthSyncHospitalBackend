import { StatusCodes } from "http-status-codes";
// import AppError from "../../../../../../Course/PH/L2/SignatureMart/NextMart-Server/src/app/errors/appError";
// import catchAsync from "../../../../../../Course/PH/L2/SignatureMart/NextMart-Server/src/app/utils/catchAsync";
import type { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import AppError from "../errors/appError";

export const parseBody = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.data) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Please provide data in the body under data key');
    }
    req.body = JSON.parse(req.body.data);

    next();
});