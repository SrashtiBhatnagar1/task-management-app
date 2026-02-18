import { Request, Response } from "express";

import { sendSuccess } from "../utils/response";
import { loginUser, logoutUser, refreshTokens, registerUser } from "../services/auth.service";

export const register = async (req: Request, res: Response): Promise<void> => {
	const result = await registerUser(req.body);
	sendSuccess(res, 201, result);
};

export const login = async (req: Request, res: Response): Promise<void> => {
	const result = await loginUser(req.body);
	sendSuccess(res, 200, result);
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
	const result = await refreshTokens(req.body);
	sendSuccess(res, 200, result);
};

export const logout = async (req: Request, res: Response): Promise<void> => {
	await logoutUser(req.body);
	res.status(204).send();
};
