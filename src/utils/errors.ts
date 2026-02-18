export class AppError extends Error {
	public readonly statusCode: number;
	public readonly isOperational: boolean;

	constructor(statusCode: number, message: string, isOperational = true) {
		super(message);
		this.statusCode = statusCode;
		this.isOperational = isOperational;
	}
}

export const badRequest = (message: string): AppError =>
	new AppError(400, message);

export const unauthorized = (message: string): AppError =>
	new AppError(401, message);

export const forbidden = (message: string): AppError =>
	new AppError(403, message);

export const notFound = (message: string): AppError =>
	new AppError(404, message);
