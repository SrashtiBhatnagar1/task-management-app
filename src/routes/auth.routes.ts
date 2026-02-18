import { Router } from "express";

import { login, logout, refresh, register } from "../controllers/auth.controller";
import { validateBody, Validator } from "../middleware/validate.middleware";
import { asyncHandler } from "../utils/async-handler";

interface RegisterBody {
	email: string;
	password: string;
}

interface LoginBody {
	email: string;
	password: string;
}

interface RefreshBody {
	refreshToken: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null;

const isNonEmptyString = (value: unknown): value is string =>
	typeof value === "string" && value.trim().length > 0;

const isEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const registerValidator: Validator<RegisterBody> = (input) => {
	if (!isRecord(input)) {
		return { success: false, errors: ["Body must be an object"] };
	}
	const errors: string[] = [];
	if (!isNonEmptyString(input.email) || !isEmail(input.email)) {
		errors.push("Valid email is required");
	}
	if (!isNonEmptyString(input.password)) {
		errors.push("Password is required");
	}
	if (errors.length > 0) {
		return { success: false, errors };
	}

	return {
		success: true,
		data: { email: input.email.trim(), password: input.password },
	};
};

const loginValidator: Validator<LoginBody> = (input) => {
	if (!isRecord(input)) {
		return { success: false, errors: ["Body must be an object"] };
	}
	const errors: string[] = [];
	if (!isNonEmptyString(input.email) || !isEmail(input.email)) {
		errors.push("Valid email is required");
	}
	if (!isNonEmptyString(input.password)) {
		errors.push("Password is required");
	}
	if (errors.length > 0) {
		return { success: false, errors };
	}

	return {
		success: true,
		data: { email: input.email.trim(), password: input.password },
	};
};

const refreshValidator: Validator<RefreshBody> = (input) => {
	if (!isRecord(input)) {
		return { success: false, errors: ["Body must be an object"] };
	}
	if (!isNonEmptyString(input.refreshToken)) {
		return { success: false, errors: ["Refresh token is required"] };
	}
	return { success: true, data: { refreshToken: input.refreshToken } };
};

const router = Router();

router.post("/register", validateBody(registerValidator), asyncHandler(register));
router.post("/login", validateBody(loginValidator), asyncHandler(login));
router.post("/refresh", validateBody(refreshValidator), asyncHandler(refresh));
router.post("/logout", validateBody(refreshValidator), asyncHandler(logout));

export default router;
