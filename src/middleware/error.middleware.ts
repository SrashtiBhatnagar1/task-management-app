import { NextFunction, Request, Response } from "express";

import { AppError } from "../utils/errors";
import { sendError } from "../utils/response";

export const errorHandler = (
	err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error for debugging
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] Error on ${req.method} ${req.path}:`, err);

  // Handle known application errors
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.message);
    return;
  }

  // Handle validation/parsing errors
  if (err instanceof SyntaxError && "body" in err) {
    sendError(res, 400, "Invalid JSON in request body");
    return;
  }

  // Handle all other errors as 500
  const isDevelopment = process.env.NODE_ENV === "development";
  const message = isDevelopment ? err.message : "Internal server error";
  sendError(res, 500, message);
}