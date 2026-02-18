import { RequestHandler } from "express";

import { badRequest } from "../utils/errors";

export type ValidationResult<T> =
	| { success: true; data: T }
	| { success: false; errors: string[] };

export type Validator<T> = (input: unknown) => ValidationResult<T>;

export const validateBody = <T>(validator: Validator<T>): RequestHandler => {
	return (req, _res, next) => {
		const result = validator(req.body);
		if (!result.success) {
			next(badRequest(result.errors.join(", ")));
			return;
		}
		req.body = result.data as unknown;
		next();
	};
};
