import { Response } from "express";

export const sendSuccess = <T>(res: Response, statusCode: number, data: T): void => {
	res.status(statusCode).json(data);
};

export const sendError = (res: Response, statusCode: number, message: string): void => {
	res.status(statusCode).json({ message });
};
