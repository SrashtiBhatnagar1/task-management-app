import bcrypt from "bcrypt";

import { forbidden, unauthorized, badRequest } from "../utils/errors";
import { getEnvNumber } from "../utils/env";
import { getRefreshExpiryDate, signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import prisma from "../utils/prisma";

export interface RegisterInput {
	email: string;
	password: string;
}

export interface LoginInput {
	email: string;
	password: string;
}

export interface RefreshInput {
	refreshToken: string;
}

export interface LogoutInput {
	refreshToken: string;
}

export interface AuthTokens {
	accessToken: string;
	refreshToken: string;
}

export interface AuthResponse {
	user: { id: string; email: string };
	tokens: AuthTokens;
}

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const createRefreshTokenRecord = async (userId: string): Promise<string> => {
	// Delete all old refresh tokens for this user to avoid unique constraint violations
	await prisma.refreshToken.deleteMany({
		where: { userId },
	});

	const refreshToken = signRefreshToken(userId);
	const expiryDate = getRefreshExpiryDate();

	await prisma.refreshToken.create({
		data: { token: refreshToken, userId, expiryDate },
	});

	return refreshToken;
};

export const registerUser = async (input: RegisterInput): Promise<AuthResponse> => {
	const email = normalizeEmail(input.email);
	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing) {
		throw badRequest("Email already in use");
	}

	const saltRounds = getEnvNumber("BCRYPT_SALT_ROUNDS");
	const hashedPassword = await bcrypt.hash(input.password, saltRounds);

	const user = await prisma.user.create({
		data: { email, password: hashedPassword },
	});

	const accessToken = signAccessToken(user.id);
	const refreshToken = await createRefreshTokenRecord(user.id);

	return {
		user: { id: user.id, email: user.email },
		tokens: { accessToken, refreshToken },
	};
};

export const loginUser = async (input: LoginInput): Promise<AuthResponse> => {
	const email = normalizeEmail(input.email);
	const user = await prisma.user.findUnique({ where: { email } });
	if (!user) {
		throw unauthorized("Invalid credentials");
	}

	const matches = await bcrypt.compare(input.password, user.password);
	if (!matches) {
		throw unauthorized("Invalid credentials");
	}

	const accessToken = signAccessToken(user.id);
	const refreshToken = await createRefreshTokenRecord(user.id);

	return {
		user: { id: user.id, email: user.email },
		tokens: { accessToken, refreshToken },
	};
};

export const refreshTokens = async (input: RefreshInput): Promise<AuthTokens> => {
	let userId: string;
	try {
		userId = verifyRefreshToken(input.refreshToken);
	} catch {
		throw unauthorized("Invalid refresh token");
	}

	const record = await prisma.refreshToken.findUnique({
		where: { token: input.refreshToken },
	});

	if (!record || record.userId !== userId) {
		throw forbidden("Refresh token revoked");
	}

	if (record.expiryDate.getTime() < Date.now()) {
		await prisma.refreshToken.delete({ where: { token: input.refreshToken } });
		throw forbidden("Refresh token expired");
	}

	return {
		accessToken: signAccessToken(userId),
		refreshToken: input.refreshToken,
	};
};

export const logoutUser = async (input: LogoutInput): Promise<void> => {
	await prisma.refreshToken.deleteMany({
		where: { token: input.refreshToken },
	});
};
