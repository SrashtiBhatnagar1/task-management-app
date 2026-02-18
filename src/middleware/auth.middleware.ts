import { NextFunction, Request, Response } from "express";

import { unauthorized } from "../utils/errors";
import { verifyAccessToken } from "../utils/jwt";

export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		next(unauthorized("Missing access token"));
		return;
	}

	const token = authHeader.slice("Bearer ".length).trim();

	try {
		const userId = verifyAccessToken(token);
		req.userId = userId;
		next();
	} catch {
		next(unauthorized("Invalid access token"));
	}
};
