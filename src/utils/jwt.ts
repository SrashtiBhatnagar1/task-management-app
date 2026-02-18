import jwt, { JwtPayload } from "jsonwebtoken";

import { getEnv } from "./env";

type TokenType = "access" | "refresh";

interface TokenPayload extends JwtPayload {
	tokenType: TokenType;
	sub: string;
}

let cachedAccessSecret: string | undefined;
let cachedRefreshSecret: string | undefined;
let cachedAccessExpiresIn: string | undefined;
let cachedRefreshExpiresIn: string | undefined;

const getAccessSecret = (): string => {
	if (!cachedAccessSecret) {
		cachedAccessSecret = getEnv("JWT_ACCESS_SECRET");
	}
	return cachedAccessSecret;
};

const getRefreshSecret = (): string => {
	if (!cachedRefreshSecret) {
		cachedRefreshSecret = getEnv("JWT_REFRESH_SECRET");
	}
	return cachedRefreshSecret;
};

const getAccessExpiresIn = (): string => {
	if (!cachedAccessExpiresIn) {
		cachedAccessExpiresIn = getEnv("JWT_ACCESS_EXPIRES_IN");
	}
	return cachedAccessExpiresIn;
};

const getRefreshExpiresIn = (): string => {
	if (!cachedRefreshExpiresIn) {
		cachedRefreshExpiresIn = getEnv("JWT_REFRESH_EXPIRES_IN");
	}
	return cachedRefreshExpiresIn;
};

const durationToMs = (value: string): number => {
	const match = /^([0-9]+)([smhd])$/.exec(value);
	if (!match) {
		throw new Error("Invalid duration format. Use number + s|m|h|d");
	}
	const amount = Number(match[1]);
	const unit = match[2];

	switch (unit) {
		case "s":
			return amount * 1000;
		case "m":
			return amount * 60 * 1000;
		case "h":
			return amount * 60 * 60 * 1000;
		case "d":
			return amount * 24 * 60 * 60 * 1000;
		default:
			return amount * 1000;
	}
};

export const signAccessToken = (userId: string): string =>
	jwt.sign({ tokenType: "access" }, getAccessSecret(), {
		subject: userId,
		expiresIn: getAccessExpiresIn(),
	});

export const signRefreshToken = (userId: string): string =>
	jwt.sign({ tokenType: "refresh" }, getRefreshSecret(), {
		subject: userId,
		expiresIn: getRefreshExpiresIn(),
	});

export const verifyAccessToken = (token: string): string => {
	const payload = jwt.verify(token, getAccessSecret()) as TokenPayload;
	if (payload.tokenType !== "access" || !payload.sub) {
		throw new Error("Invalid access token");
	}
	return payload.sub;
};

export const verifyRefreshToken = (token: string): string => {
	const payload = jwt.verify(token, getRefreshSecret()) as TokenPayload;
	if (payload.tokenType !== "refresh" || !payload.sub) {
		throw new Error("Invalid refresh token");
	}
	return payload.sub;
};

export const getRefreshExpiryDate = (): Date =>
	new Date(Date.now() + durationToMs(getRefreshExpiresIn()));
